"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  createSermonSession,
  endSermonSession,
  startSermonSession,
} from "@/lib/sermonSessionRepository";
import { getCurrentChurchView } from "@/lib/currentChurch";
import { getBranchForChurch } from "@/lib/branchRepository";

export async function createSermonSessionAction(formData: FormData) {
  const church = await getCurrentChurchView();
  const title = String(formData.get("title") ?? "").trim();
  const sourceLanguage = String(formData.get("sourceLanguage") ?? "English").trim();
  const listenerLanguages = formData.getAll("listenerLanguages").map(String);
  const streamUrl = String(formData.get("streamUrl") ?? "").trim();
  const branchId = String(formData.get("branchId") ?? "").trim();

  if (!title || !sourceLanguage) {
    redirect("/church/live-sessions?error=missing");
  }

  if (branchId) {
    const branch = await getBranchForChurch(branchId, church.id);

    if (!branch || branch.disabledAt) {
      redirect("/church/live-sessions?error=branch");
    }
  }

  await createSermonSession(church.id, {
    title,
    sourceLanguage,
    listenerLanguages,
    streamUrl,
    branchId,
  });

  revalidatePath("/church/live-sessions");
  revalidatePath(`/churches/${church.slug}`);
  revalidatePath("/churches");
  redirect("/church/live-sessions?created=1");
}

export async function startSermonSessionAction(formData: FormData) {
  const church = await getCurrentChurchView();
  const sessionId = String(formData.get("sessionId") ?? "");

  if (!sessionId) {
    redirect("/church/live-sessions?error=session");
  }

  await startSermonSession(sessionId, church.id);

  revalidatePath("/church/live-sessions");
  revalidatePath(`/listen/${sessionId}`);
  revalidatePath(`/churches/${church.slug}`);
  revalidatePath("/churches");
  redirect("/church/live-sessions?started=1");
}

export async function endSermonSessionAction(formData: FormData) {
  const church = await getCurrentChurchView();
  const sessionId = String(formData.get("sessionId") ?? "");

  if (!sessionId) {
    redirect("/church/live-sessions?error=session");
  }

  await endSermonSession(sessionId, church.id);

  revalidatePath("/church/live-sessions");
  revalidatePath(`/listen/${sessionId}`);
  revalidatePath(`/churches/${church.slug}`);
  revalidatePath("/churches");
  redirect("/church/live-sessions?ended=1");
}
