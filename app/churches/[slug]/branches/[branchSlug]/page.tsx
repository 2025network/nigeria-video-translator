import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Building2, Languages, MapPin, Play, UserRound } from "lucide-react";
import { getPublicBranchBySlugs } from "@/lib/branchRepository";
import { getBranchEmbedUrl } from "@/lib/demoChurches";
import { languageNamesFromValues } from "@/lib/languageCatalog";
import {
  getLatestListenableSessionForBranch,
  getSessionListenUrl,
} from "@/lib/sermonSessionRepository";

type PublicBranchPageProps = {
  params: Promise<{
    slug: string;
    branchSlug: string;
  }>;
};

export async function generateMetadata({
  params,
}: PublicBranchPageProps): Promise<Metadata> {
  const { slug, branchSlug } = await params;
  const branch = await getPublicBranchBySlugs(slug, branchSlug);

  if (!branch) {
    return { title: "Branch Not Found" };
  }

  return {
    title: `${branch.name} | ${branch.church.churchName}`,
    description:
      branch.description ??
      `Follow ${branch.name} with SermonBridge live sermon translation.`,
  };
}

export default async function PublicBranchProfilePage({
  params,
}: PublicBranchPageProps) {
  const { slug, branchSlug } = await params;
  const branch = await getPublicBranchBySlugs(slug, branchSlug);

  if (!branch || branch.disabledAt) {
    notFound();
  }

  const latestSession = await getLatestListenableSessionForBranch(branch.id);
  const listenUrl = latestSession
    ? getSessionListenUrl(latestSession.id)
    : getBranchEmbedUrl(branch.church.slug, branch.slug);
  const watchUrl = latestSession?.streamUrl || branch.church.youtubeLiveUrl || branch.church.websiteUrl || "";
  const availableLanguages = Array.from(
    new Set([
      ...branch.church.languages.map((item) => item.language),
      ...languageNamesFromValues(
        branch.church.supportedLanguages.split(",").map((item) => item.trim()).filter(Boolean),
      ),
    ]),
  );

  return (
    <main className="min-h-screen bg-[#06110d] text-white">
      <section className="relative overflow-hidden border-b border-emerald-400/15">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: branch.bannerUrl
              ? `linear-gradient(90deg, rgba(6,17,13,0.92), rgba(6,17,13,0.68)), url(${branch.bannerUrl})`
              : "linear-gradient(135deg, rgba(16,185,129,0.24), rgba(6,17,13,1) 58%)",
          }}
        />
        <div className="section-shell relative grid min-h-[500px] items-end gap-8 py-14 lg:grid-cols-[1fr_0.42fr]">
          <div className="max-w-3xl">
            <div className="mb-6 flex h-24 w-24 items-center justify-center overflow-hidden rounded-lg border border-emerald-300/24 bg-[#07140f] shadow-2xl shadow-black/20">
              {branch.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={branch.logoUrl}
                  alt={`${branch.name} logo`}
                  className="h-full w-full object-cover"
                />
              ) : (
                <Building2 className="h-11 w-11 text-emerald-300" />
              )}
            </div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-300">
              {branch.church.churchName} branch
            </p>
            <h1 className="mt-3 text-4xl font-semibold leading-tight sm:text-6xl">
              {branch.name}
            </h1>
            <div className="mt-5 flex flex-wrap gap-3 text-sm text-emerald-50/72">
              {branch.pastorName ? (
                <span className="inline-flex items-center gap-2 rounded-md border border-emerald-300/16 bg-white/[0.055] px-3 py-2">
                  <UserRound className="h-4 w-4 text-emerald-300" />
                  Pastor {branch.pastorName}
                </span>
              ) : null}
              <span className="inline-flex items-center gap-2 rounded-md border border-emerald-300/16 bg-white/[0.055] px-3 py-2">
                <MapPin className="h-4 w-4 text-emerald-300" />
                {[branch.city, branch.state, branch.country].filter(Boolean).join(", ") ||
                  branch.location ||
                  "Location not added"}
              </span>
            </div>
            <p className="mt-6 max-w-2xl leading-8 text-emerald-50/78">
              {branch.description ??
                "This branch has not added a public description yet. SermonBridge keeps the live translation page ready while the branch completes its details."}
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
              ) : null}
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
            <h2 className="text-xl font-semibold">Active session</h2>
            <p className="mt-3 text-sm leading-6 text-emerald-50/70">
              {latestSession
                ? `${latestSession.title} is available for this branch.`
                : "No branch session is active yet. The branch widget remains available."}
            </p>
            <Link
              href={listenUrl}
              className="mt-5 inline-flex min-h-11 w-full items-center justify-center rounded-md bg-emerald-400 px-4 text-sm font-semibold text-[#04120c] transition hover:bg-emerald-300"
            >
              Open listener page
            </Link>
          </aside>
        </div>
      </section>

      <section className="section-shell grid gap-6 py-14 lg:grid-cols-[0.72fr_1.28fr]">
        <InfoPanel title="Branch information">
          <InfoLine label="Pastor" value={branch.pastorName} />
          <InfoLine label="Email" value={branch.email} />
          <InfoLine label="Phone" value={branch.phone} />
          <InfoLine label="Address" value={branch.address} />
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
            <p className="rounded-md border border-dashed border-emerald-300/20 bg-[#07140f] p-4 text-sm text-emerald-50/62">
              All supported languages are available by default.
            </p>
          )}
        </InfoPanel>
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
