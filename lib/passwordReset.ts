import { createHash, randomBytes } from "node:crypto";
import { prisma } from "./db";
import { isSmtpConfigured } from "./emailService";
import { hashPassword } from "./password";

export type PasswordResetAccountType = "admin" | "church";

const tokenLifetimeMs = 60 * 60 * 1000;

export async function createPasswordResetToken(
  emailInput: string,
  accountType: PasswordResetAccountType,
) {
  const email = emailInput.trim().toLowerCase();
  const accountExists =
    accountType === "admin"
      ? Boolean(await prisma.user.findUnique({ where: { email }, select: { id: true } }))
      : Boolean(await prisma.church.findUnique({ where: { email }, select: { id: true } }));

  if (!accountExists) return null;

  const rawToken = `${accountType}.${randomBytes(32).toString("hex")}`;
  const tokenHash = hashResetToken(rawToken);
  const now = new Date();

  await prisma.passwordResetToken.updateMany({
    where: { email, usedAt: null },
    data: { usedAt: now },
  });

  await prisma.passwordResetToken.create({
    data: {
      email,
      token: tokenHash,
      expiresAt: new Date(now.getTime() + tokenLifetimeMs),
    },
  });

  return rawToken;
}

export async function resetPasswordWithToken(input: {
  token: string;
  password: string;
  accountType: PasswordResetAccountType;
}) {
  if (!input.token.startsWith(`${input.accountType}.`)) {
    return { ok: false as const, reason: "invalid" as const };
  }

  const tokenRecord = await prisma.passwordResetToken.findUnique({
    where: { token: hashResetToken(input.token) },
  });

  if (!tokenRecord || tokenRecord.usedAt) {
    return { ok: false as const, reason: "invalid" as const };
  }

  if (tokenRecord.expiresAt.getTime() <= Date.now()) {
    return { ok: false as const, reason: "expired" as const };
  }

  const passwordHash = await hashPassword(input.password);
  const account =
    input.accountType === "admin"
      ? await prisma.user.findUnique({ where: { email: tokenRecord.email }, select: { id: true } })
      : await prisma.church.findUnique({ where: { email: tokenRecord.email }, select: { id: true } });

  if (!account) {
    return { ok: false as const, reason: "invalid" as const };
  }

  await prisma.$transaction([
    input.accountType === "admin"
      ? prisma.user.update({ where: { id: account.id }, data: { passwordHash } })
      : prisma.church.update({ where: { id: account.id }, data: { passwordHash } }),
    prisma.passwordResetToken.update({
      where: { id: tokenRecord.id },
      data: { usedAt: new Date() },
    }),
  ]);

  return { ok: true as const, email: tokenRecord.email };
}

export function buildPasswordResetUrl(
  accountType: PasswordResetAccountType,
  rawToken: string,
) {
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
  return `${siteUrl}/${accountType}/reset-password?token=${encodeURIComponent(rawToken)}`;
}

export function shouldShowDevelopmentResetLink() {
  return process.env.NODE_ENV !== "production" && !isSmtpConfigured();
}

function hashResetToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}
