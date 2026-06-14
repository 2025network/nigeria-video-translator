import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-emerald-300/14 bg-[#06110d] text-emerald-50/68">
      <div className="section-shell flex flex-col gap-3 py-6 text-sm sm:flex-row sm:items-center sm:justify-between">
        <p>SermonBridge — Live sermon translation widgets for every church and language.</p>
        <div className="flex flex-wrap gap-4">
          <Link
            href="/about"
            className="font-semibold text-emerald-200 underline-offset-4 hover:text-emerald-100 hover:underline focus-visible:focus-ring"
          >
            About
          </Link>
          <Link
            href="/upload"
            className="font-semibold text-emerald-200 underline-offset-4 hover:text-emerald-100 hover:underline focus-visible:focus-ring"
          >
            Upload Tool
          </Link>
          <Link
            href="/diagnostics"
            className="font-semibold text-emerald-200 underline-offset-4 hover:text-emerald-100 hover:underline focus-visible:focus-ring"
          >
            Diagnostics
          </Link>
        </div>
      </div>
    </footer>
  );
}

