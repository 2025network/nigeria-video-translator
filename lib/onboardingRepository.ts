import { randomBytes } from "node:crypto";
import { prisma } from "./db";
import { nigeriaChurchLanguages, translationCountries } from "./demoChurches";
import { listenerLanguageOptions, serializeListenerLanguages } from "./listenerLanguages";
import { hashPassword } from "./password";

export const onboardingStatuses = ["NEW", "CONTACTED", "APPROVED", "REJECTED"] as const;

export type OnboardingStatus = (typeof onboardingStatuses)[number];

export type CreateOnboardingRequestInput = {
  churchName: string;
  contactName: string;
  email: string;
  phone: string;
  country: string;
  city: string;
  websiteUrl: string;
  message?: string;
};

export async function createOnboardingRequest(input: CreateOnboardingRequestInput) {
  const request = await prisma.churchOnboardingRequest.create({
    data: {
      churchName: input.churchName,
      contactName: input.contactName,
      email: input.email,
      phone: input.phone,
      country: input.country,
      city: input.city,
      websiteUrl: input.websiteUrl,
      message: input.message || null,
    },
  });

  console.info("[onboarding] request created", {
    churchName: request.churchName,
    email: request.email,
    requestId: request.id,
  });

  return request;
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

export async function approveOnboardingRequestAndCreateChurch(id: string) {
  const request = await prisma.churchOnboardingRequest.findUnique({
    where: { id },
  });

  if (!request) {
    return {
      ok: false as const,
      reason: "missing" as const,
      message: "This onboarding request could not be found.",
    };
  }

  const slug = slugify(request.churchName);
  const existingChurch = await prisma.church.findFirst({
    where: {
      OR: [{ email: request.email }, { slug }],
    },
    select: {
      email: true,
      slug: true,
    },
  });

  if (existingChurch) {
    const reason =
      existingChurch.email === request.email
        ? "A church account already exists with this email address."
        : "A church account already exists with this generated slug.";

    return {
      ok: false as const,
      reason: "duplicate" as const,
      message: reason,
    };
  }

  const temporaryPassword = generateTemporaryPassword();
  const passwordHash = await hashPassword(temporaryPassword);

  const church = await prisma.$transaction(async (tx) => {
    const createdChurch = await tx.church.create({
      data: {
        name: request.churchName,
        churchName: request.churchName,
        slug,
        email: request.email,
        passwordHash,
        plan: "FULL_ACCESS",
        supportedLanguages: serializeListenerLanguages([...listenerLanguageOptions]),
        country: request.country,
        city: request.city,
        youtubeLiveUrl: request.websiteUrl,
        defaultSpokenLanguage: "English",
        status: "Active",
        languages: {
          create: nigeriaChurchLanguages.map((language) => ({ language })),
        },
        countries: {
          create: Array.from(new Set([request.country, ...translationCountries])).map(
            (country) => ({ country }),
          ),
        },
      },
    });

    await tx.churchOnboardingRequest.update({
      where: { id: request.id },
      data: { status: "APPROVED" },
    });

    return createdChurch;
  });

  return {
    ok: true as const,
    church,
    temporaryPassword,
  };
}

export function isOnboardingStatus(value: string): value is OnboardingStatus {
  return onboardingStatuses.includes(value as OnboardingStatus);
}

function generateTemporaryPassword() {
  const randomPart = randomBytes(6).toString("hex");

  return `SB-${randomPart}!`;
}

function slugify(value: string) {
  return (
    value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
      .slice(0, 80) || "church"
  );
}
