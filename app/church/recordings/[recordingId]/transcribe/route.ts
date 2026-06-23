import { NextResponse, type NextRequest } from "next/server";
import { hasChurchPermission } from "@/lib/churchPermissions";
import { getOptionalChurchContext } from "@/lib/currentChurch";
import {
  getRecordingForChurch,
  saveRecordingTranscript,
  updateRecordingStatus,
} from "@/lib/recordingRepository";
import {
  getSafeProcessingMessage,
  transcribeRecording,
} from "@/lib/recordingProcessing";

export const runtime = "nodejs";
export const maxDuration = 300;

type RouteContext = {
  params: Promise<{ recordingId: string }>;
};

export async function POST(request: NextRequest, { params }: RouteContext) {
  const { recordingId } = await params;
  const context = await getOptionalChurchContext();

  if (!context) {
    return redirectTo(request, `/church/login?next=/church/recordings/${recordingId}`);
  }

  if (!hasChurchPermission(context.actor, "recordings:manage")) {
    return redirectWithError(request, recordingId, "Your role cannot process recordings.");
  }

  const recording = await getRecordingForChurch(recordingId, context.church.id);
  if (!recording) {
    return redirectTo(request, "/church/recordings?error=Recording%20not%20found.");
  }

  if (!process.env.OPENAI_API_KEY) {
    return redirectWithError(
      request,
      recordingId,
      "OpenAI transcription is not configured. Add OPENAI_API_KEY on the server.",
    );
  }

  await updateRecordingStatus(recording.id, "PROCESSING");

  try {
    const result = await transcribeRecording({
      fileUrl: recording.fileUrl,
      originalFileName: recording.originalFileName,
      sourceLanguage: recording.sourceLanguage,
    });

    await saveRecordingTranscript(recording.id, result.transcript, result.segments);
    return redirectTo(request, `/church/recordings/${recording.id}?transcribed=1`);
  } catch (error) {
    const message = getSafeProcessingMessage(
      error,
      "Recording transcription failed.",
    );
    await updateRecordingStatus(recording.id, "FAILED", message);
    console.error("[recordings] transcription failed", {
      recordingId: recording.id,
      message,
    });
    return redirectWithError(request, recording.id, message);
  }
}

function redirectWithError(
  request: NextRequest,
  recordingId: string,
  message: string,
) {
  const url = new URL(`/church/recordings/${recordingId}`, request.url);
  url.searchParams.set("error", message);
  return NextResponse.redirect(url, 303);
}

function redirectTo(request: NextRequest, pathname: string) {
  return NextResponse.redirect(new URL(pathname, request.url), 303);
}
