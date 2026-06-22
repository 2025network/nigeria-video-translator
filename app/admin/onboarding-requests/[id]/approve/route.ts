import { NextResponse, type NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { requireAdminSession } from "@/lib/auth";
import { getSiteUrl } from "@/lib/demoChurches";
import { sendEmail } from "@/lib/emailService";
import { churchApprovedEmail } from "@/lib/emailTemplates";
import { approveOnboardingRequestAndCreateChurch } from "@/lib/onboardingRepository";

type ApproveRouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function POST(request: NextRequest, { params }: ApproveRouteContext) {
  const { id } = await params;

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

  const siteUrl = getSiteUrl();
  const template = churchApprovedEmail({
    churchName: result.church.churchName,
    email: result.church.email,
    temporaryPassword: result.temporaryPassword,
    loginUrl: `${siteUrl}/church/login`,
    publicPageUrl: `${siteUrl}/churches/${result.church.slug}`,
    dashboardUrl: `${siteUrl}/church/dashboard`,
  });
  const delivery = await sendEmail(
    { to: result.church.email, ...template },
    "church-approved",
  );

  if (delivery.ok) {
    redirectUrl.searchParams.set("emailSent", "1");
  } else {
    redirectUrl.searchParams.set("emailWarning", delivery.code);
    redirectUrl.searchParams.set("password", result.temporaryPassword);
  }

  return NextResponse.redirect(redirectUrl);
}
