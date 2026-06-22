"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  activateBranch,
  createBranch,
  deleteBranch,
  disableBranch,
  updateBranch,
  type BranchFormInput,
} from "@/lib/branchRepository";
import { logChurchTeamActivity } from "@/lib/churchTeamRepository";
import { requireChurchPermission } from "@/lib/currentChurch";

export async function createChurchBranchAction(formData: FormData) {
  const { church, actor } = await requireChurchPermission("branches:create");
  const branch = await createBranch(church.id, parseBranchForm(formData));
  await logChurchTeamActivity({
    churchId: church.id,
    teamMemberId: actor.teamMemberId,
    branchId: branch.id,
    action: "BRANCH_CREATED",
    metadata: { branchName: branch.name },
  });
  revalidateBranchPaths(church.slug);
  redirect("/church/branches?created=1");
}

export async function updateChurchBranchAction(formData: FormData) {
  const branchId = String(formData.get("branchId") ?? "");

  if (!branchId) redirect("/church/branches?error=branch");
  const { church } = await requireChurchPermission("branches:manage", branchId);

  await updateBranch(branchId, church.id, parseBranchForm(formData));
  revalidateBranchPaths(church.slug);
  redirect("/church/branches?updated=1");
}

export async function activateChurchBranchAction(formData: FormData) {
  const branchId = String(formData.get("branchId") ?? "");

  if (!branchId) redirect("/church/branches?error=branch");
  const { church } = await requireChurchPermission("branches:manage", branchId);

  await activateBranch(branchId, church.id);
  revalidateBranchPaths(church.slug);
  redirect("/church/branches?activated=1");
}

export async function deactivateChurchBranchAction(formData: FormData) {
  const branchId = String(formData.get("branchId") ?? "");

  if (!branchId) redirect("/church/branches?error=branch");
  const { church } = await requireChurchPermission("branches:manage", branchId);

  await disableBranch(branchId, church.id);
  revalidateBranchPaths(church.slug);
  redirect("/church/branches?deactivated=1");
}

export async function deleteChurchBranchAction(formData: FormData) {
  const branchId = String(formData.get("branchId") ?? "");

  if (!branchId) redirect("/church/branches?error=branch");
  const { church } = await requireChurchPermission("branches:manage", branchId);

  await deleteBranch(branchId, church.id);
  revalidateBranchPaths(church.slug);
  redirect("/church/branches?deleted=1");
}

function parseBranchForm(formData: FormData): BranchFormInput {
  const name = String(formData.get("name") ?? "").trim();
  const slug = String(formData.get("slug") ?? "").trim();
  const country = String(formData.get("country") ?? "").trim();
  const state = String(formData.get("state") ?? "").trim();
  const city = String(formData.get("city") ?? "").trim();
  const address = String(formData.get("address") ?? "").trim();
  const location = [city, state, country].filter(Boolean).join(", ");

  if (!name) {
    throw new Error("Branch name is required.");
  }

  return {
    name,
    slug,
    location,
    pastorName: String(formData.get("pastorName") ?? "").trim(),
    email: String(formData.get("email") ?? "").trim(),
    phone: String(formData.get("phone") ?? "").trim(),
    country,
    state,
    city,
    address,
    description: String(formData.get("description") ?? "").trim(),
    bannerUrl: String(formData.get("bannerUrl") ?? "").trim(),
    logoUrl: String(formData.get("logoUrl") ?? "").trim(),
  };
}

function revalidateBranchPaths(churchSlug: string) {
  revalidatePath("/church/dashboard");
  revalidatePath("/church/branches");
  revalidatePath("/church/live-sessions");
  revalidatePath(`/churches/${churchSlug}`);
  revalidatePath("/churches");
}
