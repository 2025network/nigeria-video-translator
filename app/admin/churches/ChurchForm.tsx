"use client";

import { useMemo, useState } from "react";
import {
  getChurchEmbedCode,
  type ChurchStatus,
} from "@/lib/demoChurches";
import { LanguageMultiSelect } from "@/app/components/LanguageMultiSelect";
import { SearchableLanguageSelect } from "@/app/components/SearchableLanguageSelect";
import { SearchableCountrySelect } from "@/app/components/SearchableCountrySelect";
import { CountryMultiSelect } from "@/app/components/CountryMultiSelect";
import { defaultListenerLanguages } from "@/lib/listenerLanguages";
import { CopyEmbedButton } from "./CopyEmbedButton";

type ChurchFormInitialValues = {
  name: string;
  churchName: string;
  slug: string;
  email: string;
  plan: string;
  supportedLanguages: string[];
  country: string;
  youtubeLiveUrl: string;
  defaultSpokenLanguage: string;
  enabledTranslationCountries: string[];
  enabledLanguages: string[];
  status: ChurchStatus;
};

export function ChurchForm({
  action,
  submitLabel,
  initialValues,
}: {
  action: (formData: FormData) => void;
  submitLabel: string;
  initialValues?: ChurchFormInitialValues;
}) {
  const [name, setName] = useState(initialValues?.churchName ?? "");
  const [slug, setSlug] = useState(initialValues?.slug ?? "");
  const [email, setEmail] = useState(initialValues?.email ?? "");
  const [listenerLanguages, setListenerLanguages] = useState<string[]>(
    initialValues?.supportedLanguages ?? [...defaultListenerLanguages],
  );
  const [country, setCountry] = useState(initialValues?.country ?? "Nigeria");
  const [youtubeUrl, setYoutubeUrl] = useState(initialValues?.youtubeLiveUrl ?? "");
  const [defaultLanguage, setDefaultLanguage] = useState(
    initialValues?.defaultSpokenLanguage ?? "English",
  );
  const [countries, setCountries] = useState<string[]>(
    initialValues?.enabledTranslationCountries ?? ["Nigeria"],
  );
  const [languages, setLanguages] = useState<string[]>(
    initialValues?.enabledLanguages ?? ["English", "Nigerian Pidgin", "Yoruba"],
  );
  const [status, setStatus] = useState<ChurchStatus>(initialValues?.status ?? "Active");

  const cleanSlug = slug || slugify(name);
  const embedCode = useMemo(() => getChurchEmbedCode(cleanSlug || "church-slug"), [cleanSlug]);

  return (
    <form action={action} className="grid gap-6 lg:grid-cols-[1fr_0.8fr]">
      <div className="grid gap-4 rounded-lg border border-emerald-300/16 bg-white/[0.045] p-5">
        <Field label="Church name">
          <input
            name="churchName"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Christ Embassy Lagos"
            className="min-h-12 rounded-md border border-emerald-300/18 bg-[#07140f] px-4 text-white outline-none focus-visible:focus-ring"
            required
          />
        </Field>
        <Field label="Church slug">
          <input
            name="slug"
            value={slug}
            onChange={(event) => setSlug(slugify(event.target.value))}
            placeholder="christ-embassy-lagos"
            className="min-h-12 rounded-md border border-emerald-300/18 bg-[#07140f] px-4 text-white outline-none focus-visible:focus-ring"
          />
          <span className="text-xs font-normal text-emerald-50/55">
            Leave blank to generate a unique slug from the church name.
          </span>
        </Field>
        <input type="hidden" name="plan" value="FULL_ACCESS" />
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Church email">
            <input
              name="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="church@example.com"
              className="min-h-12 rounded-md border border-emerald-300/18 bg-[#07140f] px-4 text-white outline-none focus-visible:focus-ring"
              required
            />
          </Field>
          <Field label={initialValues ? "New password" : "Password"}>
            <input
              name="password"
              type="password"
              placeholder={initialValues ? "Leave blank to keep current" : "Church123!"}
              className="min-h-12 rounded-md border border-emerald-300/18 bg-[#07140f] px-4 text-white outline-none focus-visible:focus-ring"
              required={!initialValues}
            />
          </Field>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <SearchableCountrySelect name="country" value={country} onChange={setCountry} />
          <SearchableLanguageSelect
            name="defaultSpokenLanguage"
            label="Default spoken language"
            value={defaultLanguage}
            onChange={setDefaultLanguage}
          />
        </div>
        <Field label="YouTube Live URL">
          <input
            name="youtubeLiveUrl"
            value={youtubeUrl}
            onChange={(event) => setYoutubeUrl(event.target.value)}
            placeholder="https://www.youtube.com/watch?v=..."
            className="min-h-12 rounded-md border border-emerald-300/18 bg-[#07140f] px-4 text-white outline-none focus-visible:focus-ring"
            required
          />
        </Field>
        <LanguageMultiSelect
          label="Preferred listener languages to highlight"
          name="supportedLanguages"
          selected={listenerLanguages}
          onChange={setListenerLanguages}
          recommendedCountry={country}
        />
        <CountryMultiSelect
          label="Enabled translation countries"
          name="enabledTranslationCountries"
          selected={countries}
          onChange={setCountries}
        />
        <LanguageMultiSelect
          label="Additional languages to highlight"
          name="enabledLanguages"
          selected={languages}
          onChange={setLanguages}
          recommendedCountry={country}
        />
        <Field label="Status">
          <select
            name="status"
            value={status}
            onChange={(event) => setStatus(event.target.value as ChurchStatus)}
            className="min-h-12 rounded-md border border-emerald-300/18 bg-[#07140f] px-4 text-white outline-none focus-visible:focus-ring"
          >
            <option>Active</option>
            <option>Inactive</option>
          </select>
        </Field>
        <button
          type="submit"
          className="min-h-12 rounded-md bg-emerald-400 px-5 font-semibold text-[#04120c] hover:bg-emerald-300"
        >
          {submitLabel}
        </button>
      </div>

      <aside className="grid h-fit gap-4 rounded-lg border border-emerald-300/16 bg-white/[0.045] p-5">
        <h2 className="text-2xl font-semibold">Generated embed</h2>
        <p className="text-sm leading-6 text-emerald-50/68">
          This iframe updates with the slug and uses `NEXT_PUBLIC_SITE_URL` for production.
          All languages are available by default; churches can later enable or
          highlight preferred listener languages.
        </p>
        <pre className="max-h-64 overflow-auto rounded-md border border-emerald-300/14 bg-[#07140f] p-4 text-xs leading-6 text-emerald-50/78">
          {embedCode}
        </pre>
        <CopyEmbedButton embedCode={embedCode} />
      </aside>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-emerald-100">
      {label}
      {children}
    </label>
  );
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 80);
}

