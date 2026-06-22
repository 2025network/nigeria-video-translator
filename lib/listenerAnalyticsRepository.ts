import { prisma } from "./db";
import { getLanguageName, normalizeLanguageValue } from "./languageCatalog";

export async function recordListenerSession(input: {
  sessionId: string;
  language: string;
  visitorId: string;
  country?: string | null;
  userAgent?: string | null;
}) {
  const languageCode = normalizeLanguageValue(input.language || "en");

  return prisma.listenerSession.create({
    data: {
      sessionId: input.sessionId,
      languageCode,
      visitorId: input.visitorId.slice(0, 120),
      country: input.country || null,
      userAgent: input.userAgent?.slice(0, 500) || null,
    },
  });
}

export async function getChurchAnalyticsSummary(churchId: string) {
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const [totalListeners, activeListeners, sessionsThisMonth, languageRows, branchRows] =
    await Promise.all([
      prisma.listenerSession.count({
        where: { session: { churchId } },
      }),
      prisma.listenerSession.findMany({
        where: {
          session: { churchId },
          createdAt: { gte: new Date(Date.now() - 15 * 60 * 1000) },
        },
        select: { visitorId: true },
        distinct: ["visitorId"],
      }),
      prisma.sermonSession.count({
        where: { churchId, createdAt: { gte: monthStart } },
      }),
      prisma.listenerSession.groupBy({
        by: ["languageCode"],
        where: { session: { churchId } },
        _count: { _all: true },
        orderBy: { _count: { languageCode: "desc" } },
        take: 1,
      }),
      prisma.listenerSession.groupBy({
        by: ["sessionId"],
        where: { session: { churchId, branchId: { not: null } } },
        _count: { _all: true },
        orderBy: { _count: { sessionId: "desc" } },
        take: 20,
      }),
    ]);

  const branchSessionIds = branchRows.map((row) => row.sessionId);
  const branchSessions = branchSessionIds.length
    ? await prisma.sermonSession.findMany({
        where: { id: { in: branchSessionIds } },
        include: { branch: true },
      })
    : [];
  const topBranchSession = branchRows
    .map((row) => ({
      row,
      session: branchSessions.find((session) => session.id === row.sessionId),
    }))
    .find((item) => item.session?.branch);

  return {
    totalListeners,
    activeListeners: activeListeners.length,
    sessionsThisMonth,
    mostPopularLanguage: languageRows[0]
      ? getLanguageName(languageRows[0].languageCode)
      : "No listener data yet",
    mostPopularBranch: topBranchSession?.session?.branch?.name ?? "No branch listener data yet",
  };
}

export async function getSessionAnalytics(sessionId: string, churchId: string) {
  const session = await prisma.sermonSession.findFirst({
    where: { id: sessionId, churchId },
    include: { church: true, branch: true },
  });

  if (!session) return null;

  const [
    totalListeners,
    languageRows,
    countryRows,
    recentListeners,
    timelineRows,
    displayViews,
    kioskDisplayViews,
    displayLanguageRows,
    overlayViews,
    cleanOverlayViews,
    overlayLanguageRows,
  ] =
    await Promise.all([
      prisma.listenerSession.count({ where: { sessionId } }),
      prisma.listenerSession.groupBy({
        by: ["languageCode"],
        where: { sessionId },
        _count: { _all: true },
        orderBy: { _count: { languageCode: "desc" } },
      }),
      prisma.listenerSession.groupBy({
        by: ["country"],
        where: { sessionId },
        _count: { _all: true },
        orderBy: { _count: { country: "desc" } },
      }),
      prisma.listenerSession.findMany({
        where: { sessionId },
        orderBy: { createdAt: "desc" },
        take: 25,
      }),
      prisma.listenerSession.findMany({
        where: { sessionId },
        orderBy: { createdAt: "asc" },
        select: { createdAt: true },
      }),
      prisma.displayUsageEvent.count({
        where: { sessionId, eventType: "display_viewed" },
      }),
      prisma.displayUsageEvent.count({
        where: {
          sessionId,
          eventType: "display_viewed",
          kioskMode: true,
        },
      }),
      prisma.displayUsageEvent.groupBy({
        by: ["languageCode"],
        where: {
          sessionId,
          eventType: { in: ["display_viewed", "language_changed"] },
        },
        _count: { _all: true },
        orderBy: { _count: { languageCode: "desc" } },
      }),
      prisma.overlayUsageEvent.count({
        where: { sessionId, eventType: "overlay_viewed" },
      }),
      prisma.overlayUsageEvent.count({
        where: {
          sessionId,
          eventType: "overlay_viewed",
          cleanMode: true,
        },
      }),
      prisma.overlayUsageEvent.groupBy({
        by: ["languageCode"],
        where: {
          sessionId,
          eventType: { in: ["overlay_viewed", "language_changed"] },
        },
        _count: { _all: true },
        orderBy: { _count: { languageCode: "desc" } },
      }),
    ]);

  return {
    session,
    totalListeners,
    languages: languageRows.map((row) => ({
      language: getLanguageName(row.languageCode),
      languageCode: row.languageCode,
      count: row._count._all,
    })),
    countries: countryRows.map((row) => ({
      country: row.country || "Unknown",
      count: row._count._all,
    })),
    recentListeners: recentListeners.map((listener) => ({
      ...listener,
      language: getLanguageName(listener.languageCode),
    })),
    timeline: buildDailyTimeline(timelineRows.map((row) => row.createdAt)),
    displayViews,
    kioskDisplayViews,
    displayLanguages: displayLanguageRows.map((row) => ({
      language: getLanguageName(row.languageCode),
      languageCode: row.languageCode,
      count: row._count._all,
    })),
    overlayViews,
    cleanOverlayViews,
    overlayLanguages: overlayLanguageRows.map((row) => ({
      language: getLanguageName(row.languageCode),
      languageCode: row.languageCode,
      count: row._count._all,
    })),
  };
}

export async function getBranchAnalytics(churchId: string) {
  const branches = await prisma.churchBranch.findMany({
    where: { churchId },
    include: {
      sermonSessions: {
        include: {
          listenerSessions: true,
        },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  return branches.map((branch) => {
    const listeners = branch.sermonSessions.flatMap((session) => session.listenerSessions);
    const languageCounts = new Map<string, number>();

    for (const listener of listeners) {
      languageCounts.set(listener.languageCode, (languageCounts.get(listener.languageCode) ?? 0) + 1);
    }

    const topLanguage = Array.from(languageCounts.entries()).sort((a, b) => b[1] - a[1])[0];

    return {
      branchId: branch.id,
      listenerCount: listeners.length,
      sessionCount: branch.sermonSessions.length,
      topLanguage: topLanguage ? getLanguageName(topLanguage[0]) : "No listener data yet",
    };
  });
}

function buildDailyTimeline(dates: Date[]) {
  const counts = new Map<string, number>();

  for (const date of dates) {
    const key = date.toISOString().slice(0, 10);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  return Array.from(counts.entries()).map(([date, count]) => ({ date, count }));
}
