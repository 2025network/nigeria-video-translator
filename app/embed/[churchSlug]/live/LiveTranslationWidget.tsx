"use client";

import { useMemo, useState } from "react";
import { Headphones, Languages, Play, QrCode, Radio } from "lucide-react";
import type { DemoChurch } from "@/lib/demoChurches";
import { getYouTubeEmbedUrl, nigeriaChurchLanguages } from "@/lib/demoChurches";

type LiveStatus = "Waiting" | "Listening" | "Translating" | "Live";

const demoLines: Record<string, string> = {
  English:
    "Demo subtitle: God's word brings hope to every family listening today.",
  "Nigerian Pidgin":
    "Demo translation: God dey with us, and His word dey bring hope to every family.",
  Yoruba:
    "Demo translation: Oro Olorun mu ireti wa fun gbogbo idile ti n gbo loni.",
  Igbo:
    "Demo translation: Okwu Chineke na-ewetara ezinulo nile olile anya taa.",
  Hausa:
    "Demo translation: Maganar Allah tana kawo bege ga kowace iyali da ke sauraro yau.",
  Tiv:
    "Demo translation: Loho u Aondo ngu nana mlu u dedoo sha kwagh u tom la.",
  Idoma:
    "Demo translation: Owoicho la bring hope to every family wey dey listen today.",
  Edo:
    "Demo translation: Ivbi Osa ru hope ghi evbo evbo ne gha ru aro ebo.",
  Efik:
    "Demo translation: Ikwo Abasi anam idorenyin ke kpukpru ufok emi ekopde mfịn.",
  Ibibio:
    "Demo translation: Ikọ Abasi anam idorenyin ke kpukpru ufọk emi ekopde mfịn.",
  Urhobo:
    "Demo translation: Ovwata Oghene ro hope re families wey dey listen today.",
};

export function LiveTranslationWidget({ church }: { church: DemoChurch }) {
  const [country, setCountry] = useState(church.enabledTranslationCountries[0] ?? "Nigeria");
  const [language, setLanguage] = useState(church.enabledLanguages[0] ?? "English");
  const [status, setStatus] = useState<LiveStatus>("Waiting");
  const availableLanguages = useMemo(
    () => Array.from(new Set([...church.enabledLanguages, ...nigeriaChurchLanguages])),
    [church.enabledLanguages],
  );
  const youtubeEmbedUrl = getYouTubeEmbedUrl(church.youtubeLiveUrl);

  function startDemo() {
    const nextStatuses: LiveStatus[] = ["Listening", "Translating", "Live"];
    setStatus("Listening");

    nextStatuses.forEach((nextStatus, index) => {
      window.setTimeout(() => {
        setStatus(nextStatus);
      }, 700 * (index + 1));
    });
  }

  return (
    <main className="min-h-screen bg-[#06110d] p-3 text-white sm:p-4">
      <section className="mx-auto grid max-w-5xl gap-3">
        <header className="rounded-lg border border-emerald-300/16 bg-white/[0.055] p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-emerald-300">
                <Radio className="h-4 w-4" />
                Live Translation Widget
              </p>
              <h1 className="mt-2 text-2xl font-semibold leading-tight">{church.churchName}</h1>
              <p className="mt-1 text-sm text-emerald-50/68">
                Follow the sermon in {language} from {country}.
              </p>
            </div>
            <StatusBadge status={status} />
          </div>
        </header>

        <div className="grid gap-3 lg:grid-cols-[1.2fr_0.8fr]">
          <section className="rounded-lg border border-emerald-300/16 bg-black/30 p-3">
            <div className="aspect-video overflow-hidden rounded-md bg-black">
              {church.status === "Active" ? (
                <iframe
                  src={youtubeEmbedUrl || "https://www.youtube.com/embed/ysz5S6PUM-U"}
                  title={`${church.churchName} YouTube Live`}
                  className="h-full w-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              ) : (
                <div className="flex h-full items-center justify-center p-6 text-center text-emerald-50/68">
                  This church widget is inactive in the demo admin.
                </div>
              )}
            </div>
          </section>

          <aside className="grid gap-3">
            <section className="rounded-lg border border-emerald-300/16 bg-white/[0.055] p-4">
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                <label className="grid gap-2 text-sm font-semibold text-emerald-100">
                  Country
                  <select
                    value={country}
                    onChange={(event) => setCountry(event.target.value)}
                    className="min-h-11 rounded-md border border-emerald-300/18 bg-[#07140f] px-3 text-white"
                  >
                    {church.enabledTranslationCountries.map((item) => (
                      <option key={item}>{item}</option>
                    ))}
                  </select>
                </label>
                <label className="grid gap-2 text-sm font-semibold text-emerald-100">
                  Language
                  <select
                    value={language}
                    onChange={(event) => setLanguage(event.target.value)}
                    className="min-h-11 rounded-md border border-emerald-300/18 bg-[#07140f] px-3 text-white"
                  >
                    {availableLanguages.map((item) => (
                      <option key={item}>{item}</option>
                    ))}
                  </select>
                </label>
              </div>
            </section>

            <section className="rounded-lg border border-emerald-300/16 bg-white/[0.055] p-4">
              <div className="mb-3 flex items-center gap-2 text-emerald-300">
                <Languages className="h-5 w-5" />
                <h2 className="font-semibold text-white">Live subtitles</h2>
              </div>
              <div className="min-h-36 rounded-md border border-emerald-300/14 bg-[#07140f] p-4 text-sm leading-7 text-emerald-50/78">
                {status === "Waiting"
                  ? "Press Start Demo Translation to preview live sermon subtitles."
                  : demoLines[language] ?? demoLines.English}
              </div>
            </section>

            <section className="rounded-lg border border-emerald-300/16 bg-white/[0.055] p-4">
              <div className="mb-3 flex items-center gap-2 text-emerald-300">
                <Headphones className="h-5 w-5" />
                <h2 className="font-semibold text-white">Translated audio</h2>
              </div>
              <div className="rounded-md border border-dashed border-emerald-300/22 bg-[#07140f] p-4 text-sm leading-6 text-emerald-50/68">
                Demo audio channel placeholder for {language}. Real-time AI voice will be added later.
              </div>
            </section>
          </aside>
        </div>

        <footer className="grid gap-3 rounded-lg border border-emerald-300/16 bg-white/[0.055] p-4 sm:grid-cols-[1fr_auto] sm:items-center">
          <div>
            <p className="text-sm font-semibold text-white">Share this translation room</p>
            <p className="mt-1 text-sm text-emerald-50/68">
              Members can scan the QR placeholder when the church publishes the widget link.
            </p>
          </div>
          <div className="flex min-h-24 min-w-24 items-center justify-center rounded-md border border-dashed border-emerald-300/28 bg-[#07140f] text-emerald-200">
            <QrCode className="h-12 w-12" />
          </div>
        </footer>

        <button
          type="button"
          onClick={startDemo}
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-emerald-400 px-5 font-semibold text-[#04120c] hover:bg-emerald-300"
        >
          <Play className="h-5 w-5" />
          Start Demo Translation
        </button>
      </section>
    </main>
  );
}

function StatusBadge({ status }: { status: LiveStatus }) {
  const live = status === "Live";

  return (
    <span className={`inline-flex w-fit items-center gap-2 rounded-full px-3 py-1 text-sm font-semibold ${
      live ? "bg-emerald-300 text-[#04120c]" : "bg-white/10 text-emerald-100"
    }`}>
      <span className={`h-2 w-2 rounded-full ${live ? "bg-[#04120c]" : "bg-emerald-300"}`} />
      {status}
    </span>
  );
}


