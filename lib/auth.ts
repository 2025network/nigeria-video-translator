import { createHash, randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "./db";
import { logChurchTeamActivity } from "./churchTeamRepository";
import { isChurchTeamRole } from "./churchPermissions";
import { verifyPassword } from "./password";

export const adminSessionCookie = "nvt_admin_session";
export const churchSessionCookie = "sermonbridge_church_session";
const adminSessionValue = "admin-authenticated";
const cookieMaxAge = 60 * 60 * 8;

export async function loginAdmin(email: string, password: string) {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) return false;

  return verifyPassword(password, user.passwordHash);
}

export async function createAdminSession() {
  const cookieStore = await cookies();

  cookieStore.set(adminSessionCookie, adminSessionValue, {
    httpOnly: true,
    sameSite: "lax",
    secure: shouldUseSecureCookies(),
    path: "/",
    maxAge: cookieMaxAge,
  });
}

export async function loginChurch(emailInput: string, password: string) {
  const email = emailInput.trim().toLowerCase();
  const church = await prisma.church.findUnique({
    where: { email },
    select: {
      id: true,
      status: true,
      passwordHash: true,
    },
  });

  if (church) {
    if (church.status !== "Active") {
      return { ok: false as const, reason: "disabled" as const };
    }

    const passwordMatches = await verifyPassword(password, church.passwordHash);

    if (!passwordMatches) {
      return { ok: false as const, reason: "invalid" as const };
    }

    await safelyLogLogin(church.id, null, null);

    return {
      ok: true as const,
      churchId: church.id,
      teamMemberId: null,
    };
  }

  const teamMember = await prisma.churchTeamMember.findUnique({
    where: { email },
    include: {
      church: { select: { id: true, status: true } },
    },
  });

  if (!teamMember) {
    return { ok: false as const, reason: "invalid" as const };
  }

  if (
    !teamMember.isActive ||
    teamMember.church.status !== "Active" ||
    !isChurchTeamRole(teamMember.role) ||
    (teamMember.role === "BRANCH_MANAGER" && !teamMember.branchId)
  ) {
    return { ok: false as const, reason: "disabled" as const };
  }

  const passwordMatches = await verifyPassword(password, teamMember.passwordHash);

  if (!passwordMatches) {
    return { ok: false as const, reason: "invalid" as const };
  }

  await safelyLogLogin(
    teamMember.churchId,
    teamMember.id,
    teamMember.branchId,
  );

  return {
    ok: true as const,
    churchId: teamMember.churchId,
    teamMemberId: teamMember.id,
  };
}

export async function createChurchSession(
  churchId: string,
  teamMemberId: string | null = null,
) {
  const cookieStore = await cookies();
  const currentToken = cookieStore.get(churchSessionCookie)?.value;

  if (currentToken) {
    await prisma.churchAuthSession.deleteMany({
      where: { tokenHash: hashSessionToken(currentToken) },
    });
  }

  const rawToken = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + cookieMaxAge * 1000);

  await prisma.churchAuthSession.create({
    data: {
      tokenHash: hashSessionToken(rawToken),
      churchId,
      teamMemberId,
      expiresAt,
    },
  });

  cookieStore.set(churchSessionCookie, rawToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: shouldUseSecureCookies(),
    path: "/",
    maxAge: cookieMaxAge,
  });
}

export async function getChurchAuthSession() {
  const cookieStore = await cookies();
  const rawToken = cookieStore.get(churchSessionCookie)?.value;

  if (!rawToken) return null;

  const session = await prisma.churchAuthSession.findUnique({
    where: { tokenHash: hashSessionToken(rawToken) },
    include: {
      church: {
        select: {
          id: true,
          churchName: true,
          email: true,
          status: true,
        },
      },
      teamMember: {
        select: {
          id: true,
          churchId: true,
          name: true,
          email: true,
          role: true,
          branchId: true,
          isActive: true,
        },
      },
    },
  });

  if (
    !session ||
    session.expiresAt.getTime() <= Date.now() ||
    session.church.status !== "Active" ||
    (session.teamMemberId &&
      (!session.teamMember ||
        !session.teamMember.isActive ||
        session.teamMember.churchId !== session.churchId))
  ) {
    if (session) {
      await prisma.churchAuthSession.delete({ where: { id: session.id } });
    }

    return null;
  }

  return session;
}

export async function clearChurchSession() {
  const cookieStore = await cookies();
  const rawToken = cookieStore.get(churchSessionCookie)?.value;

  if (rawToken) {
    await prisma.churchAuthSession.deleteMany({
      where: { tokenHash: hashSessionToken(rawToken) },
    });
  }

  cookieStore.delete(churchSessionCookie);
}

export async function clearAdminSession() {
  const cookieStore = await cookies();
  cookieStore.delete(adminSessionCookie);
}

export async function requireAdminSession() {
  const cookieStore = await cookies();
  const cookieValue = cookieStore.get(adminSessionCookie)?.value;
  const authenticated = cookieValue === adminSessionValue;

  if (!authenticated) {
    redirect("/admin/login");
  }
}

async function safelyLogLogin(
  churchId: string,
  teamMemberId: string | null,
  branchId: string | null,
) {
  try {
    await logChurchTeamActivity({
      churchId,
      teamMemberId,
      branchId,
      action: "TEAM_LOGIN",
    });
  } catch {
    console.error("[church-auth] login activity could not be recorded");
  }
}

function hashSessionToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function shouldUseSecureCookies() {
  if (process.env.AUTH_COOKIE_SECURE === "true") return true;
  if (process.env.AUTH_COOKIE_SECURE === "false") return false;
  return (process.env.NEXT_PUBLIC_SITE_URL ?? "").startsWith("https://");
}
