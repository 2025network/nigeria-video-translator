import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import OpenAI from "openai";
import { getOpenAIErrorDetails } from "./openaiErrors";

export type LiveTextToSpeechResult =
  | {
      ok: true;
      audioUrl: string;
      audioStatus: "READY";
    }
  | {
      ok: false;
      audioUrl: null;
      audioStatus: "FAILED";
      audioError: string;
    };

const maxTtsInputLength = 4096;
const ttsVoice = "cedar";

export async function generateLiveTextToSpeech(input: {
  sessionId: string;
  messageId: string;
  language: string;
  translatedText: string;
}): Promise<LiveTextToSpeechResult> {
  const text = input.translatedText.trim().slice(0, maxTtsInputLength);

  if (!text) {
    return {
      ok: false,
      audioUrl: null,
      audioStatus: "FAILED",
      audioError: "No translated text was available for speaker audio.",
    };
  }

  if (!process.env.OPENAI_API_KEY) {
    return {
      ok: false,
      audioUrl: null,
      audioStatus: "FAILED",
      audioError:
        "OPENAI_API_KEY is missing. Configure OpenAI on the server to generate speaker output audio.",
    };
  }

  try {
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const response = await client.audio.speech.create({
      model: process.env.OPENAI_TTS_MODEL || "gpt-4o-mini-tts",
      voice: ttsVoice,
      input: text,
      response_format: "mp3",
      instructions: [
        `Speak naturally in ${input.language}.`,
        "Use a clear, warm church narration voice.",
        "Keep the pace steady enough for public speaker playback.",
      ].join(" "),
    });

    const safeLanguage = input.language.replace(/[^a-zA-Z0-9-]/g, "-").toLowerCase();
    const relativeDirectory = path.join("live-audio", input.sessionId);
    const fileName = `${input.messageId}-${safeLanguage}.mp3`;
    const outputDirectory = path.join(process.cwd(), "public", relativeDirectory);
    const outputPath = path.join(outputDirectory, fileName);

    await mkdir(outputDirectory, { recursive: true });
    await writeFile(outputPath, Buffer.from(await response.arrayBuffer()));

    return {
      ok: true,
      audioUrl: `/${relativeDirectory.replace(/\\/g, "/")}/${fileName}`,
      audioStatus: "READY",
    };
  } catch (error) {
    const details = getOpenAIErrorDetails(error);

    return {
      ok: false,
      audioUrl: null,
      audioStatus: "FAILED",
      audioError: details.message || "OpenAI text-to-speech failed.",
    };
  }
}
