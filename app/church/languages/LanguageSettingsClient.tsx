"use client";

import { useMemo, useState } from "react";
import { getLanguagesForCountries, languageCatalog } from "@/lib/languageCatalog";

export function LanguageSettingsClient({
  initialCountries,
  initialLanguages,
}: {
  initialCountries: string[];
  initialLanguages: string[];
}) {
  const [countries, setCountries] = useState(initialCountries);
  const [languages, setLanguages] = useState(initialLanguages);
  const availableLanguages = useMemo(() => getLanguagesForCountries(countries), [countries]);

  function toggle(value: string, values: string[], setValues: (next: string[]) => void) {
    setValues(values.includes(value) ? values.filter((item) => item !== value) : [...values, value]);
  }

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <section className="rounded-lg border border-emerald-300/16 bg-white/[0.045] p-5">
        <h2 className="text-2xl font-semibold">Enabled countries</h2>
        <div className="mt-4 grid gap-2">
          {languageCatalog.map((item) => (
            <label key={item.country} className="flex min-h-11 items-center gap-3 rounded-md border border-emerald-300/14 bg-[#07140f] px-3 text-sm text-emerald-50/78">
              <input type="checkbox" checked={countries.includes(item.country)} onChange={() => toggle(item.country, countries, setCountries)} className="h-4 w-4 accent-emerald-400" />
              {item.country}
            </label>
          ))}
        </div>
      </section>
      <section className="rounded-lg border border-emerald-300/16 bg-white/[0.045] p-5">
        <h2 className="text-2xl font-semibold">Enabled languages</h2>
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          {availableLanguages.map((language) => (
            <label key={language} className="flex min-h-11 items-center gap-3 rounded-md border border-emerald-300/14 bg-[#07140f] px-3 text-sm text-emerald-50/78">
              <input type="checkbox" checked={languages.includes(language)} onChange={() => toggle(language, languages, setLanguages)} className="h-4 w-4 accent-emerald-400" />
              {language}
            </label>
          ))}
        </div>
      </section>
      <p className="rounded-md border border-amber-300/30 bg-amber-300/10 p-4 text-sm text-amber-50 lg:col-span-2">
        Demo settings are shown for the church owner workflow. Saving these preferences to church records can be connected next.
      </p>
    </div>
  );
}

