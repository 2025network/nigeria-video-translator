"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { updateChurchProfile } from "@/lib/churchRepository";
import { getCurrentChurchView } from "@/lib/currentChurch";

export async function updateChurchProfileAction(formData: FormData) {
  const church = await getCurrentChurchView();
  const churchName = readField(formData, "churchName");
  const country = readField(formData, "country");
  const city = readField(formData, "city");

  if (!churchName || !country || !city) {
    redirect("/church/profile?error=missing");
  }

  await updateChurchProfile(church.id, {
    churchName,
    logoUrl: readField(formData, "logoUrl"),
    bannerUrl: readField(formData, "bannerUrl"),
    description: readField(formData, "description"),
    pastorName: readField(formData, "pastorName"),
    phone: readField(formData, "phone"),
    websiteUrl: readField(formData, "websiteUrl"),
    facebookUrl: readField(formData, "facebookUrl"),
    youtubeUrl: readField(formData, "youtubeUrl"),
    instagramUrl: readField(formData, "instagramUrl"),
    country,
    city,
    address: readField(formData, "address"),
  });

  revalidatePath("/church/dashboard");
  revalidatePath("/church/profile");
  redirect("/church/profile?saved=1");
}

function readField(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}
