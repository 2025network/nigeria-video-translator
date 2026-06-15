import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Download, Globe2, Languages, Users } from "lucide-react";
import { getCurrentChurchView } from "@/lib/currentChurch";
import { getSessionAnalytics } from "@/lib/listenerAnalyticsRepository";
import { ChurchNav } from "../../../ChurchNav";

type SessionAnalyticsPageProps = {
  params: Promise<{ sessionId: string }>;
};

export const metadata: Metadata = {
  title: "Session Analytics",
};

export const dynamic = "force-dynamic";

export default async function SessionAnalyticsPage({ params }: SessionAnalyticsPageProps) {
  const [{ sessionId }, church] = await Promise.all([params, getCurrentChurchView()]);
  const analytics = await getSessionAnalytics(sessionId, church.id);

  if (!analytics) {
    notFound();
  }

  const maxLanguageCount = Math.max(1, ...analytics.languages.map((item) => item.count));
  const maxTimelineCount = Math.max(1, ...analytics.timeline.map((item) => item.count));

  return (
    <main className="min-h-screen bg-[#06110d] text-white">
      <section className="section-shell py-8">
        <ChurchNav />
        <Link
          href={`/church/live-sessions/${sessionId}`}
          className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-emerald-200 hover:text-emerald-100"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to session
        </Link>
      </section>

      <section className="section-shell pb-16">
        <div className="mb-8 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-300">
              Session analytics
            </p>
            <h1 className="mt-3 text-4xl font-semibold leading-tight sm:text-5xl">
              {analytics.session.title}
            </h1>
            <p className="mt-3 text-emerald-50/68">
              {analytics.session.branch?.name ?? analytics.session.church.churchName}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href={`/api/church/live-sessions/${sessionId}/analytics/export?type=listeners`} className="inline-flex min-h-11 items-center gap-2 rounded-md border border-emerald-300/24 px-4 text-sm font-semibold text-emerald-50 hover:bg-white/8">
              <Download className="h-4 w-4" />
              Export listeners CSV
            </Link>
            <Link href={`/api/church/live-sessions/${sessionId}/analytics/export?type=languages`} className="inline-flex min-h-11 items-center gap-2 rounded-md bg-emerald-400 px-4 text-sm font-semibold text-[#04120c] hover:bg-emerald-300">
              <Download className="h-4 w-4" />
              Export languages CSV
            </Link>
          </div>
        </div>

        <div className="mb-6 grid gap-4 md:grid-cols-3">
          <Metric icon={<Users className="h-5 w-5" />} label="Total listeners" value={String(analytics.totalListeners)} />
          <Metric icon={<Languages className="h-5 w-5" />} label="Languages used" value={String(analytics.languages.length)} />
          <Metric icon={<Globe2 className="h-5 w-5" />} label="Countries" value={String(analytics.countries.length)} />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Panel title="Listener trend">
            {analytics.timeline.length ? (
              <div className="grid gap-3">
                {analytics.timeline.map((row) => (
                  <Bar key={row.date} label={row.date} value={row.count} max={maxTimelineCount} />
                ))}
              </div>
            ) : (
              <Empty>No listener visits have been recorded yet.</Empty>
            )}
          </Panel>

          <Panel title="Language distribution">
            {analytics.languages.length ? (
              <div className="grid gap-3">
                {analytics.languages.map((row) => (
                  <Bar key={row.languageCode} label={row.language} value={row.count} max={maxLanguageCount} />
                ))}
              </div>
            ) : (
              <Empty>No language usage has been recorded yet.</Empty>
            )}
          </Panel>

          <Panel title="Countries">
            {analytics.countries.length ? (
              <div className="grid gap-3">
                {analytics.countries.map((row) => (
                  <Bar key={row.country} label={row.country} value={row.count} max={Math.max(1, ...analytics.countries.map((item) => item.count))} />
                ))}
              </div>
            ) : (
              <Empty>No country data has been recorded yet.</Empty>
            )}
          </Panel>

          <Panel title="Recent listeners">
            {analytics.recentListeners.length ? (
              <div className="grid gap-3">
                {analytics.recentListeners.map((listener) => (
                  <article key={listener.id} className="rounded-md border border-emerald-300/12 bg-[#07140f] p-4">
                    <p className="text-sm font-semibold text-emerald-50">{listener.language}</p>
                    <p className="mt-1 text-xs text-emerald-50/55">
                      {listener.createdAt.toLocaleString()} · {listener.country || "Unknown country"}
                    </p>
                    <p className="mt-2 break-all text-xs text-emerald-50/45">
                      Visitor: {listener.visitorId}
                    </p>
                  </article>
                ))}
              </div>
            ) : (
              <Empty>No recent listeners yet.</Empty>
            )}
          </Panel>
        </div>
      </section>
    </main>
  );
}

function Metric({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-lg border border-emerald-300/16 bg-white/[0.045] p-5">
      <div className="flex items-center gap-2 text-emerald-300">{icon}<span className="text-xs font-semibold uppercase tracking-[0.12em]">{label}</span></div>
      <p className="mt-3 text-3xl font-semibold">{value}</p>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-lg border border-emerald-300/16 bg-white/[0.045] p-5">
      <h2 className="text-2xl font-semibold">{title}</h2>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function Bar({ label, value, max }: { label: string; value: number; max: number }) {
  return (
    <div>
      <div className="mb-1 flex justify-between gap-3 text-sm">
        <span className="font-semibold text-emerald-50">{label}</span>
        <span className="text-emerald-50/62">{value}</span>
      </div>
      <div className="h-3 overflow-hidden rounded-full bg-[#07140f]">
        <div className="h-full rounded-full bg-emerald-400" style={{ width: `${Math.max(8, (value / max) * 100)}%` }} />
      </div>
    </div>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-md border border-dashed border-emerald-300/20 bg-[#07140f] p-4 text-sm text-emerald-50/62">
      {children}
    </p>
  );
}
