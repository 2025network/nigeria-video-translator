import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import {
  Activity,
  AlertTriangle,
  AudioLines,
  Captions,
  Clock3,
  Languages,
  Mic2,
  Monitor,
  Radio,
  ServerCog,
  Speaker,
  Users,
  Volume2,
} from "lucide-react";
import { CopyEmbedButton } from "@/app/admin/churches/CopyEmbedButton";
import { BackButton } from "@/app/components/BackButton";
import { canAccessChurchBranch, canViewSessionHealth } from "@/lib/churchPermissions";
import { requireChurchPermission } from "@/lib/currentChurch";
import { getSiteUrl } from "@/lib/demoChurches";
import { normalizeLanguageValue } from "@/lib/languageCatalog";
import {
  formatErrorContext,
  getErrorStage,
  getLiveSessionHealth,
} from "@/lib/sessionHealthRepository";
import {
  getSessionListenUrl,
  parseSessionLanguages,
} from "@/lib/sermonSessionRepository";
import { ChurchNav } from "../../../ChurchNav";
import { HealthAutoRefresh } from "./HealthAutoRefresh";

type HealthPageProps = {
  params: Promise<{ sessionId: string }>;
};

type HealthTone = "healthy" | "warning" | "critical" | "neutral";

type HealthCheck = {
  label: string;
  value: string;
  detail: string;
  tone: HealthTone;
  icon: LucideIcon;
};

export const metadata: Metadata = {
  title: "Live Session Health Center",
};

export const dynamic = "force-dynamic";

export default async function LiveSessionHealthPage({ params }: HealthPageProps) {
  const [{ sessionId }, context] = await Promise.all([
    params,
    requireChurchPermission("dashboard:view"),
  ]);

  if (!canViewSessionHealth(context.actor)) notFound();

  const health = await getLiveSessionHealth(sessionId, context.church.id);

  if (!health || !canAccessChurchBranch(context.actor, health.session.branchId)) {
    notFound();
  }

  const now = health.checkedAt.getTime();
  const session = health.session;
  const listenerLanguages = parseSessionLanguages(session.listenerLanguages);
  const openAiConfigured = Boolean(process.env.OPENAI_API_KEY);
  const transcriptionModel = process.env.OPENAI_TRANSCRIPTION_MODEL || "whisper-1";
  const latestMessageAge = health.latestMessage
    ? now - health.latestMessage.createdAt.getTime()
    : null;
  const hasRecentTranscript = latestMessageAge !== null && latestMessageAge <= 90_000;
  const transcriptionError = health.errorLogs.find(
    (entry) => getErrorStage(entry.context) === "transcription",
  );
  const translationError = health.errorLogs.find(
    (entry) => getErrorStage(entry.context) === "translation",
  );
  const transcriptionNeedsAttention = isNewerThanMessage(
    transcriptionError?.createdAt,
    health.latestMessage?.createdAt,
  );
  const translationNeedsAttention = isNewerThanMessage(
    translationError?.createdAt,
    health.latestMessage?.createdAt,
  );
  const checks = buildHealthChecks({
    sessionStatus: session.status,
    openAiConfigured,
    transcriptionModel,
    hasRecentTranscript,
    messageCount: health.messageCount,
    listenerLanguageCount: listenerLanguages.length,
    transcriptionNeedsAttention,
    translationNeedsAttention,
    readyAudioCount: health.readyAudioCount,
    pendingAudioCount: health.pendingAudioCount,
    failedAudioCount: health.failedAudioCount,
    displayViews: health.displayViews,
    overlayViews: health.overlayViews,
    listenerCount: health.listenerCount,
    latestMessageAt: health.latestMessage?.createdAt ?? null,
    lastErrorAt: health.lastErrorAt,
  });
  const listenPath = getSessionListenUrl(session.id);
  const listenUrl = `${getSiteUrl()}${listenPath}`;
  const displayPath = `/display/${session.id}`;
  const overlayLanguage = normalizeLanguageValue(listenerLanguages[0] ?? "en");
  const overlayPath = `/overlay/${session.id}?lang=${encodeURIComponent(overlayLanguage)}&position=bottom&size=large&theme=outline`;
  const actionClass = "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-emerald-300/24 px-4 text-sm font-semibold text-emerald-50 transition hover:bg-white/8";

  return (
    <main className="min-h-screen bg-[#06110d] text-white">
      <section className="section-shell py-8">
        <ChurchNav />
        <div className="mt-4">
          <BackButton href={`/church/live-sessions/${session.id}`} label="Back to session control" />
        </div>
      </section>

      <section className="section-shell pb-16">
        <header className="flex flex-col gap-6 border-b border-emerald-300/14 pb-7 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-300">
              Live Session Health Center
            </p>
            <h1 className="mt-3 text-4xl font-semibold leading-tight sm:text-5xl">
              {session.title}
            </h1>
            <p className="mt-3 max-w-2xl leading-7 text-emerald-50/68">
              {session.branch?.name ?? session.church.churchName} · {listenerLanguages.length} listener language{listenerLanguages.length === 1 ? "" : "s"}
            </p>
          </div>
          <div className="flex flex-col items-start gap-3 lg:items-end">
            <SessionBadge status={session.status} />
            <HealthAutoRefresh />
          </div>
        </header>

        <div className="mt-6 flex flex-wrap gap-2">
          <Link href={`/church/live-sessions/${session.id}`} className={actionClass}>
            <Radio className="h-4 w-4" /> Open Session Control
          </Link>
          <Link href={`/church/live-sessions/${session.id}/analytics`} className={actionClass}>
            <Activity className="h-4 w-4" /> Open Analytics
          </Link>
          <Link href={displayPath} target="_blank" className={actionClass}>
            <Monitor className="h-4 w-4" /> Open Display Mode
          </Link>
          <Link href={overlayPath} target="_blank" className={actionClass}>
            <Captions className="h-4 w-4" /> Open Overlay
          </Link>
          <CopyEmbedButton embedCode={listenUrl} label="Copy Listener Link" copiedLabel="Listener link copied" />
        </div>

        <section className="mt-8">
          <div className="mb-4 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-emerald-300">Current health</p>
              <h2 className="mt-2 text-2xl font-semibold">Service signals</h2>
            </div>
            <span className="text-sm text-emerald-50/52">
              {checks.filter((check) => check.tone === "critical").length} critical
            </span>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {checks.map((check) => <HealthCard key={check.label} check={check} />)}
          </div>
        </section>

        <section className="mt-10 border-t border-emerald-300/14 pt-8">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-emerald-300">Latency indicators</p>
          <h2 className="mt-2 text-2xl font-semibold">Latest processing activity</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            <LatencyItem
              label="Last transcript age"
              value={health.latestMessage ? formatAge(health.latestMessage.createdAt, now) : "No transcript received"}
              detail={health.latestMessage ? health.latestMessage.createdAt.toLocaleString() : "Waiting for sermon audio"}
            />
            <LatencyItem
              label="Last message created"
              value={health.latestMessage?.createdAt.toLocaleTimeString() ?? "Not available"}
              detail={health.latestMessage ? `${health.latestMessage.language} translation` : "No translated messages yet"}
            />
            <LatencyItem
              label="Last audio generated"
              value={health.latestAudio?.audioGeneratedAt?.toLocaleTimeString() ?? "Not available"}
              detail={health.latestAudio ? `${health.latestAudio.language} speaker audio` : "No speaker audio generated yet"}
            />
          </div>
        </section>

        <section className="mt-10 border-t border-emerald-300/14 pt-8">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-amber-300">Recent errors</p>
              <h2 className="mt-2 text-2xl font-semibold">Items needing attention</h2>
            </div>
            <p className="text-sm text-emerald-50/52">Most recent {health.errorLogs.length} entries</p>
          </div>

          {health.errorLogs.length ? (
            <div className="mt-5 grid gap-3">
              {health.errorLogs.map((error) => (
                <article key={error.id} className="rounded-md border border-amber-300/18 bg-amber-300/[0.055] p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <SeverityBadge severity={error.severity} />
                        {getErrorStage(error.context) ? (
                          <span className="text-xs font-semibold uppercase text-emerald-50/52">{getErrorStage(error.context)}</span>
                        ) : null}
                      </div>
                      <p className="mt-3 font-semibold text-amber-50">{error.message}</p>
                      <p className="mt-2 text-sm leading-6 text-emerald-50/62">{formatErrorContext(error.context)}</p>
                    </div>
                    <time className="shrink-0 text-xs text-emerald-50/48" dateTime={error.createdAt.toISOString()}>
                      {error.createdAt.toLocaleString()}
                    </time>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="mt-5 rounded-md border border-dashed border-emerald-300/20 p-8 text-center">
              <p className="font-semibold text-emerald-100">No session errors recorded.</p>
              <p className="mt-2 text-sm text-emerald-50/58">The live processing pipeline has not reported an error.</p>
            </div>
          )}
        </section>
      </section>
    </main>
  );
}

function buildHealthChecks(input: {
  sessionStatus: string;
  openAiConfigured: boolean;
  transcriptionModel: string;
  hasRecentTranscript: boolean;
  messageCount: number;
  listenerLanguageCount: number;
  transcriptionNeedsAttention: boolean;
  translationNeedsAttention: boolean;
  readyAudioCount: number;
  pendingAudioCount: number;
  failedAudioCount: number;
  displayViews: number;
  overlayViews: number;
  listenerCount: number;
  latestMessageAt: Date | null;
  lastErrorAt: Date | null;
}): HealthCheck[] {
  const isLive = input.sessionStatus === "LIVE";
  const isEnded = input.sessionStatus === "ENDED";
  const microphoneValue = !isLive ? "Not active" : !input.openAiConfigured ? "Configuration required" : input.hasRecentTranscript ? "Receiving audio" : "Waiting for audio";
  const transcriptionValue = !input.openAiConfigured ? "Configuration required" : input.transcriptionNeedsAttention ? "Needs attention" : input.hasRecentTranscript ? "Healthy" : isLive ? "Waiting for speech" : isEnded ? "Stopped" : "Not started";
  const translationValue = !input.openAiConfigured ? "Configuration required" : input.translationNeedsAttention ? "Needs attention" : input.messageCount > 0 ? "Processing normally" : isLive ? "Waiting for transcript" : "Not started";
  const audioValue = input.failedAudioCount > 0 ? input.readyAudioCount > 0 ? "Available with failures" : "Needs attention" : input.pendingAudioCount > 0 ? "Audio is being prepared" : input.readyAudioCount > 0 ? "Ready" : "Waiting for translation";
  const speakerValue = !input.openAiConfigured ? "Configuration required" : !isLive ? "Start session first" : input.readyAudioCount > 0 ? "Ready" : "Waiting for speaker audio";

  return [
    { label: "Session status", value: input.sessionStatus, detail: isLive ? "The session is accepting live audio." : isEnded ? "This service has ended." : "Start the session before capturing audio.", tone: isLive ? "healthy" : isEnded ? "neutral" : "warning", icon: Radio },
    { label: "Microphone capture", value: microphoneValue, detail: input.hasRecentTranscript ? "Audio has produced a transcript within 90 seconds." : "Open Session Control to start microphone capture.", tone: input.hasRecentTranscript ? "healthy" : !isLive ? "neutral" : input.openAiConfigured ? "warning" : "critical", icon: Mic2 },
    { label: "OpenAI API", value: input.openAiConfigured ? "Configured" : "Missing", detail: input.openAiConfigured ? `Transcription model: ${input.transcriptionModel}` : "Add OPENAI_API_KEY on the server.", tone: input.openAiConfigured ? "healthy" : "critical", icon: ServerCog },
    { label: "Transcription", value: transcriptionValue, detail: input.transcriptionNeedsAttention ? "Review the newest transcription error below." : "Speech is converted into sermon text.", tone: input.transcriptionNeedsAttention || !input.openAiConfigured ? "critical" : input.hasRecentTranscript ? "healthy" : "warning", icon: AudioLines },
    { label: "Translation", value: translationValue, detail: `${input.messageCount} message${input.messageCount === 1 ? "" : "s"} across ${input.listenerLanguageCount} selected language${input.listenerLanguageCount === 1 ? "" : "s"}.`, tone: input.translationNeedsAttention || !input.openAiConfigured ? "critical" : input.messageCount > 0 ? "healthy" : "warning", icon: Languages },
    { label: "TTS / audio", value: audioValue, detail: `${input.readyAudioCount} ready · ${input.pendingAudioCount} pending · ${input.failedAudioCount} failed`, tone: input.failedAudioCount > 0 ? "critical" : input.readyAudioCount > 0 ? "healthy" : "warning", icon: Volume2 },
    { label: "Speaker output", value: speakerValue, detail: "Enable playback from Session Control after browser audio permission is granted.", tone: speakerValue === "Ready" ? "healthy" : !input.openAiConfigured ? "critical" : "warning", icon: Speaker },
    { label: "Display mode views", value: String(input.displayViews), detail: "Projector, TV, and auditorium display openings.", tone: "neutral", icon: Monitor },
    { label: "Overlay mode views", value: String(input.overlayViews), detail: "OBS and livestream overlay openings.", tone: "neutral", icon: Captions },
    { label: "Listener count", value: String(input.listenerCount), detail: "Anonymous unique listener browsers recorded for this session.", tone: "neutral", icon: Users },
    { label: "Last transcript time", value: input.latestMessageAt?.toLocaleTimeString() ?? "No transcript yet", detail: input.latestMessageAt?.toLocaleDateString() ?? "Waiting for sermon audio.", tone: input.hasRecentTranscript ? "healthy" : "warning", icon: Clock3 },
    { label: "Last error time", value: input.lastErrorAt?.toLocaleTimeString() ?? "No errors", detail: input.lastErrorAt?.toLocaleDateString() ?? "No processing errors recorded.", tone: input.lastErrorAt ? "warning" : "healthy", icon: AlertTriangle },
  ];
}

function HealthCard({ check }: { check: HealthCheck }) {
  const Icon = check.icon;
  const toneClass = {
    healthy: "border-emerald-300/24 bg-emerald-300/[0.075] text-emerald-200",
    warning: "border-amber-300/22 bg-amber-300/[0.065] text-amber-200",
    critical: "border-red-300/24 bg-red-400/[0.065] text-red-200",
    neutral: "border-sky-300/18 bg-sky-300/[0.055] text-sky-200",
  }[check.tone];

  return (
    <article className={`min-h-44 rounded-md border p-4 ${toneClass}`}>
      <div className="flex items-start justify-between gap-4">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] opacity-70">{check.label}</p>
        <Icon className="h-5 w-5 shrink-0" />
      </div>
      <p className="mt-5 text-xl font-semibold text-white">{check.value}</p>
      <p className="mt-2 text-sm leading-6 text-emerald-50/60">{check.detail}</p>
    </article>
  );
}

function LatencyItem({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <article className="rounded-md border border-emerald-300/16 bg-white/[0.045] p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-emerald-300">{label}</p>
      <p className="mt-3 text-xl font-semibold text-white">{value}</p>
      <p className="mt-2 text-sm text-emerald-50/56">{detail}</p>
    </article>
  );
}

function SessionBadge({ status }: { status: string }) {
  const isLive = status === "LIVE";
  return (
    <span className={`inline-flex min-h-9 items-center rounded-full border px-3 text-sm font-semibold ${isLive ? "border-emerald-300/30 bg-emerald-300/12 text-emerald-200" : "border-amber-300/24 bg-amber-300/10 text-amber-100"}`}>
      {isLive ? "LIVE" : status}
    </span>
  );
}

function SeverityBadge({ severity }: { severity: string }) {
  const normalized = severity.toUpperCase();
  const className = normalized === "CRITICAL" || normalized === "ERROR" ? "border-red-300/24 bg-red-400/10 text-red-100" : normalized === "WARNING" ? "border-amber-300/24 bg-amber-300/10 text-amber-100" : "border-sky-300/20 bg-sky-300/10 text-sky-100";
  return <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${className}`}>{normalized}</span>;
}

function isNewerThanMessage(errorAt?: Date, messageAt?: Date) {
  if (!errorAt) return false;
  if (!messageAt) return true;
  return errorAt.getTime() > messageAt.getTime();
}

function formatAge(date: Date, now: number) {
  const seconds = Math.max(0, Math.floor((now - date.getTime()) / 1000));
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ${minutes % 60}m ago`;
}
