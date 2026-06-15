import type { Metadata } from "next";
import Link from "next/link";
import { CalendarClock, Languages, Play, Radio, Square } from "lucide-react";
import { CopyEmbedButton } from "@/app/admin/churches/CopyEmbedButton";
import { catalogLanguages } from "@/lib/languageCatalog";
import { getCurrentChurchView } from "@/lib/currentChurch";
import {
  getSermonSessionsForChurch,
  getSessionListenUrl,
  parseSessionLanguages,
} from "@/lib/sermonSessionRepository";
import { ChurchNav } from "../ChurchNav";
import {
  createSermonSessionAction,
  endSermonSessionAction,
  startSermonSessionAction,
} from "./actions";

type LiveSessionsPageProps = {
  searchParams?: Promise<{
    created?: string;
    started?: string;
    ended?: string;
    error?: string;
  }>;
};

export const metadata: Metadata = {
  title: "Live Sessions",
};

export const dynamic = "force-dynamic";

export default async function ChurchLiveSessionsPage({
  searchParams,
}: LiveSessionsPageProps) {
  const [church, params] = await Promise.all([getCurrentChurchView(), searchParams]);
  const sessions = await getSermonSessionsForChurch(church.id);
  const defaultListenerLanguages = church.supportedLanguages.length
    ? church.supportedLanguages
    : catalogLanguages;

  return (
    <main className="min-h-screen bg-[#06110d] text-white">
      <section className="section-shell py-8">
        <ChurchNav />
      </section>

      <section className="section-shell pb-16">
        <div className="mb-8 max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-300">
            Live sermon sessions
          </p>
          <h1 className="mt-3 text-4xl font-semibold leading-tight sm:text-5xl">
            Start and manage listener sessions
          </h1>
          <p className="mt-4 leading-7 text-emerald-50/72">
            Create a sermon session, choose the spoken language, highlight
            listener languages, and share the public listener link.
          </p>
        </div>

        <StatusMessage params={params} />

        <div className="grid gap-6 xl:grid-cols-[0.82fr_1.18fr]">
          <form
            action={createSermonSessionAction}
            className="grid h-fit gap-5 rounded-lg border border-emerald-300/16 bg-white/[0.045] p-5"
          >
            <div>
              <div className="flex h-11 w-11 items-center justify-center rounded-md bg-emerald-400 text-[#04120c]">
                <Radio className="h-5 w-5" />
              </div>
              <h2 className="mt-4 text-2xl font-semibold">New session</h2>
            </div>

            <Field label="Sermon title" name="title" placeholder="Sunday Service" required />

            <label className="grid gap-2 text-sm font-semibold text-emerald-100">
              Source language
              <select
                name="sourceLanguage"
                defaultValue={church.defaultSpokenLanguage || "English"}
                className="min-h-12 rounded-md border border-emerald-300/18 bg-[#07140f] px-4 text-white outline-none focus-visible:focus-ring"
              >
                {catalogLanguages.map((language) => (
                  <option key={language}>{language}</option>
                ))}
              </select>
            </label>

            <Field
              label="Stream/watch URL optional"
              name="streamUrl"
              placeholder={church.youtubeLiveUrl || "https://youtube.com/live/..."}
              type="url"
            />

            <fieldset className="grid gap-3">
              <legend className="text-sm font-semibold text-emerald-100">
                Listener languages
              </legend>
              <p className="text-sm leading-6 text-emerald-50/62">
                All languages are available by default. Select languages to
                highlight for this session.
              </p>
              <div className="grid max-h-80 gap-2 overflow-auto rounded-md border border-emerald-300/14 bg-[#07140f] p-3 sm:grid-cols-2">
                {catalogLanguages.map((language) => (
                  <label
                    key={language}
                    className="flex min-h-10 items-center gap-3 rounded-md px-2 text-sm text-emerald-50/78 transition hover:bg-white/6"
                  >
                    <input
                      type="checkbox"
                      name="listenerLanguages"
                      value={language}
                      defaultChecked={defaultListenerLanguages.includes(language)}
                      className="h-4 w-4 accent-emerald-400"
                    />
                    {language}
                  </label>
                ))}
              </div>
            </fieldset>

            <button
              type="submit"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-emerald-400 px-5 font-semibold text-[#04120c] transition hover:bg-emerald-300"
            >
              <Play className="h-5 w-5" />
              Start session setup
            </button>
          </form>

          <section className="grid gap-4">
            {sessions.length === 0 ? (
              <div className="rounded-lg border border-dashed border-emerald-300/24 bg-white/[0.045] p-10 text-center">
                <CalendarClock className="mx-auto h-11 w-11 text-emerald-300" />
                <h2 className="mt-4 text-2xl font-semibold">No sessions yet</h2>
                <p className="mt-2 text-emerald-50/68">
                  Create your first sermon session to share a public listener link.
                </p>
              </div>
            ) : (
              sessions.map((session) => {
                const listenUrl = getSessionListenUrl(session.id);
                const listenerLanguages = parseSessionLanguages(session.listenerLanguages);

                return (
                  <article
                    key={session.id}
                    className="rounded-lg border border-emerald-300/16 bg-white/[0.045] p-5"
                  >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-3">
                          <h2 className="text-2xl font-semibold">{session.title}</h2>
                          <StatusBadge status={session.status} />
                        </div>
                        <p className="mt-2 text-sm leading-6 text-emerald-50/66">
                          Source: {session.sourceLanguage} · Created{" "}
                          {session.createdAt.toLocaleDateString()}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {session.status !== "LIVE" && session.status !== "ENDED" ? (
                          <form action={startSermonSessionAction}>
                            <input type="hidden" name="sessionId" value={session.id} />
                            <button
                              type="submit"
                              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md bg-emerald-400 px-4 text-sm font-semibold text-[#04120c] transition hover:bg-emerald-300"
                            >
                              <Play className="h-4 w-4" />
                              Start session
                            </button>
                          </form>
                        ) : null}
                        {session.status === "LIVE" ? (
                          <form action={endSermonSessionAction}>
                            <input type="hidden" name="sessionId" value={session.id} />
                            <button
                              type="submit"
                              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-red-300/24 px-4 text-sm font-semibold text-red-100 transition hover:bg-red-950/24"
                            >
                              <Square className="h-4 w-4" />
                              End session
                            </button>
                          </form>
                        ) : null}
                      </div>
                    </div>

                    <div className="mt-5 grid gap-3 md:grid-cols-2">
                      <Info label="Listener link" value={listenUrl} />
                      <Info
                        label="Stream/watch URL"
                        value={session.streamUrl || "No session-specific stream URL"}
                      />
                    </div>

                    <div className="mt-4 rounded-md border border-emerald-300/12 bg-[#07140f] p-4">
                      <p className="flex items-center gap-2 text-sm font-semibold text-emerald-300">
                        <Languages className="h-4 w-4" />
                        Listener languages
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {listenerLanguages.map((language) => (
                          <span
                            key={language}
                            className="rounded-md border border-emerald-300/14 bg-emerald-300/10 px-3 py-1 text-sm text-emerald-50"
                          >
                            {language}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <Link
                        href={`/church/live-sessions/${session.id}`}
                        className="inline-flex min-h-10 items-center justify-center rounded-md bg-emerald-400 px-4 text-sm font-semibold text-[#04120c] transition hover:bg-emerald-300"
                      >
                        Manage session
                      </Link>
                      <Link
                        href={listenUrl}
                        className="inline-flex min-h-10 items-center justify-center rounded-md border border-emerald-300/26 px-4 text-sm font-semibold text-emerald-100 transition hover:bg-white/8"
                      >
                        View listener link
                      </Link>
                      <CopyEmbedButton
                        embedCode={listenUrl}
                        label="Copy listener link"
                        copiedLabel="Listener link copied"
                      />
                    </div>
                  </article>
                );
              })
            )}
          </section>
        </div>
      </section>
    </main>
  );
}

function StatusMessage({
  params,
}: {
  params?: { created?: string; started?: string; ended?: string; error?: string };
}) {
  const message = params?.created
    ? "Session created. Start it when the sermon is ready."
    : params?.started
      ? "Session is now live."
      : params?.ended
        ? "Session ended."
        : params?.error
          ? "Please check the session form and try again."
          : "";

  if (!message) return null;

  return (
    <div className="mb-6 rounded-lg border border-emerald-300/24 bg-emerald-300/10 p-4 text-sm font-semibold text-emerald-50">
      {message}
    </div>
  );
}

function Field({
  label,
  name,
  placeholder,
  type = "text",
  required = false,
}: {
  label: string;
  name: string;
  placeholder?: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-emerald-100">
      {label}
      <input
        name={name}
        type={type}
        placeholder={placeholder}
        required={required}
        className="min-h-12 rounded-md border border-emerald-300/18 bg-[#07140f] px-4 text-white outline-none placeholder:text-emerald-50/35 focus-visible:focus-ring"
      />
    </label>
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

  return <span className={`rounded-full px-3 py-1 text-xs font-bold ${tone}`}>{status}</span>;
}
