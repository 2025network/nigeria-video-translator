import Link from "next/link";
import { ArrowRight, Building2, FileCode2, Radio, UploadCloud } from "lucide-react";
import { demoChurches } from "@/lib/demoChurches";
import { AdminNav } from "./AdminNav";

export const metadata = {
  title: "Admin Dashboard",
};

export default function AdminDashboardPage() {
  const activeChurches = demoChurches.filter((church) => church.status === "Active").length;

  return (
    <main className="min-h-screen bg-[#06110d] text-white">
      <section className="section-shell py-8">
        <AdminNav />
      </section>

      <section className="section-shell pb-16">
        <div className="mb-8 max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-300">
            Admin dashboard
          </p>
          <h1 className="mt-3 text-4xl font-semibold leading-tight sm:text-5xl">
            Live church translation widgets
          </h1>
          <p className="mt-4 leading-7 text-emerald-50/72">
            Manage demo church profiles, generate iframe embeds, and preview live sermon translation widgets without a database or real AI connection.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Metric label="Total churches" value={String(demoChurches.length)} />
          <Metric label="Active churches" value={String(activeChurches)} />
          <Metric label="Embed widgets generated" value={String(demoChurches.length)} />
          <Metric label="Demo live sessions" value="3" />
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <AdminCard
            title="Manage Churches"
            description="View demo churches, inspect live URLs, and copy iframe embed codes."
            href="/admin/churches"
            icon={<Building2 className="h-5 w-5" />}
          />
          <AdminCard
            title="Add Church"
            description="Open the demo form for configuring a church translation widget."
            href="/admin/churches/add"
            icon={<Radio className="h-5 w-5" />}
          />
          <AdminCard
            title="Public Upload Tool"
            description="Keep using the existing video upload and translation demo."
            href="/upload"
            icon={<UploadCloud className="h-5 w-5" />}
          />
          <AdminCard
            title="Diagnostics"
            description="Check startup readiness, FFmpeg status, and optional OpenAI connectivity."
            href="/diagnostics"
            icon={<FileCode2 className="h-5 w-5" />}
          />
        </div>
      </section>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-emerald-300/16 bg-white/[0.045] p-5">
      <p className="text-sm font-semibold uppercase tracking-[0.12em] text-emerald-300">
        {label}
      </p>
      <p className="mt-3 text-4xl font-semibold">{value}</p>
    </div>
  );
}

function AdminCard({
  title,
  description,
  href,
  icon,
}: {
  title: string;
  description: string;
  href: string;
  icon: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="group rounded-lg border border-emerald-300/16 bg-white/[0.045] p-5 transition hover:border-emerald-300/36 hover:bg-white/[0.07]"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex h-11 w-11 items-center justify-center rounded-md bg-emerald-400 text-[#04120c]">
          {icon}
        </div>
        <ArrowRight className="h-5 w-5 text-emerald-200 transition group-hover:translate-x-1" />
      </div>
      <h2 className="mt-4 text-2xl font-semibold">{title}</h2>
      <p className="mt-2 leading-7 text-emerald-50/68">{description}</p>
    </Link>
  );
}
