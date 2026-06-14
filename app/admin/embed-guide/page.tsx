import { Code2, Globe2, MessageSquareMore, Smartphone, TestTube2 } from "lucide-react";
import {
  getChurchEmbedCode,
  getFloatingWidgetScriptCode,
  getSiteUrl,
} from "@/lib/demoChurches";
import { AdminNav } from "../AdminNav";
import { CopyEmbedButton } from "../churches/CopyEmbedButton";

export const metadata = {
  title: "Embed Installation Guide",
};

const exampleChurchSlug = "christ-embassy-lagos";
const exampleEmbedCode = getChurchEmbedCode(exampleChurchSlug);
const exampleScriptCode = getFloatingWidgetScriptCode(exampleChurchSlug);
const inlineWidgetCode = `<div id="sermonbridge-widget" data-church-slug="${exampleChurchSlug}"></div>
<script src="${getSiteUrl()}/sermonbridge-widget.js"></script>`;

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
            Install SermonBridge on church websites and apps
          </h1>
          <p className="mt-4 leading-7 text-emerald-50/72">
            Paste a full iframe where the widget should appear, or use the
            floating button script to add a Translate Sermon launcher to an
            existing website, WordPress page, YouTube Live companion page, or
            mobile app WebView. The embeddable div/script widget is the easiest
            install option for most church websites. Recommended iframe height:
            720px.
          </p>
        </div>

        <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
          <section className="grid gap-4">
            <GuideCard
              icon={<Globe2 className="h-5 w-5" />}
              title="Normal website"
              body="Paste the SermonBridge div and script into the page section where live sermon translation should appear. The script injects the iframe automatically."
            />
            <GuideCard
              icon={<Code2 className="h-5 w-5" />}
              title="WordPress Custom HTML block"
              body="Open the WordPress page editor, add a Custom HTML block, paste the div/script embed code, then preview and publish the page."
            />
            <GuideCard
              icon={<Smartphone className="h-5 w-5" />}
              title="Mobile app WebView"
              body="Load the public widget URL inside the app WebView, or include the floating button script in a WebView page that already contains the church stream."
            />
            <GuideCard
              icon={<MessageSquareMore className="h-5 w-5" />}
              title="Floating button"
              body="The script adds a bottom-right Translate Sermon button. On click, it opens a side panel that loads the church live translation widget."
            />
            <GuideCard
              icon={<TestTube2 className="h-5 w-5" />}
              title="How to test"
              body="Open the widget URL directly, choose a country and language, then press Start Live Translation. Allow microphone access and confirm the transcript and translation panels update."
            />
          </section>

          <section className="grid h-fit gap-4 rounded-lg border border-emerald-300/16 bg-white/[0.045] p-5">
            <div className="rounded-md border border-emerald-300/14 bg-[#07140f] p-4">
              <p className="text-sm font-semibold text-emerald-200">Church slug</p>
              <p className="mt-2 break-all text-2xl font-semibold">{exampleChurchSlug}</p>
            </div>

            <div className="flex flex-col gap-3 border-t border-emerald-300/14 pt-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-2xl font-semibold">Copyable widget embed code</h2>
                <p className="mt-2 text-sm text-emerald-50/68">
                  Paste this into a website page, WordPress Custom HTML block, or app WebView HTML.
                </p>
              </div>
              <CopyEmbedButton embedCode={inlineWidgetCode} label="Copy Widget Code" />
            </div>
            <pre className="overflow-auto rounded-md border border-emerald-300/14 bg-[#07140f] p-4 text-xs leading-6 text-emerald-50/78">
              {inlineWidgetCode}
            </pre>

            <div className="rounded-md border border-emerald-300/14 bg-emerald-300/10 p-4 text-sm leading-6 text-emerald-50/78">
              <p className="font-semibold text-white">Preview instructions</p>
              <p className="mt-2">
                Save the page, open it in the browser, and confirm the
                SermonBridge iframe loads at 100% width with a 720px height.
                In production, replace localhost with the real church platform
                domain from `NEXT_PUBLIC_SITE_URL`.
              </p>
            </div>

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

            <div className="flex flex-col gap-3 border-t border-emerald-300/14 pt-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-2xl font-semibold">Floating button script</h2>
                <p className="mt-2 text-sm text-emerald-50/68">
                  Adds a Translate Sermon button and side panel to an existing page.
                </p>
              </div>
              <CopyEmbedButton embedCode={exampleScriptCode} label="Copy Script" />
            </div>
            <pre className="overflow-auto rounded-md border border-emerald-300/14 bg-[#07140f] p-4 text-xs leading-6 text-emerald-50/78">
              {exampleScriptCode}
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
