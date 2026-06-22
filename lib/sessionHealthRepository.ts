import { prisma } from "./db";

const recentErrorLimit = 12;

export async function getLiveSessionHealth(sessionId: string, churchId: string) {
  const session = await prisma.sermonSession.findFirst({
    where: { id: sessionId, churchId },
    include: { church: true, branch: true },
  });

  if (!session) return null;

  const [
    messageCount,
    latestMessage,
    latestAudio,
    readyAudioCount,
    pendingAudioCount,
    failedAudioCount,
    listenerRows,
    displayViews,
    overlayViews,
    errorLogs,
  ] = await Promise.all([
    prisma.sermonTranscriptMessage.count({ where: { sessionId } }),
    prisma.sermonTranscriptMessage.findFirst({
      where: { sessionId },
      orderBy: { createdAt: "desc" },
      select: { id: true, createdAt: true, language: true },
    }),
    prisma.sermonTranscriptMessage.findFirst({
      where: {
        sessionId,
        audioStatus: "READY",
        audioUrl: { not: null },
        audioGeneratedAt: { not: null },
      },
      orderBy: { audioGeneratedAt: "desc" },
      select: {
        id: true,
        audioGeneratedAt: true,
        language: true,
        audioUrl: true,
      },
    }),
    prisma.sermonTranscriptMessage.count({
      where: { sessionId, audioStatus: "READY" },
    }),
    prisma.sermonTranscriptMessage.count({
      where: { sessionId, audioStatus: "PENDING" },
    }),
    prisma.sermonTranscriptMessage.count({
      where: { sessionId, audioStatus: "FAILED" },
    }),
    prisma.listenerSession.findMany({
      where: { sessionId },
      select: { visitorId: true },
      distinct: ["visitorId"],
    }),
    prisma.displayUsageEvent.count({
      where: { sessionId, eventType: "display_viewed" },
    }),
    prisma.overlayUsageEvent.count({
      where: { sessionId, eventType: "overlay_viewed" },
    }),
    prisma.liveSessionErrorLog.findMany({
      where: { sessionId },
      orderBy: { createdAt: "desc" },
      take: recentErrorLimit,
    }),
  ]);

  return {
    checkedAt: new Date(),
    session,
    messageCount,
    latestMessage,
    latestAudio,
    readyAudioCount,
    pendingAudioCount,
    failedAudioCount,
    listenerCount: listenerRows.length,
    displayViews,
    overlayViews,
    errorLogs,
    lastErrorAt: errorLogs[0]?.createdAt ?? null,
  };
}

export function getErrorStage(context?: string | null) {
  if (!context) return null;

  try {
    const parsed = JSON.parse(context) as { stage?: unknown };
    return typeof parsed.stage === "string" ? parsed.stage : null;
  } catch {
    return null;
  }
}

export function formatErrorContext(context?: string | null) {
  if (!context) return "No additional context.";

  try {
    const parsed = JSON.parse(context) as Record<string, unknown>;
    const summary = Object.entries(parsed)
      .map(([key, value]) => `${humanizeKey(key)}: ${String(value)}`)
      .join(" | ");

    return summary || "No additional context.";
  } catch {
    return context;
  }
}

function humanizeKey(value: string) {
  return value
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/_/g, " ")
    .replace(/^./, (character) => character.toUpperCase());
}
