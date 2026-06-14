"use client";

import { useMemo, useState } from "react";
import { Radio, Video } from "lucide-react";
import { supportedLanguages, type SupportedLanguage } from "@/lib/languages";

const transcriptLines = [
  "Welcome everyone. We are starting the live session now.",
  "Today we are sharing a message for families, schools, churches, and communities.",
  "This demo shows where real-time transcript and translation will appear.",
];

const mockTranslations: Record<SupportedLanguage, string[]> = {
  Yoruba: [
    "Kaabo gbogbo eniyan. A n bere eto taara bayii.",
    "Loni a n pin ifiranse fun ebi, ile-iwe, ijo, ati agbegbe.",
    "Apeere yi fihan ibi ti itumọ akoko-gidi yoo han.",
  ],
  Igbo: [
    "Nnọọ unu niile. Anyị amalitela mmemme dị ndụ ugbu a.",
    "Taa anyị na-ekerịta ozi maka ezinụlọ, ụlọ akwụkwọ, ụka, na obodo.",
    "Ngosipụta a na-egosi ebe ntụgharị oge-adị ndụ ga-apụta.",
  ],
  Hausa: [
    "Barka da zuwa kowa. Muna fara shirin kai tsaye yanzu.",
    "Yau muna raba sako ga iyalai, makarantu, majami'u, da al'ummomi.",
    "Wannan gwaji yana nuna inda fassarar kai tsaye za ta bayyana.",
  ],
  "Nigerian Pidgin": [
    "Welcome everybody. We dey start the live session now.",
    "Today we dey share message for families, schools, churches, and communities.",
    "This demo dey show where live transcript and translation go appear.",
  ],
};

export default function LiveStreamPage() {
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [rtmpUrl, setRtmpUrl] = useState("");
  const [language, setLanguage] = useState<SupportedLanguage>("Yoruba");

  const youtubeEmbedUrl = useMemo(() => createYoutubeEmbedUrl(youtubeUrl), [youtubeUrl]);

  return (
    <main className="min-h-screen bg-[#06110d] text-white">
      <section className="section-shell py-20">
        <div className="mb-10 max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-300">
            Live Stream
          </p>
          <h1 className="mt-3 text-4xl font-semibold leading-tight sm:text-5xl">
            Live translation foundation
          </h1>
          <p className="mt-6 text-lg leading-8 text-emerald-50/76">
            Enter a YouTube Live URL or RTMP stream URL, choose a Nigerian
            language, and preview where live transcript and mock translation
            output will appear.
          </p>
          <p className="mt-5 rounded-md border border-emerald-300/18 bg-emerald-300/10 p-4 text-sm font-semibold leading-6 text-emerald-50">
            Live translation is currently a foundation/demo feature. Real-time AI
            translation will be added later.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <section className="rounded-lg border border-emerald-300/16 bg-white/[0.045] p-5">
            <div className="grid gap-4">
              <label className="grid gap-2">
                <span className="text-sm font-semibold text-emerald-100">
                  YouTube Live URL
                </span>
                <div className="flex items-center gap-3 rounded-md border border-emerald-300/20 bg-[#07140f] px-4">
                  <Video className="h-5 w-5 text-emerald-300" />
                  <input
                    value={youtubeUrl}
                    onChange={(event) => setYoutubeUrl(event.target.value)}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="min-h-12 w-full bg-transparent text-white outline-none placeholder:text-emerald-50/38"
                  />
                </div>
              </label>

              <label className="grid gap-2">
                <span className="text-sm font-semibold text-emerald-100">
                  RTMP stream URL
                </span>
                <div className="flex items-center gap-3 rounded-md border border-emerald-300/20 bg-[#07140f] px-4">
                  <Radio className="h-5 w-5 text-emerald-300" />
                  <input
                    value={rtmpUrl}
                    onChange={(event) => setRtmpUrl(event.target.value)}
                    placeholder="rtmp://your-stream-server/live/stream-key"
                    className="min-h-12 w-full bg-transparent text-white outline-none placeholder:text-emerald-50/38"
                  />
                </div>
              </label>

              <label className="grid gap-2">
                <span className="text-sm font-semibold text-emerald-100">
                  Translation language
                </span>
                <select
                  value={language}
                  onChange={(event) => setLanguage(event.target.value as SupportedLanguage)}
                  className="min-h-12 rounded-md border border-emerald-300/20 bg-[#07140f] px-4 text-white outline-none focus-visible:focus-ring"
                >
                  {supportedLanguages.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="mt-6 overflow-hidden rounded-lg border border-emerald-300/16 bg-black">
              {youtubeEmbedUrl ? (
                <iframe
                  title="YouTube live stream preview"
                  src={youtubeEmbedUrl}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  className="aspect-video w-full"
                />
              ) : (
                <div className="flex aspect-video flex-col items-center justify-center gap-3 p-6 text-center text-emerald-50/68">
                  <Radio className="h-10 w-10 text-emerald-300" />
                  <p className="max-w-md">
                    Add a YouTube Live URL to preview an embedded stream. RTMP
                    support is shown as a setup field for future server-side handling.
                  </p>
                  {rtmpUrl ? (
                    <p className="break-all text-xs text-emerald-300">{rtmpUrl}</p>
                  ) : null}
                </div>
              )}
            </div>
          </section>

          <section className="grid gap-5">
            <Panel title="Live transcript">
              {transcriptLines.map((line, index) => (
                <p key={line} className="rounded-md bg-[#07140f] p-3 leading-7">
                  <span className="mr-2 text-emerald-300">{index + 1}.</span>
                  {line}
                </p>
              ))}
            </Panel>

            <Panel title={`Mock live translation: ${language}`}>
              {mockTranslations[language].map((line, index) => (
                <p key={line} className="rounded-md bg-[#07140f] p-3 leading-7">
                  <span className="mr-2 text-emerald-300">{index + 1}.</span>
                  {line}
                </p>
              ))}
            </Panel>
          </section>
        </div>
      </section>
    </main>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-emerald-300/16 bg-white/[0.045] p-5">
      <h2 className="text-xl font-semibold">{title}</h2>
      <div className="mt-4 grid gap-3 text-emerald-50/76">{children}</div>
    </div>
  );
}

function createYoutubeEmbedUrl(url: string) {
  const trimmed = url.trim();
  if (!trimmed) return null;

  try {
    const parsedUrl = new URL(trimmed);
    const host = parsedUrl.hostname.replace(/^www\./, "");

    if (host === "youtube.com" || host === "m.youtube.com") {
      const videoId = parsedUrl.searchParams.get("v");
      return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
    }

    if (host === "youtu.be") {
      const videoId = parsedUrl.pathname.replace(/^\//, "");
      return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
    }
  } catch {
    return null;
  }

  return null;
}

