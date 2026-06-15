import type { Metadata } from "next";
import Link from "next/link";
import { Building2, ExternalLink, PauseCircle, PlayCircle, PlusCircle, Search, Trash2 } from "lucide-react";
import { CopyEmbedButton } from "@/app/admin/churches/CopyEmbedButton";
import { getBranchesForChurch } from "@/lib/branchRepository";
import { getCurrentChurchView } from "@/lib/currentChurch";
import { getBranchEmbedUrl, getBranchWidgetEmbedCode } from "@/lib/demoChurches";
import { ChurchNav } from "../ChurchNav";
import {
  activateChurchBranchAction,
  createChurchBranchAction,
  deactivateChurchBranchAction,
  deleteChurchBranchAction,
  updateChurchBranchAction,
} from "./actions";

type BranchesPageProps = {
  searchParams?: Promise<{
    q?: string;
    created?: string;
    updated?: string;
    activated?: string;
    deactivated?: string;
    deleted?: string;
    error?: string;
  }>;
};

export const metadata: Metadata = {
  title: "Church Branches",
};

export const dynamic = "force-dynamic";

export default async function ChurchBranchesPage({ searchParams }: BranchesPageProps) {
  const [church, params] = await Promise.all([getCurrentChurchView(), searchParams]);
  const branches = await getBranchesForChurch(church.id);
  const query = (params?.q ?? "").trim().toLowerCase();
  const visibleBranches = query
    ? branches.filter((branch) =>
        [branch.name, branch.city, branch.country, branch.pastorName ?? ""]
          .join(" ")
          .toLowerCase()
          .includes(query),
      )
    : branches;

  return (
    <main className="min-h-screen bg-[#06110d] text-white">
      <section className="section-shell py-8">
        <ChurchNav />
      </section>

      <section className="section-shell pb-16">
        <div className="mb-8 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-300">
              Branch management
            </p>
            <h1 className="mt-3 text-4xl font-semibold leading-tight sm:text-5xl">
              Manage church branches
            </h1>
            <p className="mt-4 leading-7 text-emerald-50/72">
              Add locations, manage branch profiles, create branch-specific widgets,
              and run separate live sermon sessions for each branch.
            </p>
          </div>
          <Link
            href="/church/live-sessions"
            className="inline-flex min-h-12 items-center justify-center rounded-md bg-emerald-400 px-5 font-semibold text-[#04120c] transition hover:bg-emerald-300"
          >
            Create branch session
          </Link>
        </div>

        <StatusMessage params={params} />

        <div className="mb-6 grid gap-4 md:grid-cols-3">
          <Metric label="Total branches" value={String(branches.length)} />
          <Metric label="Active branches" value={String(branches.filter((branch) => !branch.disabledAt).length)} />
          <Metric label="Inactive branches" value={String(branches.filter((branch) => branch.disabledAt).length)} />
        </div>

        <form className="mb-6 flex items-center gap-3 rounded-lg border border-emerald-300/16 bg-white/[0.045] p-4">
          <Search className="h-5 w-5 text-emerald-300" />
          <input
            name="q"
            defaultValue={params?.q ?? ""}
            placeholder="Search by branch name, city, country, or pastor"
            className="min-h-12 w-full bg-transparent text-white outline-none placeholder:text-emerald-50/38"
          />
          <button className="min-h-11 rounded-md border border-emerald-300/22 px-4 text-sm font-semibold text-emerald-50 hover:bg-white/8">
            Search
          </button>
        </form>

        <section className="mb-6 rounded-lg border border-emerald-300/16 bg-white/[0.045] p-5">
          <div className="mb-5 flex items-center gap-3">
            <PlusCircle className="h-6 w-6 text-emerald-300" />
            <h2 className="text-2xl font-semibold">Add branch</h2>
          </div>
          <BranchForm action={createChurchBranchAction} submitLabel="Add branch" />
        </section>

        {visibleBranches.length === 0 ? (
          <section className="rounded-lg border border-dashed border-emerald-300/24 bg-white/[0.035] p-10 text-center">
            <Building2 className="mx-auto h-12 w-12 text-emerald-300" />
            <h2 className="mt-4 text-2xl font-semibold">No branches found</h2>
            <p className="mt-3 text-emerald-50/68">
              Add your first branch or adjust the search filter.
            </p>
          </section>
        ) : (
          <div className="grid gap-5">
            {visibleBranches.map((branch) => {
              const branchWidgetUrl = getBranchEmbedUrl(church.slug, branch.slug);
              const branchPublicUrl = `/churches/${church.slug}/branches/${branch.slug}`;
              const branchEmbedCode = getBranchWidgetEmbedCode(church.slug, branch.slug);

              return (
                <article
                  key={branch.id}
                  className="rounded-lg border border-emerald-300/16 bg-white/[0.045] p-5"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-3">
                        <h2 className="text-2xl font-semibold">{branch.name}</h2>
                        <span className={`rounded-full px-3 py-1 text-xs font-bold ${
                          branch.disabledAt ? "bg-red-400/18 text-red-100" : "bg-emerald-400 text-[#04120c]"
                        }`}>
                          {branch.disabledAt ? "Inactive" : "Active"}
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-emerald-50/64">
                        {branch.location || [branch.city, branch.state, branch.country].filter(Boolean).join(", ") || "Location not added"}
                      </p>
                      <div className="mt-4 flex flex-wrap gap-2">
                        <Link href={branchPublicUrl} className="inline-flex min-h-10 items-center gap-2 rounded-md border border-emerald-300/22 px-3 text-sm font-semibold text-emerald-50 hover:bg-white/8">
                          <ExternalLink className="h-4 w-4" />
                          View branch
                        </Link>
                        <Link href={branchWidgetUrl} className="inline-flex min-h-10 items-center rounded-md border border-emerald-300/22 px-3 text-sm font-semibold text-emerald-50 hover:bg-white/8">
                          View widget
                        </Link>
                        <CopyEmbedButton embedCode={branchWidgetUrl} label="Copy widget URL" />
                        <CopyEmbedButton embedCode={branchEmbedCode} label="Copy widget code" />
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {branch.disabledAt ? (
                        <form action={activateChurchBranchAction}>
                          <input type="hidden" name="branchId" value={branch.id} />
                          <button className="inline-flex min-h-10 items-center gap-2 rounded-md bg-emerald-400 px-3 text-sm font-semibold text-[#04120c] hover:bg-emerald-300">
                            <PlayCircle className="h-4 w-4" />
                            Activate
                          </button>
                        </form>
                      ) : (
                        <form action={deactivateChurchBranchAction}>
                          <input type="hidden" name="branchId" value={branch.id} />
                          <button className="inline-flex min-h-10 items-center gap-2 rounded-md border border-amber-300/24 px-3 text-sm font-semibold text-amber-100 hover:bg-amber-950/24">
                            <PauseCircle className="h-4 w-4" />
                            Deactivate
                          </button>
                        </form>
                      )}
                      <form action={deleteChurchBranchAction}>
                        <input type="hidden" name="branchId" value={branch.id} />
                        <button className="inline-flex min-h-10 items-center gap-2 rounded-md border border-red-300/24 px-3 text-sm font-semibold text-red-100 hover:bg-red-950/24">
                          <Trash2 className="h-4 w-4" />
                          Delete
                        </button>
                      </form>
                    </div>
                  </div>

                  <details className="mt-5 rounded-md border border-emerald-300/12 bg-[#07140f] p-4">
                    <summary className="cursor-pointer text-sm font-semibold text-emerald-100">
                      Edit branch details
                    </summary>
                    <div className="mt-4">
                      <BranchForm
                        action={updateChurchBranchAction}
                        branchId={branch.id}
                        submitLabel="Save branch"
                        values={{
                          name: branch.name,
                          slug: branch.slug,
                          pastorName: branch.pastorName ?? "",
                          email: branch.email ?? "",
                          phone: branch.phone ?? "",
                          country: branch.country,
                          state: branch.state,
                          city: branch.city,
                          address: branch.address,
                          description: branch.description ?? "",
                          bannerUrl: branch.bannerUrl ?? "",
                          logoUrl: branch.logoUrl ?? "",
                        }}
                      />
                    </div>
                  </details>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}

function BranchForm({
  action,
  branchId,
  submitLabel,
  values,
}: {
  action: (formData: FormData) => void | Promise<void>;
  branchId?: string;
  submitLabel: string;
  values?: Record<string, string>;
}) {
  return (
    <form action={action} className="grid gap-4">
      {branchId ? <input type="hidden" name="branchId" value={branchId} /> : null}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <Field label="Branch name" name="name" defaultValue={values?.name} required />
        <Field label="Branch slug" name="slug" defaultValue={values?.slug} />
        <Field label="Pastor name" name="pastorName" defaultValue={values?.pastorName} />
        <Field label="Email" name="email" type="email" defaultValue={values?.email} />
        <Field label="Phone" name="phone" defaultValue={values?.phone} />
        <Field label="Country" name="country" defaultValue={values?.country} />
        <Field label="State/Region" name="state" defaultValue={values?.state} />
        <Field label="City" name="city" defaultValue={values?.city} />
        <Field label="Address" name="address" defaultValue={values?.address} />
        <Field label="Banner image URL" name="bannerUrl" type="url" defaultValue={values?.bannerUrl} />
        <Field label="Logo URL" name="logoUrl" type="url" defaultValue={values?.logoUrl} />
      </div>
      <label className="grid gap-2 text-sm font-semibold text-emerald-100">
        Description
        <textarea
          name="description"
          defaultValue={values?.description}
          rows={4}
          className="rounded-md border border-emerald-300/18 bg-[#06110d] px-4 py-3 text-white outline-none focus-visible:focus-ring"
        />
      </label>
      <button className="w-fit min-h-12 rounded-md bg-emerald-400 px-5 font-semibold text-[#04120c] hover:bg-emerald-300">
        {submitLabel}
      </button>
    </form>
  );
}

function Field({
  label,
  name,
  type = "text",
  defaultValue,
  required = false,
}: {
  label: string;
  name: string;
  type?: string;
  defaultValue?: string;
  required?: boolean;
}) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-emerald-100">
      {label}
      <input
        name={name}
        type={type}
        defaultValue={defaultValue}
        required={required}
        className="min-h-12 rounded-md border border-emerald-300/18 bg-[#06110d] px-4 text-white outline-none focus-visible:focus-ring"
      />
    </label>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-emerald-300/16 bg-white/[0.045] p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-emerald-300">{label}</p>
      <p className="mt-2 text-3xl font-semibold">{value}</p>
    </div>
  );
}

function StatusMessage({ params }: { params?: Record<string, string | undefined> }) {
  const message = params?.created
    ? "Branch created."
    : params?.updated
      ? "Branch updated."
      : params?.activated
        ? "Branch activated."
        : params?.deactivated
          ? "Branch deactivated."
          : params?.deleted
            ? "Branch deleted."
            : params?.error
              ? "Please check the branch details and try again."
              : "";

  if (!message) return null;

  return (
    <div className="mb-6 rounded-lg border border-emerald-300/24 bg-emerald-300/10 p-4 text-sm font-semibold text-emerald-50">
      {message}
    </div>
  );
}
