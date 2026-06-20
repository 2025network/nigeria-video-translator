import { NextResponse, type NextRequest } from "next/server";
import { buildPasswordResetUrl, createPasswordResetToken, shouldShowDevelopmentResetLink } from "@/lib/passwordReset";

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const token = await createPasswordResetToken(String(formData.get("email") ?? ""), "church");
  const target = new URL("/church/forgot-password", request.url);
  target.searchParams.set("sent", "1");
  if (token && shouldShowDevelopmentResetLink()) target.searchParams.set("link", buildPasswordResetUrl("church", token));
  return NextResponse.redirect(target, 303);
}
