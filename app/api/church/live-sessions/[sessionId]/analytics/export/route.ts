import { NextResponse, type NextRequest } from "next/server";
import { cookies } from "next/headers";
import { churchSessionCookie } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getSessionAnalytics } from "@/lib/listenerAnalyticsRepository";

type ExportRouteContext = {
  params: Promise<{ sessionId: string }>;
};

export async function GET(request: NextRequest, { params }: ExportRouteContext) {
  const { sessionId } = await params;
  const churchId = await getAuthenticatedChurchId();

  if (!churchId) {
    return NextResponse.json({ error: "Church login is required." }, { status: 401 });
  }

  const analytics = await getSessionAnalytics(sessionId, churchId);

  if (!analytics) {
    return NextResponse.json({ error: "Session not found." }, { status: 404 });
  }

  const type = request.nextUrl.searchParams.get("type") || "listeners";
  const csv =
    type === "languages"
      ? toCsv(
          ["language", "languageCode", "count"],
          analytics.languages.map((row) => [row.language, row.languageCode, row.count]),
        )
      : toCsv(
          ["createdAt", "visitorId", "language", "languageCode", "country", "userAgent"],
          analytics.recentListeners.map((listener) => [
            listener.createdAt.toISOString(),
            listener.visitorId,
            listener.language,
            listener.languageCode,
            listener.country ?? "Unknown",
            listener.userAgent ?? "",
          ]),
        );

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="sermonbridge-${type}-${sessionId}.csv"`,
    },
  });
}

async function getAuthenticatedChurchId() {
  const cookieStore = await cookies();
  const churchId = cookieStore.get(churchSessionCookie)?.value;

  if (!churchId) return null;

  const church = await prisma.church.findUnique({
    where: { id: churchId },
    select: { id: true, status: true },
  });

  if (!church || church.status !== "Active") return null;

  return church.id;
}

function toCsv(headers: string[], rows: Array<Array<string | number>>) {
  return [headers, ...rows]
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
    .join("\n");
}
