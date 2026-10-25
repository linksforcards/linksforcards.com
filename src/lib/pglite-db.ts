import { mkdirSync } from "node:fs";
import path from "node:path";
import { PGlite } from "@electric-sql/pglite";
import { applySchema, wrapPglite, type Sql } from "./sql";

async function ready(client: PGlite): Promise<PGlite> {
  await client.waitReady;
  return client;
}

export async function createLocalDatabase(): Promise<Sql> {
  const dir = path.join(process.cwd(), ".data", "pglite");
  mkdirSync(dir, { recursive: true });
  const client = await ready(new PGlite(dir));
  const db = wrapPglite(client as never);
  await applySchema(db);
  return db;
}

export async function createMemoryDatabase(): Promise<Sql> {
  const client = await ready(new PGlite("memory://"));
  const db = wrapPglite(client as never);
  await applySchema(db);
  return db;
}
