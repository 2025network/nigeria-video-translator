import Link from "next/link";
import { BarChart3, Building2, FileAudio2, FileCode2, Gauge, Languages, Radio, Settings, UserCog, UserRound } from "lucide-react";
import { getCurrentChurchContext } from "@/lib/currentChurch";
import { hasChurchPermission, type ChurchPermission } from "@/lib/churchPermissions";

const churchLinks: Array<{ label: string; href: string; icon: typeof Gauge; permission: ChurchPermission }> = [
  { label: "Dashboard", href: "/church/dashboard", icon: Gauge, permission: "dashboard:view" },
  { label: "Live Sessions", href: "/church/live-sessions", icon: Radio, permission: "sessions:view" },
  { label: "Recordings", href: "/church/recordings", icon: FileAudio2, permission: "recordings:manage" },
  { label: "Branches", href: "/church/branches", icon: Building2, permission: "branches:view" },
  { label: "Profile", href: "/church/profile", icon: UserRound, permission: "church:manage" },
  { label: "Settings", href: "/church/settings", icon: Settings, permission: "church:manage" },
  { label: "Widget", href: "/church/widget", icon: FileCode2, permission: "church:manage" },
  { label: "Languages", href: "/church/languages", icon: Languages, permission: "languages:manage" },
  { label: "Usage", href: "/church/usage", icon: BarChart3, permission: "analytics:view" },
  { label: "Team", href: "/church/team", icon: UserCog, permission: "team:manage" },
];

export async function ChurchNav() {
  const { actor } = await getCurrentChurchContext();
  const availableLinks = churchLinks.filter((item) =>
    hasChurchPermission(actor, item.permission),
  );

  return (
    <nav className="rounded-lg border border-emerald-300/16 bg-white/[0.045] p-3">
      <div className="flex flex-wrap items-center gap-2">
        {availableLinks.map((item) => {
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
        <span className="ml-auto hidden text-xs font-semibold text-emerald-50/55 lg:inline">
          {actor.name} - {actor.role.replaceAll("_", " ")}
        </span>
        <form action="/church/logout" method="post" className="lg:ml-0">
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

