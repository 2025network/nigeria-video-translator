"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentChurchView } from "@/lib/currentChurch";
import { translateForListenerLanguage } from "@/lib/liveSessionTranslation";
import {
  addTranscriptMessage,
  endSermonSession,
  getSermonSessionForChurch,
  startSermonSession,
  parseSessionLanguages,
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

  const translation = await translateForListenerLanguage(sourceText, language);

  await addTranscriptMessage({
    sessionId,
    sourceText,
    translatedText: translation.translatedText,
    language,
  });

  revalidateSessionPaths(sessionId, church.slug);
  redirect(`/church/live-sessions/${sessionId}?message=1`);
}

export async function addTranscriptMessageToAllAction(formData: FormData) {
  const church = await getCurrentChurchView();
  const sessionId = String(formData.get("sessionId") ?? "");
  const sourceText = String(formData.get("sourceText") ?? "").trim();

  if (!sessionId || !sourceText) {
    redirect(`/church/live-sessions/${sessionId || ""}?error=message`);
  }

  const session = await getSermonSessionForChurch(sessionId, church.id);

  if (!session) {
    redirect("/church/live-sessions?error=session");
  }

  const listenerLanguages = parseSessionLanguages(session.listenerLanguages);

  for (const language of listenerLanguages) {
    const translation = await translateForListenerLanguage(sourceText, language);

    await addTranscriptMessage({
      sessionId,
      sourceText,
      translatedText: translation.translatedText,
      language,
    });
  }

  revalidateSessionPaths(sessionId, church.slug);
  redirect(`/church/live-sessions/${sessionId}?message=all`);
}

function revalidateSessionPaths(sessionId: string, churchSlug: string) {
  revalidatePath("/church/live-sessions");
  revalidatePath(`/church/live-sessions/${sessionId}`);
  revalidatePath(`/listen/${sessionId}`);
  revalidatePath(`/churches/${churchSlug}`);
  revalidatePath("/churches");
}
