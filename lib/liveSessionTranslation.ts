import { isSupportedLanguage } from "./languages";
import { generateLiveTextToSpeech } from "./liveTextToSpeech";
import {
  addTranscriptMessage,
  updateTranscriptMessageAudio,
} from "./sermonSessionRepository";
import { translateTranscript } from "./translation";

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

  return {
    language,
    translatedText: "Language support coming soon.",
    mode: "pending",
  };
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
