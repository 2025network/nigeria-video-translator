import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, PauseCircle, Trash2 } from "lucide-react";
import { getBranchesForChurch } from "@/lib/branchRepository";
import { getChurchById } from "@/lib/churchRepository";
import { getBranchEmbedUrl, getBranchWidgetEmbedCode } from "@/lib/demoChurches";
import { AdminNav } from "../../../AdminNav";
import { CopyEmbedButton } from "../../CopyEmbedButton";
import {
  createBranchAction,
  deleteBranchAction,
  disableBranchAction,
  updateBranchAction,
} from "./actions";

type BranchesPageProps = {
  params: Promise<{ id: string }>;
};

export const metadata = {
  title: "Church Branches",
};

export default async function ChurchBranchesPage({ params }: BranchesPageProps) {
  const { id } = await params;
  const church = await getChurchById(id);

  if (!church) {
    notFound();
  }

  const branches = await getBranchesForChurch(church.id);
  const createWithChurch = createBranchAction.bind(null, church.id);

  return (
    <main className="min-h-screen bg-[#06110d] text-white">
      <section className="section-shell py-8">
        <AdminNav />
        <Link
          href={`/admin/churches/${church.id}`}
          className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-emerald-200 hover:text-emerald-100"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to church
        </Link>
      </section>

      <section className="section-shell pb-16">
        <div className="mb-8 max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-300">
            Branches
          </p>
          <h1 className="mt-3 text-4xl font-semibold">{church.name}</h1>
          <p className="mt-3 leading-7 text-emerald-50/72">
            Each branch gets its own live widget URL while using the parent church&apos;s enabled listener languages.
          </p>
        </div>

        <form action={createWithChurch} className="mb-6 grid gap-3 rounded-lg border border-emerald-300/16 bg-white/[0.045] p-5 md:grid-cols-[1fr_1fr_1fr_auto] md:items-end">
          <BranchInput label="Branch name" name="name" placeholder="Lekki Branch" required />
          <BranchInput label="Branch slug" name="slug" placeholder="lekki" />
          <BranchInput label="Location" name="location" placeholder="Lekki, Lagos" required />
          <button className="min-h-12 rounded-md bg-emerald-400 px-5 font-semibold text-[#04120c] hover:bg-emerald-300">
            Add branch
          </button>
        </form>

        {branches.length === 0 ? (
          <section className="rounded-lg border border-dashed border-emerald-300/24 bg-white/[0.035] p-10 text-center">
            <h2 className="text-2xl font-semibold">No branches yet</h2>
            <p className="mt-3 text-emerald-50/68">
              Add a branch to generate a location-specific live translation widget.
            </p>
          </section>
        ) : (
          <div className="grid gap-4">
            {branches.map((branch) => {
              const branchUrl = getBranchEmbedUrl(church.slug, branch.slug);
              const branchCode = getBranchWidgetEmbedCode(church.slug, branch.slug);
              const updateWithBranch = updateBranchAction.bind(null, branch.id, church.id);
              const disableWithBranch = disableBranchAction.bind(null, branch.id, church.id);
              const deleteWithBranch = deleteBranchAction.bind(null, branch.id, church.id);

              return (
                <article
                  key={branch.id}
                  className="rounded-lg border border-emerald-300/16 bg-white/[0.045] p-5"
                >
                  <form action={updateWithBranch} className="grid gap-3 md:grid-cols-[1fr_1fr_1fr_auto] md:items-end">
                    <BranchInput label="Branch name" name="name" defaultValue={branch.name} required />
                    <BranchInput label="Branch slug" name="slug" defaultValue={branch.slug} />
                    <BranchInput label="Location" name="location" defaultValue={branch.location} required />
                    <button className="min-h-12 rounded-md border border-emerald-300/20 px-5 font-semibold text-emerald-100 hover:bg-white/8">
                      Save
                    </button>
                  </form>

                  <div className="mt-4 grid gap-3 lg:grid-cols-[1fr_auto] lg:items-center">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-emerald-300">
                        Branch embed URL
                      </p>
                      <Link href={branchUrl} className="mt-1 block break-all text-sm text-emerald-200 hover:underline">
                        {branchUrl}
                      </Link>
                      <p className="mt-2 text-sm text-emerald-50/62">
                        Status: {branch.disabledAt ? "Disabled" : "Active"}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <CopyEmbedButton embedCode={branchUrl} label="Copy URL" />
                      <CopyEmbedButton embedCode={branchCode} label="Copy Embed" />
                      {!branch.disabledAt ? (
                        <form action={disableWithBranch}>
                          <button className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-amber-300/24 px-3 text-sm font-semibold text-amber-100 hover:bg-amber-950/24">
                            <PauseCircle className="h-4 w-4" />
                            Disable
                          </button>
                        </form>
                      ) : null}
                      <form action={deleteWithBranch}>
                        <button className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-red-300/24 px-3 text-sm font-semibold text-red-100 hover:bg-red-950/24">
                          <Trash2 className="h-4 w-4" />
                          Delete
                        </button>
                      </form>
                    </div>
                  </div>
                  <pre className="mt-4 overflow-auto rounded-md border border-emerald-300/14 bg-[#07140f] p-4 text-xs leading-6 text-emerald-50/78">
                    {branchCode}
                  </pre>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}

function BranchInput({
  label,
  name,
  placeholder,
  defaultValue,
  required,
}: {
  label: string;
  name: string;
  placeholder?: string;
  defaultValue?: string;
  required?: boolean;
}) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-emerald-100">
      {label}
      <input
        name={name}
        defaultValue={defaultValue}
        placeholder={placeholder}
        required={required}
        className="min-h-12 rounded-md border border-emerald-300/18 bg-[#07140f] px-4 text-white outline-none focus-visible:focus-ring"
      />
    </label>
  );
}
