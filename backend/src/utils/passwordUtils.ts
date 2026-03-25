import { randomBytes, scryptSync, timingSafeEqual } from "crypto";

const KEYLEN = 64;

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, KEYLEN).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, storedHash: string): boolean {
  const [salt, originalHash] = storedHash.split(":");
  if (!salt || !originalHash) {
    return false;
  }

  const hashBuffer = Buffer.from(originalHash, "hex");
  const inputBuffer = scryptSync(password, salt, KEYLEN);

  if (hashBuffer.length !== inputBuffer.length) {
    return false;
  }

  return timingSafeEqual(hashBuffer, inputBuffer);
}

export function generateAuthToken(): string {
  return randomBytes(32).toString("hex");
}
