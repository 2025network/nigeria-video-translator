import { prisma } from "./db";
import { normalizeLanguageValue } from "./languageCatalog";

export const overlayUsageEventTypes = [
  "overlay_viewed",
  "language_changed",
] as const;

export type OverlayUsageEventType =
  (typeof overlayUsageEventTypes)[number];

export async function recordOverlayUsage(input: {
  sessionId: string;
  eventType: OverlayUsageEventType;
  language: string;
  cleanMode: boolean;
}) {
  return prisma.overlayUsageEvent.create({
    data: {
      sessionId: input.sessionId,
      eventType: input.eventType,
      languageCode: normalizeLanguageValue(input.language || "en"),
      cleanMode: input.cleanMode,
    },
  });
}
