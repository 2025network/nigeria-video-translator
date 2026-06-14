import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { copyFile, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import ffmpegStaticPath from "ffmpeg-static";
import ffmpeg from "fluent-ffmpeg";

export type FfmpegDiagnostics = {
  ffmpegStaticInstalled: boolean;
  ffmpegStaticPath: string | null;
  projectFfmpegStaticPath: string | null;
  envFfmpegPath: string | null;
  selectedPath: string | null;
  selectedPathExists: boolean;
  source: "ffmpeg-static" | "FFMPEG_PATH" | "missing";
};

export type AudioExtractionResult = {
  outputPath: string;
  publicUrl: string;
  usedFfmpeg: boolean;
  message: string;
  diagnostics: FfmpegDiagnostics;
};

export type TranslatedVideoResult = {
  outputPath: string;
  publicUrl: string;
  usedFfmpeg: boolean;
  message: string;
  command: string[];
  exitCode: number | null;
  originalDurationSeconds: number | null;
  voiceOverDurationSeconds: number | null;
  durationDifferenceSeconds: number | null;
  diagnostics: FfmpegDiagnostics;
};

export async function extractAudioFromVideo(
  videoPath: string,
  outputPath: string,
): Promise<AudioExtractionResult> {
  await mkdir(path.dirname(outputPath), { recursive: true });

  const diagnostics = resolveFfmpegDiagnostics();
  logFfmpegDiagnostics(diagnostics);

  if (!diagnostics.selectedPath || !diagnostics.selectedPathExists) {
    return createMockAudioArtifact(
      videoPath,
      outputPath,
      diagnostics,
      "FFmpeg binary could not be found. Continuing with mock audio.",
    );
  }

  ffmpeg.setFfmpegPath(diagnostics.selectedPath);

  try {
    await runAudioExtraction(videoPath, outputPath);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown FFmpeg error.";

    return createMockAudioArtifact(
      videoPath,
      outputPath,
      diagnostics,
      `FFmpeg audio extraction failed: ${message}. Continuing with mock audio.`,
    );
  }

  return {
    outputPath,
    publicUrl: `/audio/${path.basename(outputPath)}`,
    usedFfmpeg: true,
    message: "Audio extracted successfully with FFmpeg.",
    diagnostics,
  };
}

export async function createTranslatedVideoWithVoiceOver({
  originalVideoPath,
  voiceOverPath,
  outputPath,
}: {
  originalVideoPath: string;
  voiceOverPath: string;
  outputPath: string;
}): Promise<TranslatedVideoResult> {
  await mkdir(path.dirname(outputPath), { recursive: true });

  const diagnostics = resolveFfmpegDiagnostics();
  logFfmpegDiagnostics(diagnostics);

  console.info("[ffmpeg] translated video paths", {
    uploadFilePath: originalVideoPath,
    voiceOverPath,
    outputTranslatedVideoPath: outputPath,
  });

  const command = [
    "-y",
    "-i",
    originalVideoPath,
    "-i",
    voiceOverPath,
    "-map",
    "0:v:0",
    "-map",
    "1:a:0",
    "-c:v",
    "libx264",
    "-preset",
    "veryfast",
    "-pix_fmt",
    "yuv420p",
    "-c:a",
    "aac",
    "-b:a",
    "192k",
    "-movflags",
    "+faststart",
    "-shortest",
    outputPath,
  ];

  if (!diagnostics.selectedPath || !diagnostics.selectedPathExists) {
    await copyFile(originalVideoPath, outputPath);

    return {
      outputPath,
      publicUrl: `/translated-videos/${path.basename(outputPath)}`,
      usedFfmpeg: false,
      message:
        "FFmpeg binary could not be found. Copied original video as a fallback translated-video artifact.",
      command,
      exitCode: null,
      originalDurationSeconds: null,
      voiceOverDurationSeconds: null,
      durationDifferenceSeconds: null,
      diagnostics,
    };
  }

  const [originalDurationSeconds, voiceOverDurationSeconds] = await Promise.all([
    getMediaDurationSeconds(diagnostics.selectedPath, originalVideoPath),
    getMediaDurationSeconds(diagnostics.selectedPath, voiceOverPath),
  ]);
  const durationDifferenceSeconds = calculateDurationDifference(
    originalDurationSeconds,
    voiceOverDurationSeconds,
  );

  if (durationDifferenceSeconds !== null && durationDifferenceSeconds > 1) {
    console.warn("[ffmpeg] translated audio duration differs from original video", {
      originalDurationSeconds,
      voiceOverDurationSeconds,
      durationDifferenceSeconds,
    });
  }

  console.info("[ffmpeg] creating translated video", {
    executable: diagnostics.selectedPath,
    command,
  });

  try {
    const exitCode = await runFfmpegCommand(diagnostics.selectedPath, command);
    console.info("[ffmpeg] translated video completed", {
      outputTranslatedVideoPath: outputPath,
      exitCode,
    });

    return {
      outputPath,
      publicUrl: `/translated-videos/${path.basename(outputPath)}`,
      usedFfmpeg: true,
      message: "Created translated video with translated voice-over audio.",
      command,
      exitCode,
      originalDurationSeconds,
      voiceOverDurationSeconds,
      durationDifferenceSeconds,
      diagnostics,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown FFmpeg error.";
    console.warn("[ffmpeg] translated video generation failed; copying original fallback", {
      error: message,
      command,
    });
    await copyFile(originalVideoPath, outputPath);

    return {
      outputPath,
      publicUrl: `/translated-videos/${path.basename(outputPath)}`,
      usedFfmpeg: false,
      message: `Translated video generation failed: ${message}. Copied original video as fallback artifact.`,
      command,
      exitCode: null,
      originalDurationSeconds,
      voiceOverDurationSeconds,
      durationDifferenceSeconds,
      diagnostics,
    };
  }
}

export function resolveFfmpegDiagnostics(): FfmpegDiagnostics {
  const normalizedStaticPath = normalizeExecutablePath(ffmpegStaticPath);
  const normalizedProjectStaticPath = normalizeExecutablePath(getProjectFfmpegStaticPath());
  const normalizedEnvPath = normalizeExecutablePath(process.env.FFMPEG_PATH ?? null);
  const staticPathExists = isUsableFfmpegPath(normalizedStaticPath);
  const projectStaticPathExists = isUsableFfmpegPath(normalizedProjectStaticPath);
  const envPathExists = isUsableFfmpegPath(normalizedEnvPath);
  const ffmpegStaticInstalled = Boolean(
    normalizedStaticPath || normalizedProjectStaticPath,
  );

  if (staticPathExists) {
    return {
      ffmpegStaticInstalled,
      ffmpegStaticPath: normalizedStaticPath,
      projectFfmpegStaticPath: normalizedProjectStaticPath,
      envFfmpegPath: normalizedEnvPath,
      selectedPath: normalizedStaticPath,
      selectedPathExists: true,
      source: "ffmpeg-static",
    };
  }

  if (projectStaticPathExists) {
    return {
      ffmpegStaticInstalled,
      ffmpegStaticPath: normalizedStaticPath,
      projectFfmpegStaticPath: normalizedProjectStaticPath,
      envFfmpegPath: normalizedEnvPath,
      selectedPath: normalizedProjectStaticPath,
      selectedPathExists: true,
      source: "ffmpeg-static",
    };
  }

  if (envPathExists) {
    return {
      ffmpegStaticInstalled,
      ffmpegStaticPath: normalizedStaticPath,
      projectFfmpegStaticPath: normalizedProjectStaticPath,
      envFfmpegPath: normalizedEnvPath,
      selectedPath: normalizedEnvPath,
      selectedPathExists: true,
      source: "FFMPEG_PATH",
    };
  }

  const selectedPath = normalizedStaticPath ?? normalizedProjectStaticPath ?? normalizedEnvPath;

  return {
    ffmpegStaticInstalled,
    ffmpegStaticPath: normalizedStaticPath,
    projectFfmpegStaticPath: normalizedProjectStaticPath,
    envFfmpegPath: normalizedEnvPath,
    selectedPath,
    selectedPathExists: false,
    source: "missing",
  };
}

function normalizeExecutablePath(value: string | null): string | null {
  if (!value) return null;

  return path.normalize(value.replace(/^['"]|['"]$/g, ""));
}

function getProjectFfmpegStaticPath() {
  const executableName = process.platform === "win32" ? "ffmpeg.exe" : "ffmpeg";

  return path.join(process.cwd(), "node_modules", "ffmpeg-static", executableName);
}

function isUsableFfmpegPath(value: string | null) {
  return Boolean(
    value &&
      !isBundledNextPath(value) &&
      existsSync(/*turbopackIgnore: true*/ value),
  );
}

function isBundledNextPath(value: string) {
  const normalizedValue = path.normalize(value).toLowerCase();

  return (
    normalizedValue.includes(`${path.sep}.next${path.sep}`) ||
    normalizedValue.includes(`${path.sep}vendor-chunks${path.sep}`)
  );
}

function logFfmpegDiagnostics(diagnostics: FfmpegDiagnostics) {
  console.info("[ffmpeg] diagnostics", {
    ffmpegStaticInstalled: diagnostics.ffmpegStaticInstalled,
    ffmpegStaticPath: diagnostics.ffmpegStaticPath,
    projectFfmpegStaticPath: diagnostics.projectFfmpegStaticPath,
    envFfmpegPath: diagnostics.envFfmpegPath,
    selectedPath: diagnostics.selectedPath,
    selectedPathExists: diagnostics.selectedPathExists,
    source: diagnostics.source,
  });
}

async function createMockAudioArtifact(
  videoPath: string,
  outputPath: string,
  diagnostics: FfmpegDiagnostics,
  message: string,
): Promise<AudioExtractionResult> {
  await writeFile(
    outputPath,
    [
      `Mock audio artifact for ${path.basename(videoPath)}.`,
      message,
      `FFmpeg source: ${diagnostics.source}`,
      `FFmpeg path: ${diagnostics.selectedPath ?? "not resolved"}`,
      `FFmpeg file exists: ${diagnostics.selectedPathExists}`,
      "Mock transcription does not require playable audio in this MVP.",
      "",
    ].join("\n"),
    "utf8",
  );

  console.warn("[ffmpeg] using mock audio fallback", {
    message,
    selectedPath: diagnostics.selectedPath,
    selectedPathExists: diagnostics.selectedPathExists,
  });

  return {
    outputPath,
    publicUrl: `/audio/${path.basename(outputPath)}`,
    usedFfmpeg: false,
    message,
    diagnostics,
  };
}

function runAudioExtraction(videoPath: string, outputPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    let ffmpegOutput = "";

    ffmpeg(videoPath)
      .noVideo()
      .audioCodec("libmp3lame")
      .audioBitrate("128k")
      .format("mp3")
      .on("stderr", (line) => {
        ffmpegOutput += `${line}\n`;
      })
      .on("error", (error) => {
        reject(new Error(error.message || ffmpegOutput || "FFmpeg failed."));
      })
      .on("end", () => {
        resolve();
      })
      .save(outputPath);
  });
}

function getMediaDurationSeconds(
  ffmpegPath: string,
  mediaPath: string,
): Promise<number | null> {
  return new Promise((resolve) => {
    let stderr = "";
    const ffmpegProcess = spawn(ffmpegPath, ["-i", mediaPath]);

    ffmpegProcess.stderr.on("data", (chunk: Buffer) => {
      stderr += chunk.toString();
    });
    ffmpegProcess.on("error", () => resolve(null));
    ffmpegProcess.on("close", () => {
      const match = stderr.match(/Duration:\s(\d{2}):(\d{2}):(\d{2}\.\d+)/);

      if (!match) {
        resolve(null);
        return;
      }

      const [, hours, minutes, seconds] = match;
      resolve(Number(hours) * 3600 + Number(minutes) * 60 + Number(seconds));
    });
  });
}

function calculateDurationDifference(
  firstDuration: number | null,
  secondDuration: number | null,
) {
  if (firstDuration === null || secondDuration === null) return null;

  return Math.abs(firstDuration - secondDuration);
}

function runFfmpegCommand(ffmpegPath: string, args: string[]): Promise<number> {
  return new Promise((resolve, reject) => {
    let stderr = "";
    const ffmpegProcess = spawn(ffmpegPath, args);

    ffmpegProcess.stderr.on("data", (chunk: Buffer) => {
      stderr += chunk.toString();
    });
    ffmpegProcess.on("error", reject);
    ffmpegProcess.on("close", (code) => {
      console.info("[ffmpeg] process exited", {
        exitCode: code,
      });

      if (code === 0) {
        resolve(code);
        return;
      }

      reject(new Error(stderr || `FFmpeg exited with code ${code}.`));
    });
  });
}

