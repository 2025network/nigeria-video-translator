import { prisma } from "./db";
import { catalogLanguages } from "./languageCatalog";

export const sermonSessionStatuses = ["READY", "LIVE", "ENDED"] as const;

export type SermonSessionStatus = (typeof sermonSessionStatuses)[number];

export type SermonSessionFormInput = {
  title: string;
  sourceLanguage: string;
  listenerLanguages: string[];
  streamUrl?: string;
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

export async function getLatestListenableSessionForChurch(churchId: string) {
  return prisma.sermonSession.findFirst({
    where: {
      churchId,
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
      status: "READY",
    },
  });
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
}) {
  return prisma.sermonTranscriptMessage.create({
    data: input,
  });
}

export function serializeSessionLanguages(languages: string[]) {
  const filtered = languages.filter((language) => catalogLanguages.includes(language));

  return Array.from(new Set(filtered.length ? filtered : catalogLanguages)).join(",");
}

export function parseSessionLanguages(value?: string | null) {
  const parsed = (value ?? "")
    .split(",")
    .map((language) => language.trim())
    .filter(Boolean);

  return Array.from(new Set(parsed.length ? parsed : catalogLanguages));
}

export function getSessionListenUrl(sessionId: string) {
  return `/listen/${sessionId}`;
}
