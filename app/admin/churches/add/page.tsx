import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AdminNav } from "../../AdminNav";
import { createChurchAction } from "../actions";
import { ChurchForm } from "../ChurchForm";

export const metadata = {
  title: "Add Church",
};

export default function AddChurchPage() {
  return (
    <main className="min-h-screen bg-[#06110d] text-white">
      <section className="section-shell py-8">
        <AdminNav />
        <Link
          href="/admin/churches"
          className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-emerald-200 hover:text-emerald-100"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to churches
        </Link>
      </section>

      <section className="section-shell pb-16">
        <div className="mb-8 max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-300">
            Add church
          </p>
          <h1 className="mt-3 text-4xl font-semibold leading-tight sm:text-5xl">
            Create a live translation widget
          </h1>
          <p className="mt-4 leading-7 text-emerald-50/72">
            Configure a demo church profile, enabled languages, and iframe snippet for a website or WebView embed.
          </p>
        </div>

        <ChurchForm action={createChurchAction} submitLabel="Save church" />
      </section>
    </main>
  );
}
