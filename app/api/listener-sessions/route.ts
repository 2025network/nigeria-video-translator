import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { recordListenerSession } from "@/lib/listenerAnalyticsRepository";

export async function POST(request: NextRequest) {
  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const sessionId = readString(payload, "sessionId");
  const language = readString(payload, "language");
  const visitorId = readString(payload, "visitorId");

  if (!sessionId || !visitorId) {
    return NextResponse.json(
      { error: "sessionId and visitorId are required." },
      { status: 400 },
    );
  }

  const session = await prisma.sermonSession.findUnique({
    where: { id: sessionId },
    select: { id: true },
  });

  if (!session) {
    return NextResponse.json({ error: "Session not found." }, { status: 404 });
  }

  const country =
    request.headers.get("x-vercel-ip-country") ||
    request.headers.get("cf-ipcountry") ||
    request.headers.get("x-country-code") ||
    null;
  const userAgent = request.headers.get("user-agent");

  await recordListenerSession({
    sessionId,
    language: language || "English",
    visitorId,
    country,
    userAgent,
  });

  return NextResponse.json({ ok: true });
}

function readString(payload: unknown, field: string) {
  if (!payload || typeof payload !== "object" || !(field in payload)) return "";
  const value = (payload as Record<string, unknown>)[field];
  return typeof value === "string" ? value.trim() : "";
}
