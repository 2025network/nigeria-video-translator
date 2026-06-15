"use client";

import { useRef, useState } from "react";
import { Mic, MicOff } from "lucide-react";

type LiveMicCaptureProps = {
  sessionId: string;
  sessionStatus: string;
};

type TranscribeResponse = {
  sourceTranscript?: string;
  languagesSaved?: string[];
  failedLanguages?: Array<{ language: string; error: string }>;
  messageCount?: number;
  error?: string;
};

export function LiveMicCapture({ sessionId, sessionStatus }: LiveMicCaptureProps) {
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [permissionState, setPermissionState] = useState("Not requested");
  const [recordingState, setRecordingState] = useState("Stopped");
  const [latestTranscript, setLatestTranscript] = useState("");
  const [latestLanguageCount, setLatestLanguageCount] = useState(0);
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);

  const canCapture = sessionStatus === "LIVE";

  async function startMicrophone() {
    setError("");

    if (!canCapture) {
      setError("Start the sermon session before microphone capture.");
      return;
    }

    if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) {
      setError("This browser does not support live microphone capture. Use Chrome or Edge.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      setPermissionState("Granted");

      const recorder = new MediaRecorder(stream, {
        mimeType: getSupportedMimeType(),
      });

      recorder.ondataavailable = async (event) => {
        if (event.data.size > 0 && recorder.state !== "inactive") {
          await sendAudioChunk(event.data);
        }
      };
      recorder.onerror = () => {
        setError("Microphone recording failed. Check permission, then restart capture.");
      };
      recorder.onstop = () => {
        setRecordingState("Stopped");
      };

      mediaRecorderRef.current = recorder;
      recorder.start(10000);
      setRecordingState("Recording");
    } catch (captureError) {
      setPermissionState("Denied or unavailable");
      setError(
        captureError instanceof Error
          ? captureError.message
          : "Microphone permission was blocked or unavailable.",
      );
    }
  }

  function stopMicrophone() {
    mediaRecorderRef.current?.stop();
    mediaRecorderRef.current = null;
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setRecordingState("Stopped");
  }

  async function sendAudioChunk(blob: Blob) {
    if (!canCapture) return;

    setSending(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("audio", blob, `sermonbridge-${Date.now()}.webm`);

      const response = await fetch(
        `/api/church/live-sessions/${sessionId}/transcribe`,
        {
          method: "POST",
          body: formData,
        },
      );
      const payload = (await response.json()) as TranscribeResponse;

      if (!response.ok) {
        throw new Error(payload.error || "Audio transcription failed.");
      }

      setLatestTranscript(payload.sourceTranscript || "");
      setLatestLanguageCount(payload.languagesSaved?.length ?? 0);

      if (payload.failedLanguages?.length) {
        setError(
          `${payload.failedLanguages.length} language(s) failed while others were saved.`,
        );
      }
    } catch (sendError) {
      setError(
        sendError instanceof Error
          ? sendError.message
          : "Could not send audio chunk.",
      );
    } finally {
      setSending(false);
    }
  }

  return (
    <section className="rounded-lg border border-emerald-300/16 bg-white/[0.045] p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-emerald-300">
            Live microphone capture
          </p>
          <h2 className="mt-2 text-2xl font-semibold">Real-life audio input</h2>
          <p className="mt-2 text-sm leading-6 text-emerald-50/68">
            Captures short audio chunks every 10 seconds while the session is LIVE.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={startMicrophone}
            disabled={!canCapture || recordingState === "Recording"}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-emerald-400 px-4 text-sm font-semibold text-[#04120c] transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-55"
          >
            <Mic className="h-4 w-4" />
            Start Microphone
          </button>
          <button
            type="button"
            onClick={stopMicrophone}
            disabled={recordingState !== "Recording"}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-emerald-300/24 px-4 text-sm font-semibold text-emerald-100 transition hover:bg-white/8 disabled:cursor-not-allowed disabled:opacity-55"
          >
            <MicOff className="h-4 w-4" />
            Stop Microphone
          </button>
        </div>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-4">
        <Status label="Permission" value={permissionState} />
        <Status label="Recording" value={recordingState} />
        <Status label="Sending" value={sending ? "Uploading chunk" : "Idle"} />
        <Status label="Languages saved" value={String(latestLanguageCount)} />
      </div>

      {latestTranscript ? (
        <div className="mt-4 rounded-md border border-emerald-300/12 bg-[#07140f] p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-emerald-300">
            Latest transcribed text
          </p>
          <p className="mt-2 leading-7 text-emerald-50">{latestTranscript}</p>
        </div>
      ) : null}

      {error ? (
        <p className="mt-4 rounded-md border border-amber-300/30 bg-amber-300/10 p-4 text-sm font-semibold text-amber-50">
          {error}
        </p>
      ) : null}

      <div className="mt-4 rounded-md border border-emerald-300/12 bg-[#07140f] p-4 text-sm leading-6 text-emerald-50/68">
        <p className="font-semibold text-emerald-100">Manual update backup</p>
        <p className="mt-1">
          If microphone transcription is unavailable, use the manual sermon
          update form below to publish text to one language or all listener
          languages.
        </p>
      </div>
    </section>
  );
}

function Status({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-emerald-300/12 bg-[#07140f] p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-emerald-300">
        {label}
      </p>
      <p className="mt-2 text-sm font-semibold text-emerald-50">{value}</p>
    </div>
  );
}

function getSupportedMimeType() {
  const types = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4"];

  return types.find((type) => MediaRecorder.isTypeSupported(type)) || "";
}
