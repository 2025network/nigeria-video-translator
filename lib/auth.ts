import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "./db";
import { verifyPassword } from "./password";

export const adminSessionCookie = "nvt_admin_session";
export const churchSessionCookie = "sermonbridge_church_session";
const sessionValue = "admin-authenticated";

export async function loginAdmin(email: string, password: string) {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) return false;

  return verifyPassword(password, user.passwordHash);
}

export async function createAdminSession() {
  const cookieStore = await cookies();

  cookieStore.set(adminSessionCookie, sessionValue, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8,
  });
}

export async function loginChurch(email: string, password: string) {
  const church = await prisma.church.findUnique({
    where: { email: email.trim().toLowerCase() },
    select: {
      id: true,
      status: true,
      passwordHash: true,
    },
  });

  if (!church) {
    return { ok: false as const, reason: "invalid" as const };
  }

  if (church.status !== "Active") {
    return { ok: false as const, reason: "disabled" as const };
  }

  const passwordMatches = await verifyPassword(password, church.passwordHash);

  if (!passwordMatches) {
    return { ok: false as const, reason: "invalid" as const };
  }

  return { ok: true as const, churchId: church.id };
}

export async function createChurchSession(churchId: string) {
  const cookieStore = await cookies();

  cookieStore.set(churchSessionCookie, churchId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8,
  });
}

export async function clearChurchSession() {
  const cookieStore = await cookies();

  cookieStore.delete(churchSessionCookie);
}

export async function clearAdminSession() {
  const cookieStore = await cookies();

  cookieStore.delete(adminSessionCookie);
}

export async function requireAdminSession() {
  const cookieStore = await cookies();
  const authenticated = cookieStore.get(adminSessionCookie)?.value === sessionValue;

  if (!authenticated) {
    redirect("/admin/login");
  }
}

