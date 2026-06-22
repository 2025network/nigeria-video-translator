import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import {
  displayUsageEventTypes,
  recordDisplayUsage,
  type DisplayUsageEventType,
} from "@/lib/smartDisplayRepository";

export async function POST(request: NextRequest) {
  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const sessionId = readString(payload, "sessionId");
  const eventType = readString(payload, "eventType");
  const language = readString(payload, "language");
  const kioskMode = readBoolean(payload, "kioskMode");

  if (!sessionId || !language) {
    return NextResponse.json(
      { error: "sessionId and language are required." },
      { status: 400 },
    );
  }

  if (!displayUsageEventTypes.includes(eventType as DisplayUsageEventType)) {
    return NextResponse.json(
      { error: "Unsupported display event type." },
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

  await recordDisplayUsage({
    sessionId,
    eventType: eventType as DisplayUsageEventType,
    language,
    kioskMode,
  });

  return NextResponse.json({ ok: true });
}

function readString(payload: unknown, field: string) {
  if (!payload || typeof payload !== "object" || !(field in payload)) return "";
  const value = (payload as Record<string, unknown>)[field];
  return typeof value === "string" ? value.trim() : "";
}

function readBoolean(payload: unknown, field: string) {
  if (!payload || typeof payload !== "object" || !(field in payload)) return false;
  return (payload as Record<string, unknown>)[field] === true;
}
