import type { Metadata } from "next";
import Link from "next/link";
import {
  AudioLines,
  CheckCircle2,
  Clock3,
  FileAudio2,
  Languages,
  Upload,
  XCircle,
} from "lucide-react";
import { BackButton } from "@/app/components/BackButton";
import { requireChurchPermission } from "@/lib/currentChurch";
import { getLanguageName } from "@/lib/languageCatalog";
import {
  getRecordingsForChurch,
  parseRecordingLanguages,
} from "@/lib/recordingRepository";
import { ChurchNav } from "../ChurchNav";

type RecordingsPageProps = {
  searchParams: Promise<{ error?: string }>;
};

export const metadata: Metadata = {
  title: "Recorded Sermons | SermonBridge",
};

export const dynamic = "force-dynamic";

export default async function ChurchRecordingsPage({
  searchParams,
}: RecordingsPageProps) {
  const [{ church }, query] = await Promise.all([
    requireChurchPermission("recordings:manage"),
    searchParams,
  ]);
  const recordings = await getRecordingsForChurch(church.id);

  return (
    <main className="min-h-screen bg-[#06110d] text-white">
      <section className="section-shell py-8">
        <ChurchNav />
        <div className="mt-4">
          <BackButton href="/church/dashboard" label="Back to dashboard" />
        </div>
      </section>

      <section className="section-shell pb-16">
        <header className="flex flex-col gap-5 border-b border-emerald-300/14 pb-7 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-300">
              Recorded Sermon Translation
            </p>
            <h1 className="mt-3 text-4xl font-semibold sm:text-5xl">Recordings</h1>
            <p className="mt-3 max-w-2xl leading-7 text-emerald-50/68">
              Prepare transcripts, translated publishing text, and timed subtitle files from recorded sermon audio or video.
            </p>
          </div>
          <Link
            href="/church/recordings/upload"
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-emerald-400 px-5 font-semibold text-[#04120c] hover:bg-emerald-300"
          >
            <Upload className="h-5 w-5" />
            Upload recording
          </Link>
        </header>

        {query.error ? (
          <div className="mt-6 rounded-md border border-red-300/24 bg-red-400/10 p-4 text-sm text-red-100">
            {query.error}
          </div>
        ) : null}

        {recordings.length ? (
          <div className="mt-8 grid gap-4">
            {recordings.map((recording) => {
              const targetLanguages = parseRecordingLanguages(recording.targetLanguages);
              const completedTranslations = recording.translations.filter(
                (translation) => translation.status === "COMPLETED",
              ).length;

              return (
                <article
                  key={recording.id}
                  className="rounded-lg border border-emerald-300/16 bg-white/[0.045] p-5"
                >
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <StatusBadge status={recording.status} />
                        <span className="text-xs text-emerald-50/48">
                          {recording.createdAt.toLocaleString()}
                        </span>
                      </div>
                      <h2 className="mt-3 text-2xl font-semibold">{recording.title}</h2>
                      <p className="mt-2 text-sm text-emerald-50/62">
                        {recording.branch?.name ?? "Main church"} · {recording.originalFileName}
                      </p>
                    </div>
                    <Link
                      href={`/church/recordings/${recording.id}`}
                      className="inline-flex min-h-11 items-center justify-center rounded-md border border-emerald-300/24 px-4 text-sm font-semibold text-emerald-50 hover:bg-white/8"
                    >
                      View results
                    </Link>
                  </div>

                  <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    <Info
                      icon={AudioLines}
                      label="Source language"
                      value={getLanguageName(recording.sourceLanguage)}
                    />
                    <Info
                      icon={Languages}
                      label="Target languages"
                      value={String(targetLanguages.length)}
                    />
                    <Info
                      icon={CheckCircle2}
                      label="Translations ready"
                      value={`${completedTranslations}/${targetLanguages.length}`}
                    />
                    <Info
                      icon={FileAudio2}
                      label="Transcript"
                      value={recording.transcriptText ? "Available" : "Not generated"}
                    />
                  </div>

                  {recording.errorMessage ? (
                    <p className="mt-4 rounded-md border border-red-300/18 bg-red-400/[0.06] p-3 text-sm text-red-100">
                      {recording.errorMessage}
                    </p>
                  ) : null}
                </article>
              );
            })}
          </div>
        ) : (
          <div className="mt-8 rounded-lg border border-dashed border-emerald-300/22 bg-white/[0.03] p-10 text-center">
            <FileAudio2 className="mx-auto h-10 w-10 text-emerald-300" />
            <h2 className="mt-4 text-2xl font-semibold">No recordings uploaded yet</h2>
            <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-emerald-50/62">
              Upload an MP3, MP4, WAV, or M4A sermon to begin transcription and translation.
            </p>
            <Link
              href="/church/recordings/upload"
              className="mt-5 inline-flex min-h-11 items-center justify-center rounded-md bg-emerald-400 px-5 font-semibold text-[#04120c] hover:bg-emerald-300"
            >
              Upload first recording
            </Link>
          </div>
        )}
      </section>
    </main>
  );
}

function StatusBadge({ status }: { status: string }) {
  const settings = {
    UPLOADED: { icon: Clock3, className: "border-sky-300/22 bg-sky-300/10 text-sky-100" },
    PROCESSING: { icon: Clock3, className: "border-amber-300/22 bg-amber-300/10 text-amber-100" },
    COMPLETED: { icon: CheckCircle2, className: "border-emerald-300/24 bg-emerald-300/10 text-emerald-100" },
    FAILED: { icon: XCircle, className: "border-red-300/22 bg-red-400/10 text-red-100" },
  }[status] ?? { icon: Clock3, className: "border-white/15 bg-white/5 text-white" };
  const Icon = settings.icon;

  return (
    <span className={`inline-flex min-h-8 items-center gap-2 rounded-full border px-3 text-xs font-semibold ${settings.className}`}>
      <Icon className="h-3.5 w-3.5" />
      {status}
    </span>
  );
}

function Info({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof AudioLines;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-md border border-emerald-300/12 bg-[#07140f] p-3">
      <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.1em] text-emerald-300">
        <Icon className="h-4 w-4" /> {label}
      </p>
      <p className="mt-2 text-sm text-emerald-50/76">{value}</p>
    </div>
  );
}
