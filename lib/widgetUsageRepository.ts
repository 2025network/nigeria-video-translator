import { prisma } from "./db";

export const widgetUsageEventTypes = [
  "widget_loaded",
  "live_started",
  "language_changed",
] as const;

export type WidgetUsageEventType = (typeof widgetUsageEventTypes)[number];

export async function createWidgetUsageEvent(input: {
  churchSlug: string;
  branchSlug?: string;
  eventType: WidgetUsageEventType;
  selectedLanguage?: string;
}) {
  const church = await prisma.church.findUnique({
    where: { slug: input.churchSlug },
    select: { id: true },
  });
  const branch =
    church && input.branchSlug
      ? await prisma.churchBranch.findUnique({
          where: {
            churchId_slug: {
              churchId: church.id,
              slug: input.branchSlug,
            },
          },
          select: { id: true },
        })
      : null;

  return prisma.widgetUsageEvent.create({
    data: {
      churchId: church?.id,
      branchId: branch?.id,
      churchSlug: input.churchSlug,
      branchSlug: input.branchSlug,
      eventType: input.eventType,
      selectedLanguage: input.selectedLanguage,
    },
  });
}

export async function getWidgetUsageStats(churchId: string) {
  const [eventCounts, branchCounts, languageCounts, branchTotals] = await Promise.all([
    prisma.widgetUsageEvent.groupBy({
      by: ["eventType"],
      where: { churchId },
      _count: { _all: true },
    }),
    prisma.widgetUsageEvent.groupBy({
      by: ["branchId", "branchSlug", "eventType"],
      where: {
        churchId,
        branchId: { not: null },
      },
      _count: { _all: true },
    }),
    prisma.widgetUsageEvent.groupBy({
      by: ["selectedLanguage"],
      where: {
        churchId,
        selectedLanguage: { not: null },
      },
      _count: { _all: true },
      orderBy: {
        _count: {
          selectedLanguage: "desc",
        },
      },
    }),
    prisma.widgetUsageEvent.groupBy({
      by: ["branchId", "branchSlug"],
      where: {
        churchId,
        branchId: { not: null },
      },
      _count: { _all: true },
      orderBy: {
        _count: {
          branchId: "desc",
        },
      },
    }),
  ]);

  return {
    totalWidgetLoads: countEvent(eventCounts, "widget_loaded"),
    totalLiveStarts: countEvent(eventCounts, "live_started"),
    languageChangeCount: countEvent(eventCounts, "language_changed"),
    branchCounts,
    languageCounts,
    branchTotals,
  };
}

function countEvent(
  rows: Array<{ eventType: string; _count: { _all: number } }>,
  eventType: WidgetUsageEventType,
) {
  return rows.find((row) => row.eventType === eventType)?._count._all ?? 0;
}
