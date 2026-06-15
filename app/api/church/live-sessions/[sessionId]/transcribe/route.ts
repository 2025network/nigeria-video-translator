import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { churchSessionCookie } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { transcribeLiveAudio } from "@/lib/liveTranscription";
import { translateForListenerLanguage } from "@/lib/liveSessionTranslation";
import {
  addTranscriptMessage,
  getSermonSessionForChurch,
  logLiveSessionError,
  parseSessionLanguages,
} from "@/lib/sermonSessionRepository";

const maxAudioBytes = 15 * 1024 * 1024;

type TranscribeRouteContext = {
  params: Promise<{
    sessionId: string;
  }>;
};

export async function POST(request: NextRequest, { params }: TranscribeRouteContext) {
  const { sessionId } = await params;
  const churchId = await getAuthenticatedChurchId();

  if (!churchId) {
    return NextResponse.json(
      { error: "Church login is required." },
      { status: 401 },
    );
  }

  const session = await getSermonSessionForChurch(sessionId, churchId);

  if (!session) {
    return NextResponse.json(
      { error: "Live session not found for this church." },
      { status: 404 },
    );
  }

  if (session.status !== "LIVE") {
    return NextResponse.json(
      { error: "Microphone capture is only accepted while the session is LIVE." },
      { status: 409 },
    );
  }

  const formData = await request.formData();
  const audio = formData.get("audio");

  if (!(audio instanceof File)) {
    return NextResponse.json(
      { error: "Audio file is required." },
      { status: 400 },
    );
  }

  if (audio.size > maxAudioBytes) {
    return NextResponse.json(
      { error: "Audio chunk is too large. Please use shorter recording chunks." },
      { status: 413 },
    );
  }

  const transcription = await transcribeLiveAudio(audio);

  if (!transcription.ok) {
    await logLiveSessionError({
      sessionId,
      message: transcription.message,
      context: { code: transcription.code, stage: "transcription" },
    });

    return NextResponse.json(
      {
        error: transcription.message,
        code: transcription.code,
        sourceTranscript: "",
        languagesSaved: [],
        failedLanguages: parseSessionLanguages(session.listenerLanguages),
        messageCount: 0,
      },
      { status: transcription.code === "missing_api_key" ? 503 : 422 },
    );
  }

  const listenerLanguages = parseSessionLanguages(session.listenerLanguages);
  const languagesSaved: string[] = [];
  const failedLanguages: Array<{ language: string; error: string }> = [];

  for (const language of listenerLanguages) {
    try {
      const translation = await translateForListenerLanguage(
        transcription.transcript,
        language,
      );

      await addTranscriptMessage({
        sessionId,
        sourceText: transcription.transcript,
        translatedText: translation.translatedText,
        language,
      });

      languagesSaved.push(language);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Translation failed.";

      failedLanguages.push({
        language,
        error: errorMessage,
      });

      await logLiveSessionError({
        sessionId,
        message: `Translation failed for ${language}.`,
        context: { language, error: errorMessage, stage: "translation" },
      });
    }
  }

  return NextResponse.json({
    sourceTranscript: transcription.transcript,
    languagesSaved,
    failedLanguages,
    messageCount: languagesSaved.length,
  });
}

async function getAuthenticatedChurchId() {
  const cookieStore = await cookies();
  const churchId = cookieStore.get(churchSessionCookie)?.value;

  if (!churchId) return null;

  const church = await prisma.church.findUnique({
    where: { id: churchId },
    select: { id: true, status: true },
  });

  if (!church || church.status !== "Active") return null;

  return church.id;
}
