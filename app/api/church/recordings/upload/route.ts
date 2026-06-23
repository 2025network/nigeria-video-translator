import { randomUUID } from "node:crypto";
import { mkdir, rm, writeFile } from "node:fs/promises";
import { NextResponse, type NextRequest } from "next/server";
import { hasChurchPermission } from "@/lib/churchPermissions";
import { getOptionalChurchContext } from "@/lib/currentChurch";
import {
  catalogLanguageCodes,
  normalizeLanguageList,
  normalizeLanguageValue,
} from "@/lib/languageCatalog";
import {
  getRecordingStorageLocation,
  validateRecordingFile,
} from "@/lib/recordingFiles";
import {
  createRecording,
  isChurchBranch,
} from "@/lib/recordingRepository";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const context = await getOptionalChurchContext();

  if (!context) {
    return redirectTo(request, "/church/login?next=/church/recordings/upload");
  }

  if (!hasChurchPermission(context.actor, "recordings:manage")) {
    return redirectWithError(
      request,
      "/church/dashboard",
      "Your role cannot manage recorded sermons.",
    );
  }

  try {
    const formData = await request.formData();
    const file = formData.get("recording");
    const title = String(formData.get("title") ?? "").trim().slice(0, 160);
    const sourceLanguage = normalizeLanguageValue(
      String(formData.get("sourceLanguage") ?? "en"),
    );
    const targetLanguages = normalizeLanguageList(
      formData.getAll("targetLanguages").map(String),
    ).filter((language) => catalogLanguageCodes.includes(language));
    const branchId = String(formData.get("branchId") ?? "").trim();

    if (!title) {
      return redirectWithError(
        request,
        "/church/recordings/upload",
        "Sermon title is required.",
      );
    }

    if (!catalogLanguageCodes.includes(sourceLanguage)) {
      return redirectWithError(
        request,
        "/church/recordings/upload",
        "Choose a valid source language.",
      );
    }

    if (!targetLanguages.length) {
      return redirectWithError(
        request,
        "/church/recordings/upload",
        "Choose at least one target language.",
      );
    }

    if (!(file instanceof File)) {
      return redirectWithError(
        request,
        "/church/recordings/upload",
        "Choose an MP3, MP4, WAV, or M4A recording.",
      );
    }

    const validation = validateRecordingFile(file);
    if (!validation.ok) {
      return redirectWithError(
        request,
        "/church/recordings/upload",
        validation.message,
      );
    }

    if (branchId && !(await isChurchBranch(context.church.id, branchId))) {
      return redirectWithError(
        request,
        "/church/recordings/upload",
        "Choose an active branch belonging to this church.",
      );
    }

    const id = randomUUID();
    const storage = getRecordingStorageLocation(
      context.church.id,
      id,
      validation.extension,
    );

    await mkdir(storage.directory, { recursive: true });
    await writeFile(storage.absolutePath, Buffer.from(await file.arrayBuffer()));

    try {
      await createRecording({
        id,
        churchId: context.church.id,
        branchId: branchId || null,
        title,
        sourceLanguage,
        targetLanguages,
        fileUrl: storage.publicUrl,
        originalFileName: sanitizeOriginalFileName(file.name),
      });
    } catch (error) {
      await rm(storage.absolutePath, { force: true });
      throw error;
    }

    return redirectTo(request, `/church/recordings/${id}?uploaded=1`);
  } catch (error) {
    console.error("[recordings] upload failed", {
      churchId: context.church.id,
      message: error instanceof Error ? error.message : "Unknown upload error",
    });
    return redirectWithError(
      request,
      "/church/recordings/upload",
      "The recording could not be saved. Please try again.",
    );
  }
}

function sanitizeOriginalFileName(fileName: string) {
  return fileName.replace(/[\u0000-\u001f\u007f]/g, "").trim().slice(0, 255) || "sermon-recording";
}

function redirectWithError(request: NextRequest, pathname: string, message: string) {
  const url = new URL(pathname, request.url);
  url.searchParams.set("error", message);
  return NextResponse.redirect(url, 303);
}

function redirectTo(request: NextRequest, pathname: string) {
  return NextResponse.redirect(new URL(pathname, request.url), 303);
}
