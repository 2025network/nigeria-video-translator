"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export function BackButton({ href = "/", label = "Back" }: { href?: string; label?: string }) {
  const router = useRouter();

  function goBack() {
    if (window.history.length > 1) {
      router.back();
      return;
    }

    router.push(href);
  }

  return (
    <button
      type="button"
      onClick={goBack}
      className="inline-flex min-h-10 items-center gap-2 rounded-md border border-emerald-300/18 bg-[#07140f] px-3 text-sm font-semibold text-emerald-100 transition hover:bg-white/8"
    >
      <ArrowLeft className="h-4 w-4" />
      {label}
    </button>
  );
}
