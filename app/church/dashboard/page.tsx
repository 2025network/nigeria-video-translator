import Link from "next/link";
import { FileCode2, Languages, Radio, Settings } from "lucide-react";
import { getCurrentChurchView } from "@/lib/currentChurch";
import { getChurchEmbedCode, getChurchEmbedUrl, getFloatingWidgetScriptCode } from "@/lib/demoChurches";
import { ChurchNav } from "../ChurchNav";
import { CopyEmbedButton } from "../../admin/churches/CopyEmbedButton";

export const metadata = {
  title: "Church Dashboard",
};

export default async function ChurchDashboardPage() {
  const church = await getCurrentChurchView();

  if (!church) {
    return <EmptyChurchState />;
  }

  const embedCode = getChurchEmbedCode(church.slug);
  const scriptCode = getFloatingWidgetScriptCode(church.slug);
  const widgetUrl = getChurchEmbedUrl(church.slug);

  return (
    <main className="min-h-screen bg-[#06110d] text-white">
      <section className="section-shell py-8">
        <ChurchNav />
      </section>
      <section className="section-shell pb-16">
        <div className="mb-6 rounded-lg border border-amber-300/30 bg-amber-300/10 p-4 text-amber-50">
          Demo translation is active. Real AI translation can be connected later.
        </div>
        <div className="mb-8 max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-300">
            SermonBridge church dashboard
          </p>
          <h1 className="mt-3 text-4xl font-semibold">{church.churchName}</h1>
          <p className="mt-4 leading-7 text-emerald-50/72">
            Live sermon translation for every nation, language, and church.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Metric icon={<Radio className="h-5 w-5" />} label="Widget status" value={church.status} />
          <Metric icon={<FileCode2 className="h-5 w-5" />} label="Stream URL" value={church.youtubeLiveUrl} />
          <Metric icon={<Settings className="h-5 w-5" />} label="Selected countries" value={church.enabledTranslationCountries.join(", ")} />
          <Metric icon={<Languages className="h-5 w-5" />} label="Selected languages" value={church.enabledLanguages.join(", ")} />
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
          <section className="grid h-fit gap-4 rounded-lg border border-emerald-300/16 bg-white/[0.045] p-5">
            <h2 className="text-2xl font-semibold">Embed code</h2>
            <pre className="overflow-auto rounded-md border border-emerald-300/14 bg-[#07140f] p-4 text-xs leading-6 text-emerald-50/78">{embedCode}</pre>
            <CopyEmbedButton embedCode={embedCode} label="Copy iframe" />
            <h2 className="pt-3 text-2xl font-semibold">Floating button code</h2>
            <pre className="overflow-auto rounded-md border border-emerald-300/14 bg-[#07140f] p-4 text-xs leading-6 text-emerald-50/78">{scriptCode}</pre>
            <CopyEmbedButton embedCode={scriptCode} label="Copy floating script" />
          </section>
          <section className="rounded-lg border border-emerald-300/16 bg-white/[0.045] p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="text-2xl font-semibold">Preview widget</h2>
              <Link href={widgetUrl} className="text-sm font-semibold text-emerald-200 hover:underline">
                Open live widget
              </Link>
            </div>
            <iframe
              src={widgetUrl}
              title="SermonBridge widget preview"
              className="h-[720px] w-full rounded-lg border border-emerald-300/16 bg-[#07140f]"
            />
          </section>
        </div>
      </section>
    </main>
  );
}

function Metric({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-lg border border-emerald-300/16 bg-white/[0.045] p-4">
      <div className="flex items-center gap-2 text-emerald-300">{icon}<span className="text-xs font-semibold uppercase tracking-[0.12em]">{label}</span></div>
      <p className="mt-3 break-words text-sm leading-6 text-emerald-50/78">{value}</p>
    </div>
  );
}

function EmptyChurchState() {
  return (
    <main className="min-h-screen bg-[#06110d] p-6 text-white">
      <div className="section-shell rounded-lg border border-emerald-300/16 bg-white/[0.045] p-8">
        <h1 className="text-3xl font-semibold">No church profile found</h1>
        <p className="mt-3 text-emerald-50/68">Ask an admin to create your church profile first.</p>
      </div>
    </main>
  );
}

