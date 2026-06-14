"use client";

import { useState } from "react";
import { Loader2, PlayCircle } from "lucide-react";
import type { OpenAIDiagnosticsResult } from "@/lib/openaiDiagnostics";

export function OpenAIConnectivityTest() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<OpenAIDiagnosticsResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function runTest() {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/diagnostics/openai", {
        method: "POST",
      });
      const payload = (await response.json()) as OpenAIDiagnosticsResult | { error?: string };

      if (!response.ok) {
        throw new Error("error" in payload && payload.error ? payload.error : "OpenAI diagnostic request failed.");
      }

      setResult(payload as OpenAIDiagnosticsResult);
    } catch (requestError) {
      setResult(null);
      setError(
        requestError instanceof Error
          ? requestError.message
          : "OpenAI diagnostic request failed.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="rounded-md border border-emerald-300/14 bg-[#07140f] p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.12em] text-emerald-300">
            OpenAI connectivity
          </p>
          <p className="mt-2 text-sm leading-6 text-emerald-50/68">
            Run this only when you want to test the API key with real text and TTS requests.
          </p>
        </div>
        <button
          type="button"
          onClick={runTest}
          disabled={isLoading}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-emerald-400 px-4 text-sm font-semibold text-[#04120c] transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <PlayCircle className="h-4 w-4" />}
          {isLoading ? "Testing..." : "Run OpenAI Connectivity Test"}
        </button>
      </div>

      {error ? (
        <p className="mt-4 rounded-md border border-red-300/24 bg-red-950/24 p-3 text-sm leading-6 text-red-100">
          {error}
        </p>
      ) : null}

      {result ? (
        <div className="mt-4 grid gap-3">
          {result.quotaUnavailable ? (
            <p className="rounded-md border border-amber-300/30 bg-amber-300/10 p-3 text-sm font-semibold leading-6 text-amber-100">
              Demo Mode: Real AI translation is temporarily unavailable. Demo translation is being shown.
            </p>
          ) : null}
          <ResultRow label="API connection" value={result.apiConnectionSuccess ? "Success" : "Failure"} />
          <ResultRow label="API key detected" value={result.apiKeyDetected ? "Yes" : "No"} />
          <ResultRow label="API quota unavailable" value={result.quotaUnavailable ? "Yes" : "No"} />
          <ResultRow label="Demo mode active" value={result.demoModeActive ? "Yes" : "No"} />
          <ResultRow label="Translation mode" value={result.translation.success ? "Real" : "Mock"} />
          <ResultRow label="Translation error code" value={result.translation.errorCode ?? "None"} />
          <ResultRow label="Translation error message" value={result.translation.errorMessage ?? "No translation API error."} />
          <ResultRow label="TTS mode" value={result.tts.success ? "Real" : "Mock"} />
          <ResultRow label="TTS error code" value={result.tts.errorCode ?? "None"} />
          <ResultRow label="TTS error message" value={result.tts.errorMessage ?? "No TTS API error."} />
        </div>
      ) : null}
    </div>
  );
}

function ResultRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded border border-emerald-300/12 bg-white/[0.035] p-3">
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-emerald-300">
        {label}
      </p>
      <p className="mt-1 break-words text-sm leading-6 text-emerald-50/78">{value}</p>
    </div>
  );
}

