"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  createSermonSession,
  endSermonSession,
  getSermonSessionForChurch,
  startSermonSession,
} from "@/lib/sermonSessionRepository";
import { getBranchForChurch } from "@/lib/branchRepository";
import { getLanguageName } from "@/lib/languageCatalog";
import { sendLiveSessionStartedNotification } from "@/lib/emailNotifications";
import { canAccessChurchBranch } from "@/lib/churchPermissions";
import { logChurchTeamActivity } from "@/lib/churchTeamRepository";
import { requireChurchPermission } from "@/lib/currentChurch";

export async function createSermonSessionAction(formData: FormData) {
  const { church, actor } = await requireChurchPermission("sessions:manage");
  const title = String(formData.get("title") ?? "").trim();
  const sourceLanguage = getLanguageName(String(formData.get("sourceLanguage") ?? "en").trim());
  const listenerLanguages = formData.getAll("listenerLanguages").map(String);
  const streamUrl = String(formData.get("streamUrl") ?? "").trim();
  const requestedBranchId = String(formData.get("branchId") ?? "").trim();
  const branchId = actor.role === "BRANCH_MANAGER"
    ? actor.branchId ?? ""
    : requestedBranchId;

  if (!title || !sourceLanguage) {
    redirect("/church/live-sessions?error=missing");
  }

  if (branchId) {
    const branch = await getBranchForChurch(branchId, church.id);

    if (!branch || branch.disabledAt) {
      redirect("/church/live-sessions?error=branch");
    }
  }

  if (!canAccessChurchBranch(actor, branchId || null)) {
    redirect("/church/live-sessions?error=branch");
  }

  const session = await createSermonSession(church.id, {
    title,
    sourceLanguage,
    listenerLanguages,
    streamUrl,
    branchId,
  });
  await logChurchTeamActivity({
    churchId: church.id,
    teamMemberId: actor.teamMemberId,
    branchId: session.branchId,
    action: "SESSION_CREATED",
    metadata: { sessionId: session.id, title: session.title },
  });

  revalidatePath("/church/live-sessions");
  revalidatePath(`/churches/${church.slug}`);
  revalidatePath("/churches");
  redirect("/church/live-sessions?created=1");
}

export async function startSermonSessionAction(formData: FormData) {
  const { church, actor } = await requireChurchPermission("sessions:manage");
  const sessionId = String(formData.get("sessionId") ?? "");

  if (!sessionId) {
    redirect("/church/live-sessions?error=session");
  }

  const session = await getSermonSessionForChurch(sessionId, church.id);

  if (!session || !canAccessChurchBranch(actor, session.branchId)) {
    redirect("/church/live-sessions?error=session");
  }

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

  revalidatePath("/church/live-sessions");
  revalidatePath(`/listen/${sessionId}`);
  revalidatePath(`/churches/${church.slug}`);
  revalidatePath("/churches");
  redirect(
    `/church/live-sessions?started=1${emailDelivery.ok ? "" : "&emailWarning=1"}`,
  );
}

export async function endSermonSessionAction(formData: FormData) {
  const { church, actor } = await requireChurchPermission("sessions:manage");
  const sessionId = String(formData.get("sessionId") ?? "");

  if (!sessionId) {
    redirect("/church/live-sessions?error=session");
  }

  const session = await getSermonSessionForChurch(sessionId, church.id);

  if (!session || !canAccessChurchBranch(actor, session.branchId)) {
    redirect("/church/live-sessions?error=session");
  }

  await endSermonSession(sessionId, church.id);
  await logChurchTeamActivity({
    churchId: church.id,
    teamMemberId: actor.teamMemberId,
    branchId: session.branchId,
    action: "SESSION_ENDED",
    metadata: { sessionId, title: session.title },
  });

  revalidatePath("/church/live-sessions");
  revalidatePath(`/listen/${sessionId}`);
  revalidatePath(`/churches/${church.slug}`);
  revalidatePath("/churches");
  redirect("/church/live-sessions?ended=1");
}
