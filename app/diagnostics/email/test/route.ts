import { NextResponse, type NextRequest } from "next/server";
import { requireAdminSession } from "@/lib/auth";
import { isSmtpConfigured, sendEmail } from "@/lib/emailService";
import { emailDeliveryTestEmail } from "@/lib/emailTemplates";

export async function POST(request: NextRequest) {
  await requireAdminSession();
  const formData = await request.formData();
  const recipient = String(formData.get("email") ?? "").trim().toLowerCase();
  const target = new URL("/diagnostics/email", request.url);

  if (!recipient || !recipient.includes("@")) {
    target.searchParams.set("error", "recipient");
    return NextResponse.redirect(target, 303);
  }

  if (!isSmtpConfigured()) {
    target.searchParams.set("error", "configuration");
    return NextResponse.redirect(target, 303);
  }

  const template = emailDeliveryTestEmail();
  const delivery = await sendEmail(
    { to: recipient, ...template },
    "email-diagnostics-test",
  );

  if (delivery.ok) {
    target.searchParams.set("sent", "1");
  } else {
    target.searchParams.set("error", "delivery");
    target.searchParams.set("code", delivery.code);
  }

  return NextResponse.redirect(target, 303);
}
