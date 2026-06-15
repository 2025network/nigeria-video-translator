import type { Metadata } from "next";
import Link from "next/link";
import { Building2, Languages, MapPin, Search, UserRound } from "lucide-react";
import { getActiveChurches, toChurchView } from "@/lib/churchRepository";
import { getChurchEmbedUrl } from "@/lib/demoChurches";
import {
  getLatestListenableSessionsForChurches,
  getSessionListenUrl,
} from "@/lib/sermonSessionRepository";

type ChurchesDirectoryPageProps = {
  searchParams?: Promise<{
    q?: string;
  }>;
};

export const metadata: Metadata = {
  title: "Churches",
  description: "Discover churches using SermonBridge live sermon translation.",
};

export const dynamic = "force-dynamic";

export default async function ChurchesDirectoryPage({
  searchParams,
}: ChurchesDirectoryPageProps) {
  const params = await searchParams;
  const query = (params?.q ?? "").trim();
  const churches = await getActiveChurches();
  const latestSessions = await getLatestListenableSessionsForChurches(
    churches.map((church) => church.id),
  );
  const filteredChurches = query
    ? churches.filter((church) => matchesSearch(church, query))
    : churches;

  return (
    <main className="min-h-screen bg-[#06110d] text-white">
      <section className="border-b border-emerald-400/15 bg-[linear-gradient(135deg,rgba(15,23,42,0.96),rgba(4,12,9,1)_62%)]">
        <div className="section-shell py-16">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-300">
            SermonBridge churches
          </p>
          <div className="mt-4 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <h1 className="text-4xl font-semibold leading-tight sm:text-5xl">
                Public church directory
              </h1>
              <p className="mt-4 leading-7 text-emerald-50/72">
                Find churches with SermonBridge listener pages and open live
                sermon translation in your preferred language.
              </p>
            </div>

            <form action="/churches" className="w-full max-w-xl">
              <label className="grid gap-2 text-sm font-semibold text-emerald-100">
                Search churches
                <div className="flex flex-col gap-2 sm:flex-row">
                  <div className="relative flex-1">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-emerald-300" />
                    <input
                      name="q"
                      defaultValue={query}
                      placeholder="Search by church, pastor, or location"
                      className="min-h-12 w-full rounded-md border border-emerald-300/18 bg-[#07140f] pl-10 pr-4 text-white outline-none transition placeholder:text-emerald-50/38 focus:border-emerald-300"
                    />
                  </div>
                  <button
                    type="submit"
                    className="inline-flex min-h-12 items-center justify-center rounded-md bg-emerald-400 px-5 font-semibold text-[#04120c] transition hover:bg-emerald-300"
                  >
                    Search
                  </button>
                </div>
              </label>
              {query ? (
                <Link
                  href="/churches"
                  className="mt-3 inline-flex text-sm font-semibold text-emerald-200 hover:underline"
                >
                  Clear search
                </Link>
              ) : null}
            </form>
          </div>
        </div>
      </section>

      <section className="section-shell py-12">
        {filteredChurches.length === 0 ? (
          <div className="rounded-lg border border-dashed border-emerald-300/24 bg-white/[0.045] p-10 text-center">
            <Building2 className="mx-auto h-11 w-11 text-emerald-300" />
            <h2 className="mt-4 text-2xl font-semibold">
              No churches are listed yet.
            </h2>
            {query ? (
              <p className="mt-2 text-emerald-50/68">
                No active church matched “{query}”. Try another church name,
                pastor name, city, country, or address.
              </p>
            ) : (
              <p className="mt-2 text-emerald-50/68">
                Approved active churches will appear here.
              </p>
            )}
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filteredChurches.map((church) => {
              const churchView = toChurchView(church);
              const languages = Array.from(
                new Set([
                  ...churchView.enabledLanguages,
                  ...churchView.supportedLanguages,
                ]),
              );
              const location = [church.city, church.country].filter(Boolean).join(", ");
              const latestSession = latestSessions.get(church.id);
              const listenUrl = latestSession
                ? getSessionListenUrl(latestSession.id)
                : getChurchEmbedUrl(church.slug);

              return (
                <article
                  key={church.id}
                  className="flex min-h-full flex-col rounded-lg border border-emerald-300/16 bg-white/[0.045] p-5 transition hover:border-emerald-300/34 hover:bg-white/[0.065]"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-emerald-300/18 bg-[#07140f]">
                      {church.logoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={church.logoUrl}
                          alt={`${church.churchName} logo`}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <Building2 className="h-8 w-8 text-emerald-300" />
                      )}
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold">{church.churchName}</h2>
                      {church.pastorName ? (
                        <p className="mt-2 flex items-center gap-2 text-sm text-emerald-50/68">
                          <UserRound className="h-4 w-4 text-emerald-300" />
                          Pastor {church.pastorName}
                        </p>
                      ) : null}
                      {location ? (
                        <p className="mt-2 flex items-center gap-2 text-sm text-emerald-50/68">
                          <MapPin className="h-4 w-4 text-emerald-300" />
                          {location}
                        </p>
                      ) : null}
                    </div>
                  </div>

                  <p className="mt-5 line-clamp-3 min-h-20 leading-7 text-emerald-50/72">
                    {church.description ||
                      "This church is listed on SermonBridge and can share live sermon translation with listeners."}
                  </p>

                  <div className="mt-4 rounded-md border border-emerald-300/12 bg-[#07140f] p-3 text-sm font-semibold text-emerald-50">
                    <span className="inline-flex items-center gap-2">
                      <Languages className="h-4 w-4 text-emerald-300" />
                      {languages.length
                        ? `${languages.length} highlighted languages`
                        : "All languages available"}
                    </span>
                  </div>

                  <div className="mt-auto flex flex-col gap-2 pt-5 sm:flex-row">
                    <Link
                      href={`/churches/${church.slug}`}
                      className="inline-flex min-h-11 flex-1 items-center justify-center rounded-md bg-emerald-400 px-4 text-sm font-semibold text-[#04120c] transition hover:bg-emerald-300"
                    >
                      View Church
                    </Link>
                    <Link
                      href={listenUrl}
                      className="inline-flex min-h-11 flex-1 items-center justify-center rounded-md border border-emerald-300/22 px-4 text-sm font-semibold text-emerald-50 transition hover:bg-white/8"
                    >
                      Listen In Your Language
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}

function matchesSearch(
  church: Awaited<ReturnType<typeof getActiveChurches>>[number],
  query: string,
) {
  const normalizedQuery = query.toLowerCase();
  const searchableText = [
    church.churchName,
    church.name,
    church.pastorName,
    church.city,
    church.country,
    church.address,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return searchableText.includes(normalizedQuery);
}
