import OpenAI from "openai";
import { getOpenAIErrorDetails } from "./openaiErrors";

export type OpenAIDiagnosticCheck = {
  success: boolean;
  errorCode: string | null;
  errorMessage: string | null;
  quotaUnavailable: boolean;
};

export type OpenAIDiagnosticsResult = {
  apiKeyDetected: boolean;
  apiConnectionSuccess: boolean;
  quotaUnavailable: boolean;
  demoModeActive: boolean;
  translation: OpenAIDiagnosticCheck;
  tts: OpenAIDiagnosticCheck;
};

const testModel = process.env.OPENAI_DIAGNOSTIC_MODEL || "gpt-4o-mini";
const testTtsModel = process.env.OPENAI_TTS_MODEL || "gpt-4o-mini-tts";

export async function runOpenAIDiagnostics(): Promise<OpenAIDiagnosticsResult> {
  if (!process.env.OPENAI_API_KEY) {
    const missingKey = createFailure(
      "missing_api_key",
      "OPENAI_API_KEY is not configured.",
    );

    return {
      apiKeyDetected: false,
      apiConnectionSuccess: false,
      quotaUnavailable: false,
      demoModeActive: true,
      translation: missingKey,
      tts: missingKey,
    };
  }

  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const [translation, tts] = await Promise.all([
    testOpenAITextRequest(client),
    testOpenAITtsRequest(client),
  ]);

  return {
    apiKeyDetected: true,
    apiConnectionSuccess: translation.success && tts.success,
    quotaUnavailable: translation.quotaUnavailable || tts.quotaUnavailable,
    demoModeActive: !translation.success || !tts.success,
    translation,
    tts,
  };
}

async function testOpenAITextRequest(client: OpenAI): Promise<OpenAIDiagnosticCheck> {
  try {
    const response = await client.responses.create({
      model: testModel,
      input:
        "Diagnostic test only. Reply with exactly: Nigeria Video Translator OK",
      max_output_tokens: 20,
    });

    if (!response.output_text.trim()) {
      return createFailure("empty_response", "OpenAI returned an empty text response.");
    }

    return createSuccess();
  } catch (error) {
    return normalizeOpenAIError(error);
  }
}

async function testOpenAITtsRequest(client: OpenAI): Promise<OpenAIDiagnosticCheck> {
  try {
    const response = await client.audio.speech.create({
      model: testTtsModel,
      voice: "cedar",
      input: "Nigeria Video Translator diagnostic text to speech test.",
      response_format: "mp3",
    });
    const audioBuffer = Buffer.from(await response.arrayBuffer());

    if (audioBuffer.length === 0) {
      return createFailure("empty_audio", "OpenAI returned an empty TTS audio file.");
    }

    return createSuccess();
  } catch (error) {
    return normalizeOpenAIError(error);
  }
}

function normalizeOpenAIError(error: unknown): OpenAIDiagnosticCheck {
  const details = getOpenAIErrorDetails(error);

  return createFailure(details.code, details.message, details.quotaUnavailable);
}

function createSuccess(): OpenAIDiagnosticCheck {
  return {
    success: true,
    errorCode: null,
    errorMessage: null,
    quotaUnavailable: false,
  };
}

function createFailure(
  errorCode: string,
  errorMessage: string,
  quotaUnavailable = false,
): OpenAIDiagnosticCheck {
  return {
    success: false,
    errorCode,
    errorMessage,
    quotaUnavailable,
  };
}
