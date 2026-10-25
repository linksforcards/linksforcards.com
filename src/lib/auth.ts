import { randomBytes } from "node:crypto";
import bcrypt from "bcryptjs";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import {
  DUMMY_HASH,
  SESSION_MS,
  WINDOW_MS,
  emailsMatch,
  hashToken,
  isBcryptHash,
  lockDecision,
  readEnv,
} from "./auth-core";
import { getDatabase } from "./db";
import { num } from "./sql";

export const SESSION_COOKIE = "lfc_session";

function cookieOptions(maxAge = SESSION_MS / 1000) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge,
  };
}

export async function clientIp(): Promise<string> {
  const headerList = await headers();
  const forwarded = headerList.get("x-forwarded-for");
  const raw = (forwarded ? forwarded.split(",")[0] : headerList.get("x-real-ip"))?.trim() || "unknown";
  return raw.slice(0, 64) || "unknown";
}

async function failCount(column: "email" | "ip", value: string, since: string): Promise<number> {
  const db = await getDatabase();
  if (!db) return 0;
  const sql =
    column === "email"
      ? `SELECT COUNT(*) AS n FROM login_attempts WHERE email = $1 AND success = 0 AND attempted_at > $2`
      : `SELECT COUNT(*) AS n FROM login_attempts WHERE ip = $1 AND success = 0 AND attempted_at > $2`;
  const rows = await db.query<{ n: unknown }>(sql, [value, since]);
  return num(rows[0]?.n);
}

export async function getSession(): Promise<{ email: string } | null> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const tokenHash = hashToken(token);
  if (!tokenHash) return null;
  const db = await getDatabase();
  if (!db) return null;
  const rows = await db.query<{ email: string; expires_at: string }>(
    `SELECT email, expires_at FROM sessions WHERE token_hash = $1`,
    [tokenHash],
  );
  const row = rows[0];
  if (!row) return null;
  if (row.expires_at < new Date().toISOString()) {
    await db.query(`DELETE FROM sessions WHERE token_hash = $1`, [tokenHash]);
    return null;
  }
  return { email: row.email };
}

export async function requireSession(): Promise<{ email: string }> {
  const session = await getSession();
  if (!session) redirect("/admin/login");
  return session;
}

export type LoginResult = { error: "config" | "locked" | "invalid" };

export async function attemptLogin(emailInput: string, password: string, ip: string): Promise<LoginResult | { ok: true; token: string }> {
  const db = await getDatabase();
  if (!db) return { error: "config" };
  const adminEmail = readEnv("ADMIN_EMAIL").toLowerCase();
  const passwordHash = readEnv("ADMIN_PASSWORD_HASH");
  if (!adminEmail || !isBcryptHash(passwordHash) || !hashToken("check")) return { error: "config" };

  const email = emailInput.trim().toLowerCase().slice(0, 200);
  const since = new Date(Date.now() - WINDOW_MS).toISOString();
  const [emailFails, ipFails] = await Promise.all([failCount("email", email, since), failCount("ip", ip, since)]);
  if (lockDecision(emailFails, ipFails)) return { error: "locked" };

  const emailOk = emailsMatch(email, adminEmail);
  const passwordOk = await bcrypt.compare(password, emailOk ? passwordHash : DUMMY_HASH);
  const now = new Date().toISOString();
  await db.query(`DELETE FROM login_attempts WHERE attempted_at < $1`, [
    new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  ]);
  if (!emailOk || !passwordOk) {
    await db.query(`INSERT INTO login_attempts (id, email, ip, success, attempted_at) VALUES ($1, $2, $3, 0, $4)`, [
      crypto.randomUUID(),
      email || "unknown",
      ip,
      now,
    ]);
    return { error: "invalid" };
  }

  await db.query(`INSERT INTO login_attempts (id, email, ip, success, attempted_at) VALUES ($1, $2, $3, 1, $4)`, [
    crypto.randomUUID(),
    email,
    ip,
    now,
  ]);
  const token = randomBytes(32).toString("base64url");
  const tokenHash = hashToken(token);
  if (!tokenHash) return { error: "config" };
  await db.query(`INSERT INTO sessions (token_hash, email, expires_at, created_at) VALUES ($1, $2, $3, $4)`, [
    tokenHash,
    adminEmail,
    new Date(Date.now() + SESSION_MS).toISOString(),
    now,
  ]);
  return { ok: true, token };
}

export async function clearSessionCookie(): Promise<void> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (token) {
    const tokenHash = hashToken(token);
    const db = await getDatabase();
    if (tokenHash && db) await db.query(`DELETE FROM sessions WHERE token_hash = $1`, [tokenHash]);
  }
  jar.set(SESSION_COOKIE, "", cookieOptions(0));
}

export async function writeSessionCookie(token: string): Promise<void> {
  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, cookieOptions());
}
