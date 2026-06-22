import { NextResponse, type NextRequest } from "next/server";
import {
  getLanguageName,
  normalizeLanguageValue,
} from "@/lib/languageCatalog";
import {
  getPublicDisplayMessages,
  getPublicDisplaySession,
} from "@/lib/smartDisplayRepository";

type DisplaySessionRouteContext = {
  params: Promise<{ sessionId: string }>;
};

export async function GET(
  request: NextRequest,
  { params }: DisplaySessionRouteContext,
) {
  const { sessionId } = await params;
  const session = await getPublicDisplaySession(sessionId);

  if (!session) {
    return NextResponse.json({ error: "Session not found." }, { status: 404 });
  }

  const languageCode = normalizeLanguageValue(
    request.nextUrl.searchParams.get("lang") || "en",
  );
  const language = getLanguageName(languageCode);
  const messages = await getPublicDisplayMessages(sessionId, languageCode);

  return NextResponse.json({
    session: {
      id: session.id,
      title: session.title,
      status: session.status,
      churchName: session.church.churchName,
      churchLogoUrl: session.church.logoUrl,
      branchName: session.branch?.name ?? null,
      updatedAt: session.updatedAt.toISOString(),
    },
    language: {
      code: languageCode,
      name: language,
    },
    messages: messages.map((message) => ({
      id: message.id,
      translatedText: message.translatedText,
      createdAt: message.createdAt.toISOString(),
    })),
  });
}
