import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CheckCircle2, ClipboardList } from "lucide-react";
import { LanguageMultiSelect } from "@/app/components/LanguageMultiSelect";
import { popularLanguageCodes } from "@/lib/languageCatalog";
import { submitOnboardingRequest } from "./actions";

type OnboardingPageProps = {
  searchParams?: Promise<{
    submitted?: string;
    error?: string;
  }>;
};

export const metadata: Metadata = {
  title: "Church Onboarding",
  description: "Request SermonBridge onboarding for a church or ministry.",
};

export default async function ChurchOnboardingPage({
  searchParams,
}: OnboardingPageProps) {
  const params = await searchParams;
  const submitted = params?.submitted === "1";
  const missingFields = params?.error === "missing";

  return (
    <main className="min-h-screen bg-[#06110d] text-white">
      <section className="border-b border-emerald-400/15 bg-[linear-gradient(135deg,rgba(15,23,42,0.96),rgba(4,12,9,1)_62%)]">
        <div className="section-shell grid gap-12 py-16 lg:grid-cols-[0.92fr_1.08fr] lg:items-start">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-300/24 bg-emerald-300/10 px-4 py-2 text-sm font-semibold text-emerald-100">
              <ClipboardList className="h-4 w-4" />
              Church onboarding
            </div>
            <h1 className="mt-6 text-4xl font-semibold tracking-normal text-white sm:text-5xl">
              Contact us for church onboarding and full SermonBridge platform access.
            </h1>
            <p className="mt-5 max-w-2xl leading-8 text-emerald-50/76">
              Share your church details and we will prepare the SermonBridge
              widget setup for your livestream, website, WordPress page, or
              mobile app WebView.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {[
                ["Profile", "Set up your church and stream details."],
                [
                  "Languages",
                  "All supported languages are available by default.",
                ],
                ["Widget", "Receive iframe and floating widget code."],
              ].map(([title, description]) => (
                <div
                  key={title}
                  className="rounded-lg border border-emerald-300/14 bg-white/[0.045] p-4"
                >
                  <CheckCircle2 className="h-5 w-5 text-emerald-300" />
                  <h2 className="mt-3 font-semibold text-emerald-50">{title}</h2>
                  <p className="mt-2 text-sm leading-6 text-emerald-50/68">
                    {description}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-lg border border-emerald-300/16 bg-white/[0.045] p-5">
              <LanguageMultiSelect
                label="Browse supported languages"
                name="languagePreview"
                selected={popularLanguageCodes}
              />
              <p className="mt-3 text-sm leading-6 text-emerald-50/62">
                This is a language coverage preview only. Churches can manage
                preferred languages after onboarding.
              </p>
            </div>
          </div>

          <div className="rounded-lg border border-emerald-300/18 bg-white/[0.055] p-5 shadow-2xl shadow-emerald-950/40">
            {submitted ? (
              <div className="rounded-md border border-emerald-300/18 bg-[#0b1f17] p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-md bg-emerald-400 text-[#04120c]">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <h2 className="mt-5 text-2xl font-semibold">Request received</h2>
                <p className="mt-3 leading-7 text-emerald-50/72">
                  Thank you. Your church onboarding request has been saved, and
                  the SermonBridge team can review it from the admin dashboard.
                </p>
                <Link
                  href="/"
                  className="mt-6 inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-emerald-400 px-5 font-semibold text-[#04120c] transition hover:bg-emerald-300"
                >
                  Back home
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            ) : (
              <form action={submitOnboardingRequest} className="grid gap-4">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.16em] text-emerald-300">
                    Request access
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold">
                    Church onboarding form
                  </h2>
                </div>

                {missingFields ? (
                  <p className="rounded-md border border-red-300/30 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-100">
                    Please complete all required fields before submitting.
                  </p>
                ) : null}

                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField label="Church name" name="churchName" />
                  <FormField label="Contact name" name="contactName" />
                  <FormField label="Email" name="email" type="email" />
                  <FormField label="Phone" name="phone" type="tel" />
                  <FormField label="Country" name="country" />
                  <FormField label="City" name="city" />
                </div>

                <FormField
                  label="Website or livestream URL"
                  name="websiteUrl"
                  type="url"
                  placeholder="https://yourchurch.org/live"
                />

                <p className="rounded-md border border-emerald-300/16 bg-emerald-300/10 px-4 py-3 text-sm font-semibold leading-6 text-emerald-50">
                  All supported languages are available. You can manage
                  languages later from your church dashboard.
                </p>

                <label className="grid gap-2 text-sm font-semibold text-emerald-50">
                  Message
                  <textarea
                    name="message"
                    rows={5}
                    className="min-h-32 rounded-md border border-emerald-300/18 bg-[#06150f] px-4 py-3 text-base font-normal text-white outline-none transition placeholder:text-emerald-50/35 focus:border-emerald-300"
                    placeholder="Tell us about your livestream, website, WordPress, or mobile app setup."
                  />
                </label>

                <button
                  type="submit"
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-emerald-400 px-6 font-semibold text-[#04120c] transition hover:bg-emerald-300 focus-visible:focus-ring"
                >
                  Submit onboarding request
                  <ArrowRight className="h-5 w-5" />
                </button>

                <p className="text-sm leading-6 text-emerald-50/62">
                  No payment or subscription setup is required here. This is a
                  church onboarding request for full SermonBridge platform access.
                </p>
              </form>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}

function FormField({
  label,
  name,
  type = "text",
  placeholder,
}: {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
}) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-emerald-50">
      {label}
      <input
        required
        name={name}
        type={type}
        placeholder={placeholder}
        className="h-12 rounded-md border border-emerald-300/18 bg-[#06150f] px-4 text-base font-normal text-white outline-none transition placeholder:text-emerald-50/35 focus:border-emerald-300"
      />
    </label>
  );
}
