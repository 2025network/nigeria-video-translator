import Link from "next/link";
import { BarChart3, Building2, FileCode2, Gauge, Languages, Radio, Settings, UserRound } from "lucide-react";

const churchLinks = [
  { label: "Dashboard", href: "/church/dashboard", icon: Gauge },
  { label: "Live Sessions", href: "/church/live-sessions", icon: Radio },
  { label: "Branches", href: "/church/branches", icon: Building2 },
  { label: "Profile", href: "/church/profile", icon: UserRound },
  { label: "Settings", href: "/church/settings", icon: Settings },
  { label: "Widget", href: "/church/widget", icon: FileCode2 },
  { label: "Languages", href: "/church/languages", icon: Languages },
  { label: "Usage", href: "/church/usage", icon: BarChart3 },
];

export function ChurchNav() {
  return (
    <nav className="rounded-lg border border-emerald-300/16 bg-white/[0.045] p-3">
      <div className="flex flex-wrap items-center gap-2">
        {churchLinks.map((item) => {
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md px-3 text-sm font-semibold text-emerald-50/76 transition hover:bg-white/8 hover:text-white"
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
        <form action="/church/logout" method="post" className="ml-auto">
          <button
            type="submit"
            className="inline-flex min-h-10 items-center justify-center rounded-md border border-emerald-300/20 px-3 text-sm font-semibold text-emerald-100 transition hover:bg-white/8"
          >
            Logout
          </button>
        </form>
      </div>
    </nav>
  );
}

