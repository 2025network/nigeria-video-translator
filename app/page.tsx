import Link from "next/link";
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  Code2,
  Globe2,
  Languages,
  MonitorSmartphone,
  Radio,
  Settings2,
} from "lucide-react";

const churchSteps = [
  "Add church profile",
  "Choose stream source",
  "Select countries and languages",
  "Copy embed code",
  "Paste on website or app",
];

const workPlaces = [
  "Church websites",
  "WordPress sites",
  "YouTube Live pages",
  "Mobile app WebViews",
  "Conference pages",
  "Smart TV web apps",
];

const widgetOptions = [
  "Full iframe embed",
  "Floating Translate Sermon button",
  "Side panel widget",
  "QR code access",
  "Mobile responsive listener view",
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[#06110d] text-white">
      <section className="relative overflow-hidden border-b border-emerald-400/15">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,197,94,0.24),transparent_34%),linear-gradient(135deg,rgba(15,23,42,0.98),rgba(4,12,9,1)_58%)]" />
        <div className="section-shell relative grid min-h-[680px] items-center gap-12 py-20 lg:grid-cols-[1fr_0.92fr]">
          <div className="max-w-3xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-300/25 bg-emerald-300/10 px-4 py-2 text-sm font-medium text-emerald-100">
              <Radio className="h-4 w-4" />
              Live Translation for church websites, streams, and mobile apps.
            </div>
            <h1 className="text-5xl font-semibold leading-tight tracking-normal text-white sm:text-6xl lg:text-7xl">
              SermonBridge
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-emerald-50/78">
              Live sermon translation widgets for churches, websites,
              WordPress, YouTube Live, and mobile apps.
            </p>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/church-onboarding"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-emerald-400 px-6 py-3 font-semibold text-[#04120c] transition hover:bg-emerald-300 focus-visible:focus-ring"
              >
                <Building2 className="h-5 w-5" />
                Get Church Widget
              </Link>
              <Link
                href="/embed/christ-embassy-lagos/live"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md border border-emerald-200/20 px-6 py-3 font-semibold text-emerald-50 transition hover:bg-white/8 focus-visible:focus-ring"
              >
                <MonitorSmartphone className="h-5 w-5" />
                View Live Preview
              </Link>
            </div>
          </div>

          <div className="rounded-lg border border-emerald-300/18 bg-white/[0.055] p-5 shadow-2xl shadow-emerald-950/50 backdrop-blur">
            <div className="rounded-md bg-[#0b1f17] p-5">
              <div className="flex items-center justify-between gap-4 border-b border-emerald-300/14 pb-4">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.16em] text-emerald-300">
                    Live widget
                  </p>
                  <h2 className="mt-1 text-2xl font-semibold">Sunday service</h2>
                </div>
                <span className="rounded-full bg-emerald-400 px-3 py-1 text-xs font-bold text-[#04120c]">
                  Live
                </span>
              </div>
              <div className="mt-5 aspect-video rounded-md border border-emerald-300/14 bg-black/50" />
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {["Country: Nigeria", "Language: Yoruba", "Mode: Live Translation", "Widget: iframe"].map(
                  (item) => (
                    <div
                      key={item}
                      className="rounded-md border border-emerald-300/14 bg-[#06150f] px-3 py-3 text-sm font-semibold text-emerald-50"
                    >
                      {item}
                    </div>
                  ),
                )}
              </div>
              <p className="mt-5 rounded-md bg-emerald-300/10 p-4 leading-7 text-emerald-50/78">
                Members choose a language and follow sermon subtitles from a
                compact widget on the church website, WordPress page, YouTube
                Live companion page, or mobile app WebView.
              </p>
            </div>
          </div>
        </div>
      </section>

      <HomeSection
        eyebrow="How churches use it"
        title="From church profile to installed widget"
        description="SermonBridge is built so churches can manage their own live translation setup instead of waiting for manual admin work."
        icon={<Settings2 className="h-8 w-8 text-emerald-300" />}
      >
        <div className="grid gap-4 md:grid-cols-5">
          {churchSteps.map((step, index) => (
            <div
              key={step}
              className="rounded-lg border border-emerald-300/14 bg-white/[0.045] p-5"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-md bg-emerald-400 font-bold text-[#04120c]">
                {index + 1}
              </span>
              <p className="mt-4 font-semibold text-emerald-50">{step}</p>
            </div>
          ))}
        </div>
      </HomeSection>

      <HomeSection
        eyebrow="Where it works"
        title="One widget for the platforms churches already use"
        description="The embed is designed for existing websites, WordPress pages, live stream companion pages, and app WebViews."
        icon={<Globe2 className="h-8 w-8 text-emerald-300" />}
      >
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {workPlaces.map((place) => (
            <FeaturePill key={place} label={place} />
          ))}
        </div>
      </HomeSection>

      <HomeSection
        eyebrow="Widget options"
        title="Embed it full-screen or launch it from a floating button"
        description="Churches can choose the installation style that fits their website, live stream page, or mobile app."
        icon={<Code2 className="h-8 w-8 text-emerald-300" />}
      >
        <div className="grid gap-4 md:grid-cols-5">
          {widgetOptions.map((option) => (
            <article
              key={option}
              className="rounded-lg border border-emerald-300/14 bg-white/[0.045] p-5"
            >
              <CheckCircle2 className="h-6 w-6 text-emerald-300" />
              <p className="mt-4 font-semibold text-emerald-50">{option}</p>
            </article>
          ))}
        </div>
      </HomeSection>

      <HomeSection
        eyebrow="Supported language structure"
        title="Enable languages by country"
        description="Churches can enable Nigerian languages, regional African language sets, and global languages from one catalog."
        icon={<Languages className="h-8 w-8 text-emerald-300" />}
      >
        <div className="grid gap-4 md:grid-cols-4">
          {["Nigeria", "Ghana", "South Africa", "Global languages"].map((group) => (
            <div
              key={group}
              className="rounded-lg border border-emerald-300/14 bg-white/[0.045] p-5"
            >
              <h3 className="text-xl font-semibold">{group}</h3>
              <p className="mt-3 leading-7 text-emerald-50/70">
                Choose country groups, then enable the listener languages your
                church wants to offer.
              </p>
            </div>
          ))}
        </div>
      </HomeSection>

      <section className="bg-[#06110d] py-20">
        <div className="section-shell flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <div>
            <Building2 className="mb-3 h-8 w-8 text-emerald-300" />
            <h2 className="text-3xl font-semibold">Church self-service</h2>
            <p className="mt-3 max-w-2xl leading-7 text-emerald-50/72">
              Churches can update their profile, stream URL, selected countries,
              selected languages, iframe code, and floating widget script
              themselves. The admin area remains available for oversight.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/church-onboarding"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-emerald-400 px-6 py-3 font-semibold text-[#04120c] transition hover:bg-emerald-300 focus-visible:focus-ring"
            >
              Request Onboarding
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              href="/admin"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md border border-emerald-200/20 px-6 py-3 font-semibold text-emerald-50 transition hover:bg-white/8 focus-visible:focus-ring"
            >
              Admin
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

function HomeSection({
  eyebrow,
  title,
  description,
  icon,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="bg-[#091813] py-20 even:bg-[#06110d]">
      <div className="section-shell">
        <div className="mb-10 max-w-3xl">
          {icon}
          <p className="mt-4 text-sm font-semibold uppercase tracking-[0.18em] text-emerald-300">
            {eyebrow}
          </p>
          <h2 className="mt-3 text-3xl font-semibold text-white sm:text-4xl">
            {title}
          </h2>
          <p className="mt-4 leading-7 text-emerald-50/72">{description}</p>
        </div>
        {children}
      </div>
    </section>
  );
}

function FeaturePill({ label }: { label: string }) {
  return (
    <div className="rounded-md border border-emerald-300/14 bg-white/[0.045] px-4 py-4 font-semibold text-emerald-50">
      {label}
    </div>
  );
}
