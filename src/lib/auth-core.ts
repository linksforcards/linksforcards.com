import { createHash, timingSafeEqual } from "node:crypto";

export const EMAIL_FAIL_LIMIT = 5;
export const IP_FAIL_LIMIT = 30;
export const WINDOW_MS = 15 * 60 * 1000;
export const SESSION_MS = 14 * 24 * 60 * 60 * 1000;

/** A real bcrypt hash of a throwaway string, so a wrong email still pays the compare cost. */
export const DUMMY_HASH = "$2a$12$xRESjbysDUQlXAHThrZa6Ok4uRzHqSX9HA4oefPcmLdk7XUntYhmq";

export function lockDecision(emailFails: number, ipFails: number): "email" | "ip" | null {
  if (emailFails >= EMAIL_FAIL_LIMIT) return "email";
  if (ipFails >= IP_FAIL_LIMIT) return "ip";
  return null;
}

export function emailsMatch(left: string, right: string): boolean {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export function isBcryptHash(value: string): boolean {
  return /^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$/.test(value);
}

export function readEnv(name: string): string {
  let value = (process.env[name] || "").trim();
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    value = value.slice(1, -1);
  }
  return value;
}

export function hashToken(token: string): string | null {
  const secret = readEnv("SESSION_SECRET");
  if (secret.length < 16) return null;
  return createHash("sha256").update(`${secret}:${token}`).digest("hex");
}
