export type EmailTemplate = {
  subject: string;
  text: string;
  html: string;
};

export function adminPasswordResetEmail(input: { resetUrl: string }) {
  return createTemplate({
    subject: "Reset your SermonBridge admin password",
    heading: "Admin password reset",
    intro: "A password reset was requested for your SermonBridge admin account.",
    paragraphs: [
      "This secure link expires in one hour and can be used only once.",
      "If you did not request this reset, you can ignore this email.",
    ],
    actionLabel: "Reset admin password",
    actionUrl: input.resetUrl,
  });
}

export function churchPasswordResetEmail(input: { resetUrl: string }) {
  return createTemplate({
    subject: "Reset your SermonBridge church password",
    heading: "Church account password reset",
    intro: "A password reset was requested for your SermonBridge church account.",
    paragraphs: [
      "This secure link expires in one hour and can be used only once.",
      "If your church did not request this reset, you can ignore this email.",
    ],
    actionLabel: "Reset church password",
    actionUrl: input.resetUrl,
  });
}

export function churchApprovedEmail(input: {
  churchName: string;
  email: string;
  temporaryPassword: string;
  loginUrl: string;
  publicPageUrl: string;
  dashboardUrl: string;
}) {
  return createTemplate({
    subject: `${input.churchName} is ready on SermonBridge`,
    heading: "Your SermonBridge church account is ready",
    intro: `${input.churchName} has been approved and activated on SermonBridge.`,
    paragraphs: [
      `Login email: ${input.email}`,
      `Temporary password: ${input.temporaryPassword}`,
      `Church login: ${input.loginUrl}`,
      `Church dashboard: ${input.dashboardUrl}`,
      `Public church page: ${input.publicPageUrl}`,
      "Please sign in and replace the temporary password as soon as possible.",
    ],
    actionLabel: "Open church dashboard",
    actionUrl: input.dashboardUrl,
  });
}

export function churchOnboardingReceivedEmail(input: {
  churchName: string;
  contactName: string;
}) {
  return createTemplate({
    subject: "SermonBridge onboarding request received",
    heading: "Your onboarding request is with us",
    intro: `Hello ${input.contactName}, we received the onboarding request for ${input.churchName}.`,
    paragraphs: [
      "The request is pending approval and the SermonBridge team will review the church details.",
      "We will contact you when the church account is ready or if more information is needed.",
    ],
  });
}

export function liveSessionStartedEmail(input: {
  churchName: string;
  sessionTitle: string;
  listenerUrl: string;
}) {
  return createTemplate({
    subject: `${input.sessionTitle} is live on SermonBridge`,
    heading: "Live sermon translation has started",
    intro: `${input.churchName} has started "${input.sessionTitle}".`,
    paragraphs: [
      "Copy and share the listener link with members who need translated sermon updates.",
      `Listener link: ${input.listenerUrl}`,
    ],
    actionLabel: "Open listener page",
    actionUrl: input.listenerUrl,
  });
}

export function emailDeliveryTestEmail() {
  return createTemplate({
    subject: "SermonBridge email delivery test",
    heading: "Email delivery is working",
    intro: "SermonBridge successfully delivered this SMTP test message.",
    paragraphs: [
      "Password resets, onboarding confirmations, church approvals, and live-session notifications can now use this mail server.",
    ],
  });
}

function createTemplate(input: {
  subject: string;
  heading: string;
  intro: string;
  paragraphs: string[];
  actionLabel?: string;
  actionUrl?: string;
}): EmailTemplate {
  const textLines = [input.heading, "", input.intro, "", ...input.paragraphs];

  if (input.actionLabel && input.actionUrl) {
    textLines.push("", `${input.actionLabel}: ${input.actionUrl}`);
  }

  const paragraphs = [input.intro, ...input.paragraphs]
    .map(
      (paragraph) =>
        `<p style="margin:0 0 16px;color:#385548;line-height:1.7;">${escapeHtml(paragraph)}</p>`,
    )
    .join("");
  const action =
    input.actionLabel && input.actionUrl
      ? `<a href="${escapeHtml(input.actionUrl)}" style="display:inline-block;margin-top:8px;padding:13px 20px;border-radius:6px;background:#34d399;color:#04120c;font-weight:700;text-decoration:none;">${escapeHtml(input.actionLabel)}</a>`
      : "";

  return {
    subject: input.subject,
    text: textLines.join("\n"),
    html: `<!doctype html><html><body style="margin:0;background:#eef7f2;font-family:Arial,Helvetica,sans-serif;"><div style="padding:32px 16px;"><div style="max-width:620px;margin:0 auto;border:1px solid #cde8da;border-radius:8px;background:#ffffff;overflow:hidden;"><div style="background:#06110d;padding:22px 28px;color:#ffffff;"><strong style="font-size:20px;">SermonBridge</strong></div><div style="padding:30px 28px;"><h1 style="margin:0 0 20px;color:#10261b;font-size:28px;letter-spacing:0;">${escapeHtml(input.heading)}</h1>${paragraphs}${action}</div><div style="padding:18px 28px;border-top:1px solid #e1eee7;color:#638072;font-size:12px;">SermonBridge - Live sermon translation for every church and language.</div></div></div></body></html>`,
  };
}

function escapeHtml(value: string) {
  return value.replace(
    /[&<>"']/g,
    (character) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;",
      })[character] ?? character,
  );
}
