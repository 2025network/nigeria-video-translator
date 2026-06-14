"use server";

import { revalidatePath } from "next/cache";
import {
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
  revalidatePath("/admin/onboarding-requests");
}
