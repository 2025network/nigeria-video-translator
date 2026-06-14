"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  FileVideo,
  Loader2,
  UploadCloud,
  XCircle,
} from "lucide-react";
import { supportedLanguages, type SupportedLanguage } from "@/lib/languages";

type UploadState = "idle" | "uploading" | "processing" | "complete" | "error";
type ProcessingStage =
  | "Uploading"
  | "Extracting Audio"
  | "Transcribing"
  | "Translating"
  | "Generating Voice"
  | "Creating Translated Video"
  | "Completed";

const maxUploadSizeBytes = 100 * 1024 * 1024;
const processingStages: ProcessingStage[] = [
  "Uploading",
  "Extracting Audio",
  "Transcribing",
  "Translating",
  "Generating Voice",
  "Creating Translated Video",
  "Completed",
];

export default function UploadPage() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [language, setLanguage] = useState<SupportedLanguage>("Yoruba");
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<UploadState>("idle");
  const [message, setMessage] = useState("Select a video and target language.");
  const [isDragging, setIsDragging] = useState(false);
  const [activeStage, setActiveStage] = useState<ProcessingStage | null>(null);

  function handleFile(nextFile?: File) {
    if (!nextFile) return;

    if (!nextFile.type.startsWith("video/")) {
      setStatus("error");
      setMessage("Please choose a valid video file.");
      setFile(null);
      setActiveStage(null);
      return;
    }

    if (nextFile.size > maxUploadSizeBytes) {
      setStatus("error");
      setMessage("File is too large. Maximum upload size is 100MB.");
      setFile(null);
      return;
    }

    setFile(nextFile);
    setProgress(0);
    setStatus("idle");
    setMessage("Ready to upload.");
    setActiveStage(null);
  }

  function submitUpload() {
    if (!file) {
      setStatus("error");
      setMessage("Choose a video before starting.");
      return;
    }

    const formData = new FormData();
    formData.append("video", file);
    formData.append("language", language);

    const request = new XMLHttpRequest();
    request.open("POST", "/api/videos");

    setStatus("uploading");
    setActiveStage("Uploading");
    setMessage("Uploading video...");

    const processingTimer = window.setInterval(() => {
      setActiveStage((currentStage) => advanceProcessingStage(currentStage));
    }, 1800);

    request.upload.onprogress = (event) => {
      if (!event.lengthComputable) return;
      setProgress(Math.round((event.loaded / event.total) * 100));
    };

    request.onload = () => {
      if (request.status >= 200 && request.status < 300) {
        window.clearInterval(processingTimer);
        setStatus("complete");
        setActiveStage("Completed");
        setMessage("Processing complete. Opening results...");
        const response = JSON.parse(request.responseText) as { id: string };
        window.location.href = `/results/${response.id}`;
        return;
      }

      window.clearInterval(processingTimer);
      setStatus("error");
      setActiveStage(null);
      setMessage(readErrorMessage(request.responseText));
    };

    request.onerror = () => {
      window.clearInterval(processingTimer);
      setStatus("error");
      setActiveStage(null);
      setMessage("Upload failed. Please try again.");
    };

    request.send(formData);
  }

  return (
    <main className="min-h-screen bg-[#06110d] text-white">
      <div className="section-shell py-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-200 hover:text-emerald-100"
        >
          <ArrowLeft className="h-4 w-4" />
          Back home
        </Link>
      </div>

      <section className="section-shell grid gap-8 pb-16 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="pt-4">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-300">
            Secondary tool
          </p>
          <h1 className="mt-3 text-4xl font-semibold leading-tight sm:text-5xl">
            Upload a recorded sermon or event video
          </h1>
          <p className="mt-5 max-w-xl leading-7 text-emerald-50/72">
            SermonBridge is focused on live church translation widgets, but this
            upload tool remains available for recorded sermons, conference
            clips, and event videos that need transcript, translation,
            subtitles, and a separate translated voice-over.
          </p>
          <p className="mt-4 max-w-xl rounded-md border border-emerald-300/18 bg-emerald-300/10 p-4 text-sm leading-6 text-emerald-50/78">
            Maximum upload size is 100MB for safe hosting and server
            performance. Larger files may be supported later through cloud
            storage.
          </p>
        </div>

        <div className="rounded-lg border border-emerald-300/16 bg-white/[0.045] p-5 shadow-2xl shadow-black/20">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            onDragOver={(event) => {
              event.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(event) => {
              event.preventDefault();
              setIsDragging(false);
              handleFile(event.dataTransfer.files[0]);
            }}
            className={`flex min-h-72 w-full flex-col items-center justify-center rounded-lg border-2 border-dashed px-6 text-center transition ${
              isDragging
                ? "border-emerald-300 bg-emerald-300/12"
                : "border-emerald-300/24 bg-[#081a13]"
            }`}
          >
            <UploadCloud className="h-12 w-12 text-emerald-300" />
            <span className="mt-5 text-xl font-semibold">
              Drag and drop your video
            </span>
            <span className="mt-2 text-sm text-emerald-50/68">
              MP4, MOV, WebM, and other browser-supported video files. Maximum size: 100MB.
            </span>
          </button>
          <input
            ref={inputRef}
            type="file"
            accept="video/*"
            className="hidden"
            onChange={(event) => handleFile(event.target.files?.[0])}
          />

          <div className="mt-6 grid gap-4">
            {file ? (
              <div className="flex items-center gap-3 rounded-md border border-emerald-300/15 bg-[#07140f] p-4">
                <FileVideo className="h-6 w-6 shrink-0 text-emerald-300" />
                <div className="min-w-0">
                  <p className="truncate font-semibold">{file.name}</p>
                  <p className="text-sm text-emerald-50/62">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
            ) : null}

            <label className="grid gap-2">
              <span className="text-sm font-semibold text-emerald-100">
                Target language
              </span>
              <select
                value={language}
                onChange={(event) =>
                  setLanguage(event.target.value as SupportedLanguage)
                }
                className="min-h-12 rounded-md border border-emerald-300/20 bg-[#07140f] px-4 text-white outline-none focus-visible:focus-ring"
              >
                {supportedLanguages.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>

            <div>
              <div className="mb-2 flex items-center justify-between text-sm text-emerald-50/72">
                <span>Upload progress</span>
                <span>{progress}%</span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-emerald-400 transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>


            <div className="rounded-md border border-emerald-300/15 bg-[#07140f] p-4">
              <p className="font-semibold">Processing steps</p>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {processingStages.map((stage) => (
                  <div
                    key={stage}
                    className={`rounded-md border px-3 py-2 text-sm ${
                      activeStage === stage
                        ? "border-emerald-300 bg-emerald-300/12 text-emerald-50"
                        : "border-emerald-300/10 bg-white/[0.025] text-emerald-50/58"
                    }`}
                  >
                    {stage}
                  </div>
                ))}
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-md border border-emerald-300/15 bg-[#07140f] p-4">
              {status === "error" ? (
                <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-300" />
              ) : status === "uploading" || status === "processing" ? (
                <Loader2 className="mt-0.5 h-5 w-5 shrink-0 animate-spin text-emerald-300" />
              ) : (
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-300" />
              )}
              <div>
                <p className="font-semibold">Processing status</p>
                <p className="mt-1 text-sm text-emerald-50/68">{message}</p>
              </div>
            </div>

            <button
              type="button"
              onClick={submitUpload}
              disabled={status === "uploading" || status === "processing"}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-emerald-400 px-6 py-3 font-semibold text-[#04120c] transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:focus-ring"
            >
              <UploadCloud className="h-5 w-5" />
              Upload Video
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}

function advanceProcessingStage(currentStage: ProcessingStage | null) {
  if (currentStage === null) return "Uploading";
  const currentIndex = processingStages.indexOf(currentStage);
  const nextIndex = Math.min(currentIndex + 1, processingStages.length - 2);

  return processingStages[nextIndex];
}

function readErrorMessage(responseText: string) {
  try {
    const response = JSON.parse(responseText) as { error?: string };
    return response.error ?? "Upload failed. Please try again.";
  } catch {
    return "Upload failed. Please try again.";
  }
}








