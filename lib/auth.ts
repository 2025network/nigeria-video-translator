import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "./db";
import { verifyPassword } from "./password";

export const adminSessionCookie = "nvt_admin_session";
export const churchSessionCookie = "sermonbridge_church_session";
const sessionValue = "admin-authenticated";
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

  cookieStore.set(adminSessionCookie, sessionValue, {
    httpOnly: true,
    sameSite: "lax",
    secure: shouldUseSecureCookies(),
    path: "/",
    maxAge: cookieMaxAge,
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
    secure: shouldUseSecureCookies(),
    path: "/",
    maxAge: cookieMaxAge,
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
  const cookieValue = cookieStore.get(adminSessionCookie)?.value;
  const authenticated = cookieValue === sessionValue;

  if (!authenticated) {
    redirect("/admin/login");
  }
}

function shouldUseSecureCookies() {
  if (process.env.AUTH_COOKIE_SECURE === "true") {
    return true;
  }

  if (process.env.AUTH_COOKIE_SECURE === "false") {
    return false;
  }

  return (process.env.NEXT_PUBLIC_SITE_URL ?? "").startsWith("https://");
}

