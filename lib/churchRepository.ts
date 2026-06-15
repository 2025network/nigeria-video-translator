import { prisma } from "./db";
import type { ChurchStatus } from "./demoChurches";
import { parseListenerLanguages, serializeListenerLanguages } from "./listenerLanguages";
import { hashPassword } from "./password";

export type ChurchFormInput = {
  name: string;
  churchName: string;
  slug: string;
  email: string;
  password?: string;
  plan: string;
  supportedLanguages: string[];
  country: string;
  city?: string;
  youtubeLiveUrl: string;
  defaultSpokenLanguage: string;
  enabledTranslationCountries: string[];
  enabledLanguages: string[];
  status: "Active" | "Inactive";
};

export type ChurchProfileInput = {
  churchName: string;
  logoUrl?: string;
  bannerUrl?: string;
  description?: string;
  pastorName?: string;
  phone?: string;
  websiteUrl?: string;
  facebookUrl?: string;
  youtubeUrl?: string;
  instagramUrl?: string;
  country: string;
  city: string;
  address?: string;
};

export type ChurchWithRelations = Awaited<ReturnType<typeof getChurches>>[number];
export type ChurchView = Omit<ChurchWithRelations, "status" | "supportedLanguages"> & {
  status: ChurchStatus;
  supportedLanguages: string[];
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
  branches: {
    orderBy: { createdAt: "asc" as const },
  },
};

export async function getChurches() {
  return prisma.church.findMany({
    include: churchInclude,
    orderBy: { createdAt: "desc" },
  });
}

export async function getActiveChurches() {
  return prisma.church.findMany({
    where: { status: "Active" },
    include: churchInclude,
    orderBy: { churchName: "asc" },
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
  const slug = await createUniqueSlug(input.slug || input.name || input.churchName);
  const passwordHash = await hashPassword(input.password || "Church123!");

  return prisma.church.create({
    data: {
      name: input.name,
      churchName: input.churchName,
      slug,
      email: input.email,
      passwordHash,
      plan: input.plan,
      supportedLanguages: serializeListenerLanguages(input.supportedLanguages),
      country: input.country,
      city: input.city ?? "",
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
  const slug = await createUniqueSlug(input.slug || input.name || input.churchName, id);

  return prisma.church.update({
    where: { id },
    data: {
      name: input.name,
      churchName: input.churchName,
      slug,
      email: input.email,
      plan: input.plan,
      supportedLanguages: serializeListenerLanguages(input.supportedLanguages),
      ...(input.password ? { passwordHash: await hashPassword(input.password) } : {}),
      country: input.country,
      city: input.city ?? "",
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

export async function updateChurchProfile(id: string, input: ChurchProfileInput) {
  return prisma.church.update({
    where: { id },
    data: {
      name: input.churchName,
      churchName: input.churchName,
      logoUrl: input.logoUrl || null,
      bannerUrl: input.bannerUrl || null,
      description: input.description || null,
      pastorName: input.pastorName || null,
      phone: input.phone || null,
      websiteUrl: input.websiteUrl || null,
      facebookUrl: input.facebookUrl || null,
      youtubeUrl: input.youtubeUrl || null,
      instagramUrl: input.instagramUrl || null,
      country: input.country,
      city: input.city,
      address: input.address || null,
    },
  });
}

export async function disableChurch(id: string) {
  return prisma.church.update({
    where: { id },
    data: {
      status: "Inactive",
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
    supportedLanguages: parseListenerLanguages(church.supportedLanguages),
    enabledLanguages: church.languages.map((item) => item.language),
    enabledTranslationCountries: church.countries.map((item) => item.country),
  };
}

async function createUniqueSlug(value: string, currentChurchId?: string) {
  const baseSlug = slugify(value) || "church";
  let candidate = baseSlug;
  let suffix = 2;

  while (await slugBelongsToAnotherChurch(candidate, currentChurchId)) {
    candidate = `${baseSlug}-${suffix}`;
    suffix += 1;
  }

  return candidate;
}

async function slugBelongsToAnotherChurch(slug: string, currentChurchId?: string) {
  const existing = await prisma.church.findUnique({
    where: { slug },
    select: { id: true },
  });

  return Boolean(existing && existing.id !== currentChurchId);
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 80);
}
