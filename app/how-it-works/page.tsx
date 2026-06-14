import Link from "next/link";
import { ArrowRight, Captions, Mic2, UploadCloud } from "lucide-react";

const steps = [
  "Upload video",
  "Extract audio",
  "Speech recognition",
  "Translation",
  "Subtitle generation",
  "AI voice-over generation",
  "View results",
];

export const metadata = {
  title: "How It Works",
};

export default function HowItWorksPage() {
  return (
    <main className="min-h-screen bg-[#06110d] text-white">
      <section className="section-shell py-20">
        <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-300">
              How It Works
            </p>
            <h1 className="mt-3 text-4xl font-semibold leading-tight sm:text-5xl">
              From recorded video to translated results
            </h1>
            <p className="mt-6 text-lg leading-8 text-emerald-50/76">
              The platform processes a recorded video through a simple sequence
              of audio extraction, text generation, translation, subtitles, and
              a separate translated voice-over player.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/upload"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-emerald-400 px-6 py-3 font-semibold text-[#04120c] transition hover:bg-emerald-300 focus-visible:focus-ring"
              >
                <UploadCloud className="h-5 w-5" />
                Upload Video
              </Link>
              <Link
                href="/live"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md border border-emerald-200/20 px-6 py-3 font-semibold text-emerald-50 transition hover:bg-white/8 focus-visible:focus-ring"
              >
                Live Stream
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          </div>

          <div className="grid gap-4">
            {steps.map((step, index) => (
              <div
                key={step}
                className="grid grid-cols-[48px_1fr] items-center gap-4 rounded-lg border border-emerald-300/14 bg-white/[0.045] p-4"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-md bg-emerald-400 font-bold text-[#04120c]">
                  {index + 1}
                </span>
                <span className="font-medium text-emerald-50">{step}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-14 grid gap-5 md:grid-cols-2">
          <article className="rounded-lg border border-emerald-300/16 bg-white/[0.045] p-6">
            <Captions className="h-8 w-8 text-emerald-300" />
            <h2 className="mt-5 text-xl font-semibold">Subtitles and text</h2>
            <p className="mt-3 leading-7 text-emerald-50/72">
              Results include the original transcript, translated text, and an
              SRT subtitle file for the selected language.
            </p>
          </article>
          <article className="rounded-lg border border-emerald-300/16 bg-white/[0.045] p-6">
            <Mic2 className="h-8 w-8 text-emerald-300" />
            <h2 className="mt-5 text-xl font-semibold">Separate voice-over</h2>
            <p className="mt-3 leading-7 text-emerald-50/72">
              The original video keeps its original audio. The translated
              voice-over is presented separately on the results page.
            </p>
          </article>
        </div>
      </section>
    </main>
  );
}
