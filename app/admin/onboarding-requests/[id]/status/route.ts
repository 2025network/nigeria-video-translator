import { NextResponse, type NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { adminSessionCookie, requireAdminSession } from "@/lib/auth";
import {
  isOnboardingStatus,
  updateOnboardingRequestStatus,
} from "@/lib/onboardingRepository";

type StatusRouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function POST(request: NextRequest, { params }: StatusRouteContext) {
  const { id } = await params;
  const adminCookieValue = request.cookies.get(adminSessionCookie)?.value;

  console.info("[onboarding-status] route reached", {
    requestId: id,
    adminCookieValue,
  });

  await requireAdminSession();

  const formData = await request.formData();
  const status = String(formData.get("status") ?? "");
  const redirectUrl = new URL("/admin/onboarding-requests", request.url);

  if (!isOnboardingStatus(status)) {
    redirectUrl.searchParams.set("statusError", "Please choose a valid request status.");

    return NextResponse.redirect(redirectUrl);
  }

  try {
    await updateOnboardingRequestStatus(id, status);
  } catch {
    redirectUrl.searchParams.set("statusError", "This onboarding request could not be found.");

    return NextResponse.redirect(redirectUrl);
  }

  revalidatePath("/admin");
  revalidatePath("/admin/onboarding-requests");

  redirectUrl.searchParams.set("statusUpdated", "1");

  return NextResponse.redirect(redirectUrl);
}
