import { redirect } from "next/navigation";
import { clearChurchSession, getChurchAuthSession } from "./auth";
import { getChurchById, toChurchView } from "./churchRepository";
import {
  canAccessChurchBranch,
  hasChurchPermission,
  isChurchTeamRole,
  type ChurchActor,
  type ChurchPermission,
} from "./churchPermissions";

export async function getOptionalChurchContext() {
  const session = await getChurchAuthSession();

  if (!session) return null;

  const church = await getChurchById(session.churchId);

  if (!church) return null;

  const actor = toChurchActor(session);

  if (!actor) return null;

  return {
    church: toChurchView(church),
    actor,
    authSessionId: session.id,
  };
}

export async function getCurrentChurchContext() {
  const context = await getOptionalChurchContext();

  if (!context) {
    await clearChurchSession();
    redirect("/church/login?error=invalid");
  }

  return context;
}

export async function getCurrentChurchView() {
  const context = await getCurrentChurchContext();
  return context.church;
}

export async function requireChurchPermission(
  permission: ChurchPermission,
  branchId?: string | null,
) {
  const context = await getCurrentChurchContext();

  if (
    !hasChurchPermission(context.actor, permission) ||
    (typeof branchId !== "undefined" &&
      !canAccessChurchBranch(context.actor, branchId))
  ) {
    redirect("/church/dashboard?error=forbidden");
  }

  return context;
}

function toChurchActor(
  session: NonNullable<Awaited<ReturnType<typeof getChurchAuthSession>>>,
): ChurchActor | null {
  if (!session.teamMember) {
    return {
      kind: "CHURCH_OWNER",
      role: "OWNER",
      teamMemberId: null,
      name: session.church.churchName,
      email: session.church.email,
      branchId: null,
    };
  }

  if (!isChurchTeamRole(session.teamMember.role)) return null;
  if (
    session.teamMember.role === "BRANCH_MANAGER" &&
    !session.teamMember.branchId
  ) {
    return null;
  }

  return {
    kind: "TEAM_MEMBER",
    role: session.teamMember.role,
    teamMemberId: session.teamMember.id,
    name: session.teamMember.name,
    email: session.teamMember.email,
    branchId: session.teamMember.branchId,
  };
}
