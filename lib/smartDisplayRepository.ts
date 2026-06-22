import { prisma } from "./db";
import {
  getLanguageName,
  normalizeLanguageValue,
} from "./languageCatalog";

export const displayUsageEventTypes = [
  "display_viewed",
  "language_changed",
] as const;

export type DisplayUsageEventType =
  (typeof displayUsageEventTypes)[number];

export async function getPublicDisplaySession(sessionId: string) {
  return prisma.sermonSession.findUnique({
    where: { id: sessionId },
    select: {
      id: true,
      title: true,
      status: true,
      listenerLanguages: true,
      updatedAt: true,
      church: {
        select: {
          churchName: true,
          logoUrl: true,
        },
      },
      branch: {
        select: {
          name: true,
        },
      },
    },
  });
}

export async function getPublicDisplayMessages(
  sessionId: string,
  languageValue: string,
  take = 12,
) {
  const languageCode = normalizeLanguageValue(languageValue || "en");
  const languageName = getLanguageName(languageCode);
  const languageValues = Array.from(
    new Set([languageCode, languageName].filter(Boolean)),
  );

  const messages = await prisma.sermonTranscriptMessage.findMany({
    where: {
      sessionId,
      language: { in: languageValues },
      isApproved: true,
    },
    select: {
      id: true,
      translatedText: true,
      language: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
    take,
  });

  return messages.reverse();
}

export async function recordDisplayUsage(input: {
  sessionId: string;
  eventType: DisplayUsageEventType;
  language: string;
  kioskMode: boolean;
}) {
  return prisma.displayUsageEvent.create({
    data: {
      sessionId: input.sessionId,
      eventType: input.eventType,
      languageCode: normalizeLanguageValue(input.language || "en"),
      kioskMode: input.kioskMode,
    },
  });
}
