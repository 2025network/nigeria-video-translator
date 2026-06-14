import { Code2, Globe2, Smartphone, TestTube2 } from "lucide-react";
import { getChurchEmbedCode } from "@/lib/demoChurches";
import { AdminNav } from "../AdminNav";
import { CopyEmbedButton } from "../churches/CopyEmbedButton";

export const metadata = {
  title: "Embed Installation Guide",
};

const exampleEmbedCode = getChurchEmbedCode("christ-embassy-lagos");

export default function EmbedGuidePage() {
  return (
    <main className="min-h-screen bg-[#06110d] text-white">
      <section className="section-shell py-8">
        <AdminNav />
      </section>

      <section className="section-shell pb-16">
        <div className="mb-8 max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-300">
            Embed installation guide
          </p>
          <h1 className="mt-3 text-4xl font-semibold leading-tight sm:text-5xl">
            Add live translation to any church website
          </h1>
          <p className="mt-4 leading-7 text-emerald-50/72">
            Use the iframe snippet inside a normal website, WordPress Custom HTML block, or mobile app WebView. Recommended iframe height: 720px.
          </p>
        </div>

        <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
          <section className="grid gap-4">
            <GuideCard
              icon={<Globe2 className="h-5 w-5" />}
              title="Normal website"
              body="Paste the iframe into the page section where the live sermon translation should appear. Keep width at 100% so it fills the container."
            />
            <GuideCard
              icon={<Code2 className="h-5 w-5" />}
              title="WordPress Custom HTML block"
              body="Open the WordPress page editor, add a Custom HTML block, paste the iframe code, then preview and publish the page."
            />
            <GuideCard
              icon={<Smartphone className="h-5 w-5" />}
              title="Mobile app WebView"
              body="Load the widget URL inside the app WebView. The widget is responsive and designed to work in narrow screens."
            />
            <GuideCard
              icon={<TestTube2 className="h-5 w-5" />}
              title="How to test"
              body="Open the widget URL directly, choose a country and language, then press Start Demo Translation. Confirm the status changes to Live and demo subtitles appear."
            />
          </section>

          <section className="grid h-fit gap-4 rounded-lg border border-emerald-300/16 bg-white/[0.045] p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-2xl font-semibold">Example iframe code</h2>
                <p className="mt-2 text-sm text-emerald-50/68">
                  Uses `NEXT_PUBLIC_SITE_URL` when configured, otherwise localhost in development.
                </p>
              </div>
              <CopyEmbedButton embedCode={exampleEmbedCode} />
            </div>
            <pre className="overflow-auto rounded-md border border-emerald-300/14 bg-[#07140f] p-4 text-xs leading-6 text-emerald-50/78">
              {exampleEmbedCode}
            </pre>
            <div className="rounded-md border border-emerald-300/14 bg-[#07140f] p-4">
              <p className="text-sm font-semibold text-emerald-200">Recommended iframe height</p>
              <p className="mt-2 text-3xl font-semibold">720px</p>
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}

function GuideCard({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <article className="rounded-lg border border-emerald-300/16 bg-white/[0.045] p-5">
      <div className="flex items-center gap-3 text-emerald-300">
        {icon}
        <h2 className="text-xl font-semibold text-white">{title}</h2>
      </div>
      <p className="mt-3 leading-7 text-emerald-50/72">{body}</p>
    </article>
  );
}
