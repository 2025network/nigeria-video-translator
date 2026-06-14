import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const scrypt = promisify(scryptCallback);
const keyLength = 64;

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const derivedKey = (await scrypt(password, salt, keyLength)) as Buffer;

  return `${salt}:${derivedKey.toString("hex")}`;
}

export async function verifyPassword(password: string, storedHash: string) {
  const [salt, hash] = storedHash.split(":");

  if (!salt || !hash) return false;

  const hashedBuffer = Buffer.from(hash, "hex");
  const derivedKey = (await scrypt(password, salt, keyLength)) as Buffer;

  if (hashedBuffer.length !== derivedKey.length) return false;

  return timingSafeEqual(hashedBuffer, derivedKey);
}

