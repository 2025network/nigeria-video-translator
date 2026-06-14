import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Captions,
  HeartHandshake,
  Languages,
  Radio,
  School,
  UploadCloud,
  Users,
} from "lucide-react";

const languages = ["Yoruba", "Igbo", "Hausa", "Nigerian Pidgin"];

const benefits = [
  {
    title: "Understand important messages",
    description:
      "Turn video speech into translated text, subtitles, and a separate voice-over so more people can follow along.",
    icon: Captions,
  },
  {
    title: "Support community learning",
    description:
      "Useful for churches, schools, creators, families, and communities sharing educational or event content.",
    icon: School,
  },
  {
    title: "Simple public access",
    description:
      "A straightforward platform for uploading recorded videos and exploring live translation foundations.",
    icon: Users,
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[#06110d] text-white">
      <section className="relative overflow-hidden border-b border-emerald-400/15">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,197,94,0.24),transparent_34%),linear-gradient(135deg,rgba(15,23,42,0.98),rgba(4,12,9,1)_58%)]" />
        <div className="section-shell relative grid min-h-[650px] items-center gap-12 py-20 lg:grid-cols-[1fr_0.9fr]">
          <div className="max-w-3xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-300/25 bg-emerald-300/10 px-4 py-2 text-sm font-medium text-emerald-100">
              <HeartHandshake className="h-4 w-4" />
              Free public video translation for sermon languages
            </div>
            <h1 className="text-5xl font-semibold leading-tight tracking-normal text-white sm:text-6xl lg:text-7xl">
              SermonBridge
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-emerald-50/78">
              Upload recorded videos or explore live stream translation demos to
              help people understand content in Yoruba, Igbo, Hausa, and
              Nigerian Pidgin.
            </p>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
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
                <Radio className="h-5 w-5" />
                Live Stream
              </Link>
            </div>
          </div>

          <div className="rounded-lg border border-emerald-300/18 bg-white/[0.055] p-5 shadow-2xl shadow-emerald-950/50 backdrop-blur">
            <div className="aspect-video rounded-md bg-[#0b1f17] p-6">
              <div className="flex h-full flex-col justify-between">
                <Languages className="h-10 w-10 text-emerald-300" />
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-300">
                    Supported languages
                  </p>
                  <div className="mt-4 grid grid-cols-2 gap-3">
                    {languages.map((language) => (
                      <div
                        key={language}
                        className="rounded-md border border-emerald-200/15 bg-[#06150f] px-3 py-3 text-center font-medium text-emerald-50"
                      >
                        {language}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#091813] py-20">
        <div className="section-shell">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-300">
              Benefits
            </p>
            <h2 className="mt-3 text-3xl font-semibold text-white sm:text-4xl">
              Make video content easier to follow
            </h2>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {benefits.map((benefit) => {
              const Icon = benefit.icon;
              return (
                <article
                  key={benefit.title}
                  className="rounded-lg border border-emerald-300/14 bg-white/[0.045] p-6"
                >
                  <Icon className="h-8 w-8 text-emerald-300" />
                  <h3 className="mt-5 text-xl font-semibold text-white">
                    {benefit.title}
                  </h3>
                  <p className="mt-3 leading-7 text-emerald-50/72">
                    {benefit.description}
                  </p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-[#06110d] py-20">
        <div className="section-shell flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <div>
            <BookOpen className="mb-3 h-8 w-8 text-emerald-300" />
            <h2 className="text-3xl font-semibold">See how the platform works</h2>
            <p className="mt-3 max-w-2xl leading-7 text-emerald-50/72">
              The recorded-video pipeline extracts audio, creates text, translates
              it, generates subtitles, and produces a separate translated voice-over.
            </p>
          </div>
          <Link
            href="/how-it-works"
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-emerald-400 px-6 py-3 font-semibold text-[#04120c] transition hover:bg-emerald-300 focus-visible:focus-ring"
          >
            How It Works
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>
    </main>
  );
}

