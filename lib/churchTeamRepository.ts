import { randomBytes } from "node:crypto";
import { prisma } from "./db";
import { hashPassword } from "./password";
import type { ChurchTeamRole } from "./churchPermissions";

export const churchTeamActivityActions = [
  "TEAM_LOGIN",
  "SESSION_CREATED",
  "SESSION_STARTED",
  "SESSION_ENDED",
  "BRANCH_CREATED",
  "PASSWORD_RESET",
] as const;

export type ChurchTeamActivityAction =
  (typeof churchTeamActivityActions)[number];

export async function getChurchTeamMembers(churchId: string) {
  return prisma.churchTeamMember.findMany({
    where: { churchId },
    include: { branch: true },
    orderBy: [{ isActive: "desc" }, { createdAt: "asc" }],
  });
}

export async function getChurchTeamMember(id: string, churchId: string) {
  return prisma.churchTeamMember.findFirst({
    where: { id, churchId },
    include: { branch: true },
  });
}

export async function findChurchTeamEmailConflict(emailInput: string) {
  const email = emailInput.trim().toLowerCase();
  const [church, teamMember] = await Promise.all([
    prisma.church.findUnique({ where: { email }, select: { id: true } }),
    prisma.churchTeamMember.findUnique({ where: { email }, select: { id: true } }),
  ]);

  return Boolean(church || teamMember);
}

export async function createChurchTeamMember(input: {
  churchId: string;
  name: string;
  email: string;
  password: string;
  role: ChurchTeamRole;
  branchId?: string | null;
}) {
  return prisma.churchTeamMember.create({
    data: {
      churchId: input.churchId,
      name: input.name,
      email: input.email.trim().toLowerCase(),
      passwordHash: await hashPassword(input.password),
      role: input.role,
      branchId: input.branchId || null,
      isActive: true,
    },
  });
}

export async function updateChurchTeamMember(input: {
  id: string;
  churchId: string;
  name: string;
  role: ChurchTeamRole;
  branchId?: string | null;
}) {
  return prisma.churchTeamMember.update({
    where: { id: input.id, churchId: input.churchId },
    data: {
      name: input.name,
      role: input.role,
      branchId: input.branchId || null,
    },
  });
}

export async function setChurchTeamMemberActive(
  id: string,
  churchId: string,
  isActive: boolean,
) {
  return prisma.$transaction([
    prisma.churchTeamMember.update({
      where: { id, churchId },
      data: { isActive },
    }),
    ...(!isActive
      ? [
          prisma.churchAuthSession.deleteMany({
            where: { teamMemberId: id, churchId },
          }),
        ]
      : []),
  ]);
}

export async function resetChurchTeamMemberPassword(
  id: string,
  churchId: string,
) {
  const temporaryPassword = `SB-${randomBytes(7).toString("hex")}!`;

  await prisma.$transaction([
    prisma.churchTeamMember.update({
      where: { id, churchId },
      data: { passwordHash: await hashPassword(temporaryPassword) },
    }),
    prisma.churchAuthSession.deleteMany({
      where: { teamMemberId: id, churchId },
    }),
  ]);

  return temporaryPassword;
}

export async function getChurchTeamDashboardStats(
  churchId: string,
  branchId?: string | null,
) {
  const scope = {
    churchId,
    ...(branchId ? { branchId } : {}),
  };
  const [teamCount, activeTeamCount, recentActivities] = await Promise.all([
    prisma.churchTeamMember.count({ where: scope }),
    prisma.churchTeamMember.count({ where: { ...scope, isActive: true } }),
    prisma.churchTeamActivity.findMany({
      where: scope,
      include: {
        teamMember: { select: { name: true, role: true } },
        branch: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
  ]);

  return { teamCount, activeTeamCount, recentActivities };
}

export async function logChurchTeamActivity(input: {
  churchId: string;
  teamMemberId?: string | null;
  branchId?: string | null;
  action: ChurchTeamActivityAction;
  metadata?: Record<string, string | number | boolean | null>;
}) {
  return prisma.churchTeamActivity.create({
    data: {
      churchId: input.churchId,
      teamMemberId: input.teamMemberId || null,
      branchId: input.branchId || null,
      action: input.action,
      metadata: input.metadata ? JSON.stringify(input.metadata).slice(0, 1000) : null,
    },
  });
}
