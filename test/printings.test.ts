import { randomUUID } from "node:crypto";
import { PGlite } from "@electric-sql/pglite";
import { describe, expect, it } from "vitest";
import { getMeta, getSetCards } from "../src/lib/catalog";
import { formatHeldLanguages, listCardPaths } from "../src/lib/card-page";
import { fill } from "../src/lib/format";
import { getMessages } from "../src/lib/i18n";
import { inventoryIdentity, resolveShipmentLines, WESTERN_LOOKUP_CAP } from "../src/lib/inventory";
import { CARD_INDEX_LOCALES, LOCALES } from "../src/lib/locales";
import { createMemoryDatabase } from "../src/lib/pglite-db";
import { applySchema, wrapPglite, type Sql } from "../src/lib/sql";
import { sitemapEntries } from "../src/lib/sitemap-data";
import { otherLanguagesHeld, readPublic } from "../src/lib/stats";
import { clearTcgdexCache, getTcgdexCard, localizedImageUrl, tcgdexIdForCatalog } from "../src/lib/tcgdex";
import { cardImageUrl } from "../src/lib/card-images";
import { readAdmin } from "../src/lib/admin-data";

describe("printing identity", () => {
  it("maps a western id onto the English card and keeps an Asian id separate", () => {
    const english = inventoryIdentity("en", "swsh3", "136");
    const german = inventoryIdentity("de", "SWSH3", "136");
    expect(english).toEqual({ kind: "catalog", setId: "swsh3", number: "136" });
    expect(german).toEqual(english);

    const japanese = inventoryIdentity("ja", "swsh3", "136");
    expect(japanese).toEqual({ kind: "local", language: "ja", setId: "swsh3", number: "136" });
    expect(japanese).not.toEqual(english);

    const simplified = inventoryIdentity("zh-cn", "sv7", "001");
    const westernPadded = inventoryIdentity("en", "sv7", "001");
    expect(simplified?.kind).toBe("local");
    expect(westernPadded?.kind).toBe("catalog");
    expect(simplified).not.toEqual(westernPadded);
  });

  it("builds the TCGdex image from the shared id and falls back to the English scan", () => {
    expect(tcgdexIdForCatalog("swsh3", "136")).toBe("swsh3-136");
    expect(localizedImageUrl("de", "swsh3", "136", "high")).toBe("https://assets.tcgdex.net/de/swsh/swsh3/136/high.webp");
    expect(localizedImageUrl("de", "swsh3", "136", "low", "https://assets.tcgdex.net/de/swsh/swsh3/136")).toBe(
      "https://assets.tcgdex.net/de/swsh/swsh3/136/low.webp",
    );
    const englishOnly = cardImageUrl("base4", "102", "low");
    expect(englishOnly).toMatch(/images\.pokemontcg\.io/);
    expect(localizedImageUrl("fr", "base4", "102", "low")).toBe(englishOnly);
    expect(localizedImageUrl("zh-cn", "SV7", "001", "high")).toBeNull();
  });
});

describe("shipment resolution", () => {
  it("uses one TCGdex read for a repeated western card and the typed name for Chinese", async () => {
    let calls = 0;
    const resolved = await resolveShipmentLines(
      [
        { number: "136", quantity: 1 },
        { number: "136", quantity: 2 },
        { language: "zh-cn", setId: "SV7", number: "001", quantity: 2, name: "芭瓢蟲" },
      ],
      { language: "de", setId: "swsh3" },
      async () => {
        calls += 1;
        return { name: "Wiesenior", image: "https://assets.tcgdex.net/de/swsh/swsh3/136" };
      },
    );
    expect(calls).toBe(1);
    expect(resolved.errors).toEqual([]);
    expect(resolved.lines).toEqual([
      expect.objectContaining({
        language: "de",
        setId: "swsh3",
        number: "136",
        name: "Wiesenior",
        quantity: 3,
        dex: "162",
        externalSource: "tcgdex",
        externalId: "swsh3-136",
      }),
      expect.objectContaining({
        language: "zh-cn",
        setId: "SV7",
        number: "001",
        name: "芭瓢蟲",
        quantity: 2,
        dex: "",
        externalSource: "manual",
        externalId: "SV7-001",
      }),
    ]);
  });

  it("does not call TCGdex once per line of a large western paste", async () => {
    const cards = (getSetCards("swsh3") ?? []).slice(0, WESTERN_LOOKUP_CAP + 5);
    expect(cards.length).toBeGreaterThan(WESTERN_LOOKUP_CAP);
    let calls = 0;
    const resolved = await resolveShipmentLines(
      cards.map((card) => ({ number: card.n, quantity: 1 })),
      { language: "de", setId: "swsh3" },
      async () => {
        calls += 1;
        return { name: "Should not be used", image: null };
      },
    );
    expect(calls).toBe(0);
    expect(resolved.errors).toEqual([]);
    expect(resolved.lines).toHaveLength(cards.length);
    expect(resolved.lines[0]).toMatchObject({
      language: "de",
      number: cards[0]?.n,
      name: cards[0]?.name,
    });
  });

  it("asks for a name when Chinese has no TCGdex record and no typed name", async () => {
    const resolved = await resolveShipmentLines(
      [{ language: "zh-cn", setId: "CSV1C", number: "001", quantity: 1 }],
      { language: "en", setId: "" },
      async () => null,
    );
    expect(resolved.lines).toEqual([]);
    expect(resolved.errors[0]).toMatch(/name/i);
  });
});

describe("inventory migration", () => {
  it("backfills existing rows to en and indexes language, set, and number", async () => {
    const client = new PGlite("memory://");
    await client.waitReady;
    const db = wrapPglite(client as never);
    await db.exec(`CREATE TABLE shops (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      country TEXT NOT NULL,
      website TEXT,
      contact TEXT,
      is_public INTEGER NOT NULL DEFAULT 1,
      is_demo INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL
    )`);
    await db.exec(`CREATE TABLE shipments (
      id TEXT PRIMARY KEY,
      shop_id TEXT NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
      received_on TEXT NOT NULL,
      notes TEXT NOT NULL DEFAULT '',
      is_demo INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL
    )`);
    await db.exec(`CREATE TABLE shipment_cards (
      id TEXT PRIMARY KEY,
      shipment_id TEXT NOT NULL REFERENCES shipments(id) ON DELETE CASCADE,
      set_id TEXT NOT NULL,
      card_number TEXT NOT NULL,
      card_name TEXT NOT NULL,
      quantity INTEGER NOT NULL CHECK (quantity > 0),
      dex_numbers TEXT NOT NULL DEFAULT ''
    )`);
    const shop = randomUUID();
    const shipment = randomUUID();
    const card = randomUUID();
    const now = new Date().toISOString();
    await db.query(
      `INSERT INTO shops (id, name, country, website, contact, is_public, is_demo, created_at)
       VALUES ($1, 'Old Shop', 'Germany', NULL, '', 1, 0, $2)`,
      [shop, now],
    );
    await db.query(
      `INSERT INTO shipments (id, shop_id, received_on, notes, is_demo, created_at)
       VALUES ($1, $2, '2026-10-01', '', 0, $3)`,
      [shipment, shop, now],
    );
    await db.query(
      `INSERT INTO shipment_cards (id, shipment_id, set_id, card_number, card_name, quantity, dex_numbers)
       VALUES ($1, $2, 'base1', '4', 'Charizard', 1, '6')`,
      [card, shipment],
    );

    await applySchema(db);
    await applySchema(db);

    const rows = await db.query<{ language: string; external_source: string | null; external_id: string | null }>(
      `SELECT language, external_source, external_id FROM shipment_cards WHERE id = $1`,
      [card],
    );
    expect(rows[0]).toMatchObject({ language: "en", external_source: null, external_id: null });
    const indexes = await db.query<{ indexname: string }>(
      `SELECT indexname FROM pg_indexes WHERE tablename = 'shipment_cards'`,
    );
    expect(indexes.map((row) => row.indexname)).toContain("shipment_cards_identity_idx");
    await expect(
      db.query(
        `INSERT INTO shipment_cards (id, shipment_id, set_id, card_number, card_name, quantity, language)
         VALUES ($1, $2, 'base1', '4', 'Charizard', 1, 'xx')`,
        [randomUUID(), shipment],
      ),
    ).rejects.toThrow();
  });
});

describe("public inventory", () => {
  async function seed(db: Sql) {
    const now = new Date().toISOString();
    const shop = randomUUID();
    const shipment = randomUUID();
    await db.query(
      `INSERT INTO shops (id, name, country, website, contact, is_public, is_demo, created_at)
       VALUES ($1, 'Alpine Cards', 'Germany', NULL, '', 1, 0, $2)`,
      [shop, now],
    );
    await db.query(
      `INSERT INTO shipments (id, shop_id, received_on, notes, is_demo, created_at)
       VALUES ($1, $2, '2026-10-02', '', 0, $3)`,
      [shipment, shop, now],
    );
    await db.query(
      `INSERT INTO shipment_cards (id, shipment_id, set_id, card_number, card_name, quantity, dex_numbers)
       VALUES ($1, $2, 'swsh3', '136', 'Furret', 1, '162')`,
      [randomUUID(), shipment],
    );
    await db.query(
      `INSERT INTO shipment_cards (
         id, shipment_id, set_id, card_number, card_name, quantity, dex_numbers, language, external_source, external_id
       ) VALUES ($1, $2, 'swsh3', '136', 'Wiesenior', 2, '162', 'de', 'tcgdex', 'swsh3-136')`,
      [randomUUID(), shipment],
    );
    await db.query(
      `INSERT INTO shipment_cards (
         id, shipment_id, set_id, card_number, card_name, quantity, dex_numbers, language, external_source, external_id
       ) VALUES ($1, $2, 'swsh3', '136', 'オオタチ', 1, '', 'ja', 'tcgdex', 'swsh3-136')`,
      [randomUUID(), shipment],
    );
    await db.query(
      `INSERT INTO shipment_cards (
         id, shipment_id, set_id, card_number, card_name, quantity, dex_numbers, language, external_source, external_id
       ) VALUES ($1, $2, 'sv7', '001', '手写', 1, '', 'zh-cn', 'manual', 'sv7-001')`,
      [randomUUID(), shipment],
    );
    return { shop, shipment };
  }

  it("counts any western language once and keeps Asian rows off the English card", async () => {
    const db = await createMemoryDatabase();
    await seed(db);
    const shown = await readPublic(db);
    expect(shown.setCounts.swsh3).toBe(1);
    expect(shown.held.swsh3).toEqual(["136"]);
    expect(shown.setCounts.sv7).toBeUndefined();
    expect(shown.held.sv7).toBeUndefined();
    expect(shown.languages["swsh3:136"]?.slice().sort()).toEqual(["de", "en"]);
    expect(otherLanguagesHeld(shown, "swsh3", "136")).toEqual(["de"]);
    expect(shown.otherPrintings).toEqual([
      expect.objectContaining({ language: "ja", setId: "swsh3", number: "136", name: "オオタチ", quantity: 1 }),
      expect.objectContaining({ language: "zh-cn", setId: "sv7", number: "001", name: "手写", quantity: 1 }),
    ]);
    expect(shown.differentCards).toBe(3);
    expect(shown.copies).toBe(5);
    expect(shown.species).toEqual([162]);
    expect(shown.shops[0]?.setIds).toEqual(["swsh3"]);

    const admin = await readAdmin(db);
    const furret = admin.cards.filter((card) => card.setId === "swsh3" && card.number === "136");
    expect(furret.map((card) => card.language).sort()).toEqual(["de", "en", "ja"]);
    const setBinder = admin.binders.find((binder) => binder.kind === "set" && binder.key === "swsh3");
    expect(setBinder?.collected).toBe(1);
    expect(admin.binders.some((binder) => binder.key === "sv7")).toBe(false);
  });
});

describe("indexed pages", () => {
  it("keeps the card sitemap to the English catalog in the five indexed locales", () => {
    expect([...CARD_INDEX_LOCALES]).toEqual(["us", "de", "fr", "es", "it"]);
    const paths = listCardPaths();
    expect(paths.length).toBe(getMeta().cards);
    expect(paths.length).toBe(20628);
    let urls = 0;
    for (const locale of CARD_INDEX_LOCALES) {
      for (let part = 1; part <= 20; part += 1) {
        const entries = sitemapEntries(`${locale}-cards-${part}`);
        if (!entries) break;
        urls += entries.length;
      }
    }
    expect(urls).toBe(paths.length * CARD_INDEX_LOCALES.length);
    for (const locale of LOCALES) {
      const text = fill(getMessages(locale).cardPage.alsoHeld, { languages: getMessages(locale).printLanguages.de });
      expect(text).toContain(getMessages(locale).printLanguages.de);
      expect(text).not.toContain("{");
    }
    expect(formatHeldLanguages(getMessages("us"), ["de"])).toBe("German");
    expect(fill(getMessages("us").cardPage.alsoHeld, { languages: "German" })).toBe("Also in the collection: German.");
  });
});

describe("TCGdex cache", () => {
  it("reads a card once and reuses it for the same id", async () => {
    clearTcgdexCache();
    const original = globalThis.fetch;
    let calls = 0;
    globalThis.fetch = (async () => {
      calls += 1;
      return new Response(
        JSON.stringify({
          id: "swsh3-136",
          localId: "136",
          name: "Wiesenior",
          image: "https://assets.tcgdex.net/de/swsh/swsh3/136",
        }),
        { status: 200, headers: { "content-type": "application/json" } },
      );
    }) as typeof fetch;
    try {
      const first = await getTcgdexCard("de", "swsh3-136");
      const second = await getTcgdexCard("de", "swsh3-136");
      expect(first).toMatchObject({ name: "Wiesenior", image: "https://assets.tcgdex.net/de/swsh/swsh3/136" });
      expect(second?.name).toBe("Wiesenior");
      expect(calls).toBe(1);
    } finally {
      globalThis.fetch = original;
      clearTcgdexCache();
    }
  });
});
