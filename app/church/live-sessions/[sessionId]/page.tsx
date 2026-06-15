import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Languages, Play, Radio, Square } from "lucide-react";
import { CopyEmbedButton } from "@/app/admin/churches/CopyEmbedButton";
import { getCurrentChurchView } from "@/lib/currentChurch";
import {
  getSermonSessionForChurch,
  getSessionListenUrl,
  getTranscriptMessagesForSession,
  parseSessionLanguages,
} from "@/lib/sermonSessionRepository";
import { ChurchNav } from "../../ChurchNav";
import {
  addTranscriptMessageAction,
  endSessionFromDetailAction,
  startSessionFromDetailAction,
} from "./actions";

type SessionDetailPageProps = {
  params: Promise<{
    sessionId: string;
  }>;
  searchParams?: Promise<{
    message?: string;
    started?: string;
    ended?: string;
    error?: string;
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
  const messages = await getTranscriptMessagesForSession(session.id);
  const listenUrl = getSessionListenUrl(session.id);

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
          </div>
        </div>

        <StatusMessage query={query} />

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
                Type the sermon text manually for now. SermonBridge will store
                the original text and a translated/placeholder listener update.
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
              <h2 className="text-2xl font-semibold">Messages sent</h2>
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
                    </article>
                  ))}
                </div>
              )}
            </section>
          </section>
        </div>
      </section>
    </main>
  );
}

function StatusMessage({
  query,
}: {
  query?: { message?: string; started?: string; ended?: string; error?: string };
}) {
  const message = query?.message
    ? "Message saved and published to listeners."
    : query?.started
      ? "Session is now live."
      : query?.ended
        ? "Session ended."
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
