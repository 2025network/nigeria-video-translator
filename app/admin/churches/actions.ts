"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  createChurch,
  deleteChurch,
  disableChurch,
  updateChurch,
  type ChurchFormInput,
} from "@/lib/churchRepository";

export async function createChurchAction(formData: FormData) {
  const church = await createChurch(parseChurchForm(formData));
  revalidatePath("/admin");
  revalidatePath("/admin/churches");
  redirect(`/admin/churches/${church.id}?created=1`);
}

export async function updateChurchAction(id: string, formData: FormData) {
  await updateChurch(id, parseChurchForm(formData));
  revalidatePath("/admin");
  revalidatePath("/admin/churches");
  revalidatePath(`/admin/churches/${id}`);
  redirect(`/admin/churches/${id}?updated=1`);
}

export async function deleteChurchAction(id: string) {
  await deleteChurch(id);
  revalidatePath("/admin");
  revalidatePath("/admin/churches");
  redirect("/admin/churches?deleted=1");
}

export async function disableChurchAction(id: string) {
  await disableChurch(id);
  revalidatePath("/admin");
  revalidatePath("/admin/churches");
  revalidatePath(`/admin/churches/${id}`);
}

function parseChurchForm(formData: FormData): ChurchFormInput {
  const churchName = String(formData.get("churchName") ?? "").trim();
  const slug = String(formData.get("slug") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "").trim();
  const plan = "FULL_ACCESS";
  const country = String(formData.get("country") ?? "").trim();
  const youtubeLiveUrl = String(formData.get("youtubeLiveUrl") ?? "").trim();
  const defaultSpokenLanguage = String(
    formData.get("defaultSpokenLanguage") ?? "English",
  );
  const status = String(formData.get("status") ?? "Active") as "Active" | "Inactive";
  const enabledLanguages = formData.getAll("enabledLanguages").map(String);
  const supportedLanguages = formData.getAll("supportedLanguages").map(String);
  const enabledTranslationCountries = formData
    .getAll("enabledTranslationCountries")
    .map(String);

  if (!churchName || !email || !country || !youtubeLiveUrl) {
    throw new Error("Church name, email, country, and YouTube Live URL are required.");
  }

  return {
    name: churchName,
    churchName,
    slug,
    email,
    password,
    plan,
    supportedLanguages,
    country,
    youtubeLiveUrl,
    defaultSpokenLanguage,
    status,
    enabledLanguages: enabledLanguages.length ? enabledLanguages : ["English"],
    enabledTranslationCountries: enabledTranslationCountries.length
      ? enabledTranslationCountries
      : [country],
  };
}

