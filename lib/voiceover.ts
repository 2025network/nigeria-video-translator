import { spawn } from "node:child_process";
import OpenAI from "openai";
import { resolveFfmpegDiagnostics } from "./ffmpeg";
import { demoTranslationMessage, getOpenAIErrorDetails } from "./openaiErrors";
import type { SupportedLanguage } from "./languages";

export type VoiceOverResult = {
  audioBuffer: Buffer;
  extension: "mp3";
  mimeType: "audio/mpeg";
  usedMock: boolean;
  mode: "real" | "mock";
  voice: "cedar";
  message: string;
  quotaUnavailable?: boolean;
  demoMode?: boolean;
};

const ttsModel = "gpt-4o-mini-tts";
const narrationVoice = "cedar";
const maxTtsInputLength = 4096;

export async function generateVoiceOver(
  translatedText: string,
  targetLanguage: SupportedLanguage,
): Promise<VoiceOverResult> {
  const input = translatedText.trim().slice(0, maxTtsInputLength);

  if (!process.env.OPENAI_API_KEY) {
    console.info("[voiceover] mock TTS mode", {
      reason: "OPENAI_API_KEY is not configured.",
      targetLanguage,
      outputFormat: "mp3",
    });

    return createMockVoiceOver(
      targetLanguage,
      "OPENAI_API_KEY is not configured. Demo voice-over audio is being used.",
    );
  }

  console.info("[voiceover] real TTS mode", {
    provider: "OpenAI",
    model: ttsModel,
    voice: narrationVoice,
    targetLanguage,
    outputFormat: "mp3",
  });

  try {
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const response = await client.audio.speech.create({
      model: ttsModel,
      voice: narrationVoice,
      input,
      response_format: "mp3",
      instructions: createNarrationInstructions(targetLanguage),
    });

    return {
      audioBuffer: Buffer.from(await response.arrayBuffer()),
      extension: "mp3",
      mimeType: "audio/mpeg",
      usedMock: false,
      mode: "real",
      voice: narrationVoice,
      message: "Generated translated voice-over with OpenAI text-to-speech.",
      quotaUnavailable: false,
      demoMode: false,
    };
  } catch (error) {
    const details = getOpenAIErrorDetails(error);

    console.warn("[voiceover] OpenAI TTS failed; falling back to mock TTS", {
      targetLanguage,
      errorCode: details.code,
      errorMessage: details.message,
      quotaUnavailable: details.quotaUnavailable,
    });

    return createMockVoiceOver(
      targetLanguage,
      details.quotaUnavailable
        ? demoTranslationMessage
        : "OpenAI TTS failed. Demo voice-over audio is being used.",
      details.quotaUnavailable,
    );
  }
}

function createNarrationInstructions(targetLanguage: SupportedLanguage) {
  return [
    `Narrate naturally in ${targetLanguage}.`,
    "Use a warm, clear, documentary-style delivery suitable for Nigerian audiences.",
    "Keep pronunciation deliberate and conversational, with respectful pacing and confident intonation.",
    "This is an AI-generated translated voice-over, not a human recording.",
  ].join(" ");
}

async function createMockVoiceOver(
  targetLanguage: SupportedLanguage,
  message = "No OPENAI_API_KEY configured. Demo voice-over audio is being used.",
  quotaUnavailable = false,
): Promise<VoiceOverResult> {
  return {
    audioBuffer: await createMockMp3Artifact(targetLanguage),
    extension: "mp3",
    mimeType: "audio/mpeg",
    usedMock: true,
    mode: "mock",
    voice: narrationVoice,
    message,
    quotaUnavailable,
    demoMode: true,
  };
}

async function createMockMp3Artifact(targetLanguage: SupportedLanguage) {
  const diagnostics = resolveFfmpegDiagnostics();

  if (!diagnostics.selectedPath || !diagnostics.selectedPathExists) {
    console.warn("[voiceover] FFmpeg unavailable for playable mock MP3; writing text fallback", {
      targetLanguage,
      diagnostics,
    });

    return Buffer.from(
      [
        "Mock MP3 voice-over artifact for Nigeria Video Translator.",
        `Target language: ${targetLanguage}`,
        "Set OPENAI_API_KEY in .env.local to generate real OpenAI TTS audio.",
        "",
      ].join("\n"),
      "utf8",
    );
  }

  return createToneMp3(diagnostics.selectedPath, languageToneFrequency(targetLanguage));
}

function languageToneFrequency(language: SupportedLanguage) {
  const frequencies: Record<SupportedLanguage, number> = {
    Yoruba: 392,
    Igbo: 440,
    Hausa: 494,
    "Nigerian Pidgin": 523,
  };

  return frequencies[language];
}

function createToneMp3(ffmpegPath: string, frequency: number): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    let stderr = "";
    const ffmpegProcess = spawn(ffmpegPath, [
      "-hide_banner",
      "-loglevel",
      "error",
      "-f",
      "lavfi",
      "-i",
      `sine=frequency=${frequency}:duration=4`,
      "-acodec",
      "libmp3lame",
      "-b:a",
      "128k",
      "-f",
      "mp3",
      "pipe:1",
    ]);

    ffmpegProcess.stdout.on("data", (chunk: Buffer) => chunks.push(chunk));
    ffmpegProcess.stderr.on("data", (chunk: Buffer) => {
      stderr += chunk.toString();
    });
    ffmpegProcess.on("error", reject);
    ffmpegProcess.on("close", (code) => {
      if (code === 0) {
        resolve(Buffer.concat(chunks));
        return;
      }

      reject(new Error(stderr || `FFmpeg mock MP3 generation exited with code ${code}.`));
    });
  });
}
