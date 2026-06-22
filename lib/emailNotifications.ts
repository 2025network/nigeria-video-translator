import { getSiteUrl } from "./demoChurches";
import { sendEmail, type EmailDeliveryResult } from "./emailService";
import { liveSessionStartedEmail } from "./emailTemplates";
import { prisma } from "./db";

export async function sendLiveSessionStartedNotification(
  sessionId: string,
  churchId: string,
): Promise<EmailDeliveryResult> {
  const session = await prisma.sermonSession.findFirst({
    where: { id: sessionId, churchId },
    select: {
      id: true,
      title: true,
      church: {
        select: {
          churchName: true,
          email: true,
        },
      },
      branch: {
        select: {
          email: true,
        },
      },
    },
  });

  if (!session) {
    return {
      ok: false,
      code: "SESSION_NOT_FOUND",
      message: "Live session details could not be loaded for email delivery.",
    };
  }

  const listenerUrl = `${getSiteUrl()}/listen/${session.id}`;
  const template = liveSessionStartedEmail({
    churchName: session.church.churchName,
    sessionTitle: session.title,
    listenerUrl,
  });

  return sendEmail(
    {
      to: session.branch?.email || session.church.email,
      ...template,
    },
    "live-session-started",
  );
}
