import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { ChurchNav } from "../../ChurchNav";

export const metadata: Metadata = {
  title: "Live Session Testing Guide",
};

const guideSections = [
  {
    title: "Best audio setup",
    items: [
      "Use a quiet laptop position close to the preacher when possible.",
      "For better quality, connect the church mixer output to the laptop audio input or USB audio interface.",
      "Do a short test before the service starts and check the listener phone.",
    ],
  },
  {
    title: "Recommended browser",
    items: [
      "Use Chrome or Microsoft Edge on the church control laptop.",
      "Allow microphone permission when prompted.",
      "Keep the SermonBridge session tab open while the service is live.",
    ],
  },
  {
    title: "How to start a session",
    items: [
      "Create a live session from the Live Sessions page.",
      "Open Manage session.",
      "Click Start session, then Start Microphone.",
      "Share the listener link with a test phone.",
    ],
  },
  {
    title: "Mixer or laptop audio",
    items: [
      "If using a mixer, send a clean speech feed to the laptop input.",
      "Avoid loud music in the same feed when testing sermon transcription.",
      "Keep the input level strong but not distorted.",
    ],
  },
  {
    title: "Test listener phone",
    items: [
      "Open the listener link on a phone using mobile data or church Wi-Fi.",
      "Choose the target language.",
      "Confirm updates appear after each microphone chunk or manual update.",
    ],
  },
  {
    title: "If microphone fails",
    items: [
      "Confirm the session is LIVE.",
      "Check browser microphone permission.",
      "Reload the control page and start microphone again.",
      "Use manual sermon updates as fallback.",
    ],
  },
  {
    title: "If translation fails",
    items: [
      "Check OPENAI_API_KEY and available quota.",
      "Review recent live errors on the session control page.",
      "Use manual updates to keep the listener page active.",
      "Unsupported languages may show placeholder translations in this MVP.",
    ],
  },
];

export default function LiveSessionTestGuidePage() {
  return (
    <main className="min-h-screen bg-[#06110d] text-white">
      <section className="section-shell py-8">
        <ChurchNav />
        <Link
          href="/church/live-sessions"
          className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-emerald-200 hover:text-emerald-100"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to live sessions
        </Link>
      </section>

      <section className="section-shell pb-16">
        <div className="mb-8 max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-300">
            Pilot testing guide
          </p>
          <h1 className="mt-3 text-4xl font-semibold leading-tight sm:text-5xl">
            Run a real church live translation test
          </h1>
          <p className="mt-4 leading-7 text-emerald-50/72">
            Use this checklist before and during a pilot service so the church
            team has a calm fallback path if microphone or translation services
            are unavailable.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {guideSections.map((section) => (
            <article
              key={section.title}
              className="rounded-lg border border-emerald-300/16 bg-white/[0.045] p-5"
            >
              <h2 className="text-2xl font-semibold">{section.title}</h2>
              <ul className="mt-4 grid gap-3">
                {section.items.map((item) => (
                  <li key={item} className="flex gap-3 text-sm leading-6 text-emerald-50/72">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" />
                    {item}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
