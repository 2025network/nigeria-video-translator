import Link from "next/link";
import { ArrowRight, Building2, FileCode2, Inbox, Radio, UploadCloud } from "lucide-react";
import { getChurches } from "@/lib/churchRepository";
import { getOnboardingRequests } from "@/lib/onboardingRepository";
import { AdminNav } from "./AdminNav";

export const metadata = {
  title: "Admin Dashboard",
};

export default async function AdminDashboardPage() {
  const [churches, onboardingRequests] = await Promise.all([
    getChurches(),
    getOnboardingRequests(),
  ]);
  const activeChurches = churches.filter((church) => church.status === "Active").length;
  const newRequests = onboardingRequests.filter((request) => request.status === "NEW").length;

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
            SermonBridge platform admin
          </h1>
          <p className="mt-4 leading-7 text-emerald-50/72">
            Manage church profiles, owner access, stream URLs, widget status,
            iframe embeds, and floating Translate Sermon button scripts from one
            place.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Metric label="Total churches" value={String(churches.length)} />
          <Metric label="Active churches" value={String(activeChurches)} />
          <Metric label="Embed widgets generated" value={String(churches.length)} />
          <Metric label="New onboarding requests" value={String(newRequests)} />
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <AdminCard
            title="Manage Churches"
            description="View churches, inspect stream URLs, and copy iframe or floating widget code."
            href="/admin/churches"
            icon={<Building2 className="h-5 w-5" />}
          />
          <AdminCard
            title="Add Church"
            description="Create a church profile and prepare its live translation widget."
            href="/admin/churches/add"
            icon={<Radio className="h-5 w-5" />}
          />
          <AdminCard
            title="Onboarding Requests"
            description="Review churches asking for full SermonBridge platform access."
            href="/admin/onboarding-requests"
            icon={<Inbox className="h-5 w-5" />}
          />
          <AdminCard
            title="Public Upload Tool"
            description="Open the secondary recorded sermon upload and translation tool."
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

