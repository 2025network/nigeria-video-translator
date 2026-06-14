import Link from "next/link";
import { Languages } from "lucide-react";

const navItems = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "How It Works", href: "/how-it-works" },
  { label: "Upload Video", href: "/upload" },
  { label: "Live Stream", href: "/live" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-emerald-300/14 bg-[#06110d]/92 backdrop-blur">
      <div className="section-shell flex min-h-16 flex-col gap-3 py-3 md:flex-row md:items-center md:justify-between">
        <Link href="/" className="flex items-center gap-3 font-semibold text-white">
          <span className="flex h-10 w-10 items-center justify-center rounded-md bg-emerald-400 text-[#04120c]">
            <Languages className="h-5 w-5" />
          </span>
          <span>Nigeria Video Translator</span>
        </Link>
        <nav className="flex flex-wrap gap-2 text-sm font-semibold text-emerald-50/76">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-md px-3 py-2 transition hover:bg-white/8 hover:text-white focus-visible:focus-ring"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
