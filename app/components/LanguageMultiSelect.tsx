"use client";

import { useMemo, useState } from "react";
import {
  getLanguageName,
  languageCatalog,
  languageRegions,
  normalizeLanguageList,
  popularLanguageCodes,
} from "@/lib/languageCatalog";

type LanguageMultiSelectProps = {
  label: string;
  name: string;
  selected: string[];
  onChange?: (values: string[]) => void;
  maxHeightClassName?: string;
};

export function LanguageMultiSelect({
  label,
  name,
  selected,
  onChange,
  maxHeightClassName = "max-h-80",
}: LanguageMultiSelectProps) {
  const [query, setQuery] = useState("");
  const [localSelected, setLocalSelected] = useState(normalizeLanguageList(selected));
  const selectedCodes = onChange ? normalizeLanguageList(selected) : localSelected;
  const selectedSet = new Set(selectedCodes);
  const normalizedQuery = query.trim().toLowerCase();
  const visibleLanguages = useMemo(
    () =>
      languageCatalog.filter((language) =>
        [
          language.name,
          language.nativeName ?? "",
          language.code,
          language.region,
        ]
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery),
      ),
    [normalizedQuery],
  );

  function setSelected(next: string[]) {
    const normalized = normalizeLanguageList(next);
    setLocalSelected(normalized);
    onChange?.(normalized);
  }

  function toggle(code: string) {
    setSelected(
      selectedSet.has(code)
        ? selectedCodes.filter((value) => value !== code)
        : [...selectedCodes, code],
    );
  }

  return (
    <fieldset className="grid gap-3">
      <legend className="text-sm font-semibold text-emerald-100">{label}</legend>
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={() => setSelected(languageCatalog.map((language) => language.code))} className="min-h-9 rounded-md border border-emerald-300/22 px-3 text-xs font-semibold text-emerald-50 hover:bg-white/8">
          Select all
        </button>
        <button type="button" onClick={() => setSelected([])} className="min-h-9 rounded-md border border-emerald-300/22 px-3 text-xs font-semibold text-emerald-50 hover:bg-white/8">
          Clear all
        </button>
        <button type="button" onClick={() => setSelected(popularLanguageCodes)} className="min-h-9 rounded-md bg-emerald-400 px-3 text-xs font-semibold text-[#04120c] hover:bg-emerald-300">
          Popular languages
        </button>
      </div>
      <input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search languages by name, native name, code, or region"
        className="min-h-12 rounded-md border border-emerald-300/18 bg-[#07140f] px-4 text-white outline-none placeholder:text-emerald-50/35 focus-visible:focus-ring"
      />
      <div className="text-xs font-semibold uppercase tracking-[0.12em] text-emerald-50/55">
        {selectedCodes.length} selected
      </div>
      {selectedCodes.map((code) => (
        <input key={code} type="hidden" name={name} value={code} />
      ))}
      <div className={`grid gap-4 overflow-auto rounded-md border border-emerald-300/14 bg-[#07140f] p-3 ${maxHeightClassName}`}>
        {languageRegions.map((region) => {
          const languages = visibleLanguages.filter((language) => language.region === region);
          if (!languages.length) return null;

          return (
            <section key={region}>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-emerald-300">
                {region}
              </h3>
              <div className="grid gap-2 sm:grid-cols-2">
                {languages.map((language) => (
                  <label
                    key={language.code}
                    className="flex min-h-11 items-center gap-3 rounded-md border border-emerald-300/12 bg-white/[0.035] px-3 text-sm text-emerald-50/78"
                  >
                    <input
                      type="checkbox"
                      checked={selectedSet.has(language.code)}
                      onChange={() => toggle(language.code)}
                      className="h-4 w-4 accent-emerald-400"
                    />
                    <span>
                      {language.name}
                      {language.nativeName ? (
                        <span className="text-emerald-50/45"> · {language.nativeName}</span>
                      ) : null}
                    </span>
                  </label>
                ))}
              </div>
            </section>
          );
        })}
      </div>
      <p className="text-xs leading-5 text-emerald-50/50">
        Stored as stable language codes. Example: Yoruba is stored as yo and displayed as {getLanguageName("yo")}.
      </p>
    </fieldset>
  );
}
