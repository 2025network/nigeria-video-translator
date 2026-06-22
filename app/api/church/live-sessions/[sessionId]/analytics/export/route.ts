import { NextResponse, type NextRequest } from "next/server";
import { canAccessChurchBranch, hasChurchPermission } from "@/lib/churchPermissions";
import { getOptionalChurchContext } from "@/lib/currentChurch";
import { getSessionAnalytics } from "@/lib/listenerAnalyticsRepository";

type ExportRouteContext = {
  params: Promise<{ sessionId: string }>;
};

export async function GET(request: NextRequest, { params }: ExportRouteContext) {
  const { sessionId } = await params;
  const context = await getOptionalChurchContext();

  if (!context) {
    return NextResponse.json({ error: "Church login is required." }, { status: 401 });
  }

  if (!hasChurchPermission(context.actor, "analytics:view")) {
    return NextResponse.json({ error: "This role cannot export analytics." }, { status: 403 });
  }

  const analytics = await getSessionAnalytics(sessionId, context.church.id);

  if (!analytics || !canAccessChurchBranch(context.actor, analytics.session.branchId)) {
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

function toCsv(headers: string[], rows: Array<Array<string | number>>) {
  return [headers, ...rows]
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
    .join("\n");
}
