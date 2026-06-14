"use client";

import { useMemo, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import {
  getChurchEmbedCode,
  nigeriaChurchLanguages,
  translationCountries,
  type ChurchStatus,
} from "@/lib/demoChurches";
import { CopyEmbedButton } from "../CopyEmbedButton";

export function AddChurchForm() {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [country, setCountry] = useState("Nigeria");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [defaultLanguage, setDefaultLanguage] = useState("English");
  const [countries, setCountries] = useState<string[]>(["Nigeria"]);
  const [languages, setLanguages] = useState<string[]>([
    "English",
    "Nigerian Pidgin",
    "Yoruba",
  ]);
  const [status, setStatus] = useState<ChurchStatus>("Active");
  const [submitted, setSubmitted] = useState(false);

  const cleanSlug = slug || slugify(name);
  const embedCode = useMemo(() => getChurchEmbedCode(cleanSlug || "church-slug"), [cleanSlug]);

  function toggleValue(value: string, values: string[], setValues: (next: string[]) => void) {
    setValues(
      values.includes(value)
        ? values.filter((item) => item !== value)
        : [...values, value],
    );
  }

  return (
    <form
      className="grid gap-6 lg:grid-cols-[1fr_0.8fr]"
      onSubmit={(event) => {
        event.preventDefault();
        setSubmitted(true);
      }}
    >
      <div className="grid gap-4 rounded-lg border border-emerald-300/16 bg-white/[0.045] p-5">
        <Field label="Church name">
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Grace City Church"
            className="min-h-12 rounded-md border border-emerald-300/18 bg-[#07140f] px-4 text-white outline-none focus-visible:focus-ring"
            required
          />
        </Field>
        <Field label="Church slug">
          <input
            value={slug}
            onChange={(event) => setSlug(slugify(event.target.value))}
            placeholder="grace-city"
            className="min-h-12 rounded-md border border-emerald-300/18 bg-[#07140f] px-4 text-white outline-none focus-visible:focus-ring"
            required
          />
        </Field>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Country">
            <input
              value={country}
              onChange={(event) => setCountry(event.target.value)}
              className="min-h-12 rounded-md border border-emerald-300/18 bg-[#07140f] px-4 text-white outline-none focus-visible:focus-ring"
              required
            />
          </Field>
          <Field label="Default spoken language">
            <select
              value={defaultLanguage}
              onChange={(event) => setDefaultLanguage(event.target.value)}
              className="min-h-12 rounded-md border border-emerald-300/18 bg-[#07140f] px-4 text-white outline-none focus-visible:focus-ring"
            >
              {nigeriaChurchLanguages.map((language) => (
                <option key={language}>{language}</option>
              ))}
            </select>
          </Field>
        </div>
        <Field label="YouTube Live URL">
          <input
            value={youtubeUrl}
            onChange={(event) => setYoutubeUrl(event.target.value)}
            placeholder="https://www.youtube.com/watch?v=..."
            className="min-h-12 rounded-md border border-emerald-300/18 bg-[#07140f] px-4 text-white outline-none focus-visible:focus-ring"
            required
          />
        </Field>
        <CheckboxGroup
          label="Enabled translation countries"
          values={translationCountries}
          selected={countries}
          onToggle={(value) => toggleValue(value, countries, setCountries)}
        />
        <CheckboxGroup
          label="Enabled languages"
          values={nigeriaChurchLanguages}
          selected={languages}
          onToggle={(value) => toggleValue(value, languages, setLanguages)}
        />
        <Field label="Status">
          <select
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
          Save demo church
        </button>
      </div>

      <aside className="grid h-fit gap-4 rounded-lg border border-emerald-300/16 bg-white/[0.045] p-5">
        <h2 className="text-2xl font-semibold">Generated embed</h2>
        {submitted ? (
          <div className="rounded-md border border-emerald-300/18 bg-emerald-300/10 p-4 text-emerald-50">
            <div className="flex items-center gap-2 font-semibold text-emerald-200">
              <CheckCircle2 className="h-5 w-5" />
              Demo church saved for preview
            </div>
            <p className="mt-2 text-sm leading-6 text-emerald-50/72">
              This first demo uses local page state only, so the church is not permanently saved yet. A database can be added later for persistent church accounts.
            </p>
          </div>
        ) : (
          <p className="text-sm leading-6 text-emerald-50/68">
            Fill the form to preview the iframe snippet for this church.
          </p>
        )}
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

function CheckboxGroup({
  label,
  values,
  selected,
  onToggle,
}: {
  label: string;
  values: string[];
  selected: string[];
  onToggle: (value: string) => void;
}) {
  return (
    <fieldset className="grid gap-3">
      <legend className="text-sm font-semibold text-emerald-100">{label}</legend>
      <div className="grid gap-2 sm:grid-cols-2">
        {values.map((value) => (
          <label
            key={value}
            className="flex min-h-11 items-center gap-3 rounded-md border border-emerald-300/14 bg-[#07140f] px-3 text-sm text-emerald-50/78"
          >
            <input
              type="checkbox"
              checked={selected.includes(value)}
              onChange={() => onToggle(value)}
              className="h-4 w-4 accent-emerald-400"
            />
            {value}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 80);
}

