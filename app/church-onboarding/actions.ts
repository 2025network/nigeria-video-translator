"use server";

import { redirect } from "next/navigation";
import { createOnboardingRequest } from "@/lib/onboardingRepository";

export async function submitOnboardingRequest(formData: FormData) {
  const churchName = String(formData.get("churchName") ?? "").trim();
  const contactName = String(formData.get("contactName") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const phone = String(formData.get("phone") ?? "").trim();
  const country = String(formData.get("country") ?? "").trim();
  const city = String(formData.get("city") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();

  if (!churchName || !contactName || !email || !phone || !country || !city) {
    redirect("/church-onboarding?error=missing");
  }

  await createOnboardingRequest({
    churchName,
    contactName,
    email,
    phone,
    country,
    city,
    message,
  });

  redirect("/church-onboarding?submitted=1");
}
