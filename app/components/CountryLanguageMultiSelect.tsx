"use client";

import { useState } from "react";
import { LanguageMultiSelect } from "./LanguageMultiSelect";
import { SearchableCountrySelect } from "./SearchableCountrySelect";

export function CountryLanguageMultiSelect({ countryName, languageName, initialCountry, selectedLanguages }: { countryName?: string; languageName: string; initialCountry: string; selectedLanguages: string[] }) {
  const [country, setCountry] = useState(initialCountry);
  return <div className="grid gap-4"><SearchableCountrySelect name={countryName ?? "recommendationCountry"} label="Country for language recommendations" value={country} onChange={setCountry} /><LanguageMultiSelect label="Listener languages" name={languageName} selected={selectedLanguages} recommendedCountry={country} /></div>;
}
