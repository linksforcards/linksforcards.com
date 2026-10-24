import { randomUUID } from "node:crypto";
import { getSetCards, getSets, type CatalogCard } from "./catalog";
import { formatDexList } from "./cards";
import { todayIso } from "./format";
import type { Sql } from "./sql";

function findNamed(name: string): { setId: string; card: CatalogCard } | null {
  for (const set of getSets()) {
    const card = (getSetCards(set.id) ?? []).find((item) => item.name.toLowerCase() === name.toLowerCase());
    if (card) return { setId: set.id, card };
  }
  return null;
}

type Draft = { setId: string; card: CatalogCard; qty: number };

export async function replaceDemoData(db: Sql): Promise<void> {
  const base = getSetCards("base1") ?? [];
  const paldea = getSetCards("sv4pt5") ?? [];
  const drafts: Draft[] = [];
  const magikarp = findNamed("Magikarp");
  for (const card of base.filter((item) => item.k === "p").slice(0, 8)) {
    drafts.push({ setId: "base1", card, qty: magikarp?.card.n === card.n && magikarp.setId === "base1" ? 24 : 1 });
  }
  if (magikarp && !drafts.some((item) => item.setId === magikarp.setId && item.card.n === magikarp.card.n)) {
    drafts.push({ setId: magikarp.setId, card: magikarp.card, qty: 24 });
  }
  for (const card of paldea.slice(0, 6)) drafts.push({ setId: "sv4pt5", card, qty: 1 });
  if (!drafts.length) throw new Error("Catalog is missing the demo sets");

  const now = new Date().toISOString();
  const day = todayIso();
  await db.transaction(async (tx) => {
    await tx.query(`DELETE FROM shops WHERE is_demo = 1`);
    await tx.query(`DELETE FROM updates WHERE is_demo = 1`);
    await tx.query(`DELETE FROM binders WHERE is_demo = 1`);

    const corner = randomUUID();
    const river = randomUUID();
    await tx.query(
      `INSERT INTO shops (id, name, country, website, contact, is_public, is_demo, created_at)
       VALUES ($1, $2, $3, $4, $5, 1, 1, $6)`,
      [corner, "DEMO — Corner Shop Cards", "Germany", "https://example.com/demo-corner-shop", "demo@example.com", now],
    );
    await tx.query(
      `INSERT INTO shops (id, name, country, website, contact, is_public, is_demo, created_at)
       VALUES ($1, $2, $3, $4, $5, 1, 1, $6)`,
      [river, "DEMO — River Market Cards", "Netherlands", "https://example.com/demo-river-market", "demo@example.com", now],
    );

    async function ship(shopId: string, rows: Draft[]) {
      if (!rows.length) return;
      const shipmentId = randomUUID();
      await tx.query(
        `INSERT INTO shipments (id, shop_id, received_on, notes, is_demo, created_at)
         VALUES ($1, $2, $3, $4, 1, $5)`,
        [shipmentId, shopId, day, "Local demo only. Not a real parcel.", now],
      );
      for (const row of rows) {
        await tx.query(
          `INSERT INTO shipment_cards (id, shipment_id, set_id, card_number, card_name, quantity, dex_numbers)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [randomUUID(), shipmentId, row.setId, row.card.n, row.card.name, row.qty, formatDexList(row.card.dex ?? [])],
        );
      }
    }

    await ship(
      corner,
      drafts.filter((row) => row.setId !== "sv4pt5"),
    );
    await ship(
      river,
      drafts.filter((row) => row.setId === "sv4pt5"),
    );
  });
}

export function demoToolsEnabled(): boolean {
  if (process.env.VERCEL) return false;
  if (process.env.NEXT_PHASE === "phase-production-build") return false;
  return process.env.NODE_ENV !== "production" || process.env.LOCAL_DB === "1";
}
