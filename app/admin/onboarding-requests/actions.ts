"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  approveOnboardingRequestAndCreateChurch,
  isOnboardingStatus,
  updateOnboardingRequestStatus,
} from "@/lib/onboardingRepository";

export async function updateOnboardingStatusAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");

  if (!id || !isOnboardingStatus(status)) {
    throw new Error("A valid onboarding request and status are required.");
  }

  await updateOnboardingRequestStatus(id, status);
  revalidatePath("/admin");
  revalidatePath("/admin/onboarding-requests");
}

export async function approveAndCreateChurchAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");

  if (!id) {
    redirect("/admin/onboarding-requests?approveError=missing");
  }

  const result = await approveOnboardingRequestAndCreateChurch(id);

  revalidatePath("/admin");
  revalidatePath("/admin/churches");
  revalidatePath("/admin/onboarding-requests");

  if (!result.ok) {
    redirect(
      `/admin/onboarding-requests?approveError=${encodeURIComponent(result.message)}`,
    );
  }

  redirect(
    `/admin/onboarding-requests?createdChurch=${encodeURIComponent(
      result.church.id,
    )}&churchName=${encodeURIComponent(
      result.church.churchName,
    )}&email=${encodeURIComponent(result.church.email)}&password=${encodeURIComponent(
      result.temporaryPassword,
    )}`,
  );
}
