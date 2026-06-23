import { NextResponse } from "next/server";
import { hasChurchPermission } from "@/lib/churchPermissions";
import { getOptionalChurchContext } from "@/lib/currentChurch";
import { getLanguageName, normalizeLanguageValue } from "@/lib/languageCatalog";
import { getRecordingForChurch } from "@/lib/recordingRepository";

type RouteContext = {
  params: Promise<{ recordingId: string; languageCode: string }>;
};

export async function GET(_: Request, { params }: RouteContext) {
  const { recordingId, languageCode: rawLanguageCode } = await params;
  const context = await getOptionalChurchContext();

  if (!context) {
    return NextResponse.json({ error: "Church login is required." }, { status: 401 });
  }

  if (!hasChurchPermission(context.actor, "recordings:manage")) {
    return NextResponse.json({ error: "This role cannot access recordings." }, { status: 403 });
  }

  const recording = await getRecordingForChurch(recordingId, context.church.id);
  const languageCode = normalizeLanguageValue(rawLanguageCode);
  const translation = recording?.translations.find(
    (item) => item.languageCode === languageCode && item.status === "COMPLETED",
  );

  if (!recording || !translation?.translatedText) {
    return NextResponse.json({ error: "Translation not found." }, { status: 404 });
  }

  const languageName = getLanguageName(languageCode);
  const fileName = `${slugify(recording.title)}-${slugify(languageName)}.txt`;

  return new NextResponse(translation.translatedText, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Content-Disposition": `attachment; filename="${fileName}"`,
      "Cache-Control": "private, no-store",
    },
  });
}

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "translation";
}
