"use client";

import { useEffect } from "react";

type ListenerVisitTrackerProps = {
  sessionId: string;
  language: string;
};

export function ListenerVisitTracker({ sessionId, language }: ListenerVisitTrackerProps) {
  useEffect(() => {
    const visitorId = getOrCreateVisitorId();

    fetch("/api/listener-sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId, language, visitorId }),
      keepalive: true,
    }).catch(() => {
      // Listener analytics must never interrupt the listener page.
    });
  }, [language, sessionId]);

  return null;
}

function getOrCreateVisitorId() {
  const storageKey = "sermonbridge_visitor_id";
  const existing = window.localStorage.getItem(storageKey);

  if (existing) return existing;

  const next =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `visitor-${Date.now()}-${Math.random().toString(16).slice(2)}`;

  window.localStorage.setItem(storageKey, next);
  return next;
}
