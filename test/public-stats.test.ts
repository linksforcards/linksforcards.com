import { randomUUID } from "node:crypto";
import { describe, expect, it } from "vitest";
import { getSetCards } from "../src/lib/catalog";
import { replaceDemoData } from "../src/lib/demo";
import { createMemoryDatabase } from "../src/lib/pglite-db";
import { readPublic } from "../src/lib/stats";

describe("public stats", () => {
  it("ignores demo shipments and counts a real card", async () => {
    const db = await createMemoryDatabase();
    await replaceDemoData(db);
    const hidden = await readPublic(db);
    expect(hidden.differentCards).toBe(0);
    expect(hidden.copies).toBe(0);
    expect(hidden.shops).toEqual([]);
    expect(hidden.updates).toEqual([]);

    const card = (getSetCards("base1") ?? []).find((item) => item.name === "Magikarp");
    expect(card).toMatchObject({ n: "35", dex: [129] });
    const now = new Date().toISOString();
    const shop = randomUUID();
    const shipment = randomUUID();
    await db.query(
      `INSERT INTO shops (id, name, country, website, contact, is_public, is_demo, created_at)
       VALUES ($1, $2, $3, $4, $5, 1, 0, $6)`,
      [shop, "River Cards", "Netherlands", "https://example.com/river", "a@example.com", now],
    );
    await db.query(
      `INSERT INTO shipments (id, shop_id, received_on, notes, is_demo, created_at)
       VALUES ($1, $2, $3, '', 0, $4)`,
      [shipment, shop, "2026-10-01", now],
    );
    await db.query(
      `INSERT INTO shipment_cards (id, shipment_id, set_id, card_number, card_name, quantity, dex_numbers)
       VALUES ($1, $2, 'base1', $3, $4, 2, '129')`,
      [randomUUID(), shipment, card?.n, card?.name],
    );
    const shown = await readPublic(db);
    expect(shown.state).toBe("ok");
    expect(shown.differentCards).toBe(1);
    expect(shown.copies).toBe(2);
    expect(shown.species).toEqual([129]);
    expect(shown.setCounts.base1).toBe(1);
    expect(shown.shops[0]).toMatchObject({ name: "River Cards", country: "Netherlands", generations: [1] });
    expect(shown.shops[0]?.website).toBe("https://example.com/river");
  });
});
