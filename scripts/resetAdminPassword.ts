import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { prisma } from "../lib/db";
import { hashPassword } from "../lib/password";

const terminal = createInterface({ input, output });

try {
  const email = (await terminal.question("Admin email: ")).trim().toLowerCase();
  const password = await terminal.question("New password (minimum 8 characters): ");

  if (!email || password.length < 8) {
    throw new Error("A valid email and password of at least 8 characters are required.");
  }

  const admin = await prisma.user.findUnique({ where: { email }, select: { id: true } });

  if (!admin) {
    throw new Error(`No admin account was found for ${email}.`);
  }

  await prisma.user.update({
    where: { id: admin.id },
    data: { passwordHash: await hashPassword(password) },
  });

  output.write(`Admin password updated for ${email}.\n`);
} catch (error) {
  const message = error instanceof Error ? error.message : "Password reset failed.";
  output.write(`Error: ${message}\n`);
  process.exitCode = 1;
} finally {
  terminal.close();
  await prisma.$disconnect();
}
