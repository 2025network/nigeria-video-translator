"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Headphones, Play, Square } from "lucide-react";

export type SpeakerOutputMessage = {
  id: string;
  sourceText: string;
  translatedText: string;
  language: string;
  audioUrl: string | null;
  audioStatus: string | null;
  audioError: string | null;
  createdAt: string;
};

type SpeakerOutputModeProps = {
  sessionId: string;
  languages: string[];
  initialMessages: SpeakerOutputMessage[];
};

export function SpeakerOutputMode({
  sessionId,
  languages,
  initialMessages,
}: SpeakerOutputModeProps) {
  const [enabled, setEnabled] = useState(false);
  const [language, setLanguage] = useState(languages[0] ?? "English");
  const [messages, setMessages] = useState(initialMessages);
  const [playbackError, setPlaybackError] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const playedMessageIdRef = useRef<string | null>(null);

  const languageMessages = useMemo(
    () => messages.filter((message) => message.language === language),
    [language, messages],
  );
  const latestMessage = languageMessages.at(-1) ?? null;

  useEffect(() => {
    let active = true;

    async function refreshMessages() {
      setIsRefreshing(true);

      try {
        const response = await fetch(
          `/api/church/live-sessions/${sessionId}/messages?language=${encodeURIComponent(language)}`,
          { cache: "no-store" },
        );
        const payload = (await response.json()) as {
          messages?: SpeakerOutputMessage[];
          error?: string;
        };

        if (!response.ok) {
          throw new Error(payload.error || "Could not load speaker output messages.");
        }

        if (active) {
          setMessages(payload.messages ?? []);
        }
      } catch (error) {
        if (active) {
          setPlaybackError(
            error instanceof Error
              ? error.message
              : "Could not load speaker output messages.",
          );
        }
      } finally {
        if (active) {
          setIsRefreshing(false);
        }
      }
    }

    refreshMessages();
    const intervalId = window.setInterval(refreshMessages, 5000);

    return () => {
      active = false;
      window.clearInterval(intervalId);
    };
  }, [language, sessionId]);

  useEffect(() => {
    if (!enabled || !latestMessage?.audioUrl) return;
    if (playedMessageIdRef.current === latestMessage.id) return;

    playedMessageIdRef.current = latestMessage.id;
    setPlaybackError("");

    const audio = new Audio(latestMessage.audioUrl);
    audioRef.current = audio;
    audio.play().catch(() => {
      setPlaybackError(
        "Browser playback was blocked. Click Enable Speaker Output again, then keep this page open.",
      );
    });
  }, [enabled, latestMessage]);

  function enableOutput() {
    setEnabled(true);
    setPlaybackError("");
  }

  function disableOutput() {
    setEnabled(false);
    audioRef.current?.pause();
    audioRef.current = null;
  }

  return (
    <section className="rounded-lg border border-emerald-300/16 bg-white/[0.045] p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-emerald-300">
            Speaker Output Mode
          </p>
          <h2 className="mt-2 text-2xl font-semibold">Play translated audio from this laptop</h2>
          <p className="mt-2 text-sm leading-6 text-emerald-50/68">
            Click Enable Speaker Output before service starts so the browser can play translated audio.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={enableOutput}
            disabled={enabled}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-emerald-400 px-4 text-sm font-semibold text-[#04120c] transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Play className="h-4 w-4" />
            Enable Speaker Output
          </button>
          <button
            type="button"
            onClick={disableOutput}
            disabled={!enabled}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-emerald-300/24 px-4 text-sm font-semibold text-emerald-100 transition hover:bg-white/8 disabled:cursor-not-allowed disabled:opacity-55"
          >
            <Square className="h-4 w-4" />
            Disable
          </button>
        </div>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-3">
        <label className="grid gap-2 rounded-md border border-emerald-300/12 bg-[#07140f] p-4 text-sm font-semibold text-emerald-100">
          Output language
          <select
            value={language}
            onChange={(event) => {
              setLanguage(event.target.value);
              playedMessageIdRef.current = null;
            }}
            className="min-h-11 rounded-md border border-emerald-300/18 bg-[#06110d] px-3 text-white outline-none focus:border-emerald-300"
          >
            {languages.map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
        </label>
        <StatusCard label="Output" value={enabled ? "Enabled" : "Disabled"} />
        <StatusCard label="Current language" value={language} />
      </div>

      <div className="mt-4 rounded-md border border-emerald-300/12 bg-[#07140f] p-4">
        <div className="flex items-center gap-2 text-emerald-300">
          <Headphones className="h-5 w-5" />
          <p className="text-sm font-semibold uppercase tracking-[0.12em]">
            Latest translated message
          </p>
        </div>
        {latestMessage ? (
          <div className="mt-3 grid gap-3">
            <p className="text-sm leading-6 text-emerald-50/58">
              {new Date(latestMessage.createdAt).toLocaleTimeString()}
            </p>
            <p className="text-lg leading-8 text-emerald-50">
              {latestMessage.translatedText}
            </p>
            {latestMessage.audioUrl ? (
              <audio controls src={latestMessage.audioUrl} className="w-full" />
            ) : latestMessage.audioStatus === "PENDING" ? (
              <p className="rounded-md border border-amber-300/24 bg-amber-300/10 p-3 text-sm font-semibold text-amber-50">
                Audio is being prepared.
              </p>
            ) : latestMessage.audioStatus === "FAILED" ? (
              <p className="rounded-md border border-red-300/24 bg-red-950/24 p-3 text-sm font-semibold text-red-100">
                {latestMessage.audioError || "Speaker audio could not be generated."}
              </p>
            ) : (
              <p className="rounded-md border border-amber-300/24 bg-amber-300/10 p-3 text-sm font-semibold text-amber-50">
                Audio is being prepared.
              </p>
            )}
          </div>
        ) : (
          <p className="mt-3 text-sm leading-6 text-emerald-50/66">
            Waiting for a translated message in {language}.
          </p>
        )}
      </div>

      {playbackError ? (
        <p className="mt-4 rounded-md border border-amber-300/30 bg-amber-300/10 p-4 text-sm font-semibold text-amber-50">
          {playbackError}
        </p>
      ) : null}

      <p className="mt-4 text-xs font-semibold uppercase tracking-[0.12em] text-emerald-50/45">
        {isRefreshing ? "Checking for new speaker audio..." : "Auto-checking for new speaker audio every 5 seconds"}
      </p>
    </section>
  );
}

function StatusCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-emerald-300/12 bg-[#07140f] p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-emerald-300">
        {label}
      </p>
      <p className="mt-2 text-sm font-semibold text-emerald-50">{value}</p>
    </div>
  );
}
