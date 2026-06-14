import Link from "next/link";
import { Building2, Code2, Globe2, Languages, MonitorSmartphone, Radio } from "lucide-react";

const platformUses = [
  "Church websites",
  "WordPress pages",
  "YouTube Live companion pages",
  "Mobile app WebViews",
  "Conference pages",
  "Community broadcast pages",
];

export const metadata = {
  title: "About",
};

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[#06110d] text-white">
      <section className="section-shell py-20">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-300">
            About SermonBridge
          </p>
          <h1 className="mt-3 text-4xl font-semibold leading-tight sm:text-5xl">
            A live sermon translation widget platform for churches
          </h1>
          <p className="mt-6 text-lg leading-8 text-emerald-50/76">
            SermonBridge helps churches add live sermon translation to the
            online platforms they already use. A church can configure its
            profile, choose a stream source, enable countries and languages,
            then copy an iframe or floating widget button into a website,
            WordPress page, YouTube Live page, or mobile app WebView.
          </p>
          <p className="mt-5 rounded-md border border-emerald-300/18 bg-emerald-300/10 p-4 text-sm font-semibold leading-6 text-emerald-50">
            Demo translation is active. Real AI translation can be connected later.
          </p>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-3">
          <InfoCard
            icon={<Building2 className="h-8 w-8" />}
            title="Church self-service"
            description="Churches can manage their own stream URL, widget status, selected countries, selected languages, and embed codes."
          />
          <InfoCard
            icon={<Code2 className="h-8 w-8" />}
            title="Embeds that travel"
            description="Use a full iframe embed or a floating Translate Sermon button that opens a side panel with the live widget."
          />
          <InfoCard
            icon={<Languages className="h-8 w-8" />}
            title="Languages by country"
            description="Nigerian languages are included, and churches can also enable regional and global languages from the shared catalog."
          />
        </div>

        <section className="mt-14 rounded-lg border border-emerald-300/16 bg-white/[0.045] p-6">
          <div className="flex items-center gap-3 text-emerald-300">
            <Globe2 className="h-7 w-7" />
            <h2 className="text-2xl font-semibold text-white">Where churches can use it</h2>
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {platformUses.map((item) => (
              <div
                key={item}
                className="rounded-md border border-emerald-300/14 bg-[#07140f] px-4 py-3 font-medium text-emerald-50"
              >
                {item}
              </div>
            ))}
          </div>
        </section>

        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/church/login"
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-emerald-400 px-6 py-3 font-semibold text-[#04120c] transition hover:bg-emerald-300 focus-visible:focus-ring"
          >
            <Radio className="h-5 w-5" />
            Get Church Widget
          </Link>
          <Link
            href="/embed/christ-embassy-lagos/live"
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md border border-emerald-200/20 px-6 py-3 font-semibold text-emerald-50 transition hover:bg-white/8 focus-visible:focus-ring"
          >
            <MonitorSmartphone className="h-5 w-5" />
            View Live Demo
          </Link>
        </div>
      </section>
    </main>
  );
}

function InfoCard({
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
      <div className="text-emerald-300">{icon}</div>
      <h2 className="mt-5 text-xl font-semibold">{title}</h2>
      <p className="mt-3 leading-7 text-emerald-50/72">{description}</p>
    </article>
  );
}
