"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { canAccessChurchBranch, type ChurchPermission } from "@/lib/churchPermissions";
import { logChurchTeamActivity } from "@/lib/churchTeamRepository";
import { requireChurchPermission } from "@/lib/currentChurch";
import { sendLiveSessionStartedNotification } from "@/lib/emailNotifications";
import { createLiveTranscriptMessage } from "@/lib/liveSessionTranslation";
import {
  clearTranscriptMessages,
  deleteTranscriptMessage,
  endSermonSession,
  getSermonSessionForChurch,
  parseSessionLanguages,
  startSermonSession,
} from "@/lib/sermonSessionRepository";

export async function startSessionFromDetailAction(formData: FormData) {
  const { sessionId, session, church, actor } = await authorizeSession(
    formData,
    "sessions:manage",
  );

  await startSermonSession(sessionId, church.id);
  await logChurchTeamActivity({
    churchId: church.id,
    teamMemberId: actor.teamMemberId,
    branchId: session.branchId,
    action: "SESSION_STARTED",
    metadata: { sessionId, title: session.title },
  });
  const emailDelivery = await sendLiveSessionStartedNotification(
    sessionId,
    church.id,
  );
  revalidateSessionPaths(sessionId, church.slug);
  redirect(
    `/church/live-sessions/${sessionId}?started=1${emailDelivery.ok ? "" : "&emailWarning=1"}`,
  );
}

export async function endSessionFromDetailAction(formData: FormData) {
  const { sessionId, session, church, actor } = await authorizeSession(
    formData,
    "sessions:manage",
  );

  await endSermonSession(sessionId, church.id);
  await logChurchTeamActivity({
    churchId: church.id,
    teamMemberId: actor.teamMemberId,
    branchId: session.branchId,
    action: "SESSION_ENDED",
    metadata: { sessionId, title: session.title },
  });
  revalidateSessionPaths(sessionId, church.slug);
  redirect(`/church/live-sessions/${sessionId}?ended=1`);
}

export async function addTranscriptMessageAction(formData: FormData) {
  const sourceText = String(formData.get("sourceText") ?? "").trim();
  const language = String(formData.get("language") ?? "").trim();
  const sessionId = String(formData.get("sessionId") ?? "");

  if (!sessionId || !sourceText || !language) {
    redirect(`/church/live-sessions/${sessionId}?error=message`);
  }

  const authorized = await authorizeSession(formData, "translations:manage");
  await createLiveTranscriptMessage({ sessionId, sourceText, language });
  revalidateSessionPaths(sessionId, authorized.church.slug);
  redirect(`/church/live-sessions/${sessionId}?message=1`);
}

export async function addTranscriptMessageToAllAction(formData: FormData) {
  const sourceText = String(formData.get("sourceText") ?? "").trim();
  const sessionId = String(formData.get("sessionId") ?? "");

  if (!sessionId || !sourceText) {
    redirect(`/church/live-sessions/${sessionId}?error=message`);
  }

  const { session, church } = await authorizeSession(
    formData,
    "translations:manage",
  );

  for (const language of parseSessionLanguages(session.listenerLanguages)) {
    await createLiveTranscriptMessage({ sessionId, sourceText, language });
  }

  revalidateSessionPaths(sessionId, church.slug);
  redirect(`/church/live-sessions/${sessionId}?message=all`);
}

export async function deleteTranscriptMessageAction(formData: FormData) {
  const messageId = String(formData.get("messageId") ?? "");
  const sessionId = String(formData.get("sessionId") ?? "");

  if (!sessionId || !messageId) {
    redirect(`/church/live-sessions/${sessionId}?error=message`);
  }

  const { church } = await authorizeSession(formData, "translations:manage");
  await deleteTranscriptMessage(messageId, sessionId);
  revalidateSessionPaths(sessionId, church.slug);
  redirect(`/church/live-sessions/${sessionId}?deleted=1`);
}

export async function clearTranscriptMessagesAction(formData: FormData) {
  const { sessionId, church } = await authorizeSession(
    formData,
    "translations:manage",
  );
  await clearTranscriptMessages(sessionId);
  revalidateSessionPaths(sessionId, church.slug);
  redirect(`/church/live-sessions/${sessionId}?cleared=1`);
}

async function authorizeSession(
  formData: FormData,
  permission: ChurchPermission,
) {
  const sessionId = String(formData.get("sessionId") ?? "");

  if (!sessionId) redirect("/church/live-sessions?error=session");

  const { church, actor } = await requireChurchPermission(permission);
  const session = await getSermonSessionForChurch(sessionId, church.id);

  if (!session || !canAccessChurchBranch(actor, session.branchId)) {
    redirect("/church/live-sessions?error=session");
  }

  return { sessionId, session, church, actor };
}

function revalidateSessionPaths(sessionId: string, churchSlug: string) {
  revalidatePath("/church/live-sessions");
  revalidatePath(`/church/live-sessions/${sessionId}`);
  revalidatePath(`/listen/${sessionId}`);
  revalidatePath(`/churches/${churchSlug}`);
  revalidatePath("/churches");
}
