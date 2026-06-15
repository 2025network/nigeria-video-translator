import { getCurrentChurchView } from "@/lib/currentChurch";
import { ChurchNav } from "../ChurchNav";
import { LanguageSettingsClient } from "./LanguageSettingsClient";

export const metadata = {
  title: "Church Languages",
};

export default async function ChurchLanguagesPage() {
  const church = await getCurrentChurchView();

  if (!church) return null;

  return (
    <main className="min-h-screen bg-[#06110d] text-white">
      <section className="section-shell py-8">
        <ChurchNav />
      </section>
      <section className="section-shell pb-16">
        <div className="mb-8 max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-300">
            Language system
          </p>
          <h1 className="mt-3 text-4xl font-semibold">Countries and languages</h1>
          <p className="mt-4 leading-7 text-emerald-50/72">
            All languages are available by default. Churches can later enable or
            highlight preferred listener languages for their audience.
          </p>
        </div>
        <LanguageSettingsClient
          initialCountries={church.enabledTranslationCountries}
          initialLanguages={church.enabledLanguages}
        />
      </section>
    </main>
  );
}

