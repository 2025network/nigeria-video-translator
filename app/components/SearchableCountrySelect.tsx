"use client";

import { useMemo, useState } from "react";
import { countryCatalog, getCountryByCodeOrName } from "@/lib/countryCatalog";

export function SearchableCountrySelect({ name, label = "Country", value = "Nigeria", onChange }: { name: string; label?: string; value?: string; onChange?: (countryName: string) => void }) {
  const [selected, setSelected] = useState(getCountryByCodeOrName(value)?.code ?? "NG");
  const [query, setQuery] = useState("");
  const visibleCountries = useMemo(() => { const search = query.trim().toLowerCase(); return countryCatalog.filter((country) => [country.name, country.code, country.region].join(" ").toLowerCase().includes(search)); }, [query]);
  return <label className="grid gap-2 text-sm font-semibold text-emerald-100">{label}<input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search countries" className="min-h-10 rounded-md border border-emerald-300/18 bg-[#07140f] px-3 text-white outline-none placeholder:text-emerald-50/35" /><select name={name} value={selected} onChange={(event) => { setSelected(event.target.value); onChange?.(getCountryByCodeOrName(event.target.value)?.name ?? event.target.value); }} className="min-h-12 rounded-md border border-emerald-300/18 bg-[#07140f] px-4 text-white outline-none focus-visible:focus-ring">{visibleCountries.map((country) => <option key={country.code} value={country.code}>{country.name}</option>)}</select></label>;
}
