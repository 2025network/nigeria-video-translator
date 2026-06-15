import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Languages, Radio } from "lucide-react";
import { CopyEmbedButton } from "@/app/admin/churches/CopyEmbedButton";
import { getSiteUrl } from "@/lib/demoChurches";
import {
  getSermonSessionById,
  getTranscriptMessagesForSession,
  parseSessionLanguages,
} from "@/lib/sermonSessionRepository";
import { AutoRefresh } from "./AutoRefresh";

type ListenerPageProps = {
  params: Promise<{
    sessionId: string;
  }>;
  searchParams?: Promise<{
    lang?: string;
    language?: string;
  }>;
};

export async function generateMetadata({
  params,
}: ListenerPageProps): Promise<Metadata> {
  const { sessionId } = await params;
  const session = await getSermonSessionById(sessionId);

  if (!session) {
    return { title: "Session Not Found" };
  }

  return {
    title: `${session.title} Listener`,
    description: `Listen to ${session.church.churchName} in your preferred language.`,
  };
}

export default async function PublicListenerPage({
  params,
  searchParams,
}: ListenerPageProps) {
  const [{ sessionId }, query] = await Promise.all([params, searchParams]);
  const session = await getSermonSessionById(sessionId);

  if (!session) {
    notFound();
  }

  const languages = parseSessionLanguages(session.listenerLanguages);
  const requestedLanguage = query?.lang ?? query?.language;
  const selectedLanguage =
    requestedLanguage && languages.includes(requestedLanguage)
      ? requestedLanguage
      : languages[0] ?? "English";
  const messages = await getTranscriptMessagesForSession(session.id, selectedLanguage);
  const lastUpdatedAt = messages.at(-1)?.createdAt ?? null;
  const languageSpecificUrl = `${getSiteUrl()}/listen/${session.id}?lang=${encodeURIComponent(selectedLanguage)}`;
  const whatsappShareUrl = `https://wa.me/?text=${encodeURIComponent(
    `${session.church.churchName} live sermon translation: ${languageSpecificUrl}`,
  )}`;

  return (
    <main className="min-h-screen bg-[#06110d] text-white">
      <AutoRefresh />
      <section className="border-b border-emerald-400/15 bg-[linear-gradient(135deg,rgba(15,23,42,0.96),rgba(4,12,9,1)_62%)]">
        <div className="section-shell grid gap-8 py-14 lg:grid-cols-[1fr_0.42fr] lg:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-300">
              SermonBridge listener
            </p>
            <h1 className="mt-3 text-4xl font-semibold leading-tight sm:text-5xl">
              {session.title}
            </h1>
            <p className="mt-4 text-xl text-emerald-50/82">
              {session.church.churchName}
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <StatusBadge status={session.status} />
              <span className="rounded-full border border-emerald-300/20 px-3 py-1 text-sm font-semibold text-emerald-50/72">
                Source: {session.sourceLanguage}
              </span>
            </div>
            <div className="mt-6 rounded-lg border border-emerald-300/16 bg-white/[0.055] p-4">
              <p className="text-sm font-semibold text-emerald-100">
                {session.status === "LIVE"
                  ? "Live translation is active. Keep this page open for updates."
                  : session.status === "ENDED"
                    ? "This live session has ended. You can still review published updates."
                    : "Waiting for sermon to start. Please keep this page open."}
              </p>
              <p className="mt-2 text-sm text-emerald-50/62">
                Updates: {messages.length} · Last updated:{" "}
                {lastUpdatedAt ? lastUpdatedAt.toLocaleTimeString() : "No updates yet"}
              </p>
            </div>
          </div>

          <form action={`/listen/${session.id}`} className="rounded-lg border border-emerald-300/16 bg-white/[0.055] p-5">
            <label className="grid gap-2 text-sm font-semibold text-emerald-100">
              Listener language
              <select
                name="lang"
                defaultValue={selectedLanguage}
                className="min-h-12 rounded-md border border-emerald-300/18 bg-[#07140f] px-4 text-white outline-none focus:border-emerald-300"
              >
                {languages.map((language) => (
                  <option key={language}>{language}</option>
                ))}
              </select>
            </label>
            <button
              type="submit"
              className="mt-3 inline-flex min-h-11 w-full items-center justify-center rounded-md bg-emerald-400 px-4 text-sm font-semibold text-[#04120c] transition hover:bg-emerald-300"
            >
              Change language
            </button>
            <Link
              href={`/listen/${session.id}?lang=${encodeURIComponent(selectedLanguage)}`}
              className="mt-2 inline-flex min-h-11 w-full items-center justify-center rounded-md border border-emerald-300/22 px-4 text-sm font-semibold text-emerald-50 transition hover:bg-white/8"
            >
              Refresh updates
            </Link>
            <div className="mt-3 flex flex-col gap-2">
              <CopyEmbedButton
                embedCode={getSessionSharePath(session.id)}
                label="Copy listener link"
                copiedLabel="Listener link copied"
              />
              <CopyEmbedButton
                embedCode={languageSpecificUrl}
                label="Copy language link"
                copiedLabel="Language link copied"
              />
              <Link
                href={whatsappShareUrl}
                className="inline-flex min-h-10 items-center justify-center rounded-md border border-emerald-300/22 px-4 text-sm font-semibold text-emerald-50 transition hover:bg-white/8"
              >
                Share on WhatsApp
              </Link>
            </div>
          </form>
        </div>
      </section>

      <section className="section-shell grid gap-6 py-12 lg:grid-cols-[0.72fr_1.28fr]">
        <aside className="grid h-fit gap-5">
          <Panel title="Session details">
            <Detail label="Church" value={session.church.churchName} />
            <Detail label="Status" value={session.status} />
            <Detail label="Selected language" value={selectedLanguage} />
            <Detail label="Stream URL" value={session.streamUrl ?? session.church.youtubeLiveUrl} />
            <Detail label="Update count" value={String(messages.length)} />
            <Detail
              label="Last updated"
              value={lastUpdatedAt ? lastUpdatedAt.toLocaleString() : "No updates yet"}
            />
          </Panel>

          <Panel title="Available languages">
            <div className="flex flex-wrap gap-2">
              {languages.map((language) => (
                <Link
                  key={language}
                  href={`/listen/${session.id}?lang=${encodeURIComponent(language)}`}
                  className={`rounded-md border px-3 py-2 text-sm font-semibold transition ${
                    language === selectedLanguage
                      ? "border-emerald-300 bg-emerald-300 text-[#04120c]"
                      : "border-emerald-300/14 bg-[#07140f] text-emerald-50 hover:bg-white/8"
                  }`}
                >
                  {language}
                </Link>
              ))}
            </div>
          </Panel>
        </aside>

        <section className="rounded-lg border border-emerald-300/16 bg-white/[0.045] p-5">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-md bg-emerald-400 text-[#04120c]">
              {session.status === "LIVE" ? (
                <Radio className="h-5 w-5" />
              ) : (
                <Languages className="h-5 w-5" />
              )}
            </span>
            <div>
              <h2 className="text-2xl font-semibold">Translated transcript</h2>
              <p className="mt-1 text-sm text-emerald-50/62">
                Auto-refreshes every 5 seconds. Manual refresh is also available.
              </p>
            </div>
          </div>

          <div className="mt-5 min-h-80 rounded-lg border border-emerald-300/14 bg-[#07140f] p-5">
            {session.status === "LIVE" ? (
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.14em] text-emerald-300">
                  Latest sermon updates
                </p>
                {messages.length ? (
                  <div className="mt-4 grid gap-4">
                    {messages.map((message) => (
                      <article
                        key={message.id}
                        className="rounded-md border border-emerald-300/12 bg-white/[0.035] p-4"
                      >
                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-300">
                          {message.createdAt.toLocaleTimeString()}
                        </p>
                        <p className="mt-3 text-xl leading-9 text-emerald-50">
                          {message.translatedText}
                        </p>
                      </article>
                    ))}
                  </div>
                ) : (
                  <div>
                    <p className="mt-4 text-2xl leading-9 text-emerald-50">
                      No translated updates yet. Please keep this page open.
                    </p>
                    <p className="mt-4 leading-7 text-emerald-50/66">
                      The church team can publish manual sermon updates from the
                      live session control page. Real-time automation will
                      connect here later.
                    </p>
                  </div>
                )}
              </div>
            ) : session.status === "ENDED" ? (
              <div>
                <p className="text-2xl font-semibold text-emerald-50">
                  Session ended
                </p>
                {messages.length ? (
                  <div className="mt-5 grid gap-4">
                    {messages.map((message) => (
                      <article
                        key={message.id}
                        className="rounded-md border border-emerald-300/12 bg-white/[0.035] p-4"
                      >
                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-300">
                          {message.createdAt.toLocaleTimeString()}
                        </p>
                        <p className="mt-3 text-xl leading-9 text-emerald-50">
                          {message.translatedText}
                        </p>
                      </article>
                    ))}
                  </div>
                ) : (
                  <p className="mt-4 leading-7 text-emerald-50/66">
                    No translated updates were published for {selectedLanguage}.
                  </p>
                )}
              </div>
            ) : (
              <p className="text-2xl font-semibold text-emerald-50">
                Waiting for sermon to start
              </p>
            )}
          </div>
        </section>
      </section>
    </main>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-lg border border-emerald-300/16 bg-white/[0.045] p-5">
      <h2 className="text-xl font-semibold">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function Detail({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="border-b border-emerald-300/10 py-3 last:border-b-0">
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-emerald-300">
        {label}
      </p>
      <p className="mt-1 break-words text-sm leading-6 text-emerald-50/76">
        {value || "Not added"}
      </p>
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

function getSessionSharePath(sessionId: string) {
  return `${getSiteUrl()}/listen/${sessionId}`;
}
