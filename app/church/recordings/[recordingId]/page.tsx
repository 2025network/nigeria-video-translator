import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  AudioLines,
  CheckCircle2,
  Download,
  Languages,
  LoaderCircle,
  Subtitles,
  XCircle,
} from "lucide-react";
import { CopyEmbedButton } from "@/app/admin/churches/CopyEmbedButton";
import { BackButton } from "@/app/components/BackButton";
import { requireChurchPermission } from "@/lib/currentChurch";
import { getLanguageName } from "@/lib/languageCatalog";
import { isVideoRecording } from "@/lib/recordingFiles";
import {
  getRecordingForChurch,
  parseRecordingLanguages,
  parseTimedTranscript,
} from "@/lib/recordingRepository";
import { ChurchNav } from "../../ChurchNav";

type RecordingDetailPageProps = {
  params: Promise<{ recordingId: string }>;
  searchParams: Promise<{
    error?: string;
    uploaded?: string;
    transcribed?: string;
    translated?: string;
  }>;
};

export const metadata: Metadata = {
  title: "Recorded Sermon Results | SermonBridge",
};

export const dynamic = "force-dynamic";

export default async function RecordingDetailPage({
  params,
  searchParams,
}: RecordingDetailPageProps) {
  const [{ recordingId }, query, { church }] = await Promise.all([
    params,
    searchParams,
    requireChurchPermission("recordings:manage"),
  ]);
  const recording = await getRecordingForChurch(recordingId, church.id);

  if (!recording) notFound();

  const targetLanguages = parseRecordingLanguages(recording.targetLanguages);
  const timedSegments = parseTimedTranscript(recording.timedTranscriptJson);
  const openAiConfigured = Boolean(process.env.OPENAI_API_KEY);
  const video = isVideoRecording(recording.originalFileName);
  const successMessage = query.uploaded
    ? "Recording uploaded successfully. Generate its transcript when ready."
    : query.transcribed
      ? "Transcript generated successfully. You can now generate translations."
      : query.translated
        ? "Translations and available subtitle files were generated successfully."
        : null;

  return (
    <main className="min-h-screen bg-[#06110d] text-white">
      <section className="section-shell py-8">
        <ChurchNav />
        <div className="mt-4">
          <BackButton href="/church/recordings" label="Back to recordings" />
        </div>
      </section>

      <section className="section-shell pb-16">
        <header className="flex flex-col gap-5 border-b border-emerald-300/14 pb-7 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status={recording.status} />
              <span className="text-xs text-emerald-50/48">{recording.createdAt.toLocaleString()}</span>
            </div>
            <h1 className="mt-4 text-4xl font-semibold sm:text-5xl">{recording.title}</h1>
            <p className="mt-3 text-emerald-50/64">
              {recording.branch?.name ?? "Main church"} · {recording.originalFileName}
            </p>
          </div>
          <a
            href={recording.fileUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-11 items-center justify-center rounded-md border border-emerald-300/24 px-4 text-sm font-semibold text-emerald-50 hover:bg-white/8"
          >
            Open original recording
          </a>
        </header>

        {successMessage ? (
          <div className="mt-6 rounded-md border border-emerald-300/24 bg-emerald-300/10 p-4 text-sm text-emerald-50">
            {successMessage}
          </div>
        ) : null}
        {query.error || recording.errorMessage ? (
          <div className="mt-6 rounded-md border border-red-300/24 bg-red-400/10 p-4 text-sm text-red-100">
            {query.error ?? recording.errorMessage}
          </div>
        ) : null}
        {!openAiConfigured ? (
          <div className="mt-6 rounded-md border border-amber-300/24 bg-amber-300/10 p-4 text-sm leading-6 text-amber-50">
            OpenAI processing is not configured. Add <code>OPENAI_API_KEY</code> on the server before generating transcripts or translations.
          </div>
        ) : null}

        <div className="mt-8 grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
          <section className="h-fit rounded-lg border border-emerald-300/16 bg-white/[0.045] p-5">
            <h2 className="text-2xl font-semibold">Original recording</h2>
            <div className="mt-4 overflow-hidden rounded-md border border-emerald-300/14 bg-black">
              {video ? (
                <video controls preload="metadata" className="aspect-video w-full" src={recording.fileUrl}>
                  Your browser cannot play this video format.
                </video>
              ) : (
                <div className="p-5">
                  <audio controls preload="metadata" className="w-full" src={recording.fileUrl}>
                    Your browser cannot play this audio format.
                  </audio>
                </div>
              )}
            </div>

            <dl className="mt-5 grid gap-3 text-sm">
              <Detail label="Source language" value={getLanguageName(recording.sourceLanguage)} />
              <Detail label="Target languages" value={targetLanguages.map(getLanguageName).join(", ")} />
              <Detail label="Timed segments" value={timedSegments.length ? String(timedSegments.length) : "Not available"} />
            </dl>
          </section>

          <section className="rounded-lg border border-emerald-300/16 bg-white/[0.045] p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.14em] text-emerald-300">Source text</p>
                <h2 className="mt-2 text-2xl font-semibold">Transcript</h2>
              </div>
              <div className="flex flex-wrap gap-2">
                <form method="post" action={`/church/recordings/${recording.id}/transcribe`}>
                  <button
                    type="submit"
                    disabled={!openAiConfigured}
                    className="inline-flex min-h-11 items-center gap-2 rounded-md bg-emerald-400 px-4 text-sm font-semibold text-[#04120c] hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-45"
                  >
                    <AudioLines className="h-4 w-4" /> Generate Transcript
                  </button>
                </form>
                {recording.transcriptText ? (
                  <Link
                    href={`/church/recordings/${recording.id}/downloads/transcript`}
                    className="inline-flex min-h-11 items-center gap-2 rounded-md border border-emerald-300/24 px-4 text-sm font-semibold text-emerald-50 hover:bg-white/8"
                  >
                    <Download className="h-4 w-4" /> Download .txt
                  </Link>
                ) : null}
              </div>
            </div>

            {recording.transcriptText ? (
              <div className="mt-5 whitespace-pre-wrap rounded-md border border-emerald-300/14 bg-[#07140f] p-4 text-sm leading-7 text-emerald-50/78">
                {recording.transcriptText}
              </div>
            ) : (
              <div className="mt-5 rounded-md border border-dashed border-emerald-300/20 p-7 text-center text-sm text-emerald-50/60">
                Transcript has not been generated yet.
              </div>
            )}
          </section>
        </div>

        <section className="mt-8 border-t border-emerald-300/14 pt-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-emerald-300">Publishing output</p>
              <h2 className="mt-2 text-3xl font-semibold">Translations</h2>
              <p className="mt-2 text-sm text-emerald-50/60">Generated separately for each selected language.</p>
            </div>
            <form method="post" action={`/church/recordings/${recording.id}/translate`}>
              <button
                type="submit"
                disabled={!openAiConfigured || !recording.transcriptText}
                className="inline-flex min-h-11 items-center gap-2 rounded-md bg-emerald-400 px-4 text-sm font-semibold text-[#04120c] hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-45"
              >
                <Languages className="h-4 w-4" /> Generate Translations
              </button>
            </form>
          </div>

          <div className="mt-6 grid gap-5 lg:grid-cols-2">
            {targetLanguages.map((languageCode) => {
              const translation = recording.translations.find(
                (item) => item.languageCode === languageCode,
              );
              const completed = translation?.status === "COMPLETED" && translation.translatedText;

              return (
                <article key={languageCode} className="rounded-lg border border-emerald-300/16 bg-white/[0.045] p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-emerald-300">{languageCode}</p>
                      <h3 className="mt-1 text-2xl font-semibold">{getLanguageName(languageCode)}</h3>
                    </div>
                    <TranslationStatus status={translation?.status ?? "PENDING"} />
                  </div>

                  {completed ? (
                    <>
                      <div className="mt-4 max-h-80 overflow-auto whitespace-pre-wrap rounded-md border border-emerald-300/14 bg-[#07140f] p-4 text-sm leading-7 text-emerald-50/78">
                        {translation.translatedText}
                      </div>
                      <div className="mt-4 flex flex-wrap gap-2">
                        <CopyEmbedButton embedCode={translation.translatedText} label="Copy translation" copiedLabel="Translation copied" />
                        <Link
                          href={`/church/recordings/${recording.id}/downloads/translations/${languageCode}`}
                          className="inline-flex min-h-10 items-center gap-2 rounded-md border border-emerald-300/24 px-3 text-sm font-semibold text-emerald-50 hover:bg-white/8"
                        >
                          <Download className="h-4 w-4" /> Translation .txt
                        </Link>
                        {translation.subtitleUrl ? (
                          <a
                            href={translation.subtitleUrl}
                            download
                            className="inline-flex min-h-10 items-center gap-2 rounded-md border border-emerald-300/24 px-3 text-sm font-semibold text-emerald-50 hover:bg-white/8"
                          >
                            <Subtitles className="h-4 w-4" /> Subtitle .srt
                          </a>
                        ) : null}
                      </div>
                      {!translation.subtitleUrl ? (
                        <p className="mt-4 rounded-md border border-amber-300/18 bg-amber-300/[0.06] p-3 text-sm text-amber-50/80">
                          Subtitle timestamps require timed transcript support.
                        </p>
                      ) : null}
                    </>
                  ) : translation?.status === "FAILED" ? (
                    <p className="mt-4 rounded-md border border-red-300/18 bg-red-400/[0.06] p-4 text-sm leading-6 text-red-100">
                      {translation.errorMessage ?? "Translation could not be completed."}
                    </p>
                  ) : (
                    <p className="mt-4 rounded-md border border-dashed border-emerald-300/20 p-5 text-sm text-emerald-50/58">
                      Translation has not been generated yet.
                    </p>
                  )}
                </article>
              );
            })}
          </div>
        </section>
      </section>
    </main>
  );
}

function StatusBadge({ status }: { status: string }) {
  const className = status === "COMPLETED"
    ? "border-emerald-300/24 bg-emerald-300/10 text-emerald-100"
    : status === "FAILED"
      ? "border-red-300/24 bg-red-400/10 text-red-100"
      : "border-amber-300/24 bg-amber-300/10 text-amber-100";

  return <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${className}`}>{status}</span>;
}

function TranslationStatus({ status }: { status: string }) {
  const Icon = status === "COMPLETED" ? CheckCircle2 : status === "FAILED" ? XCircle : LoaderCircle;
  const className = status === "COMPLETED"
    ? "text-emerald-200"
    : status === "FAILED"
      ? "text-red-200"
      : "text-amber-200";

  return (
    <span className={`inline-flex items-center gap-2 text-xs font-semibold ${className}`}>
      <Icon className="h-4 w-4" /> {status}
    </span>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-1 rounded-md border border-emerald-300/12 bg-[#07140f] p-3">
      <dt className="text-xs font-semibold uppercase tracking-[0.1em] text-emerald-300">{label}</dt>
      <dd className="break-words text-emerald-50/76">{value || "Not set"}</dd>
    </div>
  );
}
