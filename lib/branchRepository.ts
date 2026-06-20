import { prisma } from "./db";
import { getCountryByCodeOrName } from "./countryCatalog";

export type BranchFormInput = {
  name: string;
  slug: string;
  location: string;
  pastorName?: string;
  email?: string;
  phone?: string;
  country?: string;
  state?: string;
  city?: string;
  address?: string;
  description?: string;
  bannerUrl?: string;
  logoUrl?: string;
};

export async function getBranchesForChurch(churchId: string) {
  return prisma.churchBranch.findMany({
    where: { churchId },
    orderBy: { createdAt: "asc" },
  });
}

export async function getBranchForChurch(branchId: string, churchId: string) {
  return prisma.churchBranch.findFirst({
    where: { id: branchId, churchId },
  });
}

export async function getBranchByChurchAndSlug(churchSlug: string, branchSlug: string) {
  return prisma.churchBranch.findFirst({
    where: {
      slug: branchSlug,
      church: { slug: churchSlug },
    },
    include: {
      church: {
        include: {
          languages: { orderBy: { language: "asc" } },
          countries: { orderBy: { country: "asc" } },
          branches: { orderBy: { createdAt: "asc" } },
        },
      },
    },
  });
}

export async function getPublicBranchBySlugs(churchSlug: string, branchSlug: string) {
  return prisma.churchBranch.findFirst({
    where: {
      slug: branchSlug,
      church: { slug: churchSlug, status: "Active" },
    },
    include: {
      church: {
        include: {
          languages: { orderBy: { language: "asc" } },
          countries: { orderBy: { country: "asc" } },
        },
      },
    },
  });
}

export async function createBranch(churchId: string, input: BranchFormInput) {
  const slug = await createUniqueBranchSlug(churchId, input.slug || input.name);

  return prisma.churchBranch.create({
    data: {
      churchId,
      name: input.name,
      slug,
      ...normalizeBranchInput(input),
    },
  });
}

export async function updateBranch(branchId: string, churchId: string, input: BranchFormInput) {
  const branch = await prisma.churchBranch.findUnique({
    where: { id: branchId },
    select: { churchId: true },
  });

  if (!branch || branch.churchId !== churchId) {
    throw new Error("Branch not found.");
  }

  const slug = await createUniqueBranchSlug(branch.churchId, input.slug || input.name, branchId);

  return prisma.churchBranch.update({
    where: { id: branchId },
    data: {
      name: input.name,
      slug,
      ...normalizeBranchInput(input),
    },
  });
}

export async function disableBranch(branchId: string, churchId?: string) {
  return prisma.churchBranch.updateMany({
    where: { id: branchId, ...(churchId ? { churchId } : {}) },
    data: { disabledAt: new Date() },
  });
}

export async function activateBranch(branchId: string, churchId?: string) {
  return prisma.churchBranch.updateMany({
    where: { id: branchId, ...(churchId ? { churchId } : {}) },
    data: { disabledAt: null },
  });
}

export async function deleteBranch(branchId: string, churchId?: string) {
  return prisma.churchBranch.deleteMany({
    where: { id: branchId, ...(churchId ? { churchId } : {}) },
  });
}

function normalizeBranchInput(input: BranchFormInput) {
  const country = input.country
    ? getCountryByCodeOrName(input.country)?.name ?? input.country
    : "";
  return {
    location: [input.city, input.state, country].filter(Boolean).join(", ") || input.location,
    pastorName: input.pastorName || null,
    email: input.email || null,
    phone: input.phone || null,
    country,
    state: input.state || "",
    city: input.city || "",
    address: input.address || "",
    description: input.description || null,
    bannerUrl: input.bannerUrl || null,
    logoUrl: input.logoUrl || null,
  };
}

async function createUniqueBranchSlug(churchId: string, value: string, currentBranchId?: string) {
  const baseSlug = slugify(value) || "branch";
  let candidate = baseSlug;
  let suffix = 2;

  while (await branchSlugBelongsToAnotherBranch(churchId, candidate, currentBranchId)) {
    candidate = `${baseSlug}-${suffix}`;
    suffix += 1;
  }

  return candidate;
}

async function branchSlugBelongsToAnotherBranch(
  churchId: string,
  slug: string,
  currentBranchId?: string,
) {
  const existing = await prisma.churchBranch.findUnique({
    where: { churchId_slug: { churchId, slug } },
    select: { id: true },
  });

  return Boolean(existing && existing.id !== currentBranchId);
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 80);
}
