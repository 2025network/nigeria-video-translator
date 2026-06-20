"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createOnboardingRequest } from "@/lib/onboardingRepository";
import { getCountryByCodeOrName } from "@/lib/countryCatalog";

export async function submitOnboardingRequest(formData: FormData) {
  const churchName = String(formData.get("churchName") ?? "").trim();
  const contactName = String(formData.get("contactName") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const phone = String(formData.get("phone") ?? "").trim();
  const countryValue = String(formData.get("country") ?? "").trim();
  const country = getCountryByCodeOrName(countryValue)?.name ?? countryValue;
  const city = String(formData.get("city") ?? "").trim();
  const websiteUrl = String(formData.get("websiteUrl") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();

  if (
    !churchName ||
    !contactName ||
    !email ||
    !phone ||
    !country ||
    !city ||
    !websiteUrl
  ) {
    redirect("/church-onboarding?error=missing");
  }

  await createOnboardingRequest({
    churchName,
    contactName,
    email,
    phone,
    country,
    city,
    websiteUrl,
    message,
  });

  revalidatePath("/admin");
  revalidatePath("/admin/onboarding-requests");
  redirect("/church-onboarding?submitted=1");
}
