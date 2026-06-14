import Link from "next/link";
import { Edit3, Eye, PlusCircle, Trash2 } from "lucide-react";
import type { ChurchWithRelations } from "@/lib/churchRepository";
import { toChurchView } from "@/lib/churchRepository";
import { getChurchEmbedCode, getFloatingWidgetScriptCode } from "@/lib/demoChurches";
import { CopyEmbedButton } from "./CopyEmbedButton";
import { deleteChurchAction } from "./actions";

export function ChurchesTable({ churches }: { churches: ChurchWithRelations[] }) {
  const activeCount = churches.filter((church) => church.status === "Active").length;

  return (
    <div className="grid gap-5">
      <div className="grid gap-3 rounded-lg border border-emerald-300/16 bg-white/[0.045] p-5 md:grid-cols-3">
        <Metric label="Total churches" value={String(churches.length)} />
        <Metric label="Active widgets" value={String(activeCount)} />
        <Metric label="Languages available" value="11" />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm leading-6 text-emerald-50/68">
          Manage church widgets from the SQLite database and copy iframe snippets for websites, WordPress pages, or app WebViews.
        </p>
        <Link
          href="/admin/churches/add"
          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md bg-emerald-400 px-4 text-sm font-semibold text-[#04120c] hover:bg-emerald-300"
        >
          <PlusCircle className="h-4 w-4" />
          Add church
        </Link>
      </div>

      {churches.length === 0 ? (
        <div className="rounded-lg border border-dashed border-emerald-300/24 bg-white/[0.035] p-10 text-center">
          <h2 className="text-2xl font-semibold">No churches yet</h2>
          <p className="mt-3 text-emerald-50/68">
            Add a church to create its first live translation widget.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-emerald-300/16 bg-white/[0.045]">
          <div className="overflow-x-auto">
            <table className="min-w-[1050px] w-full border-collapse text-left text-sm">
              <thead className="bg-emerald-300/10 text-emerald-100">
                <tr>
                  {["Church", "Owner", "Slug", "Country", "Languages", "YouTube Live", "Widget status", "Actions"].map((heading) => (
                    <th key={heading} className="px-4 py-3 font-semibold">
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-emerald-300/12">
                {churches.map((church) => {
                  const churchView = toChurchView(church);
                  const deleteWithId = deleteChurchAction.bind(null, church.id);

                  return (
                    <tr key={church.id} className="align-top">
                      <td className="px-4 py-4 font-semibold text-white">{church.churchName}</td>
                      <td className="px-4 py-4 text-emerald-50/72">Seeded owner</td>
                      <td className="px-4 py-4 text-emerald-50/72">{church.slug}</td>
                      <td className="px-4 py-4 text-emerald-50/72">{church.country}</td>
                      <td className="px-4 py-4 text-emerald-50/72">
                        {churchView.enabledLanguages.join(", ")}
                      </td>
                      <td className="px-4 py-4">
                        <a className="break-all text-emerald-200 hover:underline" href={church.youtubeLiveUrl}>
                          {church.youtubeLiveUrl}
                        </a>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          church.status === "Active"
                            ? "bg-emerald-300/14 text-emerald-100"
                            : "bg-zinc-400/12 text-zinc-200"
                        }`}>
                          {church.status}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex flex-wrap gap-2">
                          <Link
                            href={`/admin/churches/${church.id}`}
                            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md bg-white/8 px-3 font-semibold text-white hover:bg-white/12"
                          >
                            <Eye className="h-4 w-4" />
                            View
                          </Link>
                          <Link
                            href={`/admin/churches/${church.id}/edit`}
                            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md bg-white/8 px-3 font-semibold text-white hover:bg-white/12"
                          >
                            <Edit3 className="h-4 w-4" />
                            Edit
                          </Link>
                          <CopyEmbedButton embedCode={getChurchEmbedCode(church.slug)} />
                          <CopyEmbedButton embedCode={getFloatingWidgetScriptCode(church.slug)} label="Copy Script" />
                          <form action={deleteWithId}>
                            <button
                              type="submit"
                              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-red-300/24 px-3 font-semibold text-red-100 hover:bg-red-950/24"
                            >
                              <Trash2 className="h-4 w-4" />
                              Delete
                            </button>
                          </form>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-emerald-300/14 bg-[#07140f] p-4">
      <p className="text-sm font-semibold uppercase tracking-[0.12em] text-emerald-300">
        {label}
      </p>
      <p className="mt-2 text-3xl font-semibold text-white">{value}</p>
    </div>
  );
}

