import Link from "next/link";
import {
  Activity,
  FileCode2,
  Gauge,
  Inbox,
  PlusCircle,
  Settings,
  UploadCloud,
} from "lucide-react";

const adminLinks = [
  { label: "Dashboard", href: "/admin", icon: Gauge },
  { label: "Churches", href: "/admin/churches", icon: Activity },
  { label: "Add Church", href: "/admin/churches/add", icon: PlusCircle },
  { label: "Requests", href: "/admin/onboarding-requests", icon: Inbox },
  { label: "Embed Guide", href: "/admin/embed-guide", icon: FileCode2 },
  { label: "Upload Tool", href: "/upload", icon: UploadCloud },
  { label: "Diagnostics", href: "/diagnostics", icon: Settings },
];

export function AdminNav() {
  return (
    <nav className="rounded-lg border border-emerald-300/16 bg-white/[0.045] p-3">
      <div className="flex flex-wrap items-center gap-2">
        {adminLinks.map((item) => {
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md px-3 text-sm font-semibold text-emerald-50/76 transition hover:bg-white/8 hover:text-white focus-visible:focus-ring"
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
        <form action="/admin/logout" method="post" className="ml-auto">
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

