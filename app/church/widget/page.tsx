import { getCurrentChurchView } from "@/lib/currentChurch";
import { getChurchEmbedCode, getChurchEmbedUrl, getFloatingWidgetScriptCode } from "@/lib/demoChurches";
import { ChurchNav } from "../ChurchNav";
import { CopyEmbedButton } from "../../admin/churches/CopyEmbedButton";

export const metadata = {
  title: "Church Widget",
};

export default async function ChurchWidgetPage() {
  const church = await getCurrentChurchView();

  if (!church) {
    return null;
  }

  const iframeCode = getChurchEmbedCode(church.slug);
  const scriptCode = getFloatingWidgetScriptCode(church.slug);
  const widgetUrl = getChurchEmbedUrl(church.slug);

  return (
    <main className="min-h-screen bg-[#06110d] text-white">
      <section className="section-shell py-8">
        <ChurchNav />
      </section>
      <section className="section-shell pb-16">
        <div className="mb-8 max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-300">
            Widget installation
          </p>
          <h1 className="mt-3 text-4xl font-semibold">Install SermonBridge</h1>
          <p className="mt-4 leading-7 text-emerald-50/72">
            Add the live translation widget as a full iframe or as a floating Translate Sermon button.
          </p>
        </div>
        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <section className="grid h-fit gap-4 rounded-lg border border-emerald-300/16 bg-white/[0.045] p-5">
            <h2 className="text-2xl font-semibold">Iframe embed code</h2>
            <pre className="overflow-auto rounded-md border border-emerald-300/14 bg-[#07140f] p-4 text-xs leading-6 text-emerald-50/78">{iframeCode}</pre>
            <CopyEmbedButton embedCode={iframeCode} label="Copy iframe" />
            <h2 className="pt-3 text-2xl font-semibold">Floating button script</h2>
            <pre className="overflow-auto rounded-md border border-emerald-300/14 bg-[#07140f] p-4 text-xs leading-6 text-emerald-50/78">{scriptCode}</pre>
            <CopyEmbedButton embedCode={scriptCode} label="Copy floating script" />
            <Instruction title="WordPress Custom HTML" body="Add a Custom HTML block, paste either code snippet, preview the page, then publish." />
            <Instruction title="Mobile app WebView" body="Load the widget URL or a web page containing the script inside your WebView." />
          </section>
          <section className="rounded-lg border border-emerald-300/16 bg-white/[0.045] p-5">
            <h2 className="mb-4 text-2xl font-semibold">Test preview</h2>
            <iframe src={widgetUrl} title="SermonBridge widget test" className="h-[720px] w-full rounded-lg border border-emerald-300/16 bg-[#07140f]" />
          </section>
        </div>
      </section>
    </main>
  );
}

function Instruction({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-md border border-emerald-300/14 bg-[#07140f] p-4">
      <h3 className="font-semibold text-emerald-100">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-emerald-50/68">{body}</p>
    </div>
  );
}

