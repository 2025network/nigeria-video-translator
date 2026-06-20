import { NextResponse, type NextRequest } from "next/server";
import { buildPasswordResetUrl, createPasswordResetToken, shouldShowDevelopmentResetLink } from "@/lib/passwordReset";

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const token = await createPasswordResetToken(String(formData.get("email") ?? ""), "admin");
  const target = new URL("/admin/forgot-password", request.url);
  target.searchParams.set("sent", "1");
  if (token && shouldShowDevelopmentResetLink()) target.searchParams.set("link", buildPasswordResetUrl("admin", token));
  return NextResponse.redirect(target, 303);
}
