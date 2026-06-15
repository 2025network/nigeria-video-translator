import { NextResponse, type NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { requireAdminSession } from "@/lib/auth";
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
  await requireAdminSession();

  const { id } = await params;
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
