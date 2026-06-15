import { NextResponse } from "next/server";
import OpenAI from "openai";

const liveTranslationLanguages = [
  "Yoruba",
  "Igbo",
  "Hausa",
  "Nigerian Pidgin",
  "French",
  "Spanish",
] as const;

type LiveTranslationLanguage = (typeof liveTranslationLanguages)[number];

const languagePrompts: Record<LiveTranslationLanguage, string> = {
  Yoruba:
    "Translate into natural Yoruba suitable for a live church sermon listener. Preserve names, Bible references, locations, dates, and numbers.",
  Igbo:
    "Translate into natural Igbo suitable for a live church sermon listener. Preserve names, Bible references, locations, dates, and numbers.",
  Hausa:
    "Translate into natural Hausa suitable for a live church sermon listener. Preserve names, Bible references, locations, dates, and numbers.",
  "Nigerian Pidgin":
    "Translate into natural Nigerian Pidgin suitable for a live church sermon listener. Use everyday Nigerian Pidgin, not standard English. Preserve names, Bible references, locations, dates, and numbers.",
  French:
    "Translate into clear natural French suitable for a live church sermon listener. Preserve names, Bible references, locations, dates, and numbers.",
  Spanish:
    "Translate into clear natural Spanish suitable for a live church sermon listener. Preserve names, Bible references, locations, dates, and numbers.",
};

export async function POST(request: Request) {
  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body." },
      { status: 400 },
    );
  }

  const transcript = readStringField(payload, "transcript").trim();
  const targetLanguage = readStringField(payload, "targetLanguage");

  if (!transcript) {
    return NextResponse.json(
      { error: "Transcript text is required." },
      { status: 400 },
    );
  }

  if (!isLiveTranslationLanguage(targetLanguage)) {
    return NextResponse.json(
      { error: "Unsupported target language." },
      { status: 400 },
    );
  }

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json(
      {
        error: "Translation is being prepared. Please keep this page open.",
        code: "openai_not_configured",
      },
      { status: 503 },
    );
  }

  try {
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const model = process.env.OPENAI_LIVE_TRANSLATION_MODEL || "gpt-4o-mini";

    const response = await client.responses.create({
      model,
      input: [
        {
          role: "system",
          content: [
            "You are SermonBridge, a careful live sermon translation assistant.",
            languagePrompts[targetLanguage],
            "Translate only the provided transcript.",
            "Return only the translated text with no markdown, no explanation, and no extra labels.",
          ].join(" "),
        },
        {
          role: "user",
          content: transcript,
        },
      ],
    });

    const translation = response.output_text.trim();

    if (!translation) {
      return NextResponse.json(
        { error: "OpenAI returned an empty translation." },
        { status: 502 },
      );
    }

    return NextResponse.json({
      translation,
      targetLanguage,
      mode: "real",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Translation failed.";

    console.error("[live-translate] OpenAI translation failed", {
      targetLanguage,
      message,
    });

    return NextResponse.json(
      { error: "Translation is being prepared. Please keep this page open." },
      { status: 502 },
    );
  }
}

function readStringField(payload: unknown, field: string) {
  if (!payload || typeof payload !== "object" || !(field in payload)) {
    return "";
  }

  const value = (payload as Record<string, unknown>)[field];
  return typeof value === "string" ? value : "";
}

function isLiveTranslationLanguage(value: string): value is LiveTranslationLanguage {
  return liveTranslationLanguages.includes(value as LiveTranslationLanguage);
}
