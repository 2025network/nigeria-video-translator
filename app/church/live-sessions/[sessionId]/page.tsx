import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Languages, Play, Radio, Square, Trash2 } from "lucide-react";
import { CopyEmbedButton } from "@/app/admin/churches/CopyEmbedButton";
import { getCurrentChurchView } from "@/lib/currentChurch";
import {
  getSessionErrorLogs,
  getSermonSessionForChurch,
  getSessionListenUrl,
  getTranscriptMessageStats,
  getTranscriptMessagesForSession,
  parseSessionLanguages,
} from "@/lib/sermonSessionRepository";
import { ChurchNav } from "../../ChurchNav";
import {
  addTranscriptMessageAction,
  addTranscriptMessageToAllAction,
  clearTranscriptMessagesAction,
  deleteTranscriptMessageAction,
  endSessionFromDetailAction,
  startSessionFromDetailAction,
} from "./actions";
import { LiveMicCapture } from "./LiveMicCapture";
import { SpeakerOutputMode, type SpeakerOutputMessage } from "./SpeakerOutputMode";

type SessionDetailPageProps = {
  params: Promise<{
    sessionId: string;
  }>;
  searchParams?: Promise<{
    message?: string;
    started?: string;
    ended?: string;
    error?: string;
    deleted?: string;
    cleared?: string;
  }>;
};

export const metadata: Metadata = {
  title: "Live Session Control",
};

export const dynamic = "force-dynamic";

export default async function ChurchLiveSessionDetailPage({
  params,
  searchParams,
}: SessionDetailPageProps) {
  const [{ sessionId }, query, church] = await Promise.all([
    params,
    searchParams,
    getCurrentChurchView(),
  ]);
  const session = await getSermonSessionForChurch(sessionId, church.id);

  if (!session) {
    notFound();
  }

  const listenerLanguages = parseSessionLanguages(session.listenerLanguages);
  const [messages, stats, errorLogs] = await Promise.all([
    getTranscriptMessagesForSession(session.id),
    getTranscriptMessageStats(session.id),
    getSessionErrorLogs(session.id),
  ]);
  const listenUrl = getSessionListenUrl(session.id);
  const transcriptionModel = process.env.OPENAI_TRANSCRIPTION_MODEL || "whisper-1";
  const openAiConfigured = Boolean(process.env.OPENAI_API_KEY);

  return (
    <main className="min-h-screen bg-[#06110d] text-white">
      <section className="section-shell py-8">
        <ChurchNav />
        <Link
          href="/church/live-sessions"
          className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-emerald-200 hover:text-emerald-100"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to live sessions
        </Link>
      </section>

      <section className="section-shell pb-16">
        <div className="mb-8 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-300">
              Session control
            </p>
            <h1 className="mt-3 text-4xl font-semibold leading-tight sm:text-5xl">
              {session.title}
            </h1>
            <div className="mt-4 flex flex-wrap gap-3">
              <StatusBadge status={session.status} />
              <span className="rounded-full border border-emerald-300/20 px-3 py-1 text-sm font-semibold text-emerald-50/72">
                Source: {session.sourceLanguage}
              </span>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {session.status !== "LIVE" && session.status !== "ENDED" ? (
              <form action={startSessionFromDetailAction}>
                <input type="hidden" name="sessionId" value={session.id} />
                <button
                  type="submit"
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-emerald-400 px-4 text-sm font-semibold text-[#04120c] transition hover:bg-emerald-300"
                >
                  <Play className="h-4 w-4" />
                  Start session
                </button>
              </form>
            ) : null}
            {session.status === "LIVE" ? (
              <form action={endSessionFromDetailAction}>
                <input type="hidden" name="sessionId" value={session.id} />
                <button
                  type="submit"
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-red-300/24 px-4 text-sm font-semibold text-red-100 transition hover:bg-red-950/24"
                >
                  <Square className="h-4 w-4" />
                  End session
                </button>
              </form>
            ) : null}
            <Link
              href={listenUrl}
              className="inline-flex min-h-11 items-center justify-center rounded-md border border-emerald-300/26 px-4 text-sm font-semibold text-emerald-100 transition hover:bg-white/8"
            >
              View listener link
            </Link>
            <CopyEmbedButton
              embedCode={listenUrl}
              label="Copy listener link"
              copiedLabel="Listener link copied"
            />
            <Link
              href="/church/live-sessions/setup-guide"
              className="inline-flex min-h-11 items-center justify-center rounded-md border border-emerald-300/26 px-4 text-sm font-semibold text-emerald-100 transition hover:bg-white/8"
            >
              Setup guide
            </Link>
          </div>
        </div>

        <StatusMessage query={query} />

        <section className="mb-6 rounded-lg border border-emerald-300/16 bg-white/[0.045] p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-emerald-300">
                Session health
              </p>
              <h2 className="mt-2 text-2xl font-semibold">Live readiness panel</h2>
              <p className="mt-2 text-sm leading-6 text-emerald-50/62">
                Resolve any warnings before opening the listener link to the congregation.
              </p>
            </div>
            <StatusBadge status={session.status} />
          </div>
          <ProductionWarnings
            openAiConfigured={openAiConfigured}
            sessionStatus={session.status}
            listenerLanguageCount={listenerLanguages.length}
          />
          <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <Info label="Listener link" value={listenUrl} />
            <Info label="Transcript messages" value={String(stats.messageCount)} />
            <Info
              label="Last transcript time"
              value={stats.lastTranscriptAt ? stats.lastTranscriptAt.toLocaleString() : "No messages yet"}
            />
            <Info
              label="Mic readiness"
              value={session.status === "LIVE" ? "Ready for mic capture" : "Session must be LIVE before mic capture"}
            />
            <Info
              label="OPENAI_API_KEY"
              value={openAiConfigured ? "Configured" : "Missing"}
            />
            <Info label="Transcription model" value={transcriptionModel} />
            <Info
              label="Selected listener languages"
              value={listenerLanguages.join(", ")}
            />
            <Info
              label="Latest errors"
              value={errorLogs.length ? `${errorLogs.length} recent error(s)` : "No recent errors"}
            />
          </div>
        </section>

        <div className="mb-6 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <LiveMicCapture sessionId={session.id} sessionStatus={session.status} />
          <section className="rounded-lg border border-emerald-300/16 bg-emerald-300/10 p-5">
            <h2 className="text-2xl font-semibold">Best audio setup</h2>
            <ul className="mt-4 grid gap-2 text-sm leading-6 text-emerald-50/78">
              <li>Use Chrome or Edge.</li>
              <li>Use a laptop close to the speaker or connect church mixer output to laptop audio input.</li>
              <li>Use stable internet.</li>
              <li>Start session before microphone capture.</li>
              <li>Keep manual update ready as a backup publishing method.</li>
            </ul>
          </section>
        </div>

        <div className="mb-6">
          <SpeakerOutputMode
            sessionId={session.id}
            languages={listenerLanguages}
            initialMessages={messages.map(toSpeakerOutputMessage)}
          />
        </div>

        <div className="grid gap-6 xl:grid-cols-[0.82fr_1.18fr]">
          <form
            action={addTranscriptMessageAction}
            className="grid h-fit gap-5 rounded-lg border border-emerald-300/16 bg-white/[0.045] p-5"
          >
            <div>
              <div className="flex h-11 w-11 items-center justify-center rounded-md bg-emerald-400 text-[#04120c]">
                <Radio className="h-5 w-5" />
              </div>
              <h2 className="mt-4 text-2xl font-semibold">Add sermon update</h2>
              <p className="mt-2 text-sm leading-6 text-emerald-50/66">
                Type sermon text manually when the media team needs to publish
                an update directly to listeners.
              </p>
            </div>

            <input type="hidden" name="sessionId" value={session.id} />

            <label className="grid gap-2 text-sm font-semibold text-emerald-100">
              Target listener language
              <select
                name="language"
                defaultValue={listenerLanguages[0] ?? "English"}
                className="min-h-12 rounded-md border border-emerald-300/18 bg-[#07140f] px-4 text-white outline-none focus:border-emerald-300"
              >
                {listenerLanguages.map((language) => (
                  <option key={language}>{language}</option>
                ))}
              </select>
            </label>

            <label className="grid gap-2 text-sm font-semibold text-emerald-100">
              Sermon text/update
              <textarea
                name="sourceText"
                rows={7}
                required
                placeholder="Type the next sermon line or announcement..."
                className="min-h-40 rounded-md border border-emerald-300/18 bg-[#07140f] px-4 py-3 text-white outline-none placeholder:text-emerald-50/35 focus-visible:focus-ring"
              />
            </label>

            <button
              type="submit"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-emerald-400 px-5 font-semibold text-[#04120c] transition hover:bg-emerald-300"
            >
              <Languages className="h-5 w-5" />
              Save message
            </button>
            <button
              type="submit"
              formAction={addTranscriptMessageToAllAction}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md border border-emerald-300/24 px-5 font-semibold text-emerald-100 transition hover:bg-white/8"
            >
              <Languages className="h-5 w-5" />
              Save to all listener languages
            </button>
          </form>

          <section className="grid gap-4">
            <div className="grid gap-3 md:grid-cols-2">
              <Info label="Listener link" value={listenUrl} />
              <Info
                label="Stream/watch URL"
                value={session.streamUrl || "No session-specific stream URL"}
              />
            </div>

            <section className="rounded-lg border border-emerald-300/16 bg-white/[0.045] p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-2xl font-semibold">Messages sent</h2>
                {messages.length ? (
                  <form action={clearTranscriptMessagesAction}>
                    <input type="hidden" name="sessionId" value={session.id} />
                    <button
                      type="submit"
                      className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-red-300/24 px-4 text-sm font-semibold text-red-100 transition hover:bg-red-950/24"
                    >
                      <Trash2 className="h-4 w-4" />
                      Clear session messages
                    </button>
                  </form>
                ) : null}
              </div>
              {messages.length === 0 ? (
                <p className="mt-4 rounded-md border border-dashed border-emerald-300/20 bg-[#07140f] p-4 text-sm text-emerald-50/62">
                  No sermon updates have been sent yet.
                </p>
              ) : (
                <div className="mt-4 grid gap-3">
                  {messages.map((message) => (
                    <article
                      key={message.id}
                      className="rounded-md border border-emerald-300/12 bg-[#07140f] p-4"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <p className="text-sm font-semibold text-emerald-300">
                          {message.language}
                        </p>
                        <p className="text-xs text-emerald-50/50">
                          {message.createdAt.toLocaleTimeString()}
                        </p>
                      </div>
                      <p className="mt-3 text-sm leading-6 text-emerald-50/58">
                        Original: {message.sourceText}
                      </p>
                      <p className="mt-3 leading-7 text-emerald-50">
                        {message.translatedText}
                      </p>
                      <p className="mt-3 text-xs font-semibold uppercase tracking-[0.12em] text-emerald-50/50">
                        Speaker audio: {formatAudioStatus(message.audioStatus)}
                      </p>
                      {message.audioError ? (
                        <p className="mt-2 rounded-md border border-amber-300/24 bg-amber-300/10 p-3 text-sm leading-6 text-amber-50">
                          {message.audioError}
                        </p>
                      ) : null}
                      <form action={deleteTranscriptMessageAction} className="mt-4">
                        <input type="hidden" name="sessionId" value={session.id} />
                        <input type="hidden" name="messageId" value={message.id} />
                        <button
                          type="submit"
                          className="inline-flex min-h-9 items-center justify-center gap-2 rounded-md border border-red-300/20 px-3 text-xs font-semibold text-red-100 transition hover:bg-red-950/24"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Delete message
                        </button>
                      </form>
                    </article>
                  ))}
                </div>
              )}
            </section>

            {errorLogs.length ? (
              <section className="rounded-lg border border-amber-300/24 bg-amber-300/10 p-5">
                <h2 className="text-2xl font-semibold">Recent live errors</h2>
                <div className="mt-4 grid gap-3">
                  {errorLogs.map((errorLog) => (
                    <article key={errorLog.id} className="rounded-md border border-amber-300/20 bg-[#07140f] p-4">
                      <p className="text-sm font-semibold text-amber-100">{errorLog.message}</p>
                      <p className="mt-2 text-xs text-emerald-50/50">{errorLog.createdAt.toLocaleString()}</p>
                    </article>
                  ))}
                </div>
              </section>
            ) : null}
          </section>
        </div>
      </section>
    </main>
  );
}

function toSpeakerOutputMessage(message: {
  id: string;
  sourceText: string;
  translatedText: string;
  language: string;
  audioUrl: string | null;
  audioStatus: string | null;
  audioError: string | null;
  createdAt: Date;
}): SpeakerOutputMessage {
  return {
    id: message.id,
    sourceText: message.sourceText,
    translatedText: message.translatedText,
    language: message.language,
    audioUrl: message.audioUrl,
    audioStatus: message.audioStatus,
    audioError: message.audioError,
    createdAt: message.createdAt.toISOString(),
  };
}

function formatAudioStatus(status?: string | null) {
  if (status === "READY") return "Ready";
  if (status === "PENDING") return "Audio is being prepared";
  if (status === "FAILED") return "Needs configuration";

  return "Not generated";
}

function StatusMessage({
  query,
}: {
  query?: {
    message?: string;
    started?: string;
    ended?: string;
    error?: string;
    deleted?: string;
    cleared?: string;
  };
}) {
  const message = query?.message
    ? "Message saved and published to listeners."
    : query?.started
      ? "Session is now live."
      : query?.ended
        ? "Session ended."
        : query?.deleted
          ? "Message deleted."
          : query?.cleared
            ? "Session messages cleared."
            : query?.error
              ? "Please check the session details and try again."
              : "";

  if (!message) return null;

  return (
    <div className="mb-6 rounded-lg border border-emerald-300/24 bg-emerald-300/10 p-4 text-sm font-semibold text-emerald-50">
      {message}
    </div>
  );
}

function ProductionWarnings({
  openAiConfigured,
  sessionStatus,
  listenerLanguageCount,
}: {
  openAiConfigured: boolean;
  sessionStatus: string;
  listenerLanguageCount: number;
}) {
  const warnings = [
    !openAiConfigured
      ? "OPENAI_API_KEY is missing. Microphone transcription and automated translation need server configuration."
      : "",
    sessionStatus !== "LIVE"
      ? "Session is not LIVE. Start the session before microphone capture."
      : "",
    listenerLanguageCount === 0
      ? "No listener languages are selected. Add at least one listener language."
      : "",
  ].filter(Boolean);

  if (!warnings.length) {
    return (
      <div className="mt-5 rounded-md border border-emerald-300/18 bg-emerald-300/10 p-4 text-sm font-semibold text-emerald-50">
        Production checks look ready for live translation.
      </div>
    );
  }

  return (
    <div className="mt-5 rounded-md border border-amber-300/28 bg-amber-300/10 p-4">
      <p className="text-sm font-semibold text-amber-100">Production warning</p>
      <ul className="mt-2 grid gap-2 text-sm leading-6 text-amber-50/90">
        {warnings.map((warning) => (
          <li key={warning}>{warning}</li>
        ))}
      </ul>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-emerald-300/12 bg-[#07140f] p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-emerald-300">
        {label}
      </p>
      <p className="mt-2 break-words text-sm leading-6 text-emerald-50/76">{value}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const tone =
    status === "LIVE"
      ? "bg-emerald-400 text-[#04120c]"
      : status === "ENDED"
        ? "bg-red-400/18 text-red-100"
        : "bg-amber-300/18 text-amber-100";

  return <span className={`rounded-full px-3 py-1 text-sm font-bold ${tone}`}>{status}</span>;
}
