"use client";

import { useMemo, useState } from "react";
import { getLanguageName, languageCatalog, normalizeLanguageValue } from "@/lib/languageCatalog";

type SearchableLanguageSelectProps = {
  name: string;
  label: string;
  value?: string;
  languages?: string[];
  onChange?: (value: string) => void;
};

export function SearchableLanguageSelect({
  name,
  label,
  value,
  languages,
  onChange,
}: SearchableLanguageSelectProps) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(normalizeLanguageValue(value ?? "en"));
  const availableLanguages = useMemo(() => {
    const allowed = languages?.length
      ? languageCatalog.filter((language) =>
          languages.map(normalizeLanguageValue).includes(language.code),
        )
      : languageCatalog;
    const normalizedQuery = query.trim().toLowerCase();

    return allowed.filter((language) =>
      [language.name, language.nativeName ?? "", language.code, language.region]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery),
    );
  }, [languages, query]);

  return (
    <label className="grid gap-2 text-sm font-semibold text-emerald-100">
      {label}
      <input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search language"
        className="min-h-11 rounded-md border border-emerald-300/18 bg-[#07140f] px-4 text-white outline-none placeholder:text-emerald-50/35 focus-visible:focus-ring"
      />
      <select
        name={name}
        value={selected}
        onChange={(event) => {
          setSelected(event.target.value);
          onChange?.(getLanguageName(event.target.value));
        }}
        className="min-h-12 rounded-md border border-emerald-300/18 bg-[#07140f] px-4 text-white outline-none focus-visible:focus-ring"
      >
        {availableLanguages.map((language) => (
          <option key={language.code} value={language.code}>
            {language.name}
            {language.nativeName ? ` (${language.nativeName})` : ""}
          </option>
        ))}
      </select>
    </label>
  );
}
