"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isSupportedLanguage } from "@/lib/languages";
import { translateTranscript } from "@/lib/translation";
import { getCurrentChurchView } from "@/lib/currentChurch";
import {
  addTranscriptMessage,
  endSermonSession,
  getSermonSessionForChurch,
  startSermonSession,
} from "@/lib/sermonSessionRepository";

export async function startSessionFromDetailAction(formData: FormData) {
  const church = await getCurrentChurchView();
  const sessionId = String(formData.get("sessionId") ?? "");

  if (!sessionId) redirect("/church/live-sessions?error=session");

  await startSermonSession(sessionId, church.id);
  revalidateSessionPaths(sessionId, church.slug);
  redirect(`/church/live-sessions/${sessionId}?started=1`);
}

export async function endSessionFromDetailAction(formData: FormData) {
  const church = await getCurrentChurchView();
  const sessionId = String(formData.get("sessionId") ?? "");

  if (!sessionId) redirect("/church/live-sessions?error=session");

  await endSermonSession(sessionId, church.id);
  revalidateSessionPaths(sessionId, church.slug);
  redirect(`/church/live-sessions/${sessionId}?ended=1`);
}

export async function addTranscriptMessageAction(formData: FormData) {
  const church = await getCurrentChurchView();
  const sessionId = String(formData.get("sessionId") ?? "");
  const sourceText = String(formData.get("sourceText") ?? "").trim();
  const language = String(formData.get("language") ?? "").trim();

  if (!sessionId || !sourceText || !language) {
    redirect(`/church/live-sessions/${sessionId || ""}?error=message`);
  }

  const session = await getSermonSessionForChurch(sessionId, church.id);

  if (!session) {
    redirect("/church/live-sessions?error=session");
  }

  const translatedText = await translateManualMessage(sourceText, language);

  await addTranscriptMessage({
    sessionId,
    sourceText,
    translatedText,
    language,
  });

  revalidateSessionPaths(sessionId, church.slug);
  redirect(`/church/live-sessions/${sessionId}?message=1`);
}

async function translateManualMessage(sourceText: string, language: string) {
  if (language === "English") {
    return `[English original] ${sourceText}`;
  }

  if (isSupportedLanguage(language)) {
    const result = await translateTranscript(sourceText, language);

    return result.mode === "real"
      ? result.text
      : `[Demo translation to ${language}] ${result.text}`;
  }

  return `[Placeholder translation to ${language}] ${sourceText}`;
}

function revalidateSessionPaths(sessionId: string, churchSlug: string) {
  revalidatePath("/church/live-sessions");
  revalidatePath(`/church/live-sessions/${sessionId}`);
  revalidatePath(`/listen/${sessionId}`);
  revalidatePath(`/churches/${churchSlug}`);
  revalidatePath("/churches");
}
