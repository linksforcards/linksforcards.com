import type { Metadata } from "next";
import { LoginForm } from "@/components/admin/login-form";
import { isBcryptHash, readEnv } from "@/lib/auth-core";
import { databaseUrl, localDbAllowed } from "@/lib/db";
import { site } from "@/lib/site";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Sign in", robots: { index: false, follow: false } };

function signInReady(): boolean {
  return Boolean(
    readEnv("ADMIN_EMAIL") &&
      isBcryptHash(readEnv("ADMIN_PASSWORD_HASH")) &&
      readEnv("SESSION_SECRET").length >= 16 &&
      (databaseUrl() || localDbAllowed()),
  );
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const query = await searchParams;
  const code = Array.isArray(query.e) ? query.e[0] : query.e;
  const notice = signInReady()
    ? code === "config"
      ? "The database is not available from this server."
      : null
    : "Sign-in is not configured yet. Set ADMIN_EMAIL, ADMIN_PASSWORD_HASH, and SESSION_SECRET. On the host, also set DATABASE_URL. Locally, next dev uses an embedded database when DATABASE_URL is empty.";

  return (
    <main className="admin-narrow">
      <p className="stamp">Private</p>
      <p className="kicker">{site.sender}</p>
      <h1>Sign in</h1>
      <p>This page is only for me. It is not indexed.</p>
      <LoginForm notice={notice} />
      <p>
        <a href="/">Back to the public site</a>
      </p>
    </main>
  );
}
