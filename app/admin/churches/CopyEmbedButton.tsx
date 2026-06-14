"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";

export function CopyEmbedButton({
  embedCode,
  label = "Copy Embed Code",
}: {
  embedCode: string;
  label?: string;
}) {
  const [copied, setCopied] = useState(false);

  async function copyEmbedCode() {
    await navigator.clipboard.writeText(embedCode);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <button
      type="button"
      onClick={copyEmbedCode}
      className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-md border px-4 text-sm font-semibold transition focus-visible:focus-ring ${
        copied
          ? "border-emerald-300 bg-emerald-300 text-[#04120c]"
          : "border-emerald-300/26 text-emerald-100 hover:bg-white/8"
      }`}
    >
      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
      {copied ? "Embed code copied" : label}
    </button>
  );
}
