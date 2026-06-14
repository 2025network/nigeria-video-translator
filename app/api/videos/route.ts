import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import {
  createTranslatedVideoWithVoiceOver,
  extractAudioFromVideo,
} from "@/lib/ffmpeg";
import { isSupportedLanguage } from "@/lib/languages";
import { generateSrt } from "@/lib/subtitles";
import { transcribeSpeech } from "@/lib/transcription";
import { translateTranscript } from "@/lib/translation";
import { generateVoiceOver } from "@/lib/voiceover";

export const runtime = "nodejs";

const publicDirectory = path.join(process.cwd(), "public");
const maxUploadSizeBytes = 100 * 1024 * 1024;

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const video = formData.get("video");
    const languageValue = formData.get("language");

    if (!(video instanceof File) || video.size === 0) {
      return NextResponse.json(
        { error: "Missing file. Please upload a recorded video." },
        { status: 400 },
      );
    }

    if (!video.type.startsWith("video/")) {
      return NextResponse.json(
        { error: "Invalid file type. Only video files are allowed." },
        { status: 400 },
      );
    }

    if (video.size > maxUploadSizeBytes) {
      return NextResponse.json(
        { error: "File is too large. Maximum upload size is 100MB." },
        { status: 413 },
      );
    }

    if (typeof languageValue !== "string" || !isSupportedLanguage(languageValue)) {
      return NextResponse.json(
        { error: "Choose Yoruba, Igbo, Hausa, or Nigerian Pidgin." },
        { status: 400 },
      );
    }

    await ensureStorageFolders();

    const id = `${Date.now()}-${randomUUID()}`;
    const extension = path.extname(video.name) || ".mp4";
    const safeBaseName = sanitizeFileName(video.name.replace(/\.[^.]+$/, ""));
    const storedVideoName = `${id}-${safeBaseName}${extension}`;
    const videoPath = path.join(publicDirectory, "uploads", storedVideoName);

    await writeFile(videoPath, Buffer.from(await video.arrayBuffer()));
    console.info("[pipeline] uploaded video saved", {
      uploadFilePath: videoPath,
      publicUrl: `/uploads/${storedVideoName}`,
      sizeBytes: video.size,
    });

    const audioPath = path.join(publicDirectory, "audio", `${id}.mp3`);
    const audio = await extractAudioFromVideo(videoPath, audioPath);

    const transcript = await transcribeSpeech({
      audioPath: audio.publicUrl,
      videoName: video.name,
    });
    const translation = await translateTranscript(transcript, languageValue);
    const ttsInputText = translation.text;
    const ttsInputMatchesTranslation = ttsInputText === translation.text;

    console.info("[pipeline] transcript and translation debug", {
      languageSelected: languageValue,
      originalTranscript: transcript,
      translatedTranscript: translation.text,
      textSentToTts: ttsInputText,
      ttsInputMatchesTranslation,
      translationMode: translation.mode,
    });

    const voiceOver = await generateVoiceOver(ttsInputText, languageValue);
    const subtitles = generateSrt({
      transcript,
      translation: translation.text,
      language: languageValue,
    });

    const transcriptPath = path.join(publicDirectory, "transcripts", `${id}.txt`);
    const translationPath = path.join(publicDirectory, "translations", `${id}.txt`);
    const subtitlesPath = path.join(publicDirectory, "subtitles", `${id}.srt`);
    const metadataPath = path.join(publicDirectory, "metadata", `${id}.json`);
    const translatedVideoPath = path.join(
      publicDirectory,
      "translated-videos",
      `${id}.mp4`,
    );
    const voiceOverPath = path.join(
      publicDirectory,
      "voiceovers",
      `${id}.${voiceOver.extension}`,
    );

    console.info("[voiceover] voice-over file path", {
      path: voiceOverPath,
      mode: voiceOver.mode,
      usedMock: voiceOver.usedMock,
    });

    await Promise.all([
      writeFile(transcriptPath, transcript, "utf8"),
      writeFile(translationPath, translation.text, "utf8"),
      writeFile(subtitlesPath, subtitles, "utf8"),
      writeFile(voiceOverPath, voiceOver.audioBuffer),
    ]);

    const translatedVideo = await createTranslatedVideoWithVoiceOver({
      originalVideoPath: videoPath,
      voiceOverPath,
      outputPath: translatedVideoPath,
    });
    console.info("[pipeline] translated video output", {
      uploadFilePath: videoPath,
      outputTranslatedVideoPath: translatedVideoPath,
      publicUrl: translatedVideo.publicUrl,
      ffmpegExitCode: translatedVideo.exitCode,
      usedFfmpeg: translatedVideo.usedFfmpeg,
    });

    await writeFile(
      metadataPath,
      JSON.stringify(
        {
          language: languageValue,
          translation,
          translatedVideo,
          tts: {
            inputText: ttsInputText,
            inputPreview: ttsInputText.slice(0, 200),
            inputMatchesTranslation: ttsInputMatchesTranslation,
            mode: voiceOver.mode,
            usedMock: voiceOver.usedMock,
            message: voiceOver.message,
            quotaUnavailable: voiceOver.quotaUnavailable,
            demoMode: voiceOver.demoMode,
          },
        },
        null,
        2,
      ),
      "utf8",
    );

    return NextResponse.json({
      id,
      language: languageValue,
      videoUrl: `/uploads/${storedVideoName}`,
      translatedVideoUrl: translatedVideo.publicUrl,
      audioUrl: audio.publicUrl,
      transcriptUrl: `/transcripts/${id}.txt`,
      translationUrl: `/translations/${id}.txt`,
      metadataUrl: `/metadata/${id}.json`,
      subtitlesUrl: `/subtitles/${id}.srt`,
      voiceOverUrl: `/voiceovers/${id}.${voiceOver.extension}`,
      voiceOver: {
        mimeType: voiceOver.mimeType,
        usedMock: voiceOver.usedMock,
        mode: voiceOver.mode,
        voice: voiceOver.voice,
        message: voiceOver.message,
        quotaUnavailable: voiceOver.quotaUnavailable,
        demoMode: voiceOver.demoMode,
      },
        translatedVideo: {
          url: translatedVideo.publicUrl,
          usedFfmpeg: translatedVideo.usedFfmpeg,
          message: translatedVideo.message,
          command: translatedVideo.command,
          exitCode: translatedVideo.exitCode,
          originalDurationSeconds: translatedVideo.originalDurationSeconds,
          voiceOverDurationSeconds: translatedVideo.voiceOverDurationSeconds,
        durationDifferenceSeconds: translatedVideo.durationDifferenceSeconds,
      },
      translation: {
        confidence: translation.confidence,
        mode: translation.mode,
        usedOpenAI: translation.usedOpenAI,
        message: translation.message,
      },
      message: audio.message,
      usedFfmpeg: audio.usedFfmpeg,
      ffmpeg: audio.diagnostics,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "The video could not be processed.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}

async function ensureStorageFolders() {
  await Promise.all(
    [
      "uploads",
      "audio",
      "transcripts",
      "translations",
      "subtitles",
      "voiceovers",
      "metadata",
      "translated-videos",
    ].map((folder) => mkdir(path.join(publicDirectory, folder), { recursive: true })),
  );
}

function sanitizeFileName(fileName: string) {
  return (
    fileName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
      .slice(0, 80) || "video"
  );
}



