import { prisma } from "./db";
import {
  catalogLanguageCodes,
  languageNamesFromValues,
  normalizeLanguageList,
} from "./languageCatalog";

export const sermonSessionStatuses = ["READY", "LIVE", "ENDED"] as const;

export type SermonSessionStatus = (typeof sermonSessionStatuses)[number];

export type SermonSessionFormInput = {
  title: string;
  sourceLanguage: string;
  listenerLanguages: string[];
  streamUrl?: string;
  branchId?: string;
};

const sermonSessionInclude = {
  church: true,
};

export type SermonSessionWithChurch = Awaited<
  ReturnType<typeof getSermonSessionById>
>;

export async function getSermonSessionsForChurch(churchId: string) {
  return prisma.sermonSession.findMany({
    where: { churchId },
    include: { branch: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function getSermonSessionById(id: string) {
  return prisma.sermonSession.findUnique({
    where: { id },
    include: sermonSessionInclude,
  });
}

export async function getSermonSessionForChurch(id: string, churchId: string) {
  return prisma.sermonSession.findFirst({
    where: { id, churchId },
    include: sermonSessionInclude,
  });
}

export async function getTranscriptMessagesForSession(
  sessionId: string,
  language?: string,
) {
  return prisma.sermonTranscriptMessage.findMany({
    where: {
      sessionId,
      ...(language ? { language } : {}),
    },
    orderBy: { createdAt: "asc" },
  });
}

export async function getLatestTranscriptMessagesForSession(
  sessionId: string,
  language?: string,
  take = 12,
) {
  const messages = await prisma.sermonTranscriptMessage.findMany({
    where: {
      sessionId,
      ...(language ? { language } : {}),
    },
    orderBy: { createdAt: "desc" },
    take,
  });

  return messages.reverse();
}

export async function getTranscriptMessageStats(sessionId: string) {
  const [messageCount, lastMessage] = await Promise.all([
    prisma.sermonTranscriptMessage.count({
      where: { sessionId },
    }),
    prisma.sermonTranscriptMessage.findFirst({
      where: { sessionId },
      orderBy: { createdAt: "desc" },
      select: { createdAt: true },
    }),
  ]);

  return {
    messageCount,
    lastTranscriptAt: lastMessage?.createdAt ?? null,
  };
}

export async function getSessionErrorLogs(sessionId: string) {
  return prisma.liveSessionErrorLog.findMany({
    where: { sessionId },
    orderBy: { createdAt: "desc" },
    take: 8,
  });
}

export async function getLatestListenableSessionForChurch(churchId: string) {
  return prisma.sermonSession.findFirst({
    where: {
      churchId,
      status: { in: ["READY", "LIVE"] },
    },
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
  });
}

export async function getLatestListenableSessionForBranch(branchId: string) {
  return prisma.sermonSession.findFirst({
    where: {
      branchId,
      status: { in: ["READY", "LIVE"] },
    },
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
  });
}

export async function getLatestListenableSessionsForChurches(churchIds: string[]) {
  const sessions = await prisma.sermonSession.findMany({
    where: {
      churchId: { in: churchIds },
      status: { in: ["READY", "LIVE"] },
    },
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
  });

  const sessionByChurch = new Map<string, (typeof sessions)[number]>();

  for (const session of sessions) {
    if (!sessionByChurch.has(session.churchId)) {
      sessionByChurch.set(session.churchId, session);
    }
  }

  return sessionByChurch;
}

export async function createSermonSession(
  churchId: string,
  input: SermonSessionFormInput,
) {
  return prisma.sermonSession.create({
    data: {
      churchId,
      title: input.title,
      sourceLanguage: input.sourceLanguage,
      listenerLanguages: serializeSessionLanguages(input.listenerLanguages),
      streamUrl: input.streamUrl || null,
      branchId: input.branchId || null,
      status: "READY",
    },
  });
}

export async function getChurchSessionStats(churchId: string) {
  const [totalLiveSessions, totalListeners] = await Promise.all([
    prisma.sermonSession.count({ where: { churchId } }),
    prisma.widgetUsageEvent.count({
      where: {
        churchId,
        eventType: { in: ["widget_loaded", "live_started"] },
      },
    }),
  ]);

  return { totalLiveSessions, totalListeners };
}

export async function startSermonSession(id: string, churchId: string) {
  return prisma.sermonSession.update({
    where: { id, churchId },
    data: {
      status: "LIVE",
      startedAt: new Date(),
      endedAt: null,
    },
  });
}

export async function endSermonSession(id: string, churchId: string) {
  return prisma.sermonSession.update({
    where: { id, churchId },
    data: {
      status: "ENDED",
      endedAt: new Date(),
    },
  });
}

export async function addTranscriptMessage(input: {
  sessionId: string;
  sourceText: string;
  translatedText: string;
  language: string;
  audioUrl?: string | null;
  audioStatus?: string | null;
  audioError?: string | null;
}) {
  return prisma.sermonTranscriptMessage.create({
    data: input,
  });
}

export async function updateTranscriptMessageAudio(
  id: string,
  input: {
    audioUrl?: string | null;
    audioStatus: string;
    audioError?: string | null;
  },
) {
  return prisma.sermonTranscriptMessage.update({
    where: { id },
    data: input,
  });
}

export async function deleteTranscriptMessage(id: string, sessionId: string) {
  return prisma.sermonTranscriptMessage.deleteMany({
    where: { id, sessionId },
  });
}

export async function clearTranscriptMessages(sessionId: string) {
  return prisma.sermonTranscriptMessage.deleteMany({
    where: { sessionId },
  });
}

export async function logLiveSessionError(input: {
  sessionId: string;
  message: string;
  context?: unknown;
}) {
  return prisma.liveSessionErrorLog.create({
    data: {
      sessionId: input.sessionId,
      message: input.message,
      context:
        typeof input.context === "undefined"
          ? null
          : JSON.stringify(input.context).slice(0, 3000),
    },
  });
}

export function serializeSessionLanguages(languages: string[]) {
  const filtered = normalizeLanguageList(languages).filter((language) =>
    catalogLanguageCodes.includes(language),
  );

  return Array.from(new Set(filtered.length ? filtered : catalogLanguageCodes)).join(",");
}

export function parseSessionLanguages(value?: string | null) {
  const parsed = (value ?? "")
    .split(",")
    .map((language) => language.trim())
    .filter(Boolean);

  return languageNamesFromValues(parsed.length ? parsed : catalogLanguageCodes);
}

export function getSessionListenUrl(sessionId: string) {
  return `/listen/${sessionId}`;
}
