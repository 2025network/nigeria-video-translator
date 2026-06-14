import Script from "next/script";
import { Radio, Tv, Users } from "lucide-react";

export const metadata = {
  title: "Demo Church",
};

export default function DemoChurchPage() {
  return (
    <main className="min-h-screen bg-[#06110d] text-white">
      <section className="border-b border-emerald-300/14 bg-[#081812]">
        <div className="section-shell py-10">
          <p className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-emerald-300">
            <Radio className="h-4 w-4" />
            Christ Embassy Lagos
          </p>
          <h1 className="mt-4 text-4xl font-semibold leading-tight sm:text-5xl">
            Sunday Service Live
          </h1>
          <p className="mt-4 max-w-2xl leading-7 text-emerald-50/72">
            This page demonstrates how SermonBridge can sit beside or below an
            existing church livestream.
          </p>
        </div>
      </section>

      <section className="section-shell grid gap-6 py-8 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="grid gap-6">
          <section className="rounded-lg border border-emerald-300/16 bg-white/[0.045] p-4">
            <div className="mb-4 flex items-center gap-3 text-emerald-300">
              <Tv className="h-5 w-5" />
              <h2 className="font-semibold text-white">YouTube Live</h2>
            </div>
            <div className="flex aspect-video items-center justify-center rounded-md border border-emerald-300/14 bg-black/50 p-6 text-center">
              <div>
                <Tv className="mx-auto h-12 w-12 text-emerald-300" />
                <p className="mt-4 text-lg font-semibold">Livestream placeholder</p>
                <p className="mt-2 max-w-md text-sm leading-6 text-emerald-50/64">
                  A real church page would place its YouTube Live player here.
                </p>
              </div>
            </div>
          </section>

          <section className="rounded-lg border border-emerald-300/16 bg-white/[0.045] p-5">
            <div className="flex items-center gap-3 text-emerald-300">
              <Users className="h-5 w-5" />
              <h2 className="font-semibold text-white">Service details</h2>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {["Main auditorium", "English sermon", "Live translation available"].map(
                (item) => (
                  <div
                    key={item}
                    className="rounded-md border border-emerald-300/14 bg-[#07140f] px-4 py-3 text-sm font-semibold text-emerald-50"
                  >
                    {item}
                  </div>
                ),
              )}
            </div>
          </section>
        </div>

        <section className="rounded-lg border border-emerald-300/16 bg-white/[0.045] p-4">
          <div className="mb-4">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-emerald-300">
              SermonBridge translation section
            </p>
            <h2 className="mt-2 text-2xl font-semibold">
              Follow the sermon in your language
            </h2>
            <p className="mt-2 text-sm leading-6 text-emerald-50/68">
              The widget below is loaded using the same div and script snippet a
              church can paste into its website.
            </p>
          </div>
          <div id="sermonbridge-widget" data-church-slug="christ-embassy-lagos" />
          <Script src="/sermonbridge-widget.js" strategy="afterInteractive" />
        </section>
      </section>
    </main>
  );
}
