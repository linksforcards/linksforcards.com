import { wrapPostgres, type Sql } from "./sql";
import { applySchema } from "./sql";

const globalForDb = globalThis as unknown as { lfcSql?: Promise<Sql | null> };

export function databaseUrl(): string {
  return process.env.DATABASE_URL || process.env.POSTGRES_URL || "";
}

export function localDbAllowed(): boolean {
  if (process.env.VERCEL) return false;
  if (process.env.NEXT_PHASE === "phase-production-build") return false;
  if (process.env.npm_lifecycle_event === "build") return false;
  if (databaseUrl()) return false;
  if (process.env.NODE_ENV !== "production") return true;
  return process.env.LOCAL_DB === "1";
}

function sslFor(url: string): false | "require" {
  if (process.env.DATABASE_SSL === "disable") return false;
  if (url.includes("sslmode=disable")) return false;
  if (/@(localhost|127\.0\.0\.1)(:|\/)/.test(url)) return false;
  return "require";
}

async function openDatabase(): Promise<Sql | null> {
  const url = databaseUrl();
  if (url) {
    const postgres = (await import("postgres")).default;
    const client = postgres(url, {
      max: 1,
      prepare: false,
      ssl: sslFor(url),
      connect_timeout: 15,
      idle_timeout: 20,
    });
    const db = wrapPostgres(client as never);
    await applySchema(db);
    return db;
  }
  if (!localDbAllowed()) return null;
  const { createLocalDatabase } = await import("./pglite-db");
  return createLocalDatabase();
}

export function getDatabase(): Promise<Sql | null> {
  if (!globalForDb.lfcSql) {
    globalForDb.lfcSql = openDatabase().catch((error: unknown) => {
      globalForDb.lfcSql = undefined;
      throw error;
    });
  }
  return globalForDb.lfcSql;
}

export function usingLocalDatabase(): boolean {
  return !databaseUrl() && localDbAllowed();
}
