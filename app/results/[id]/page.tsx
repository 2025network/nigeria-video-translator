import { access, readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Captions,
  FileText,
  Languages,
  Mic2,
  UploadCloud,
} from "lucide-react";
import type { SupportedLanguage } from "@/lib/languages";
import { VideoVersionToggle } from "./VideoVersionToggle";

type ResultPageProps = {
  params: Promise<{
    id: string;
  }>;
};

type ResultMetadata = {
  language?: SupportedLanguage;
  translation?: {
    confidence?: number;
    mode?: "real" | "mock";
    usedOpenAI?: boolean;
    message?: string;
    quotaUnavailable?: boolean;
    demoMode?: boolean;
  };
  translatedVideo?: {
    message?: string;
    usedFfmpeg?: boolean;
    command?: string[];
    exitCode?: number | null;
    durationDifferenceSeconds?: number | null;
  };
  tts?: {
    inputPreview?: string;
    inputMatchesTranslation?: boolean;
    mode?: "real" | "mock";
    usedMock?: boolean;
    message?: string;
    quotaUnavailable?: boolean;
    demoMode?: boolean;
  };
};

export default async function ResultPage({ params }: ResultPageProps) {
  const { id } = await params;
  const result = await loadResult(id);

  if (!result) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-[#06110d] text-white">
      <div className="section-shell py-8">
        <Link
          href="/upload"
          className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-200 hover:text-emerald-100"
        >
          <ArrowLeft className="h-4 w-4" />
          Upload another video
        </Link>
      </div>

      <section className="section-shell pb-16">
        {result.demoModeActive ? <AiUnavailableBanner quotaUnavailable={result.quotaUnavailable} /> : null}

        <div className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-300">
              Results
            </p>
            <h1 className="mt-3 text-4xl font-semibold sm:text-5xl">
              Translation artifacts
            </h1>
          </div>
          <Link
            href="/upload"
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-emerald-400 px-6 py-3 font-semibold text-[#04120c] transition hover:bg-emerald-300 focus-visible:focus-ring"
          >
            <UploadCloud className="h-5 w-5" />
            New upload
          </Link>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <VideoVersionToggle
            originalVideo={result.originalVideo}
            translatedVideo={result.translatedVideo}
            language={result.language}
          />

          <div className="grid gap-4">
            <InfoRow icon={<Languages className="h-5 w-5" />} label="Language selected">
              {result.language}
            </InfoRow>
            <InfoRow icon={<FileText className="h-5 w-5" />} label="Translation status">
              <div className="grid gap-1">
                <span>{result.translationMessage}</span>
                <span className="text-sm text-emerald-50/62">
                  Confidence: {(result.translationConfidence * 100).toFixed(0)}%
                </span>
                <span className="text-sm font-semibold text-emerald-200">
                  Translation Mode: {formatMode(result.translationMode)}
                </span>
                <span className="text-sm font-semibold text-emerald-200">
                  TTS Mode: {formatMode(result.ttsMode)}
                </span>
                <span className="text-sm text-emerald-50/62">
                  TTS input matches translated transcript: {result.ttsInputMatchesTranslation ? "Yes" : "No"}
                </span>
              </div>
            </InfoRow>
            <InfoRow icon={<Mic2 className="h-5 w-5" />} label="Translated video status">
              <div className="grid gap-1">
                <span>{result.translatedVideoMessage}</span>
                <span className="text-sm text-emerald-50/62">Duration difference: {formatDurationDifference(result.durationDifferenceSeconds)}</span>
                <span className="text-sm text-emerald-50/62">
                  FFmpeg exit code: {result.ffmpegExitCode ?? "not available"}
                </span>
              </div>
            </InfoRow>
            <InfoRow icon={<Mic2 className="h-5 w-5" />} label="Translated voice-over">
              {result.voiceOverUrl ? (
                <div className="grid gap-3">
                  {result.demoModeActive ? (
                    <p className="text-sm font-semibold text-emerald-200">Generated Voice-over</p>
                  ) : null}
                  <audio controls src={result.voiceOverUrl} className="w-full" />
                  <a
                    href={result.voiceOverUrl}
                    className="text-sm text-emerald-200 underline-offset-4 hover:underline"
                  >
                    {result.voiceOverUrl}
                  </a>
                </div>
              ) : (
                "No voice-over file was found for this result."
              )}
            </InfoRow>
            <InfoRow icon={<Captions className="h-5 w-5" />} label="Subtitle file">
              <a
                href={result.subtitlesUrl}
                className="text-emerald-200 underline-offset-4 hover:underline"
              >
                {result.subtitlesUrl}
              </a>
            </InfoRow>
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <TextPanel title={result.demoModeActive ? "Generated transcript" : "Original transcript"} content={result.transcript} />
          <TextPanel title={result.demoModeActive ? "Translation pending" : "Translated transcript"} content={result.translation} />
          <TextPanel title="First 200 characters sent to TTS" content={result.ttsInputPreview} />
        </div>
      </section>
    </main>
  );
}

function AiUnavailableBanner({ quotaUnavailable }: { quotaUnavailable: boolean }) {
  return (
    <div className="mb-6 rounded-lg border border-amber-300/30 bg-amber-300/10 p-5 text-amber-50">
      <p className="text-sm font-semibold uppercase tracking-[0.16em] text-amber-200">
        AI configuration needed
      </p>
      <h2 className="mt-2 text-2xl font-semibold">
        Live AI translation is temporarily unavailable.
      </h2>
      <p className="mt-3 leading-7 text-amber-50/78">
        Uploads, FFmpeg processing, subtitles, voice-over files, and translated video generation continue to work. When OpenAI access is available, SermonBridge will use live AI translation automatically.
        {quotaUnavailable ? " OpenAI quota is currently unavailable." : ""}
      </p>
    </div>
  );
}

function TextPanel({ title, content }: { title: string; content: string }) {
  return (
    <section className="rounded-lg border border-emerald-300/16 bg-white/[0.045] p-5">
      <h2 className="text-xl font-semibold">{title}</h2>
      <p className="mt-4 whitespace-pre-wrap leading-7 text-emerald-50/76">
        {content}
      </p>
    </section>
  );
}

function InfoRow({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-emerald-300/16 bg-white/[0.045] p-5">
      <div className="flex items-center gap-2 text-emerald-300">
        {icon}
        <span className="text-sm font-semibold uppercase tracking-[0.14em]">
          {label}
        </span>
      </div>
      <div className="mt-3 leading-7 text-emerald-50/78">{children}</div>
    </div>
  );
}

async function loadResult(id: string) {
  const publicDirectory = path.join(process.cwd(), "public");
  const safeId = id.replace(/[^a-zA-Z0-9-]/g, "");
  const [transcript, translation] = await Promise.all([
    readFile(path.join(publicDirectory, "transcripts", `${safeId}.txt`), "utf8"),
    readFile(path.join(publicDirectory, "translations", `${safeId}.txt`), "utf8"),
  ]).catch(() => [null, null]);

  if (!transcript || !translation) {
    return null;
  }

  const uploadsDirectory = path.join(publicDirectory, "uploads");
  const uploadFiles = await readdir(uploadsDirectory).catch(() => []);
  const videoFile = uploadFiles.find((file) => file.startsWith(`${safeId}-`));

  const metadata = await loadMetadata(publicDirectory, safeId);
  const voiceOverUrl = await resolveVoiceOverUrl(publicDirectory, safeId);
  const originalVideo = videoFile
    ? await resolveVideoDiagnostic({
        filePath: path.join(uploadsDirectory, videoFile),
        publicUrl: `/uploads/${videoFile}`,
      })
    : {
        exists: false,
        url: null,
        filePath: path.join(uploadsDirectory, `${safeId}-*`),
        sizeBytes: null,
        error: "Uploaded video file was not found in public/uploads.",
      };
  const translatedVideo = await resolveVideoDiagnostic({
    filePath: path.join(publicDirectory, "translated-videos", `${safeId}.mp4`),
    publicUrl: `/translated-videos/${safeId}.mp4`,
  });

  return {
    language: metadata?.language ?? detectLanguageFromTranslation(translation),
    transcript,
    translation,
    translationConfidence: metadata?.translation?.confidence ?? 0,
    translationMode: metadata?.translation?.mode ?? "unknown",
    translationMessage: metadata?.translation?.message ?? "Translation metadata was not found.",
    ttsMode: metadata?.tts?.mode ?? "unknown",
    ttsInputPreview: metadata?.tts?.inputPreview ?? "TTS input metadata was not found.",
    ttsInputMatchesTranslation: metadata?.tts?.inputMatchesTranslation ?? false,
    quotaUnavailable: Boolean(
      metadata?.translation?.quotaUnavailable || metadata?.tts?.quotaUnavailable,
    ),
    demoModeActive: Boolean(
      metadata?.translation?.demoMode ||
        metadata?.translation?.mode === "mock" ||
        metadata?.tts?.demoMode ||
        metadata?.tts?.mode === "mock",
    ),
    originalVideo,
    translatedVideo,
    translatedVideoMessage: metadata?.translatedVideo?.message ?? "Translated video metadata was not found.",
    ffmpegExitCode: metadata?.translatedVideo?.exitCode ?? null,
    durationDifferenceSeconds: metadata?.translatedVideo?.durationDifferenceSeconds ?? null,
    voiceOverUrl,
    subtitlesUrl: `/subtitles/${safeId}.srt`,
  };
}

async function loadMetadata(publicDirectory: string, id: string) {
  try {
    const rawMetadata = await readFile(
      path.join(publicDirectory, "metadata", `${id}.json`),
      "utf8",
    );

    return JSON.parse(rawMetadata) as ResultMetadata;
  } catch {
    return null;
  }
}

async function resolveVideoDiagnostic({
  filePath,
  publicUrl,
}: {
  filePath: string;
  publicUrl: string;
}) {
  try {
    await access(filePath);
    const fileStats = await stat(filePath);

    return {
      exists: true,
      url: publicUrl,
      filePath,
      sizeBytes: fileStats.size,
      error: null,
    };
  } catch {
    return {
      exists: false,
      url: null,
      filePath,
      sizeBytes: null,
      error: `Video file was not found at ${filePath}.`,
    };
  }
}

function formatMode(value: string) {
  if (value === "real") return "Real";
  if (value === "mock") return "Configuration required";

  return "Unknown";
}

function formatDurationDifference(value: number | null) {
  if (value === null) return "not available";

  return `${value.toFixed(1)} seconds`;
}
async function resolveVoiceOverUrl(publicDirectory: string, id: string) {
  const candidates = [`${id}.mp3`, `${id}.wav`];

  for (const fileName of candidates) {
    const filePath = path.join(publicDirectory, "voiceovers", fileName);

    try {
      await access(filePath);
      return `/voiceovers/${fileName}`;
    } catch {
      continue;
    }
  }

  return null;
}

function detectLanguageFromTranslation(translation: string) {
  if (translation.includes("Yoruba")) return "Yoruba";
  if (translation.includes("Igbo")) return "Igbo";
  if (translation.includes("Hausa")) return "Hausa";
  if (translation.includes("Nigerian Pidgin")) return "Nigerian Pidgin";
  return "Selected language";
}









