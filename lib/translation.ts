import OpenAI from "openai";
import type { SupportedLanguage } from "./languages";
import { demoTranslationMessage, getOpenAIErrorDetails } from "./openaiErrors";

export type TranslationResult = {
  text: string;
  language: SupportedLanguage;
  confidence: number;
  mode: "real" | "mock";
  usedOpenAI: boolean;
  message: string;
  quotaUnavailable?: boolean;
  demoMode?: boolean;
};

type OpenAITranslationPayload = {
  translation?: string;
  confidence?: number;
};

const defaultTranslationModel = "gpt-4o-mini";

const mockTranslations: Record<SupportedLanguage, string> = {
  Yoruba:
    "Eyi ni itumo idanwo si ede Yoruba. A pa oruko, ibi, ojo, awon nomba, ati awon ese Bibeli mo gege bi won se wa ninu oro atilẹba.",
  Igbo:
    "Nke a bu ntụgharị ule n'asụsụ Igbo. A na-edobe aha, ebe, ubochi, onu ogugu, na amaokwu Bible dika ha di n'okwu mbụ.",
  Hausa:
    "Wannan fassarar gwaji ce zuwa Hausa. Ana kiyaye sunaye, wurare, ranaku, lambobi, da ayoyin Littafi Mai Tsarki kamar yadda suke a asalin rubutu.",
  "Nigerian Pidgin":
    "Na test translation be this for Nigerian Pidgin. Names, places, dates, numbers, and Bible verses go remain as dem dey for the original transcript.",
};

const languagePrompts: Record<SupportedLanguage, string> = {
  Yoruba:
    "Translate into natural Yoruba for Nigerian listeners. Use clear Yoruba wording, not English paraphrase. Preserve names, Bible verses, locations, dates, and numbers exactly as written.",
  Igbo:
    "Translate into natural Igbo for Nigerian listeners. Use clear Igbo wording, not English paraphrase. Preserve names, Bible verses, locations, dates, and numbers exactly as written.",
  Hausa:
    "Translate into natural Hausa for Nigerian listeners. Use clear Hausa wording, not English paraphrase. Preserve names, Bible verses, locations, dates, and numbers exactly as written.",
  "Nigerian Pidgin":
    "Translate into natural Nigerian Pidgin for Nigerian listeners. Use everyday Nigerian Pidgin, not standard English. Preserve names, Bible verses, locations, dates, and numbers exactly as written.",
};

export async function translateTranscript(
  transcript: string,
  language: SupportedLanguage,
): Promise<TranslationResult> {
  if (!process.env.OPENAI_API_KEY) {
    const result = createMockTranslation(
      language,
      "OPENAI_API_KEY is not configured. Demo translation is being shown.",
    );
    logTranslationConfidence(result);
    return result;
  }

  try {
    const result = await translateWithOpenAI(transcript, language);

    if (!appearsTranslatedForLanguage(transcript, result.text, language)) {
      throw new Error(
        `OpenAI translation did not appear to be in ${language}; using mock fallback.`,
      );
    }

    logTranslationConfidence(result);
    return result;
  } catch (error) {
    const details = getOpenAIErrorDetails(error);
    const result = createMockTranslation(
      language,
      details.quotaUnavailable
        ? demoTranslationMessage
        : "OpenAI translation failed. Demo translation is being shown.",
      details.quotaUnavailable,
    );

    console.warn("[translation] OpenAI translation failed; using mock fallback", {
      language,
      errorCode: details.code,
      errorMessage: details.message,
      quotaUnavailable: details.quotaUnavailable,
    });
    logTranslationConfidence(result);

    return result;
  }
}

async function translateWithOpenAI(
  transcript: string,
  language: SupportedLanguage,
): Promise<TranslationResult> {
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const model = process.env.OPENAI_TRANSLATION_MODEL || defaultTranslationModel;

  console.info("[translation] real translation mode", {
    provider: "OpenAI",
    model,
    language,
  });

  const response = await client.responses.create({
    model,
    input: [
      {
        role: "system",
        content: [
          "You are a careful Nigerian language translator.",
          languagePrompts[language],
          "Return only JSON with keys translation and confidence.",
          "confidence must be a number from 0 to 1 representing your confidence in translation quality.",
        ].join(" "),
      },
      {
        role: "user",
        content: `Translate this transcript into ${language}:\n\n${transcript}`,
      },
    ],
  });

  const parsed = parseOpenAITranslation(response.output_text);
  const translation = parsed.translation?.trim();

  if (!translation) {
    throw new Error("OpenAI returned an empty translation.");
  }

  return {
    text: translation,
    language,
    confidence: clampConfidence(parsed.confidence ?? 0.82),
    mode: "real",
    usedOpenAI: true,
    message: "Translated with OpenAI.",
    quotaUnavailable: false,
    demoMode: false,
  };
}

function parseOpenAITranslation(outputText: string): OpenAITranslationPayload {
  try {
    return JSON.parse(outputText) as OpenAITranslationPayload;
  } catch {
    const jsonMatch = outputText.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      throw new Error("OpenAI response was not valid JSON.");
    }

    return JSON.parse(jsonMatch[0]) as OpenAITranslationPayload;
  }
}

function createMockTranslation(
  language: SupportedLanguage,
  message: string,
  quotaUnavailable = false,
): TranslationResult {
  console.info("[translation] mock translation mode", { language, reason: message });

  return {
    text: mockTranslations[language],
    language,
    confidence: 0.55,
    mode: "mock",
    usedOpenAI: false,
    message,
    quotaUnavailable,
    demoMode: true,
  };
}

function appearsTranslatedForLanguage(
  sourceText: string,
  translatedText: string,
  language: SupportedLanguage,
) {
  const normalizedSource = normalizeForComparison(sourceText);
  const normalizedTranslation = normalizeForComparison(translatedText);

  if (!normalizedTranslation || normalizedTranslation === normalizedSource) {
    return false;
  }

  if (language === "Nigerian Pidgin") {
    return /\b(na|dey|abi|wetin|make|no|go|dem|una|fit|don)\b/i.test(translatedText);
  }

  const signals: Record<Exclude<SupportedLanguage, "Nigerian Pidgin">, RegExp> = {
    Yoruba: /\b(ati|awon|eyi|ni|fun|pẹlu|oruko|ede|gege|wa|inu)\b/i,
    Igbo: /\b(bu|na|nke|ndi|aha|ebe|okwu|ụbọchị|asụsụ|dika)\b/i,
    Hausa: /\b(wannan|fassara|zuwa|ana|kiyaye|sunaye|wurare|ranaku|lambobi)\b/i,
  };

  return signals[language].test(translatedText);
}

function normalizeForComparison(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function clampConfidence(value: number) {
  if (Number.isNaN(value)) return 0.75;
  return Math.min(1, Math.max(0, value));
}

function logTranslationConfidence(result: TranslationResult) {
  console.info("[translation] confidence", {
    language: result.language,
    confidence: result.confidence,
    mode: result.mode,
    usedOpenAI: result.usedOpenAI,
    quotaUnavailable: result.quotaUnavailable,
    message: result.message,
  });
}
