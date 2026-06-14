import { prisma } from "./db";

export const onboardingStatuses = ["NEW", "CONTACTED", "APPROVED", "REJECTED"] as const;

export type OnboardingStatus = (typeof onboardingStatuses)[number];

export type CreateOnboardingRequestInput = {
  churchName: string;
  contactName: string;
  email: string;
  phone: string;
  country: string;
  city: string;
  message?: string;
};

export async function createOnboardingRequest(input: CreateOnboardingRequestInput) {
  return prisma.churchOnboardingRequest.create({
    data: {
      churchName: input.churchName,
      contactName: input.contactName,
      email: input.email,
      phone: input.phone,
      country: input.country,
      city: input.city,
      message: input.message || null,
    },
  });
}

export async function getOnboardingRequests() {
  return prisma.churchOnboardingRequest.findMany({
    orderBy: { createdAt: "desc" },
  });
}

export async function updateOnboardingRequestStatus(
  id: string,
  status: OnboardingStatus,
) {
  return prisma.churchOnboardingRequest.update({
    where: { id },
    data: { status },
  });
}

export function isOnboardingStatus(value: string): value is OnboardingStatus {
  return onboardingStatuses.includes(value as OnboardingStatus);
}
