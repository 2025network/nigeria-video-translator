"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getBranchForChurch } from "@/lib/branchRepository";
import {
  canManageTeamRole,
  isChurchTeamRole,
} from "@/lib/churchPermissions";
import {
  createChurchTeamMember,
  findChurchTeamEmailConflict,
  getChurchTeamMember,
  logChurchTeamActivity,
  resetChurchTeamMemberPassword,
  setChurchTeamMemberActive,
  updateChurchTeamMember,
} from "@/lib/churchTeamRepository";
import { requireChurchPermission } from "@/lib/currentChurch";

export async function createTeamMemberAction(formData: FormData) {
  const { church, actor } = await requireChurchPermission("team:manage");
  const name = readField(formData, "name");
  const email = readField(formData, "email").toLowerCase();
  const password = String(formData.get("password") ?? "");
  const roleValue = readField(formData, "role");
  const branchId = readField(formData, "branchId") || null;

  if (!name || !email || password.length < 8 || !isChurchTeamRole(roleValue)) {
    redirect("/church/team?error=invalid");
  }

  if (!canManageTeamRole(actor, roleValue)) {
    redirect("/church/team?error=permission");
  }

  if (roleValue === "BRANCH_MANAGER" && !branchId) {
    redirect("/church/team?error=branch-required");
  }

  if (branchId && !(await getBranchForChurch(branchId, church.id))) {
    redirect("/church/team?error=branch");
  }

  if (await findChurchTeamEmailConflict(email)) {
    redirect("/church/team?error=email");
  }

  await createChurchTeamMember({
    churchId: church.id,
    name,
    email,
    password,
    role: roleValue,
    branchId,
  });

  revalidateTeamPaths();
  redirect("/church/team?created=1");
}

export async function updateTeamMemberAction(formData: FormData) {
  const { church, actor } = await requireChurchPermission("team:manage");
  const memberId = readField(formData, "memberId");
  const name = readField(formData, "name");
  const roleValue = readField(formData, "role");
  const branchId = readField(formData, "branchId") || null;

  if (!memberId || !name || !isChurchTeamRole(roleValue)) {
    redirect("/church/team?error=invalid");
  }

  const member = await getChurchTeamMember(memberId, church.id);

  if (
    !member ||
    !isChurchTeamRole(member.role) ||
    !canManageTeamRole(actor, member.role) ||
    !canManageTeamRole(actor, roleValue)
  ) {
    redirect("/church/team?error=permission");
  }

  if (member.id === actor.teamMemberId && roleValue !== member.role) {
    redirect("/church/team?error=self");
  }

  if (roleValue === "BRANCH_MANAGER" && !branchId) {
    redirect("/church/team?error=branch-required");
  }

  if (branchId && !(await getBranchForChurch(branchId, church.id))) {
    redirect("/church/team?error=branch");
  }

  await updateChurchTeamMember({
    id: member.id,
    churchId: church.id,
    name,
    role: roleValue,
    branchId,
  });

  revalidateTeamPaths();
  redirect("/church/team?updated=1");
}

export async function setTeamMemberActiveAction(formData: FormData) {
  const { church, actor } = await requireChurchPermission("team:manage");
  const memberId = readField(formData, "memberId");
  const isActive = readField(formData, "isActive") === "true";
  const member = await getChurchTeamMember(memberId, church.id);

  if (
    !member ||
    !isChurchTeamRole(member.role) ||
    !canManageTeamRole(actor, member.role) ||
    (!isActive && member.id === actor.teamMemberId)
  ) {
    redirect("/church/team?error=permission");
  }

  await setChurchTeamMemberActive(member.id, church.id, isActive);
  revalidateTeamPaths();
  redirect(`/church/team?${isActive ? "activated" : "deactivated"}=1`);
}

export async function resetTeamMemberPasswordAction(formData: FormData) {
  const { church, actor } = await requireChurchPermission("team:manage");
  const memberId = readField(formData, "memberId");
  const member = await getChurchTeamMember(memberId, church.id);

  if (
    !member ||
    !isChurchTeamRole(member.role) ||
    !canManageTeamRole(actor, member.role) ||
    member.id === actor.teamMemberId
  ) {
    redirect("/church/team?error=permission");
  }

  const temporaryPassword = await resetChurchTeamMemberPassword(
    member.id,
    church.id,
  );
  await logChurchTeamActivity({
    churchId: church.id,
    teamMemberId: actor.teamMemberId,
    branchId: actor.branchId,
    action: "PASSWORD_RESET",
    metadata: { targetTeamMemberId: member.id, targetName: member.name },
  });

  revalidateTeamPaths();
  const params = new URLSearchParams({
    reset: "1",
    name: member.name,
    email: member.email,
    password: temporaryPassword,
  });
  redirect(`/church/team?${params.toString()}`);
}

function readField(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function revalidateTeamPaths() {
  revalidatePath("/church/team");
  revalidatePath("/church/dashboard");
}
