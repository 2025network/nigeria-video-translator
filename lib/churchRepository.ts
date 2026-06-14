import { prisma } from "./db";
import type { ChurchStatus } from "./demoChurches";

export type ChurchFormInput = {
  churchName: string;
  slug: string;
  country: string;
  youtubeLiveUrl: string;
  defaultSpokenLanguage: string;
  enabledTranslationCountries: string[];
  enabledLanguages: string[];
  status: "Active" | "Inactive";
};

export type ChurchWithRelations = Awaited<ReturnType<typeof getChurches>>[number];
export type ChurchView = Omit<ChurchWithRelations, "status"> & {
  status: ChurchStatus;
  enabledLanguages: string[];
  enabledTranslationCountries: string[];
};

const churchInclude = {
  languages: {
    orderBy: { language: "asc" as const },
  },
  countries: {
    orderBy: { country: "asc" as const },
  },
};

export async function getChurches() {
  return prisma.church.findMany({
    include: churchInclude,
    orderBy: { createdAt: "desc" },
  });
}

export async function getChurchById(id: string) {
  return prisma.church.findUnique({
    where: { id },
    include: churchInclude,
  });
}

export async function getChurchBySlug(slug: string) {
  return prisma.church.findFirst({
    where: {
      OR: [
        { slug },
        ...(slug === "grace-city" ? [{ slug: "christ-embassy-lagos" }] : []),
      ],
    },
    include: churchInclude,
  });
}

export async function createChurch(input: ChurchFormInput) {
  return prisma.church.create({
    data: {
      churchName: input.churchName,
      slug: input.slug,
      country: input.country,
      youtubeLiveUrl: input.youtubeLiveUrl,
      defaultSpokenLanguage: input.defaultSpokenLanguage,
      status: input.status,
      languages: {
        create: input.enabledLanguages.map((language) => ({ language })),
      },
      countries: {
        create: input.enabledTranslationCountries.map((country) => ({ country })),
      },
    },
  });
}

export async function updateChurch(id: string, input: ChurchFormInput) {
  return prisma.church.update({
    where: { id },
    data: {
      churchName: input.churchName,
      slug: input.slug,
      country: input.country,
      youtubeLiveUrl: input.youtubeLiveUrl,
      defaultSpokenLanguage: input.defaultSpokenLanguage,
      status: input.status,
      languages: {
        deleteMany: {},
        create: input.enabledLanguages.map((language) => ({ language })),
      },
      countries: {
        deleteMany: {},
        create: input.enabledTranslationCountries.map((country) => ({ country })),
      },
    },
  });
}

export async function deleteChurch(id: string) {
  return prisma.church.delete({
    where: { id },
  });
}

export function toChurchView(church: ChurchWithRelations): ChurchView {
  return {
    ...church,
    status: church.status === "Inactive" ? "Inactive" : "Active",
    enabledLanguages: church.languages.map((item) => item.language),
    enabledTranslationCountries: church.countries.map((item) => item.country),
  };
}
