"use client";

import { useState } from "react";
import { LanguageMultiSelect } from "@/app/components/LanguageMultiSelect";
import { languageRegions } from "@/lib/languageCatalog";

export function LanguageSettingsClient({
  initialCountries,
  initialLanguages,
}: {
  initialCountries: string[];
  initialLanguages: string[];
}) {
  const [regions, setRegions] = useState(initialCountries);
  const [languages, setLanguages] = useState(initialLanguages);

  function toggle(value: string) {
    setRegions((current) =>
      current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value],
    );
  }

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <section className="rounded-lg border border-emerald-300/16 bg-white/[0.045] p-5">
        <h2 className="text-2xl font-semibold">Language groups</h2>
        <div className="mt-4 grid gap-2">
          {languageRegions.map((region) => (
            <label key={region} className="flex min-h-11 items-center gap-3 rounded-md border border-emerald-300/14 bg-[#07140f] px-3 text-sm text-emerald-50/78">
              <input type="checkbox" checked={regions.includes(region)} onChange={() => toggle(region)} className="h-4 w-4 accent-emerald-400" />
              {region}
            </label>
          ))}
        </div>
      </section>
      <section className="rounded-lg border border-emerald-300/16 bg-white/[0.045] p-5">
        <LanguageMultiSelect
          label="Enabled languages"
          name="enabledLanguages"
          selected={languages}
          onChange={setLanguages}
        />
      </section>
      <p className="rounded-md border border-amber-300/30 bg-amber-300/10 p-4 text-sm text-amber-50 lg:col-span-2">
        All languages are available by default. Churches can highlight preferred listener languages for each live session.
      </p>
    </div>
  );
}
