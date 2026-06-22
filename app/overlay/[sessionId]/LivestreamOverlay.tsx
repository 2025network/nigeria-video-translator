"use client";

import type { CSSProperties } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  getLanguageName,
  languageCatalog,
  languageRegions,
} from "@/lib/languageCatalog";

export type OverlayPosition = "top" | "middle" | "bottom";
export type OverlaySize = "small" | "medium" | "large" | "xlarge";
export type OverlayTheme = "light" | "dark" | "outline";

type OverlaySession = {
  id: string;
  title: string;
  status: string;
  churchName: string;
  branchName: string | null;
};

type OverlayMessage = {
  id: string;
  translatedText: string;
  createdAt: string;
};

type LivestreamOverlayProps = {
  initialSession: OverlaySession;
  initialLanguageCode: string;
  initialMessage: OverlayMessage | null;
  cleanMode: boolean;
  initialPosition: OverlayPosition;
  initialSize: OverlaySize;
  initialTheme: OverlayTheme;
};

const fontSizes: Record<OverlaySize, string> = {
  small: "2rem",
  medium: "3rem",
  large: "4rem",
  xlarge: "5.5rem",
};

const positionClasses: Record<OverlayPosition, string> = {
  top: "justify-start",
  middle: "justify-center",
  bottom: "justify-end",
};

const subtitleThemes: Record<OverlayTheme, CSSProperties> = {
  light: {
    color: "#07110c",
    background: "rgba(255, 255, 255, 0.9)",
    border: "1px solid rgba(255, 255, 255, 0.96)",
    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)",
  },
  dark: {
    color: "#ffffff",
    background: "rgba(0, 0, 0, 0.78)",
    border: "1px solid rgba(255, 255, 255, 0.14)",
    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.34)",
  },
  outline: {
    color: "#ffffff",
    background: "transparent",
    border: "1px solid transparent",
    textShadow:
      "-3px -3px 2px #000, 3px -3px 2px #000, -3px 3px 2px #000, 3px 3px 2px #000, 0 4px 8px rgba(0, 0, 0, 0.96)",
  },
};

export function LivestreamOverlay({
  initialSession,
  initialLanguageCode,
  initialMessage,
  cleanMode,
  initialPosition,
  initialSize,
  initialTheme,
}: LivestreamOverlayProps) {
  const [session, setSession] = useState(initialSession);
  const [message, setMessage] = useState(initialMessage);
  const [languageCode, setLanguageCode] = useState(initialLanguageCode);
  const [position, setPosition] = useState(initialPosition);
  const [size, setSize] = useState(initialSize);
  const [theme, setTheme] = useState(initialTheme);
  const [feedError, setFeedError] = useState(false);
  const hasTrackedView = useRef(false);
  const languageName = getLanguageName(languageCode);

  const refreshOverlay = useCallback(async () => {
    try {
      const response = await fetch(
        `/api/display-sessions/${initialSession.id}?lang=${encodeURIComponent(languageCode)}`,
        { cache: "no-store" },
      );

      if (!response.ok) throw new Error("Overlay feed unavailable");

      const payload = (await response.json()) as {
        session: OverlaySession;
        messages: OverlayMessage[];
      };
      setSession(payload.session);
      setMessage(payload.messages.at(-1) ?? null);
      setFeedError(false);
    } catch {
      setFeedError(true);
    }
  }, [initialSession.id, languageCode]);

  useEffect(() => {
    if (!hasTrackedView.current) {
      hasTrackedView.current = true;
      trackOverlayUsage(
        initialSession.id,
        "overlay_viewed",
        languageCode,
        cleanMode,
      );
    }
  }, [cleanMode, initialSession.id, languageCode]);

  useEffect(() => {
    const initialRefresh = window.setTimeout(refreshOverlay, 0);
    const interval = window.setInterval(refreshOverlay, 2000);

    return () => {
      window.clearTimeout(initialRefresh);
      window.clearInterval(interval);
    };
  }, [refreshOverlay]);

  function changeLanguage(nextLanguageCode: string) {
    setLanguageCode(nextLanguageCode);
    updateUrlOption("lang", nextLanguageCode);
    trackOverlayUsage(
      initialSession.id,
      "language_changed",
      nextLanguageCode,
      cleanMode,
    );
  }

  function changePosition(nextPosition: OverlayPosition) {
    setPosition(nextPosition);
    updateUrlOption("position", nextPosition);
  }

  function changeSize(nextSize: OverlaySize) {
    setSize(nextSize);
    updateUrlOption("size", nextSize);
  }

  function changeTheme(nextTheme: OverlayTheme) {
    setTheme(nextTheme);
    updateUrlOption("theme", nextTheme);
  }

  const verticalPadding = !cleanMode && position === "top" ? "18vh" : "8vh";

  return (
    <main className="relative h-screen w-screen overflow-hidden bg-transparent text-white">
      {!cleanMode ? (
        <section className="absolute left-[4vw] right-[4vw] top-[3vh] z-20 rounded-md border border-white/15 bg-black/82 p-4 shadow-2xl backdrop-blur-md">
          <div className="flex flex-wrap items-end gap-3">
            <div className="mr-auto min-w-52">
              <p className="text-sm font-bold text-white">SermonBridge Overlay</p>
              <p className="mt-1 truncate text-xs text-white/62">
                {session.churchName} · {session.branchName ?? "Main church"} · {session.status}
              </p>
            </div>
            <OverlaySelect
              label="Language"
              value={languageCode}
              onChange={changeLanguage}
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
            </OverlaySelect>
            <OverlaySelect
              label="Position"
              value={position}
              onChange={(value) => changePosition(value as OverlayPosition)}
            >
              <option value="top">Top</option>
              <option value="middle">Middle</option>
              <option value="bottom">Bottom</option>
            </OverlaySelect>
            <OverlaySelect
              label="Size"
              value={size}
              onChange={(value) => changeSize(value as OverlaySize)}
            >
              <option value="small">Small</option>
              <option value="medium">Medium</option>
              <option value="large">Large</option>
              <option value="xlarge">Extra Large</option>
            </OverlaySelect>
            <OverlaySelect
              label="Theme"
              value={theme}
              onChange={(value) => changeTheme(value as OverlayTheme)}
            >
              <option value="outline">Outline</option>
              <option value="dark">Dark</option>
              <option value="light">Light</option>
            </OverlaySelect>
          </div>
          <div className="mt-3 flex items-center justify-between gap-3 text-xs text-white/55">
            <span>Latest approved translation · {languageName}</span>
            <span>{feedError ? "Reconnecting" : "Refreshes every 2 seconds"}</span>
          </div>
        </section>
      ) : null}

      <section
        className={`flex h-full w-full flex-col ${positionClasses[position]} px-[8vw]`}
        style={{ paddingTop: verticalPadding, paddingBottom: verticalPadding }}
        aria-live="polite"
      >
        {message ? (
          <article
            key={message.id}
            className="sermonbridge-overlay-enter mx-auto w-fit max-w-full rounded-md px-7 py-5 text-center font-bold leading-[1.25]"
            style={{
              ...subtitleThemes[theme],
              fontSize: fontSizes[size],
            }}
          >
            {message.translatedText}
          </article>
        ) : !cleanMode ? (
          <p className="mx-auto rounded-md bg-black/72 px-5 py-3 text-center text-lg font-semibold text-white/78">
            Waiting for an approved {languageName} translation.
          </p>
        ) : null}
      </section>
    </main>
  );
}

function OverlaySelect({
  label,
  value,
  onChange,
  children,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  children: React.ReactNode;
}) {
  return (
    <label className="grid min-w-36 gap-1 text-xs font-semibold text-white/72">
      {label}
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="min-h-10 rounded-md border border-white/18 bg-[#07140f] px-3 text-sm font-semibold text-white outline-none focus-visible:focus-ring"
      >
        {children}
      </select>
    </label>
  );
}

function updateUrlOption(name: string, value: string) {
  const nextUrl = new URL(window.location.href);
  nextUrl.searchParams.set(name, value);
  window.history.replaceState({}, "", nextUrl);
}

function trackOverlayUsage(
  sessionId: string,
  eventType: "overlay_viewed" | "language_changed",
  language: string,
  cleanMode: boolean,
) {
  fetch("/api/overlay-usage", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sessionId, eventType, language, cleanMode }),
    keepalive: true,
  }).catch(() => {
    // Analytics must never interrupt the livestream overlay.
  });
}
