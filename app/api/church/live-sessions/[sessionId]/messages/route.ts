import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { churchSessionCookie } from "@/lib/auth";
import { prisma } from "@/lib/db";
import {
  getLatestTranscriptMessagesForSession,
  getSermonSessionForChurch,
} from "@/lib/sermonSessionRepository";

type MessagesRouteContext = {
  params: Promise<{
    sessionId: string;
  }>;
};

export async function GET(request: NextRequest, { params }: MessagesRouteContext) {
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

  const language = request.nextUrl.searchParams.get("language") || undefined;
  const messages = await getLatestTranscriptMessagesForSession(sessionId, language, 10);

  return NextResponse.json({
    messages: messages.map((message) => ({
      id: message.id,
      sourceText: message.sourceText,
      translatedText: message.translatedText,
      language: message.language,
      audioUrl: message.audioUrl,
      audioStatus: message.audioStatus,
      audioError: message.audioError,
      createdAt: message.createdAt.toISOString(),
    })),
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
