import Link from "next/link";
import { ArrowRight, Code2, Languages, MonitorSmartphone, Radio, Settings2 } from "lucide-react";

const widgetSteps = [
  "Create or update the church profile",
  "Add the YouTube Live or stream page source",
  "Choose enabled countries and listener languages",
  "Copy the iframe embed or floating button script",
  "Paste it into a website, WordPress block, or app WebView",
  "Members open the widget and choose their language",
  "Demo subtitles appear now; real AI translation can be connected later",
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
              Install live sermon translation where your church already streams
            </h1>
            <p className="mt-6 text-lg leading-8 text-emerald-50/76">
              SermonBridge gives each church a configurable live translation
              widget. Churches manage their own profile, stream URL, countries,
              languages, and embed codes from the church area.
            </p>
            <p className="mt-5 rounded-md border border-emerald-300/18 bg-emerald-300/10 p-4 text-sm font-semibold leading-6 text-emerald-50">
              Demo translation is active. Real AI translation can be connected later.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/church/login"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-emerald-400 px-6 py-3 font-semibold text-[#04120c] transition hover:bg-emerald-300 focus-visible:focus-ring"
              >
                <Settings2 className="h-5 w-5" />
                Get Church Widget
              </Link>
              <Link
                href="/embed/christ-embassy-lagos/live"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md border border-emerald-200/20 px-6 py-3 font-semibold text-emerald-50 transition hover:bg-white/8 focus-visible:focus-ring"
              >
                View Live Demo
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          </div>

          <div className="grid gap-4">
            {widgetSteps.map((step, index) => (
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

        <div className="mt-14 grid gap-5 md:grid-cols-3">
          <FeatureCard
            icon={<Code2 className="h-8 w-8 text-emerald-300" />}
            title="Two install options"
            description="Use the full iframe embed for a dedicated page, or the floating button script for a side panel on an existing page."
          />
          <FeatureCard
            icon={<Languages className="h-8 w-8 text-emerald-300" />}
            title="Country-based languages"
            description="Enable Nigerian languages, other African language groups, and global languages from the shared catalog."
          />
          <FeatureCard
            icon={<MonitorSmartphone className="h-8 w-8 text-emerald-300" />}
            title="Responsive listener view"
            description="The public widget is compact enough for iframes, WordPress pages, mobile app WebViews, and narrow screens."
          />
        </div>

        <section className="mt-14 rounded-lg border border-emerald-300/16 bg-white/[0.045] p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <Radio className="mb-3 h-8 w-8 text-emerald-300" />
              <h2 className="text-2xl font-semibold">Recorded video tool</h2>
              <p className="mt-3 max-w-2xl leading-7 text-emerald-50/72">
                SermonBridge still includes the upload video workflow as a
                secondary tool for recorded sermons and event clips.
              </p>
            </div>
            <Link
              href="/upload"
              className="inline-flex min-h-12 items-center justify-center rounded-md border border-emerald-200/20 px-6 py-3 font-semibold text-emerald-50 transition hover:bg-white/8 focus-visible:focus-ring"
            >
              Open Upload Tool
            </Link>
          </div>
        </section>
      </section>
    </main>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <article className="rounded-lg border border-emerald-300/16 bg-white/[0.045] p-6">
      {icon}
      <h2 className="mt-5 text-xl font-semibold">{title}</h2>
      <p className="mt-3 leading-7 text-emerald-50/72">{description}</p>
    </article>
  );
}
