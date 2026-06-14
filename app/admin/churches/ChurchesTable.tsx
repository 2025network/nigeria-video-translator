"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Edit3, Eye, PlusCircle, RotateCcw } from "lucide-react";
import type { DemoChurch } from "@/lib/demoChurches";
import { demoChurches, getChurchEmbedCode } from "@/lib/demoChurches";
import { CopyEmbedButton } from "./CopyEmbedButton";

export function ChurchesTable() {
  const [churches, setChurches] = useState<DemoChurch[]>(demoChurches);
  const activeCount = useMemo(
    () => churches.filter((church) => church.status === "Active").length,
    [churches],
  );

  return (
    <div className="grid gap-5">
      <div className="grid gap-3 rounded-lg border border-emerald-300/16 bg-white/[0.045] p-5 md:grid-cols-3">
        <Metric label="Demo churches" value={String(churches.length)} />
        <Metric label="Active widgets" value={String(activeCount)} />
        <Metric label="Languages available" value="11" />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm leading-6 text-emerald-50/68">
          Manage demo church widgets and copy iframe snippets for existing websites, WordPress pages, or app WebViews.
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setChurches(demoChurches)}
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-emerald-300/24 px-4 text-sm font-semibold text-emerald-100 hover:bg-white/8"
          >
            <RotateCcw className="h-4 w-4" />
            Add demo churches
          </button>
          <Link
            href="/admin/churches/add"
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md bg-emerald-400 px-4 text-sm font-semibold text-[#04120c] hover:bg-emerald-300"
          >
            <PlusCircle className="h-4 w-4" />
            Add church
          </Link>
        </div>
      </div>

      {churches.length === 0 ? (
        <div className="rounded-lg border border-dashed border-emerald-300/24 bg-white/[0.035] p-10 text-center">
          <h2 className="text-2xl font-semibold">No churches yet</h2>
          <p className="mt-3 text-emerald-50/68">
            Add demo churches to preview the embed workflow.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-emerald-300/16 bg-white/[0.045]">
          <div className="overflow-x-auto">
            <table className="min-w-[1050px] w-full border-collapse text-left text-sm">
              <thead className="bg-emerald-300/10 text-emerald-100">
                <tr>
                  {["Church", "Slug", "Country", "Languages", "YouTube Live", "Status", "Actions"].map((heading) => (
                    <th key={heading} className="px-4 py-3 font-semibold">
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-emerald-300/12">
                {churches.map((church) => (
                  <tr key={church.id} className="align-top">
                    <td className="px-4 py-4 font-semibold text-white">{church.churchName}</td>
                    <td className="px-4 py-4 text-emerald-50/72">{church.slug}</td>
                    <td className="px-4 py-4 text-emerald-50/72">{church.country}</td>
                    <td className="px-4 py-4 text-emerald-50/72">
                      {church.enabledLanguages.join(", ")}
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
                          href={`/admin/churches/add?from=${church.id}`}
                          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md bg-white/8 px-3 font-semibold text-white hover:bg-white/12"
                        >
                          <Edit3 className="h-4 w-4" />
                          Edit demo
                        </Link>
                        <CopyEmbedButton embedCode={getChurchEmbedCode(church.slug)} />
                      </div>
                    </td>
                  </tr>
                ))}
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

