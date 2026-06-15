import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { ChurchNav } from "../../ChurchNav";

export const metadata: Metadata = {
  title: "Live Session Setup Guide",
};

const guideSections = [
  {
    title: "Connect church audio",
    items: [
      "Use a laptop near the preacher when a mixer connection is not available.",
      "For stronger audio, connect the church mixer output to the laptop audio input or a USB audio interface.",
      "Keep the audio feed focused on speech and avoid distorted input levels.",
    ],
  },
  {
    title: "Connect translated audio to church speaker",
    items: [
      "Use the laptop headphone output or USB audio interface output.",
      "Connect the laptop to a mixer AUX, stereo, or line input channel.",
      "Select one translated language in Speaker Output Mode.",
      "Keep the pastor original microphone on the main channel.",
      "Keep translated audio volume lower to avoid feedback.",
      "Use a separate speaker or room when playing a different language publicly.",
    ],
  },
  {
    title: "Use Chrome or Edge",
    items: [
      "Open the church session control page in Chrome or Microsoft Edge.",
      "Allow microphone permission when the browser asks.",
      "Keep the SermonBridge session tab open while the service is live.",
    ],
  },
  {
    title: "Start before service",
    items: [
      "Create the live session before the service begins.",
      "Open Manage session.",
      "Click Start session before microphone capture.",
      "Confirm the session health panel has no unresolved warnings.",
    ],
  },
  {
    title: "Open listener link on phone",
    items: [
      "Copy the listener link from the session page.",
      "Open it on a phone using mobile data or church Wi-Fi.",
      "Choose the listener language and confirm the page is refreshing.",
    ],
  },
  {
    title: "Test one language first",
    items: [
      "Send a short manual update before sharing the link widely.",
      "Confirm the selected language displays clearly on the listener page.",
      "Check the latest update time after each message.",
    ],
  },
  {
    title: "Keep manual updates ready",
    items: [
      "Use the manual sermon update form if microphone capture is unavailable.",
      "Publish to one language or all selected listener languages.",
      "Keep a media team member assigned to monitor the session page.",
    ],
  },
  {
    title: "If translation is unavailable",
    items: [
      "Confirm OPENAI_API_KEY is configured on the server.",
      "Check available OpenAI quota and server logs.",
      "Review recent live errors on the session control page.",
      "Use manual updates so listeners continue receiving service notes.",
    ],
  },
];

export default function LiveSessionSetupGuidePage() {
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
            Live service setup
          </p>
          <h1 className="mt-3 text-4xl font-semibold leading-tight sm:text-5xl">
            Prepare the church team for live translation
          </h1>
          <p className="mt-4 leading-7 text-emerald-50/72">
            Use this checklist before service so audio, listener links,
            microphone capture, and manual update backup are ready.
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
