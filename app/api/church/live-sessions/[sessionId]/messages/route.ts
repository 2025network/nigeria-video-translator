import { NextResponse, type NextRequest } from "next/server";
import { canAccessChurchBranch, hasChurchPermission } from "@/lib/churchPermissions";
import { getOptionalChurchContext } from "@/lib/currentChurch";
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
  const context = await getOptionalChurchContext();

  if (!context) {
    return NextResponse.json(
      { error: "Church login is required." },
      { status: 401 },
    );
  }

  if (!hasChurchPermission(context.actor, "sessions:view")) {
    return NextResponse.json({ error: "This role cannot view live session messages." }, { status: 403 });
  }

  const session = await getSermonSessionForChurch(sessionId, context.church.id);

  if (!session || !canAccessChurchBranch(context.actor, session.branchId)) {
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
