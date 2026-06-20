"use client";

import { useMemo, useState } from "react";
import { getCountryByCodeOrName, getRecommendedLanguageCodes } from "@/lib/countryCatalog";
import { getLanguageName, languageCatalog, languageRegions, normalizeLanguageList, popularLanguageCodes } from "@/lib/languageCatalog";

type Props = { label: string; name: string; selected: string[]; onChange?: (values: string[]) => void; maxHeightClassName?: string; recommendedCountry?: string };

export function LanguageMultiSelect({ label, name, selected, onChange, maxHeightClassName = "max-h-80", recommendedCountry }: Props) {
  const [query, setQuery] = useState("");
  const [localSelected, setLocalSelected] = useState(normalizeLanguageList(selected));
  const selectedCodes = onChange ? normalizeLanguageList(selected) : localSelected;
  const selectedSet = new Set(selectedCodes);
  const normalizedQuery = query.trim().toLowerCase();
  const visibleLanguages = useMemo(() => languageCatalog.filter((language) => [language.name, language.nativeName ?? "", language.code, language.region].join(" ").toLowerCase().includes(normalizedQuery)), [normalizedQuery]);
  const recommendedCodes = recommendedCountry ? getRecommendedLanguageCodes(recommendedCountry) : [];
  const recommendedLanguages = recommendedCodes.map((code) => languageCatalog.find((language) => language.code === code)).filter((language): language is (typeof languageCatalog)[number] => Boolean(language)).filter((language) => visibleLanguages.some((item) => item.code === language.code));
  const countryName = recommendedCountry ? getCountryByCodeOrName(recommendedCountry)?.name ?? recommendedCountry : "";
  function setSelected(next: string[]) { const normalized = normalizeLanguageList(next); setLocalSelected(normalized); onChange?.(normalized); }
  function toggle(code: string) { setSelected(selectedSet.has(code) ? selectedCodes.filter((value) => value !== code) : [...selectedCodes, code]); }

  return <fieldset className="grid gap-3"><legend className="text-sm font-semibold text-emerald-100">{label}</legend><div className="flex flex-wrap gap-2"><Action label="Select all" onClick={() => setSelected(languageCatalog.map((language) => language.code))} /><Action label="Clear all" onClick={() => setSelected([])} /><Action label="Popular languages" primary onClick={() => setSelected(popularLanguageCodes)} />{recommendedCodes.length ? <Action label={`Recommended for ${countryName}`} onClick={() => setSelected(recommendedCodes)} /> : null}</div><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search languages by name, native name, code, or region" className="min-h-12 rounded-md border border-emerald-300/18 bg-[#07140f] px-4 text-white outline-none placeholder:text-emerald-50/35 focus-visible:focus-ring" /><div className="text-xs font-semibold uppercase tracking-[0.12em] text-emerald-50/55">{selectedCodes.length} selected</div>{selectedCodes.map((code) => <input key={code} type="hidden" name={name} value={code} />)}<div className={`grid gap-4 overflow-auto rounded-md border border-emerald-300/14 bg-[#07140f] p-3 ${maxHeightClassName}`}>{recommendedLanguages.length ? <section><Heading>Recommended for {countryName}</Heading><div className="grid gap-2 sm:grid-cols-2">{recommendedLanguages.map((language) => <LanguageOption key={`recommended-${language.code}`} language={language} checked={selectedSet.has(language.code)} onToggle={() => toggle(language.code)} />)}</div></section> : null}<Heading>All languages</Heading>{languageRegions.map((region) => { const languages = visibleLanguages.filter((language) => language.region === region); if (!languages.length) return null; return <section key={region}><Heading>{region}</Heading><div className="grid gap-2 sm:grid-cols-2">{languages.map((language) => <LanguageOption key={language.code} language={language} checked={selectedSet.has(language.code)} onToggle={() => toggle(language.code)} />)}</div></section>; })}</div><p className="text-xs leading-5 text-emerald-50/50">Stored as stable language codes. Example: Yoruba is stored as yo and displayed as {getLanguageName("yo")}.</p></fieldset>;
}

function Action({ label, onClick, primary = false }: { label: string; onClick: () => void; primary?: boolean }) { return <button type="button" onClick={onClick} className={`min-h-9 rounded-md px-3 text-xs font-semibold ${primary ? "bg-emerald-400 text-[#04120c] hover:bg-emerald-300" : "border border-emerald-300/22 text-emerald-50 hover:bg-white/8"}`}>{label}</button>; }
function Heading({ children }: { children: React.ReactNode }) { return <h3 className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-emerald-300">{children}</h3>; }
function LanguageOption({ language, checked, onToggle }: { language: (typeof languageCatalog)[number]; checked: boolean; onToggle: () => void }) { return <label className="flex min-h-11 items-center gap-3 rounded-md border border-emerald-300/12 bg-white/[0.035] px-3 text-sm text-emerald-50/78"><input type="checkbox" checked={checked} onChange={onToggle} className="h-4 w-4 accent-emerald-400" /><span>{language.name}{language.nativeName ? <span className="text-emerald-50/45"> · {language.nativeName}</span> : null}</span></label>; }
