import { NextResponse, type NextRequest } from "next/server";
import { resetPasswordWithToken } from "@/lib/passwordReset";

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const token = String(formData.get("token") ?? "");
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");
  if (password.length < 8 || password !== confirmPassword) return redirectWithError(request, token, "password");
  const result = await resetPasswordWithToken({ token, password, accountType: "church" });
  if (!result.ok) return redirectWithError(request, token, result.reason);
  return NextResponse.redirect(new URL("/church/reset-password?success=1", request.url), 303);
}
function redirectWithError(request: NextRequest, token: string, error: string) { const target = new URL("/church/reset-password", request.url); target.searchParams.set("token", token); target.searchParams.set("error", error); return NextResponse.redirect(target, 303); }
