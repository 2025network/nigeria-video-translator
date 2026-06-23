import { NextResponse } from "next/server";
import { hasChurchPermission } from "@/lib/churchPermissions";
import { getOptionalChurchContext } from "@/lib/currentChurch";
import { getRecordingForChurch } from "@/lib/recordingRepository";

type RouteContext = {
  params: Promise<{ recordingId: string }>;
};

export async function GET(_: Request, { params }: RouteContext) {
  const { recordingId } = await params;
  const context = await getOptionalChurchContext();

  if (!context) {
    return NextResponse.json({ error: "Church login is required." }, { status: 401 });
  }

  if (!hasChurchPermission(context.actor, "recordings:manage")) {
    return NextResponse.json({ error: "This role cannot access recordings." }, { status: 403 });
  }

  const recording = await getRecordingForChurch(recordingId, context.church.id);
  if (!recording?.transcriptText) {
    return NextResponse.json({ error: "Transcript not found." }, { status: 404 });
  }

  return new NextResponse(recording.transcriptText, {
    headers: textDownloadHeaders(`${slugify(recording.title)}-transcript.txt`),
  });
}

function textDownloadHeaders(fileName: string) {
  return {
    "Content-Type": "text/plain; charset=utf-8",
    "Content-Disposition": `attachment; filename="${fileName}"`,
    "Cache-Control": "private, no-store",
  };
}

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "sermon";
}
