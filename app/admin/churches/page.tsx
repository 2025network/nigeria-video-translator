import Link from "next/link";
import { PlusCircle, Radio } from "lucide-react";
import { getChurches } from "@/lib/churchRepository";
import { AdminNav } from "../AdminNav";
import { ChurchesTable } from "./ChurchesTable";

export const metadata = {
  title: "Churches Admin",
};

export default async function ChurchesAdminPage() {
  const churches = await getChurches();

  return (
    <main className="min-h-screen bg-[#06110d] text-white">
      <section className="section-shell py-8">
        <AdminNav />
      </section>

      <section className="section-shell pb-16">
        <div className="mb-8 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <div className="max-w-3xl">
            <p className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-emerald-300">
              <Radio className="h-4 w-4" />
              Live Church Translation
            </p>
            <h1 className="mt-3 text-4xl font-semibold leading-tight sm:text-5xl">
              Church embed widgets
            </h1>
            <p className="mt-4 leading-7 text-emerald-50/72">
              Demo admin workspace for generating live translation widgets that churches can embed on their existing websites, WordPress pages, or mobile app WebViews.
            </p>
          </div>
          <Link
            href="/admin/churches/add"
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-emerald-400 px-5 font-semibold text-[#04120c] hover:bg-emerald-300"
          >
            <PlusCircle className="h-5 w-5" />
            Add church
          </Link>
        </div>

        <ChurchesTable churches={churches} />
      </section>
    </main>
  );
}

