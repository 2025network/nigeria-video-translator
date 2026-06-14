import { prisma } from "./db";

export type BranchFormInput = {
  name: string;
  slug: string;
  location: string;
};

export async function getBranchesForChurch(churchId: string) {
  return prisma.churchBranch.findMany({
    where: { churchId },
    orderBy: { createdAt: "asc" },
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

export async function createBranch(churchId: string, input: BranchFormInput) {
  const slug = await createUniqueBranchSlug(churchId, input.slug || input.name);

  return prisma.churchBranch.create({
    data: {
      churchId,
      name: input.name,
      slug,
      location: input.location,
    },
  });
}

export async function updateBranch(branchId: string, input: BranchFormInput) {
  const branch = await prisma.churchBranch.findUnique({
    where: { id: branchId },
    select: { churchId: true },
  });

  if (!branch) {
    throw new Error("Branch not found.");
  }

  const slug = await createUniqueBranchSlug(branch.churchId, input.slug || input.name, branchId);

  return prisma.churchBranch.update({
    where: { id: branchId },
    data: {
      name: input.name,
      slug,
      location: input.location,
    },
  });
}

export async function disableBranch(branchId: string) {
  return prisma.churchBranch.update({
    where: { id: branchId },
    data: { disabledAt: new Date() },
  });
}

export async function deleteBranch(branchId: string) {
  return prisma.churchBranch.delete({
    where: { id: branchId },
  });
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
