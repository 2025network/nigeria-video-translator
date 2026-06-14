import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "./db";
import { verifyPassword } from "./password";

export const adminSessionCookie = "nvt_admin_session";
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

