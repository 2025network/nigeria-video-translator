import OpenAI from "openai";
import { isSupportedLanguage } from "./languages";
import { generateLiveTextToSpeech } from "./liveTextToSpeech";
import {
  addTranscriptMessage,
  updateTranscriptMessageAudio,
} from "./sermonSessionRepository";
import { translateTranscript } from "./translation";

const liveTranslationModel = process.env.OPENAI_LIVE_TRANSLATION_MODEL || "gpt-4o-mini";

export type LiveSessionTranslationResult = {
  language: string;
  translatedText: string;
  mode: "real" | "pending";
};

export async function translateForListenerLanguage(
  sourceText: string,
  language: string,
): Promise<LiveSessionTranslationResult> {
  if (language === "English") {
    return {
      language,
      translatedText: sourceText,
      mode: "real",
    };
  }

  if (!process.env.OPENAI_API_KEY) {
    return {
      language,
      translatedText: "Translation is being prepared. Please keep this page open.",
      mode: "pending",
    };
  }

  if (isSupportedLanguage(language)) {
    const result = await translateTranscript(sourceText, language);

    return {
      language,
      translatedText:
        result.mode === "real"
          ? result.text
          : "Translation is being prepared. Please keep this page open.",
      mode: result.mode === "real" ? "real" : "pending",
    };
  }

  try {
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const response = await client.responses.create({
      model: liveTranslationModel,
      input: [
        {
          role: "system",
          content: [
            "You are SermonBridge, a careful live sermon translation assistant.",
            `Translate into ${language}.`,
            "Preserve names, Bible references, locations, dates, and numbers.",
            "Return only the translated text with no markdown and no explanation.",
          ].join(" "),
        },
        { role: "user", content: sourceText },
      ],
    });
    const translatedText = response.output_text.trim();

    return {
      language,
      translatedText: translatedText || "Translation is being prepared. Please keep this page open.",
      mode: translatedText ? "real" : "pending",
    };
  } catch {
    return {
      language,
      translatedText: "Translation is being prepared. Please keep this page open.",
      mode: "pending",
    };
  }
}

export async function createLiveTranscriptMessage(input: {
  sessionId: string;
  sourceText: string;
  language: string;
}) {
  const translation = await translateForListenerLanguage(
    input.sourceText,
    input.language,
  );

  const message = await addTranscriptMessage({
    sessionId: input.sessionId,
    sourceText: input.sourceText,
    translatedText: translation.translatedText,
    language: input.language,
    audioStatus: "PENDING",
    audioUrl: null,
    audioError: null,
  });

  const audio = await generateLiveTextToSpeech({
    sessionId: input.sessionId,
    messageId: message.id,
    language: input.language,
    translatedText: translation.translatedText,
  });

  if (audio.ok) {
    return updateTranscriptMessageAudio(message.id, {
      audioUrl: audio.audioUrl,
      audioStatus: audio.audioStatus,
      audioError: null,
    });
  }

  return updateTranscriptMessageAudio(message.id, {
    audioUrl: null,
    audioStatus: audio.audioStatus,
    audioError: audio.audioError,
  });
}
