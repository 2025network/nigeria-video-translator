"use server";

import { revalidatePath } from "next/cache";
import {
  createBranch,
  deleteBranch,
  disableBranch,
  updateBranch,
  type BranchFormInput,
} from "@/lib/branchRepository";

export async function createBranchAction(churchId: string, formData: FormData) {
  await createBranch(churchId, parseBranchForm(formData));
  revalidatePath(`/admin/churches/${churchId}/branches`);
  revalidatePath("/church/dashboard");
}

export async function updateBranchAction(branchId: string, churchId: string, formData: FormData) {
  await updateBranch(branchId, churchId, parseBranchForm(formData));
  revalidatePath(`/admin/churches/${churchId}/branches`);
  revalidatePath("/church/dashboard");
}

export async function disableBranchAction(branchId: string, churchId: string) {
  await disableBranch(branchId, churchId);
  revalidatePath(`/admin/churches/${churchId}/branches`);
  revalidatePath("/church/dashboard");
}

export async function deleteBranchAction(branchId: string, churchId: string) {
  await deleteBranch(branchId, churchId);
  revalidatePath(`/admin/churches/${churchId}/branches`);
  revalidatePath("/church/dashboard");
}

function parseBranchForm(formData: FormData): BranchFormInput {
  const name = String(formData.get("name") ?? "").trim();
  const slug = String(formData.get("slug") ?? "").trim();
  const location = String(formData.get("location") ?? "").trim();

  if (!name || !location) {
    throw new Error("Branch name and location are required.");
  }

  return { name, slug, location };
}
