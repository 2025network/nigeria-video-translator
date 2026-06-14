import { getCurrentChurchView } from "@/lib/currentChurch";
import { catalogLanguages } from "@/lib/languageCatalog";
import { ChurchNav } from "../ChurchNav";

export const metadata = {
  title: "Church Settings",
};

export default async function ChurchSettingsPage() {
  const church = await getCurrentChurchView();

  if (!church) return null;

  return (
    <main className="min-h-screen bg-[#06110d] text-white">
      <section className="section-shell py-8">
        <ChurchNav />
      </section>
      <section className="section-shell pb-16">
        <div className="mb-8 max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-300">
            Church settings
          </p>
          <h1 className="mt-3 text-4xl font-semibold">{church.churchName}</h1>
          <p className="mt-4 text-emerald-50/72">
            Demo settings UI for stream and default language configuration.
          </p>
        </div>
        <form className="grid gap-4 rounded-lg border border-emerald-300/16 bg-white/[0.045] p-5 lg:grid-cols-2">
          <Field label="Stream URL" defaultValue={church.youtubeLiveUrl} />
          <Field label="Church status" defaultValue={church.status} />
          <label className="grid gap-2 text-sm font-semibold text-emerald-100">
            Default spoken language
            <select defaultValue={church.defaultSpokenLanguage} className="min-h-12 rounded-md border border-emerald-300/18 bg-[#07140f] px-4 text-white">
              {catalogLanguages.map((language) => <option key={language}>{language}</option>)}
            </select>
          </label>
          <label className="grid gap-2 text-sm font-semibold text-emerald-100">
            Default listener language
            <select defaultValue={church.enabledLanguages[0] ?? "English"} className="min-h-12 rounded-md border border-emerald-300/18 bg-[#07140f] px-4 text-white">
              {catalogLanguages.map((language) => <option key={language}>{language}</option>)}
            </select>
          </label>
          <p className="rounded-md border border-amber-300/30 bg-amber-300/10 p-4 text-sm text-amber-50 lg:col-span-2">
            Demo translation is active. Real AI translation can be connected later.
          </p>
        </form>
      </section>
    </main>
  );
}

function Field({ label, defaultValue }: { label: string; defaultValue: string }) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-emerald-100">
      {label}
      <input defaultValue={defaultValue} className="min-h-12 rounded-md border border-emerald-300/18 bg-[#07140f] px-4 text-white" />
    </label>
  );
}

