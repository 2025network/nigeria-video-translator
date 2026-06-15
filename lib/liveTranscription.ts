import OpenAI from "openai";

export type LiveTranscriptionResult =
  | {
      ok: true;
      transcript: string;
      provider: "openai";
    }
  | {
      ok: false;
      code: "missing_api_key" | "empty_audio" | "transcription_failed";
      message: string;
    };

export async function transcribeLiveAudio(audioFile: File): Promise<LiveTranscriptionResult> {
  if (!audioFile.size) {
    return {
      ok: false,
      code: "empty_audio",
      message: "No audio was received. Please try speaking again.",
    };
  }

  if (!process.env.OPENAI_API_KEY) {
    return {
      ok: false,
      code: "missing_api_key",
      message:
        "OpenAI transcription is not configured. Add OPENAI_API_KEY or use manual sermon updates.",
    };
  }

  try {
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const response = await client.audio.transcriptions.create({
      file: audioFile,
      model: process.env.OPENAI_TRANSCRIPTION_MODEL || "whisper-1",
    });
    const transcript = response.text?.trim();

    if (!transcript) {
      return {
        ok: false,
        code: "transcription_failed",
        message: "No speech was detected in this audio chunk.",
      };
    }

    return {
      ok: true,
      transcript,
      provider: "openai",
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown transcription error.";

    return {
      ok: false,
      code: "transcription_failed",
      message,
    };
  }
}
