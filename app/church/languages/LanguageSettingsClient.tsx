"use client";

import { useState } from "react";
import { LanguageMultiSelect } from "@/app/components/LanguageMultiSelect";
import { SearchableCountrySelect } from "@/app/components/SearchableCountrySelect";

export function LanguageSettingsClient({ initialCountries, initialLanguages }: { initialCountries: string[]; initialLanguages: string[] }) {
  const [country, setCountry] = useState(initialCountries[0] ?? "Nigeria");
  const [languages, setLanguages] = useState(initialLanguages);
  return <div className="grid gap-5 lg:grid-cols-[0.55fr_1.45fr]"><section className="rounded-lg border border-emerald-300/16 bg-white/[0.045] p-5"><h2 className="mb-4 text-2xl font-semibold">Country recommendations</h2><SearchableCountrySelect name="recommendationCountry" value={country} onChange={setCountry} /><p className="mt-4 text-sm leading-6 text-emerald-50/62">Choosing a country prioritizes local languages but never hides the global catalog.</p></section><section className="rounded-lg border border-emerald-300/16 bg-white/[0.045] p-5"><LanguageMultiSelect label="Enabled languages" name="enabledLanguages" selected={languages} onChange={setLanguages} recommendedCountry={country} /></section><p className="rounded-md border border-amber-300/30 bg-amber-300/10 p-4 text-sm text-amber-50 lg:col-span-2">All languages remain available. Country selection only changes recommendations.</p></div>;
}
