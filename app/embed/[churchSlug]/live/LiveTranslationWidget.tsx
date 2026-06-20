"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Headphones,
  Languages,
  Mic,
  MicOff,
  Play,
  QrCode,
  Radio,
  Square,
} from "lucide-react";
import { BackButton } from "@/app/components/BackButton";
import { countryCatalog, getRecommendedLanguageNames } from "@/lib/countryCatalog";
import { getYouTubeEmbedUrl } from "@/lib/demoChurches";
import { languageCatalog } from "@/lib/languageCatalog";
import { defaultListenerLanguages, isListenerLanguage } from "@/lib/listenerLanguages";

type LiveStatus = "Waiting" | "Listening" | "Translating" | "Live";
type ListenerLanguage = string;
type ChurchWidgetView = {
  slug: string;
  churchName: string;
  youtubeLiveUrl: string;
  enabledTranslationCountries: string[];
  enabledLanguages: string[];
  supportedLanguages: string[];
  status: string;
};
type WidgetContext = {
  branchSlug?: string;
};
type SpeechRecognitionResultLike = {
  isFinal: boolean;
  0: {
    transcript: string;
  };
};
type SpeechRecognitionEventLike = {
  resultIndex: number;
  results: {
    length: number;
    [index: number]: SpeechRecognitionResultLike;
  };
};
type SpeechRecognitionErrorLike = {
  error?: string;
  message?: string;
};
type BrowserSpeechRecognition = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onstart: (() => void) | null;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: SpeechRecognitionErrorLike) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};
type LiveTranslateResponse = {
  translation?: string;
  error?: string;
};

declare global {
  interface Window {
    SpeechRecognition?: new () => BrowserSpeechRecognition;
    webkitSpeechRecognition?: new () => BrowserSpeechRecognition;
  }
}

export function LiveTranslationWidget({
  church,
  widgetContext,
}: {
  church: ChurchWidgetView;
  widgetContext?: WidgetContext;
}) {
  const [country, setCountry] = useState(church.enabledTranslationCountries[0] ?? "Nigeria");
  const [language, setLanguage] = useState<ListenerLanguage>(() =>
    getEnabledListenerLanguages(church.supportedLanguages)[0],
  );
  const [status, setStatus] = useState<LiveStatus>("Waiting");
  const [finalTranscript, setFinalTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [isTranslating, setIsTranslating] = useState(false);
  const [translationError, setTranslationError] = useState("");
  const [error, setError] = useState("");
  const [languageQuery, setLanguageQuery] = useState("");
  const recognitionRef = useRef<BrowserSpeechRecognition | null>(null);
  const manuallyStoppedRef = useRef(false);
  const trackedWidgetLoadRef = useRef(false);

  const youtubeEmbedUrl = getYouTubeEmbedUrl(church.youtubeLiveUrl);
  const transcript = `${finalTranscript} ${interimTranscript}`.trim();
  const isListening = status === "Listening" || status === "Translating" || status === "Live";
  const hasSpeechSupport =
    typeof window !== "undefined" &&
    Boolean(window.SpeechRecognition || window.webkitSpeechRecognition);

  const enabledListenerLanguages = useMemo(() => getEnabledListenerLanguages(church.supportedLanguages), [church.supportedLanguages]);
  const recommendedLanguages = useMemo(() => getRecommendedLanguageNames(country), [country]);
  const allListenerLanguages = useMemo(() => Array.from(new Set([...enabledListenerLanguages, ...languageCatalog.map((item) => item.name)])), [enabledListenerLanguages]);
  const search = languageQuery.trim().toLowerCase();
  const visibleRecommendedLanguages = recommendedLanguages.filter((item) => item.toLowerCase().includes(search));
  const visibleListenerLanguages = allListenerLanguages.filter((item) => item.toLowerCase().includes(search));

  useEffect(() => {
    if (!trackedWidgetLoadRef.current) {
      trackedWidgetLoadRef.current = true;
      sendWidgetUsageEvent({
        churchSlug: church.slug,
        branchSlug: widgetContext?.branchSlug,
        eventType: "widget_loaded",
        selectedLanguage: language,
      });
    }

    return () => {
      recognitionRef.current?.stop();
    };
  }, [church.slug, language, widgetContext?.branchSlug]);

  useEffect(() => {
    const cleanTranscript = transcript.trim();

    if (!cleanTranscript) {
      return;
    }

    const controller = new AbortController();
    const timeoutId = window.setTimeout(async () => {
      setIsTranslating(true);
      setTranslationError("");

      try {
        const response = await fetch("/api/live-translate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            transcript: cleanTranscript,
            targetLanguage: language,
          }),
          signal: controller.signal,
        });
        const data = (await response.json()) as LiveTranslateResponse;

        if (!response.ok) {
          throw new Error(data.error ?? "Translation is being prepared. Please keep this page open.");
        }

        setTranslatedText(data.translation ?? "");
      } catch (translationRequestError) {
        if (controller.signal.aborted) return;

        setTranslatedText("");
        setTranslationError(
          translationRequestError instanceof Error
            ? translationRequestError.message
            : "Translation is being prepared. Please keep this page open.",
        );
      } finally {
        if (!controller.signal.aborted) {
          setIsTranslating(false);
        }
      }
    }, 650);

    return () => {
      controller.abort();
      window.clearTimeout(timeoutId);
    };
  }, [language, transcript]);

  async function startLiveTranslation() {
    sendWidgetUsageEvent({
      churchSlug: church.slug,
      branchSlug: widgetContext?.branchSlug,
      eventType: "live_started",
      selectedLanguage: language,
    });

    setError("");
    setFinalTranscript("");
    setInterimTranscript("");
    setTranslatedText("");
    setTranslationError("");
    setIsTranslating(false);
    manuallyStoppedRef.current = false;

    if (!hasSpeechSupport) {
      setStatus("Waiting");
      setError(
        "This browser does not support the Web Speech API yet. Try Chrome or Edge on localhost or HTTPS.",
      );
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((track) => track.stop());
    } catch {
      setStatus("Waiting");
      setError("Microphone permission is required to start live sermon transcription.");
      return;
    }

    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Recognition) return;

    recognitionRef.current?.stop();
    const recognition = new Recognition();
    recognitionRef.current = recognition;
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onstart = () => {
      setStatus("Listening");
    };

    recognition.onresult = (event) => {
      let nextFinal = "";
      let nextInterim = "";

      for (let index = event.resultIndex; index < event.results.length; index += 1) {
        const result = event.results[index];
        const text = result[0]?.transcript ?? "";

        if (result.isFinal) {
          nextFinal += `${text} `;
        } else {
          nextInterim += text;
        }
      }

      if (nextFinal) {
        setFinalTranscript((current) => `${current} ${nextFinal}`.trim());
      }

      setInterimTranscript(nextInterim.trim());
      setStatus("Translating");

      window.setTimeout(() => {
        setStatus("Live");
      }, 450);
    };

    recognition.onerror = (event) => {
      setError(`Speech recognition stopped: ${event.error ?? event.message ?? "unknown error"}.`);
      setStatus("Waiting");
    };

    recognition.onend = () => {
      if (!manuallyStoppedRef.current && status !== "Waiting") {
        setStatus("Waiting");
      }
    };

    recognition.start();
  }

  function stopLiveTranslation() {
    manuallyStoppedRef.current = true;
    recognitionRef.current?.stop();
    recognitionRef.current = null;
    setStatus(finalTranscript ? "Live" : "Waiting");
    setInterimTranscript("");
  }

  return (
    <main className="min-h-screen bg-[#06110d] p-3 text-white sm:p-4">
      <section className="mx-auto grid max-w-5xl gap-3">
        <div><BackButton href="/" /></div>
        <header className="rounded-lg border border-emerald-300/16 bg-white/[0.055] p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-emerald-300">
                <Radio className="h-4 w-4" />
                SermonBridge Live Translation Widget
              </p>
              <h1 className="mt-2 text-2xl font-semibold leading-tight">{church.churchName}</h1>
              <p className="mt-1 text-sm text-emerald-50/68">
                Church live translation companion for sermons, websites, WordPress, YouTube Live, and app WebViews.
              </p>
            </div>
            <StatusBadge status={status} />
          </div>
        </header>

        {error ? (
          <div className="rounded-lg border border-amber-300/24 bg-amber-400/10 p-4 text-sm font-semibold leading-6 text-amber-50">
            {error}
          </div>
        ) : null}

        <div className="grid gap-3 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="rounded-lg border border-emerald-300/16 bg-black/30 p-3">
            <div className="aspect-video overflow-hidden rounded-md bg-black">
              {church.status === "Active" ? (
                <iframe
                  src={youtubeEmbedUrl || "https://www.youtube.com/embed/ysz5S6PUM-U"}
                  title={`${church.churchName} YouTube Live`}
                  className="h-full w-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              ) : (
                <div className="flex h-full items-center justify-center p-6 text-center text-emerald-50/68">
                  This church widget is currently inactive.
                </div>
              )}
            </div>

            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={startLiveTranslation}
                disabled={isListening}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-emerald-400 px-5 font-semibold text-[#04120c] transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Play className="h-5 w-5" />
                Start Live Translation
              </button>
              <button
                type="button"
                onClick={stopLiveTranslation}
                disabled={!isListening}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md border border-emerald-300/22 px-5 font-semibold text-emerald-50 transition hover:bg-white/8 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Square className="h-5 w-5" />
                Stop
              </button>
            </div>
          </section>

          <aside className="grid gap-3">
            <section className="rounded-lg border border-emerald-300/16 bg-white/[0.055] p-4">
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                <label className="grid gap-2 text-sm font-semibold text-emerald-100">
                  Country
                  <select
                    value={country}
                    onChange={(event) => {
                      const nextCountry = event.target.value;
                      setCountry(nextCountry);
                      const firstRecommendation = getRecommendedLanguageNames(nextCountry)[0];
                      if (firstRecommendation) setLanguage(firstRecommendation);
                    }}
                    className="min-h-11 rounded-md border border-emerald-300/18 bg-[#07140f] px-3 text-white"
                  >
                    {countryCatalog.map((item) => (
                      <option key={item.code} value={item.name}>{item.name}</option>
                    ))}
                  </select>
                </label>
                <label className="grid gap-2 text-sm font-semibold text-emerald-100">
                  Listener language
                  <input
                    value={languageQuery}
                    onChange={(event) => setLanguageQuery(event.target.value)}
                    placeholder="Search language"
                    className="min-h-10 rounded-md border border-emerald-300/18 bg-[#07140f] px-3 text-white outline-none placeholder:text-emerald-50/35"
                  />
                  <select
                    value={language}
                    onChange={(event) => {
                      const nextLanguage = event.target.value as ListenerLanguage;
                      setLanguage(nextLanguage);
                      sendWidgetUsageEvent({
                        churchSlug: church.slug,
                        branchSlug: widgetContext?.branchSlug,
                        eventType: "language_changed",
                        selectedLanguage: nextLanguage,
                      });
                    }}
                    className="min-h-11 rounded-md border border-emerald-300/18 bg-[#07140f] px-3 text-white"
                  >
                    {visibleRecommendedLanguages.length ? <optgroup label={`Recommended for ${country}`}>{visibleRecommendedLanguages.map((item) => <option key={`recommended-${item}`}>{item}</option>)}</optgroup> : null}
                    <optgroup label="All languages">{visibleListenerLanguages.map((item) => <option key={item}>{item}</option>)}</optgroup>
                  </select>
                </label>
              </div>
            </section>

            <TranscriptPanel
              title="Live English transcript"
              icon={isListening ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
            >
              {transcript || "Press Start Live Translation and speak in English. Your browser will ask for microphone permission."}
            </TranscriptPanel>

            <TranscriptPanel title={`${language} translation`} icon={<Languages className="h-5 w-5" />}>
              {isTranslating
                ? "Translating..."
                : translationError ||
                  translatedText ||
                  "Speak in English to see live server-side translation here."}
            </TranscriptPanel>

            <section className="rounded-lg border border-emerald-300/16 bg-white/[0.055] p-4">
              <div className="mb-3 flex items-center gap-2 text-emerald-300">
                <Headphones className="h-5 w-5" />
                <h2 className="font-semibold text-white">Translated audio</h2>
              </div>
              <div className="rounded-md border border-dashed border-emerald-300/22 bg-[#07140f] p-4 text-sm leading-6 text-emerald-50/68">
                Translated audio for {language} is being prepared.
              </div>
            </section>
          </aside>
        </div>

        <footer className="grid gap-3 rounded-lg border border-emerald-300/16 bg-white/[0.055] p-4 sm:grid-cols-[1fr_auto] sm:items-center">
          <div>
            <p className="text-sm font-semibold text-white">Share this translation room</p>
            <p className="mt-1 text-sm text-emerald-50/68">
              Members can scan the QR access point when the church publishes the widget link.
            </p>
          </div>
          <div className="flex min-h-24 min-w-24 items-center justify-center rounded-md border border-dashed border-emerald-300/28 bg-[#07140f] text-emerald-200">
            <QrCode className="h-12 w-12" />
          </div>
        </footer>
      </section>
    </main>
  );
}

function TranscriptPanel({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-lg border border-emerald-300/16 bg-white/[0.055] p-4">
      <div className="mb-3 flex items-center gap-2 text-emerald-300">
        {icon}
        <h2 className="font-semibold text-white">{title}</h2>
      </div>
      <div className="min-h-36 rounded-md border border-emerald-300/14 bg-[#07140f] p-4 text-sm leading-7 text-emerald-50/78">
        {children}
      </div>
    </section>
  );
}

function StatusBadge({ status }: { status: LiveStatus }) {
  const live = status === "Live";

  return (
    <span
      className={`inline-flex w-fit items-center gap-2 rounded-full px-3 py-1 text-sm font-semibold ${
        live ? "bg-emerald-300 text-[#04120c]" : "bg-white/10 text-emerald-100"
      }`}
    >
      <span className={`h-2 w-2 rounded-full ${live ? "bg-[#04120c]" : "bg-emerald-300"}`} />
      {status}
    </span>
  );
}

function getEnabledListenerLanguages(languages: string[]) {
  const enabled = languages.filter(isListenerLanguage);

  return (enabled.length ? enabled : [...defaultListenerLanguages]) as ListenerLanguage[];
}

function sendWidgetUsageEvent(input: {
  churchSlug: string;
  branchSlug?: string;
  eventType: "widget_loaded" | "live_started" | "language_changed";
  selectedLanguage?: string;
}) {
  fetch("/api/widget-usage", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
    keepalive: true,
  }).catch(() => {
    // Usage tracking must never interrupt the listener experience.
  });
}
