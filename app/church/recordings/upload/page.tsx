import type { Metadata } from "next";
import { FileAudio2, ShieldCheck, Upload } from "lucide-react";
import { BackButton } from "@/app/components/BackButton";
import { CountryLanguageMultiSelect } from "@/app/components/CountryLanguageMultiSelect";
import { SearchableLanguageSelect } from "@/app/components/SearchableLanguageSelect";
import { getBranchesForChurch } from "@/lib/branchRepository";
import { requireChurchPermission } from "@/lib/currentChurch";
import { maxRecordingLabel, recordingAccept } from "@/lib/recordingFiles";
import { ChurchNav } from "../../ChurchNav";

type UploadRecordingPageProps = {
  searchParams: Promise<{ error?: string }>;
};

export const metadata: Metadata = {
  title: "Upload Recorded Sermon | SermonBridge",
};

export const dynamic = "force-dynamic";

export default async function UploadRecordingPage({
  searchParams,
}: UploadRecordingPageProps) {
  const [{ church }, query] = await Promise.all([
    requireChurchPermission("recordings:manage"),
    searchParams,
  ]);
  const branches = (await getBranchesForChurch(church.id)).filter(
    (branch) => !branch.disabledAt,
  );

  return (
    <main className="min-h-screen bg-[#06110d] text-white">
      <section className="section-shell py-8">
        <ChurchNav />
        <div className="mt-4">
          <BackButton href="/church/recordings" label="Back to recordings" />
        </div>
      </section>

      <section className="section-shell pb-16">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-300">
            New recorded sermon
          </p>
          <h1 className="mt-3 text-4xl font-semibold sm:text-5xl">Upload recording</h1>
          <p className="mt-3 leading-7 text-emerald-50/68">
            Choose the source language and the publishing languages you want SermonBridge to prepare.
          </p>
        </div>

        {query.error ? (
          <div className="mt-6 max-w-3xl rounded-md border border-red-300/24 bg-red-400/10 p-4 text-sm text-red-100">
            {query.error}
          </div>
        ) : null}

        <form
          method="post"
          action="/api/church/recordings/upload"
          encType="multipart/form-data"
          className="mt-8 grid max-w-3xl gap-6 rounded-lg border border-emerald-300/16 bg-white/[0.045] p-5 sm:p-7"
        >
          <label className="grid gap-2 text-sm font-semibold text-emerald-100">
            Sermon title
            <input
              name="title"
              maxLength={160}
              required
              placeholder="Sunday Service - Walking by Faith"
              className="min-h-12 rounded-md border border-emerald-300/18 bg-[#07140f] px-4 text-white outline-none placeholder:text-emerald-50/35 focus-visible:focus-ring"
            />
          </label>

          {branches.length ? (
            <label className="grid gap-2 text-sm font-semibold text-emerald-100">
              Branch (optional)
              <select
                name="branchId"
                defaultValue=""
                className="min-h-12 rounded-md border border-emerald-300/18 bg-[#07140f] px-4 text-white outline-none focus-visible:focus-ring"
              >
                <option value="">Main church</option>
                {branches.map((branch) => (
                  <option key={branch.id} value={branch.id}>{branch.name}</option>
                ))}
              </select>
            </label>
          ) : null}

          <SearchableLanguageSelect
            name="sourceLanguage"
            label="Source sermon language"
            value="en"
            recommendedCountry={church.country}
          />

          <CountryLanguageMultiSelect
            languageName="targetLanguages"
            initialCountry={church.country || "Nigeria"}
            selectedLanguages={["yo", "ig", "ha", "pcm"]}
          />

          <label className="grid gap-3 rounded-md border border-emerald-300/16 bg-[#07140f] p-4 text-sm font-semibold text-emerald-100">
            <span className="flex items-center gap-2">
              <FileAudio2 className="h-5 w-5 text-emerald-300" /> Sermon audio or video
            </span>
            <input
              type="file"
              name="recording"
              accept={recordingAccept}
              required
              className="block w-full text-sm text-emerald-50/70 file:mr-4 file:rounded-md file:border-0 file:bg-emerald-400 file:px-4 file:py-3 file:font-semibold file:text-[#04120c] hover:file:bg-emerald-300"
            />
            <span className="font-normal leading-6 text-emerald-50/52">
              MP3, MP4, WAV, or M4A. Maximum upload size: {maxRecordingLabel}.
            </span>
          </label>

          <div className="rounded-md border border-sky-300/16 bg-sky-300/[0.055] p-4 text-sm leading-6 text-sky-50/78">
            <p className="flex items-center gap-2 font-semibold text-sky-100">
              <ShieldCheck className="h-4 w-4" /> Processing remains private to your church account
            </p>
            <p className="mt-2">
              Upload first, then manually start transcription and translation from the recording results page. Select only the languages needed for this publishing run.
            </p>
          </div>

          <button
            type="submit"
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-emerald-400 px-5 font-semibold text-[#04120c] hover:bg-emerald-300"
          >
            <Upload className="h-5 w-5" /> Upload sermon recording
          </button>
        </form>
      </section>
    </main>
  );
}
