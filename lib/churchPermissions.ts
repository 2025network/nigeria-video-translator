export const churchTeamRoles = [
  "OWNER",
  "ADMIN",
  "MEDIA",
  "TRANSLATOR",
  "BRANCH_MANAGER",
  "VIEWER",
] as const;

export type ChurchTeamRole = (typeof churchTeamRoles)[number];

export const churchPermissions = [
  "dashboard:view",
  "analytics:view",
  "team:manage",
  "church:manage",
  "branches:view",
  "branches:create",
  "branches:manage",
  "sessions:view",
  "sessions:manage",
  "translations:manage",
  "languages:manage",
] as const;

export type ChurchPermission = (typeof churchPermissions)[number];

export type ChurchActor = {
  kind: "CHURCH_OWNER" | "TEAM_MEMBER";
  role: ChurchTeamRole;
  teamMemberId: string | null;
  name: string;
  email: string;
  branchId: string | null;
};

const allPermissions = new Set<ChurchPermission>(churchPermissions);

const permissionsByRole: Record<ChurchTeamRole, Set<ChurchPermission>> = {
  OWNER: allPermissions,
  ADMIN: new Set([
    "dashboard:view",
    "analytics:view",
    "team:manage",
    "church:manage",
    "branches:view",
    "branches:create",
    "branches:manage",
    "sessions:view",
    "sessions:manage",
    "translations:manage",
    "languages:manage",
  ]),
  MEDIA: new Set([
    "dashboard:view",
    "analytics:view",
    "sessions:view",
    "sessions:manage",
  ]),
  TRANSLATOR: new Set([
    "dashboard:view",
    "sessions:view",
    "translations:manage",
    "languages:manage",
  ]),
  BRANCH_MANAGER: new Set([
    "dashboard:view",
    "analytics:view",
    "branches:view",
    "branches:manage",
    "sessions:view",
    "sessions:manage",
    "translations:manage",
  ]),
  VIEWER: new Set(["dashboard:view", "analytics:view"]),
};

export function isChurchTeamRole(value: string): value is ChurchTeamRole {
  return churchTeamRoles.includes(value as ChurchTeamRole);
}

export function hasChurchPermission(
  actor: ChurchActor,
  permission: ChurchPermission,
) {
  return permissionsByRole[actor.role].has(permission);
}

export function canAccessChurchBranch(
  actor: ChurchActor,
  branchId?: string | null,
) {
  if (actor.role !== "BRANCH_MANAGER") return true;
  return Boolean(branchId && actor.branchId === branchId);
}

export function canManageTeamRole(
  actor: ChurchActor,
  targetRole: ChurchTeamRole,
) {
  if (actor.role === "OWNER") return true;
  return actor.role === "ADMIN" && targetRole !== "OWNER";
}
