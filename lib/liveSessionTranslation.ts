import { isSupportedLanguage } from "./languages";
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
