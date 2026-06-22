"use client";

import type { CSSProperties } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Contrast,
  Expand,
  Minimize,
  Moon,
  Radio,
  Sun,
  Type,
} from "lucide-react";
import { BackButton } from "@/app/components/BackButton";
import {
  getLanguageName,
  languageCatalog,
  languageRegions,
} from "@/lib/languageCatalog";

type DisplaySession = {
  id: string;
  title: string;
  status: string;
  churchName: string;
  churchLogoUrl: string | null;
  branchName: string | null;
  updatedAt: string;
};

type DisplayMessage = {
  id: string;
  translatedText: string;
  createdAt: string;
};

type SmartDisplayProps = {
  initialSession: DisplaySession;
  initialLanguageCode: string;
  initialMessages: DisplayMessage[];
  kioskMode: boolean;
};

type DisplayTheme = "dark" | "light" | "contrast";
type DisplayFontSize = "small" | "medium" | "large" | "extra-large";

const themeStorageKey = "sermonbridge_display_theme";
const fontStorageKey = "sermonbridge_display_font";

const themes: Record<
  DisplayTheme,
  { label: string; icon: typeof Moon; palette: Record<string, string> }
> = {
  dark: {
    label: "Dark Auditorium",
    icon: Moon,
    palette: {
      background: "#020806",
      foreground: "#f4fff8",
      muted: "#a9c8b8",
      accent: "#34d399",
      accentText: "#04120c",
      panel: "#07140f",
      border: "rgba(110, 231, 183, 0.22)",
    },
  },
  light: {
    label: "Light",
    icon: Sun,
    palette: {
      background: "#f4f8f5",
      foreground: "#10231a",
      muted: "#486255",
      accent: "#047857",
      accentText: "#ffffff",
      panel: "#ffffff",
      border: "rgba(4, 120, 87, 0.22)",
    },
  },
  contrast: {
    label: "High Contrast",
    icon: Contrast,
    palette: {
      background: "#000000",
      foreground: "#ffffff",
      muted: "#ffffff",
      accent: "#fde047",
      accentText: "#000000",
      panel: "#000000",
      border: "#fde047",
    },
  },
};

const fontSizes: Array<{ value: DisplayFontSize; label: string; rem: string }> = [
  { value: "small", label: "Small", rem: "1.5rem" },
  { value: "medium", label: "Medium", rem: "2.125rem" },
  { value: "large", label: "Large", rem: "3rem" },
  { value: "extra-large", label: "Extra Large", rem: "4.5rem" },
];

export function SmartDisplay({
  initialSession,
  initialLanguageCode,
  initialMessages,
  kioskMode,
}: SmartDisplayProps) {
  const [session, setSession] = useState(initialSession);
  const [messages, setMessages] = useState(initialMessages);
  const [languageCode, setLanguageCode] = useState(initialLanguageCode);
  const [theme, setTheme] = useState<DisplayTheme>("dark");
  const [fontSize, setFontSize] = useState<DisplayFontSize>("large");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [feedState, setFeedState] = useState<"connected" | "refreshing" | "error">(
    "connected",
  );
  const latestMessageRef = useRef<HTMLElement | null>(null);
  const hasTrackedView = useRef(false);
  const languageName = getLanguageName(languageCode);
  const palette = themes[theme].palette;
  const selectedFontSize =
    fontSizes.find((option) => option.value === fontSize)?.rem ?? "3rem";
  const latestMessageId = messages.at(-1)?.id;
  const lastUpdatedAt = messages.at(-1)?.createdAt ?? session.updatedAt;

  const displayStyle = useMemo(
    () =>
      ({
        "--display-background": palette.background,
        "--display-foreground": palette.foreground,
        "--display-muted": palette.muted,
        "--display-accent": palette.accent,
        "--display-accent-text": palette.accentText,
        "--display-panel": palette.panel,
        "--display-border": palette.border,
      }) as CSSProperties,
    [palette],
  );

  const refreshDisplay = useCallback(async () => {
    setFeedState("refreshing");

    try {
      const response = await fetch(
        `/api/display-sessions/${initialSession.id}?lang=${encodeURIComponent(languageCode)}`,
        { cache: "no-store" },
      );

      if (!response.ok) throw new Error("Display feed unavailable");

      const payload = (await response.json()) as {
        session: DisplaySession;
        messages: DisplayMessage[];
      };
      setSession(payload.session);
      setMessages(payload.messages);
      setFeedState("connected");
    } catch {
      setFeedState("error");
    }
  }, [initialSession.id, languageCode]);

  useEffect(() => {
    const storedTheme = window.localStorage.getItem(themeStorageKey);
    const storedFont = window.localStorage.getItem(fontStorageKey);
    const frame = window.requestAnimationFrame(() => {
      if (storedTheme && storedTheme in themes) {
        setTheme(storedTheme as DisplayTheme);
      }

      if (fontSizes.some((option) => option.value === storedFont)) {
        setFontSize(storedFont as DisplayFontSize);
      }
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  useEffect(() => {
    if (!hasTrackedView.current) {
      hasTrackedView.current = true;
      trackDisplayUsage(initialSession.id, "display_viewed", languageCode, kioskMode);
    }
  }, [initialSession.id, kioskMode, languageCode]);

  useEffect(() => {
    const initialRefresh = window.setTimeout(refreshDisplay, 0);
    const interval = window.setInterval(refreshDisplay, 3000);
    return () => {
      window.clearTimeout(initialRefresh);
      window.clearInterval(interval);
    };
  }, [refreshDisplay]);

  useEffect(() => {
    latestMessageRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [latestMessageId, languageCode]);

  function changeLanguage(nextLanguageCode: string) {
    setLanguageCode(nextLanguageCode);
    const nextUrl = new URL(window.location.href);
    nextUrl.searchParams.set("lang", nextLanguageCode);
    window.history.replaceState({}, "", nextUrl);
    trackDisplayUsage(
      initialSession.id,
      "language_changed",
      nextLanguageCode,
      kioskMode,
    );
  }

  function changeTheme(nextTheme: DisplayTheme) {
    setTheme(nextTheme);
    window.localStorage.setItem(themeStorageKey, nextTheme);
  }

  function changeFontSize(nextFontSize: DisplayFontSize) {
    setFontSize(nextFontSize);
    window.localStorage.setItem(fontStorageKey, nextFontSize);
  }

  async function toggleFullscreen() {
    if (document.fullscreenElement) {
      await document.exitFullscreen();
      return;
    }

    await document.documentElement.requestFullscreen();
  }

  return (
    <main
      className="flex min-h-screen flex-col bg-[var(--display-background)] text-[var(--display-foreground)] transition-colors duration-200"
      style={displayStyle}
    >
      {!kioskMode ? (
        <section className="border-b border-[var(--display-border)] bg-[var(--display-panel)] px-4 py-3">
          <div className="mx-auto flex max-w-[1600px] flex-wrap items-end gap-3">
            <BackButton href={`/listen/${session.id}`} />

            <label className="grid min-w-56 flex-1 gap-1 text-xs font-semibold text-[var(--display-muted)]">
              Display language
              <select
                value={languageCode}
                onChange={(event) => changeLanguage(event.target.value)}
                className="min-h-11 rounded-md border border-[var(--display-border)] bg-[var(--display-background)] px-3 text-sm font-semibold text-[var(--display-foreground)] outline-none focus-visible:focus-ring"
              >
                {languageRegions.map((region) => (
                  <optgroup key={region} label={region}>
                    {languageCatalog
                      .filter((language) => language.region === region)
                      .map((language) => (
                        <option key={language.code} value={language.code}>
                          {language.name}
                        </option>
                      ))}
                  </optgroup>
                ))}
              </select>
            </label>

            <ControlGroup label="Theme">
              {(Object.entries(themes) as Array<
                [DisplayTheme, (typeof themes)[DisplayTheme]]
              >).map(([value, option]) => {
                const Icon = option.icon;
                return (
                  <button
                    key={value}
                    type="button"
                    title={`${option.label} mode`}
                    aria-label={`${option.label} mode`}
                    aria-pressed={theme === value}
                    onClick={() => changeTheme(value)}
                    className={controlButtonClass(theme === value)}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="hidden xl:inline">{option.label}</span>
                  </button>
                );
              })}
            </ControlGroup>

            <ControlGroup label="Text size">
              {fontSizes.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  title={`${option.label} text`}
                  aria-label={`${option.label} text`}
                  aria-pressed={fontSize === option.value}
                  onClick={() => changeFontSize(option.value)}
                  className={controlButtonClass(fontSize === option.value)}
                >
                  <Type className="h-4 w-4" />
                  <span className="hidden 2xl:inline">{option.label}</span>
                </button>
              ))}
            </ControlGroup>

            <button
              type="button"
              onClick={toggleFullscreen}
              className="inline-flex min-h-11 items-center gap-2 rounded-md bg-[var(--display-accent)] px-4 text-sm font-bold text-[var(--display-accent-text)]"
            >
              {isFullscreen ? (
                <Minimize className="h-4 w-4" />
              ) : (
                <Expand className="h-4 w-4" />
              )}
              {isFullscreen ? "Exit Full Screen" : "Enter Full Screen"}
            </button>
          </div>
        </section>
      ) : null}

      <header className="border-b border-[var(--display-border)] px-5 py-5">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-5">
          <div className="flex min-w-0 items-center gap-4">
            {session.churchLogoUrl ? (
              <div
                role="img"
                aria-label={`${session.churchName} logo`}
                className="h-14 w-14 shrink-0 rounded-md border border-[var(--display-border)] bg-white bg-contain bg-center bg-no-repeat"
                style={{ backgroundImage: `url(${session.churchLogoUrl})` }}
              />
            ) : (
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-md bg-[var(--display-accent)] text-xl font-black text-[var(--display-accent-text)]">
                {getInitials(session.churchName)}
              </div>
            )}
            <div className="min-w-0">
              <p className="truncate text-xl font-bold">{session.churchName}</p>
              <p className="mt-1 truncate text-sm text-[var(--display-muted)]">
                {session.branchName ? `${session.branchName} · ` : ""}
                {session.title}
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-3">
            <span className="hidden text-right text-sm text-[var(--display-muted)] sm:block">
              <span className="block font-semibold text-[var(--display-foreground)]">
                {languageName}
              </span>
              Last update {formatTime(lastUpdatedAt)}
            </span>
            <StatusBadge status={session.status} />
          </div>
        </div>
      </header>

      <section className="flex min-h-0 flex-1 flex-col px-5 py-6">
        <div className="mx-auto flex min-h-0 w-full max-w-[1600px] flex-1 flex-col">
          <div className="mb-4 flex items-center justify-between gap-4 text-sm text-[var(--display-muted)]">
            <p className="font-semibold">Current translation · {languageName}</p>
            <p className="inline-flex items-center gap-2">
              <span
                className={`h-2.5 w-2.5 rounded-full ${
                  feedState === "error" ? "bg-red-400" : "bg-emerald-400"
                }`}
              />
              {feedState === "error"
                ? "Reconnecting"
                : feedState === "refreshing"
                  ? "Checking for updates"
                  : "Auto refresh every 3 seconds"}
            </p>
          </div>

          <div
            className="min-h-[50vh] flex-1 overflow-y-auto rounded-md border border-[var(--display-border)] bg-[var(--display-panel)] px-6 py-8"
            aria-live="polite"
          >
            {session.status === "ENDED" ? (
              <div className="mb-6 border-b border-[var(--display-border)] pb-6">
                <p className="text-3xl font-bold">Session has ended.</p>
                <p className="mt-2 text-[var(--display-muted)]">
                  The final published translations remain available below.
                </p>
              </div>
            ) : null}

            {messages.length ? (
              <div className="grid gap-8">
                {messages.map((message, index) => {
                  const isLatest = index === messages.length - 1;
                  return (
                    <article
                      key={message.id}
                      ref={isLatest ? latestMessageRef : undefined}
                      className={`border-l-4 pl-6 ${
                        isLatest
                          ? "border-[var(--display-accent)]"
                          : "border-[var(--display-border)] opacity-55"
                      }`}
                    >
                      <p className="mb-3 text-sm font-semibold text-[var(--display-muted)]">
                        {formatTime(message.createdAt)}
                      </p>
                      <p
                        className="font-semibold leading-[1.3]"
                        style={{ fontSize: selectedFontSize }}
                      >
                        {message.translatedText}
                      </p>
                    </article>
                  );
                })}
              </div>
            ) : (
              <div className="flex min-h-[44vh] items-center justify-center text-center">
                <div className="max-w-4xl">
                  <Radio className="mx-auto h-10 w-10 text-[var(--display-accent)]" />
                  <p
                    className="mt-6 font-semibold leading-[1.3]"
                    style={{ fontSize: selectedFontSize }}
                  >
                    {session.status === "READY"
                      ? "Service not started yet."
                      : session.status === "ENDED"
                        ? "Session has ended."
                        : "Waiting for sermon audio."}
                  </p>
                  {session.status === "LIVE" ? (
                    <p className="mt-4 text-xl text-[var(--display-muted)]">
                      Translation is being prepared. Please keep this display open.
                    </p>
                  ) : null}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      <footer className="px-5 py-3 text-center text-xs font-semibold text-[var(--display-muted)]">
        Powered by SermonBridge
      </footer>
    </main>
  );
}

function ControlGroup({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-1">
      <p className="text-xs font-semibold text-[var(--display-muted)]">{label}</p>
      <div className="flex overflow-hidden rounded-md border border-[var(--display-border)]">
        {children}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const tone =
    status === "LIVE"
      ? "bg-emerald-400 text-[#04120c]"
      : status === "ENDED"
        ? "bg-red-500 text-white"
        : "bg-amber-300 text-[#231b03]";

  return (
    <span className={`rounded-md px-3 py-2 text-sm font-black ${tone}`}>
      {status}
    </span>
  );
}

function controlButtonClass(active: boolean) {
  return `inline-flex min-h-10 items-center justify-center gap-2 border-r border-[var(--display-border)] px-3 text-xs font-semibold last:border-r-0 ${
    active
      ? "bg-[var(--display-accent)] text-[var(--display-accent-text)]"
      : "bg-[var(--display-panel)] text-[var(--display-foreground)] hover:opacity-75"
  }`;
}

function formatTime(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(new Date(value));
}

function getInitials(value: string) {
  return value
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function trackDisplayUsage(
  sessionId: string,
  eventType: "display_viewed" | "language_changed",
  language: string,
  kioskMode: boolean,
) {
  fetch("/api/display-usage", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sessionId, eventType, language, kioskMode }),
    keepalive: true,
  }).catch(() => {
    // Analytics must never interrupt the public display.
  });
}
