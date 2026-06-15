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
import { getCurrentChurchView } from "@/lib/currentChurch";

export async function createChurchBranchAction(formData: FormData) {
  const church = await getCurrentChurchView();
  await createBranch(church.id, parseBranchForm(formData));
  revalidateBranchPaths(church.slug);
  redirect("/church/branches?created=1");
}

export async function updateChurchBranchAction(formData: FormData) {
  const church = await getCurrentChurchView();
  const branchId = String(formData.get("branchId") ?? "");

  if (!branchId) redirect("/church/branches?error=branch");

  await updateBranch(branchId, church.id, parseBranchForm(formData));
  revalidateBranchPaths(church.slug);
  redirect("/church/branches?updated=1");
}

export async function activateChurchBranchAction(formData: FormData) {
  const church = await getCurrentChurchView();
  const branchId = String(formData.get("branchId") ?? "");

  if (!branchId) redirect("/church/branches?error=branch");

  await activateBranch(branchId, church.id);
  revalidateBranchPaths(church.slug);
  redirect("/church/branches?activated=1");
}

export async function deactivateChurchBranchAction(formData: FormData) {
  const church = await getCurrentChurchView();
  const branchId = String(formData.get("branchId") ?? "");

  if (!branchId) redirect("/church/branches?error=branch");

  await disableBranch(branchId, church.id);
  revalidateBranchPaths(church.slug);
  redirect("/church/branches?deactivated=1");
}

export async function deleteChurchBranchAction(formData: FormData) {
  const church = await getCurrentChurchView();
  const branchId = String(formData.get("branchId") ?? "");

  if (!branchId) redirect("/church/branches?error=branch");

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
