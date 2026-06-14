"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  createChurch,
  deleteChurch,
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

function parseChurchForm(formData: FormData): ChurchFormInput {
  const churchName = String(formData.get("churchName") ?? "").trim();
  const slug = String(formData.get("slug") ?? "").trim();
  const country = String(formData.get("country") ?? "").trim();
  const youtubeLiveUrl = String(formData.get("youtubeLiveUrl") ?? "").trim();
  const defaultSpokenLanguage = String(
    formData.get("defaultSpokenLanguage") ?? "English",
  );
  const status = String(formData.get("status") ?? "Active") as "Active" | "Inactive";
  const enabledLanguages = formData.getAll("enabledLanguages").map(String);
  const enabledTranslationCountries = formData
    .getAll("enabledTranslationCountries")
    .map(String);

  if (!churchName || !slug || !country || !youtubeLiveUrl) {
    throw new Error("Church name, slug, country, and YouTube Live URL are required.");
  }

  return {
    churchName,
    slug,
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
