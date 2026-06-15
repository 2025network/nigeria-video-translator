import { isSupportedLanguage } from "./languages";
import { translateTranscript } from "./translation";

export type LiveSessionTranslationResult = {
  language: string;
  translatedText: string;
  mode: "real" | "demo" | "placeholder";
};

export async function translateForListenerLanguage(
  sourceText: string,
  language: string,
): Promise<LiveSessionTranslationResult> {
  if (language === "English") {
    return {
      language,
      translatedText: `[English original] ${sourceText}`,
      mode: "placeholder",
    };
  }

  if (isSupportedLanguage(language)) {
    const result = await translateTranscript(sourceText, language);

    return {
      language,
      translatedText:
        result.mode === "real"
          ? result.text
          : `[Demo translation to ${language}] ${result.text}`,
      mode: result.mode === "real" ? "real" : "demo",
    };
  }

  return {
    language,
    translatedText: `[Placeholder translation to ${language}] ${sourceText}`,
    mode: "placeholder",
  };
}
