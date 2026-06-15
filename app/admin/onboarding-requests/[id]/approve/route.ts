import { NextResponse, type NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { adminSessionCookie, requireAdminSession } from "@/lib/auth";
import { approveOnboardingRequestAndCreateChurch } from "@/lib/onboardingRepository";

type ApproveRouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function POST(request: NextRequest, { params }: ApproveRouteContext) {
  const { id } = await params;
  const adminCookieValue = request.cookies.get(adminSessionCookie)?.value;

  console.info("[onboarding-approve] route reached", {
    requestId: id,
    adminCookieValue,
  });

  await requireAdminSession();

  const result = await approveOnboardingRequestAndCreateChurch(id);

  revalidatePath("/admin");
  revalidatePath("/admin/churches");
  revalidatePath("/admin/onboarding-requests");

  const redirectUrl = new URL("/admin/onboarding-requests", request.url);

  if (!result.ok) {
    redirectUrl.searchParams.set("approveError", result.message);

    return NextResponse.redirect(redirectUrl);
  }

  redirectUrl.searchParams.set("approved", "1");
  redirectUrl.searchParams.set("churchId", result.church.id);
  redirectUrl.searchParams.set("churchName", result.church.churchName);
  redirectUrl.searchParams.set("email", result.church.email);
  redirectUrl.searchParams.set("password", result.temporaryPassword);

  return NextResponse.redirect(redirectUrl);
}
