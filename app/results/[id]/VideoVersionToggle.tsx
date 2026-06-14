"use client";

import { useState } from "react";
import { Languages, Video } from "lucide-react";

type VideoVersionToggleProps = {
  originalVideo: VideoFileDiagnostic;
  translatedVideo: VideoFileDiagnostic;
  language: string;
  demoModeActive: boolean;
};

type VideoFileDiagnostic = {
  exists: boolean;
  url: string | null;
  filePath: string;
  sizeBytes: number | null;
  error: string | null;
};

export function VideoVersionToggle({
  originalVideo,
  translatedVideo,
  language,
  demoModeActive,
}: VideoVersionToggleProps) {
  const [version, setVersion] = useState<"original" | "translated">("original");
  const canShowTranslated = translatedVideo.exists && Boolean(translatedVideo.url);
  const activeVideo = version === "translated" ? translatedVideo : originalVideo;
  const activeVideoUrl = activeVideo.exists ? activeVideo.url : null;
  const [playbackError, setPlaybackError] = useState<{
    url: string;
    message: string;
  } | null>(null);
  const activePlaybackError =
    playbackError?.url === activeVideoUrl ? playbackError.message : null;

  return (
    <section className="rounded-lg border border-emerald-300/16 bg-white/[0.045] p-4">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-emerald-300">
            Video playback
          </p>
          <h2 className="mt-1 text-xl font-semibold">
            {version === "translated"
              ? demoModeActive
                ? "Demo Translated Video"
                : "Translated Video"
              : "Original Video"}
          </h2>
          <p className="mt-1 text-sm text-emerald-50/68">
            {version === "translated"
              ? `${language} audio from the translated voice-over`
              : "Original English audio"}
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2 rounded-md border border-emerald-300/18 bg-[#07140f] p-1 text-sm font-semibold">
          <button
            type="button"
            onClick={() => setVersion("original")}
            className={`inline-flex min-h-10 items-center justify-center gap-2 rounded px-3 transition ${
              version === "original"
                ? "bg-emerald-400 text-[#04120c]"
                : "text-emerald-50/72 hover:bg-white/8"
            }`}
          >
            <Video className="h-4 w-4" />
            Original Version
          </button>
          <button
            type="button"
            onClick={() => setVersion("translated")}
            disabled={!canShowTranslated}
            className={`inline-flex min-h-10 items-center justify-center gap-2 rounded px-3 transition disabled:cursor-not-allowed disabled:opacity-50 ${
              version === "translated"
                ? "bg-emerald-400 text-[#04120c]"
                : "text-emerald-50/72 hover:bg-white/8"
            }`}
          >
            <Languages className="h-4 w-4" />
            Translated Version
          </button>
        </div>
      </div>

      {activeVideoUrl ? (
        <div className="grid gap-3">
          <video
            key={activeVideoUrl}
            src={activeVideoUrl}
            controls
            preload="metadata"
            className="aspect-video w-full rounded-md bg-black"
            onError={() => {
              setPlaybackError({
                url: activeVideoUrl,
                message:
                  "The file exists, but this browser cannot play the video format. Open the direct link below to verify the file, or upload an MP4/H.264 video.",
              });
            }}
          />
          {activePlaybackError ? (
            <p className="rounded-md border border-red-300/24 bg-red-950/24 p-3 text-sm leading-6 text-red-100">
              {activePlaybackError}
            </p>
          ) : null}
          <a
            href={activeVideoUrl}
            className="w-fit text-sm font-semibold text-emerald-200 underline-offset-4 hover:text-emerald-100 hover:underline"
          >
            Open active video directly: {activeVideoUrl}
          </a>
        </div>
      ) : (
        <div className="flex aspect-video w-full items-center justify-center rounded-md border border-red-300/24 bg-red-950/24 p-6 text-center text-red-100">
          {activeVideo.error ?? "This video file could not be found, so the player is hidden."}
        </div>
      )}

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <VideoDiagnosticCard
          title="Original Video"
          description="Plays the uploaded video with its original English audio."
          linkLabel="Open Original Video"
          diagnostic={originalVideo}
        />
        <VideoDiagnosticCard
          title={demoModeActive ? "Demo Translated Video" : "Translated Video"}
          description={`Plays a generated second video using the ${language} translated voice-over instead of the original audio.`}
          linkLabel="Open Translated Video"
          diagnostic={translatedVideo}
        />
      </div>
    </section>
  );
}

function VideoDiagnosticCard({
  title,
  description,
  linkLabel,
  diagnostic,
}: {
  title: string;
  description: string;
  linkLabel: string;
  diagnostic: VideoFileDiagnostic;
}) {
  return (
    <div className="rounded-md border border-emerald-300/18 bg-[#07140f] p-4">
      <h3 className="font-semibold">{title}</h3>
      <p className="mt-1 text-sm leading-6 text-emerald-50/68">{description}</p>
      <dl className="mt-4 grid gap-2 text-sm">
        <div>
          <dt className="font-semibold text-emerald-300">URL</dt>
          <dd className="mt-1 break-words text-emerald-50/72">
            {diagnostic.url ?? "Not available"}
          </dd>
        </div>
        <div>
          <dt className="font-semibold text-emerald-300">Path</dt>
          <dd className="mt-1 break-words text-emerald-50/72">{diagnostic.filePath}</dd>
        </div>
        <div>
          <dt className="font-semibold text-emerald-300">Size</dt>
          <dd className="mt-1 text-emerald-50/72">
            {diagnostic.sizeBytes === null ? "Not available" : formatBytes(diagnostic.sizeBytes)}
          </dd>
        </div>
      </dl>
      {diagnostic.url ? (
        <a
          href={diagnostic.url}
          className="mt-4 inline-flex min-h-10 items-center justify-center rounded-md border border-emerald-300/28 px-4 text-sm font-semibold text-emerald-100 hover:bg-white/8"
        >
          {linkLabel}: {diagnostic.url}
        </a>
      ) : (
        <p className="mt-4 rounded-md border border-red-300/24 bg-red-950/24 p-3 text-sm leading-6 text-red-100">
          {diagnostic.error ?? "Video file was not found."}
        </p>
      )}
    </div>
  );
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
