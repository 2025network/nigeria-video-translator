import { BarChart3, Languages, Radio, Users } from "lucide-react";
import { getCurrentChurchView } from "@/lib/currentChurch";
import { getWidgetUsageStats } from "@/lib/widgetUsageRepository";
import { ChurchNav } from "../ChurchNav";

export const metadata = {
  title: "Church Usage",
};

export default async function ChurchUsagePage() {
  const church = await getCurrentChurchView();
  const stats = await getWidgetUsageStats(church.id);

  return (
    <main className="min-h-screen bg-[#06110d] text-white">
      <section className="section-shell py-8">
        <ChurchNav />
      </section>

      <section className="section-shell pb-16">
        <div className="mb-8 max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-300">
            Usage analytics
          </p>
          <h1 className="mt-3 text-4xl font-semibold">{church.name}</h1>
          <p className="mt-4 leading-7 text-emerald-50/72">
            Anonymous SermonBridge widget activity for this church only. No
            personal listener identity is tracked.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Metric icon={<Users className="h-5 w-5" />} label="Total widget loads" value={stats.totalWidgetLoads} />
          <Metric icon={<Radio className="h-5 w-5" />} label="Total live starts" value={stats.totalLiveStarts} />
          <Metric icon={<Languages className="h-5 w-5" />} label="Language changes" value={stats.languageChangeCount} />
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <Panel title="Most selected languages">
            {stats.languageCounts.length ? (
              stats.languageCounts.map((row) => (
                <Row
                  key={row.selectedLanguage ?? "unknown"}
                  label={row.selectedLanguage ?? "Unknown"}
                  value={row._count._all}
                />
              ))
            ) : (
              <EmptyText>No language selections have been recorded yet.</EmptyText>
            )}
          </Panel>

          <Panel title="Branch usage counts">
            {stats.branchTotals.length ? (
              stats.branchTotals.map((row) => (
                <Row
                  key={`${row.branchId}-${row.branchSlug}`}
                  label={row.branchSlug ?? "Unknown branch"}
                  value={row._count._all}
                />
              ))
            ) : (
              <EmptyText>No branch widget activity has been recorded yet.</EmptyText>
            )}
          </Panel>
        </div>

        {stats.branchCounts.length ? (
          <section className="mt-6 rounded-lg border border-emerald-300/16 bg-white/[0.045] p-5">
            <div className="flex items-center gap-3 text-emerald-300">
              <BarChart3 className="h-5 w-5" />
              <h2 className="text-2xl font-semibold text-white">Branch events</h2>
            </div>
            <div className="mt-4 overflow-hidden rounded-lg border border-emerald-300/14">
              <table className="w-full min-w-[620px] border-collapse text-left text-sm">
                <thead className="bg-emerald-300/10 text-emerald-100">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Branch</th>
                    <th className="px-4 py-3 font-semibold">Event</th>
                    <th className="px-4 py-3 font-semibold">Count</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-emerald-300/12">
                  {stats.branchCounts.map((row) => (
                    <tr key={`${row.branchId}-${row.branchSlug}-${row.eventType}`}>
                      <td className="px-4 py-3 text-emerald-50/78">{row.branchSlug}</td>
                      <td className="px-4 py-3 text-emerald-50/78">{row.eventType}</td>
                      <td className="px-4 py-3 font-semibold text-white">{row._count._all}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        ) : null}
      </section>
    </main>
  );
}

function Metric({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-lg border border-emerald-300/16 bg-white/[0.045] p-5">
      <div className="flex items-center gap-2 text-emerald-300">
        {icon}
        <p className="text-xs font-semibold uppercase tracking-[0.12em]">{label}</p>
      </div>
      <p className="mt-3 text-4xl font-semibold">{value}</p>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-lg border border-emerald-300/16 bg-white/[0.045] p-5">
      <h2 className="text-2xl font-semibold">{title}</h2>
      <div className="mt-4 grid gap-3">{children}</div>
    </section>
  );
}

function Row({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-md border border-emerald-300/14 bg-[#07140f] p-4">
      <span className="break-words text-sm font-semibold text-emerald-50">{label}</span>
      <span className="text-lg font-semibold text-white">{value}</span>
    </div>
  );
}

function EmptyText({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-md border border-dashed border-emerald-300/20 bg-[#07140f] p-4 text-sm text-emerald-50/68">
      {children}
    </p>
  );
}
