import { NextResponse } from "next/server";
import OpenAI from "openai";
import { getLanguageName, normalizeLanguageValue } from "@/lib/languageCatalog";

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
  const targetLanguage = getLanguageName(
    normalizeLanguageValue(readStringField(payload, "targetLanguage")),
  );

  if (!transcript) {
    return NextResponse.json(
      { error: "Transcript text is required." },
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
            `Translate into ${targetLanguage} for a live church sermon listener.`,
            targetLanguage === "Nigerian Pidgin"
              ? "Use everyday Nigerian Pidgin, not standard English."
              : "",
            "Translate only the provided transcript.",
            "Preserve names, Bible references, locations, dates, and numbers.",
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
