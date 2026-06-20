"use client";

import { useMemo, useState } from "react";
import { countryCatalog, getCountryByCodeOrName } from "@/lib/countryCatalog";

export function CountryMultiSelect({ name, label, selected, onChange }: { name: string; label: string; selected: string[]; onChange?: (values: string[]) => void }) {
  const [query, setQuery] = useState("");
  const [local, setLocal] = useState(selected.map((value) => getCountryByCodeOrName(value)?.code ?? value));
  const values = onChange ? selected.map((value) => getCountryByCodeOrName(value)?.code ?? value) : local;
  const visible = useMemo(() => { const search = query.trim().toLowerCase(); return countryCatalog.filter((country) => [country.name, country.code, country.region].join(" ").toLowerCase().includes(search)); }, [query]);
  function update(next: string[]) { const unique = Array.from(new Set(next)); setLocal(unique); onChange?.(unique); }
  return <fieldset className="grid gap-3"><legend className="text-sm font-semibold text-emerald-100">{label}</legend><div className="flex gap-2"><button type="button" onClick={() => update(countryCatalog.map((country) => country.code))} className="min-h-9 rounded-md border border-emerald-300/22 px-3 text-xs font-semibold text-emerald-50">Select all</button><button type="button" onClick={() => update([])} className="min-h-9 rounded-md border border-emerald-300/22 px-3 text-xs font-semibold text-emerald-50">Clear all</button></div><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search countries" className="min-h-11 rounded-md border border-emerald-300/18 bg-[#07140f] px-3 text-white outline-none" />{values.map((value) => <input key={value} type="hidden" name={name} value={value} />)}<div className="grid max-h-72 gap-2 overflow-auto rounded-md border border-emerald-300/14 bg-[#07140f] p-3 sm:grid-cols-2">{visible.map((country) => <label key={country.code} className="flex min-h-10 items-center gap-2 text-sm text-emerald-50/78"><input type="checkbox" checked={values.includes(country.code)} onChange={() => update(values.includes(country.code) ? values.filter((value) => value !== country.code) : [...values, country.code])} className="accent-emerald-400" />{country.name}</label>)}</div></fieldset>;
}
