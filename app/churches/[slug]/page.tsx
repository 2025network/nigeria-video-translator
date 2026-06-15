import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Building2,
  Camera,
  Globe2,
  Languages,
  MapPin,
  Play,
  Share2,
  UserRound,
  Video,
} from "lucide-react";
import { getChurchBySlug, toChurchView } from "@/lib/churchRepository";
import { getChurchEmbedUrl } from "@/lib/demoChurches";
import {
  getLatestListenableSessionForChurch,
  getSessionListenUrl,
} from "@/lib/sermonSessionRepository";

type PublicChurchPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateMetadata({
  params,
}: PublicChurchPageProps): Promise<Metadata> {
  const { slug } = await params;
  const church = await getChurchBySlug(slug);

  if (!church) {
    return {
      title: "Church Not Found",
    };
  }

  return {
    title: church.churchName,
    description:
      church.description ??
      `Follow ${church.churchName} with SermonBridge live sermon translation.`,
  };
}

export default async function PublicChurchProfilePage({
  params,
}: PublicChurchPageProps) {
  const { slug } = await params;
  const church = await getChurchBySlug(slug);

  if (!church) {
    notFound();
  }

  const churchView = toChurchView(church);
  const latestSession = await getLatestListenableSessionForChurch(church.id);
  const listenUrl = latestSession
    ? getSessionListenUrl(latestSession.id)
    : getChurchEmbedUrl(church.slug);
  const watchUrl = church.youtubeLiveUrl || church.websiteUrl || "";
  const socialLinks = [
    { label: "Website", href: church.websiteUrl, icon: <Globe2 className="h-4 w-4" /> },
    { label: "Facebook", href: church.facebookUrl, icon: <Share2 className="h-4 w-4" /> },
    { label: "YouTube", href: church.youtubeUrl, icon: <Video className="h-4 w-4" /> },
    { label: "Instagram", href: church.instagramUrl, icon: <Camera className="h-4 w-4" /> },
  ].filter((item) => Boolean(item.href));
  const availableLanguages = Array.from(
    new Set([...churchView.enabledLanguages, ...churchView.supportedLanguages]),
  );

  return (
    <main className="min-h-screen bg-[#06110d] text-white">
      <section className="relative overflow-hidden border-b border-emerald-400/15">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: church.bannerUrl
              ? `linear-gradient(90deg, rgba(6,17,13,0.92), rgba(6,17,13,0.68)), url(${church.bannerUrl})`
              : "linear-gradient(135deg, rgba(16,185,129,0.24), rgba(6,17,13,1) 58%)",
          }}
        />
        <div className="section-shell relative grid min-h-[520px] items-end gap-8 py-14 lg:grid-cols-[1fr_0.42fr]">
          <div className="max-w-3xl">
            <div className="mb-6 flex h-24 w-24 items-center justify-center overflow-hidden rounded-lg border border-emerald-300/24 bg-[#07140f] shadow-2xl shadow-black/20">
              {church.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={church.logoUrl}
                  alt={`${church.churchName} logo`}
                  className="h-full w-full object-cover"
                />
              ) : (
                <Building2 className="h-11 w-11 text-emerald-300" />
              )}
            </div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-300">
              SermonBridge church profile
            </p>
            <h1 className="mt-3 text-4xl font-semibold leading-tight sm:text-6xl">
              {church.churchName}
            </h1>
            <div className="mt-5 flex flex-wrap gap-3 text-sm text-emerald-50/72">
              {church.pastorName ? (
                <span className="inline-flex items-center gap-2 rounded-md border border-emerald-300/16 bg-white/[0.055] px-3 py-2">
                  <UserRound className="h-4 w-4 text-emerald-300" />
                  Pastor {church.pastorName}
                </span>
              ) : null}
              <span className="inline-flex items-center gap-2 rounded-md border border-emerald-300/16 bg-white/[0.055] px-3 py-2">
                <MapPin className="h-4 w-4 text-emerald-300" />
                {[church.city, church.country].filter(Boolean).join(", ") || "Location not added"}
              </span>
            </div>
            <p className="mt-6 max-w-2xl leading-8 text-emerald-50/78">
              {church.description ??
                "This church has not added a public description yet. SermonBridge keeps the live translation profile ready while the church completes its details."}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              {watchUrl ? (
                <Link
                  href={watchUrl}
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-emerald-400 px-6 font-semibold text-[#04120c] transition hover:bg-emerald-300"
                >
                  <Play className="h-5 w-5" />
                  Watch Live
                </Link>
              ) : (
                <span className="inline-flex min-h-12 items-center justify-center rounded-md border border-emerald-300/18 px-6 font-semibold text-emerald-50/50">
                  Watch Live unavailable
                </span>
              )}
              <Link
                href={listenUrl}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md border border-emerald-300/22 px-6 font-semibold text-emerald-50 transition hover:bg-white/8"
              >
                <Languages className="h-5 w-5" />
                Listen In Your Language
              </Link>
            </div>
          </div>

          <aside className="rounded-lg border border-emerald-300/16 bg-white/[0.055] p-5 backdrop-blur">
            <h2 className="text-xl font-semibold">Live translation access</h2>
            <p className="mt-3 text-sm leading-6 text-emerald-50/70">
              Open the SermonBridge listener widget to follow the service in
              your preferred language.
            </p>
            <Link
              href={listenUrl}
              className="mt-5 inline-flex min-h-11 w-full items-center justify-center rounded-md bg-emerald-400 px-4 text-sm font-semibold text-[#04120c] transition hover:bg-emerald-300"
            >
              Open listener widget
            </Link>
          </aside>
        </div>
      </section>

      <section className="section-shell grid gap-6 py-14 lg:grid-cols-[0.72fr_1.28fr]">
        <aside className="grid h-fit gap-5">
          <InfoPanel title="Church information">
            <InfoLine label="Pastor" value={church.pastorName} />
            <InfoLine label="Address" value={church.address} />
            <InfoLine
              label="Location"
              value={[church.city, church.country].filter(Boolean).join(", ")}
            />
          </InfoPanel>

          <InfoPanel title="Connect">
            {socialLinks.length ? (
              <div className="grid gap-3">
                {socialLinks.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href ?? "#"}
                    className="inline-flex min-h-11 items-center gap-2 rounded-md border border-emerald-300/14 bg-[#07140f] px-3 text-sm font-semibold text-emerald-50 transition hover:bg-white/8"
                  >
                    {item.icon}
                    {item.label}
                  </Link>
                ))}
              </div>
            ) : (
              <EmptyText>No social links have been added yet.</EmptyText>
            )}
          </InfoPanel>
        </aside>

        <section className="grid gap-6">
          <InfoPanel title="About this church">
            <p className="leading-8 text-emerald-50/76">
              {church.description ??
                "No public description has been added yet. The church can update this from its SermonBridge profile dashboard."}
            </p>
          </InfoPanel>

          <InfoPanel title="Available Languages">
            {availableLanguages.length ? (
              <div className="flex flex-wrap gap-2">
                {availableLanguages.map((language) => (
                  <span
                    key={language}
                    className="rounded-md border border-emerald-300/14 bg-emerald-300/10 px-3 py-2 text-sm font-semibold text-emerald-50"
                  >
                    {language}
                  </span>
                ))}
              </div>
            ) : (
              <EmptyText>No languages have been highlighted yet.</EmptyText>
            )}
            <p className="mt-4 text-sm leading-6 text-emerald-50/62">
              All supported languages are available by default. Churches can
              highlight preferred listener languages for their audience.
            </p>
          </InfoPanel>
        </section>
      </section>
    </main>
  );
}

function InfoPanel({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-lg border border-emerald-300/16 bg-white/[0.045] p-5">
      <h2 className="text-2xl font-semibold">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function InfoLine({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="border-b border-emerald-300/10 py-3 last:border-b-0">
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-emerald-300">
        {label}
      </p>
      <p className="mt-1 break-words text-sm leading-6 text-emerald-50/76">
        {value || "Not added yet"}
      </p>
    </div>
  );
}

function EmptyText({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-md border border-dashed border-emerald-300/20 bg-[#07140f] p-4 text-sm text-emerald-50/62">
      {children}
    </p>
  );
}
