import { NextResponse, type NextRequest } from "next/server";
import { isSmtpConfigured, sendEmail } from "@/lib/emailService";
import { adminPasswordResetEmail } from "@/lib/emailTemplates";
import { buildPasswordResetUrl, createPasswordResetToken, shouldShowDevelopmentResetLink } from "@/lib/passwordReset";

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const token = await createPasswordResetToken(email, "admin");
  const target = new URL("/admin/forgot-password", request.url);
  target.searchParams.set("sent", "1");

  if (isSmtpConfigured()) {
    target.searchParams.set("delivery", "email");

    if (token) {
      const resetUrl = buildPasswordResetUrl("admin", token);
      const template = adminPasswordResetEmail({ resetUrl });
      await sendEmail({ to: email, ...template }, "admin-password-reset");
    }
  } else if (token && shouldShowDevelopmentResetLink()) {
    target.searchParams.set("delivery", "development");
    target.searchParams.set("link", buildPasswordResetUrl("admin", token));
  }

  return NextResponse.redirect(target, 303);
}
