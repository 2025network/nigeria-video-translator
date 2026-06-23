import { NextResponse, type NextRequest } from "next/server";
import { hasChurchPermission } from "@/lib/churchPermissions";
import { getOptionalChurchContext } from "@/lib/currentChurch";
import {
  completeRecordingTranslation,
  failRecordingTranslation,
  getRecordingForChurch,
  markRecordingTranslationProcessing,
  parseRecordingLanguages,
  parseTimedTranscript,
  updateRecordingStatus,
} from "@/lib/recordingRepository";
import {
  getSafeProcessingMessage,
  translateRecording,
  writeRecordingSubtitle,
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
      recording.id,
      "OpenAI translation is not configured. Add OPENAI_API_KEY on the server.",
    );
  }

  if (!recording.transcriptText) {
    return redirectWithError(
      request,
      recording.id,
      "Generate the source transcript before generating translations.",
    );
  }

  const targetLanguages = parseRecordingLanguages(recording.targetLanguages);
  if (!targetLanguages.length) {
    return redirectWithError(
      request,
      recording.id,
      "This recording has no target languages.",
    );
  }

  const segments = parseTimedTranscript(recording.timedTranscriptJson);
  let failureCount = 0;
  await updateRecordingStatus(recording.id, "PROCESSING");

  for (const languageCode of targetLanguages) {
    await markRecordingTranslationProcessing(recording.id, languageCode);

    try {
      const translatedText = await translateRecording({
        transcript: recording.transcriptText,
        sourceLanguageCode: recording.sourceLanguage,
        targetLanguageCode: languageCode,
      });
      const subtitleUrl = await writeRecordingSubtitle({
        churchId: recording.churchId,
        recordingId: recording.id,
        languageCode,
        translatedText,
        segments,
      });

      await completeRecordingTranslation({
        recordingId: recording.id,
        languageCode,
        translatedText,
        subtitleUrl,
      });
    } catch (error) {
      failureCount += 1;
      const message = getSafeProcessingMessage(
        error,
        "Translation could not be completed.",
      );
      await failRecordingTranslation(recording.id, languageCode, message);
      console.error("[recordings] translation failed", {
        recordingId: recording.id,
        languageCode,
        message,
      });
    }
  }

  if (failureCount) {
    const message = `${failureCount} of ${targetLanguages.length} translations could not be completed.`;
    await updateRecordingStatus(recording.id, "FAILED", message);
    return redirectWithError(request, recording.id, message);
  }

  await updateRecordingStatus(recording.id, "COMPLETED");
  return redirectTo(request, `/church/recordings/${recording.id}?translated=1`);
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
