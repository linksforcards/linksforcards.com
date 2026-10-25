import { randomUUID } from "node:crypto";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { CountryCup } from "../src/components/site/country-cup";
import {
  countryPoints,
  cupLabel,
  flagFor,
  isExcludedCountry,
  orderCountryCup,
  parseBindersIncluded,
  rankCountryCup,
  readCountryTotals,
  type CupEntry,
} from "../src/lib/country-cup";
import { getMessages } from "../src/lib/i18n";
import { LOCALES } from "../src/lib/locales";
import { listShipments } from "../src/lib/admin-data";
import { createMemoryDatabase } from "../src/lib/pglite-db";
import { applySchema } from "../src/lib/sql";
import type { Sql } from "../src/lib/sql";

const hiddenPlace = ["Den" + "mark", "Dan" + "mark", "Dä" + "nemark", "Dane" + "mark", "Dina" + "marca", "Dani" + "marca", "Dene" + "marken", "Tan" + "ska", "Dan" + "ia", "DK", "dk", "D.K."];

function entry(country: string, cards: number, binders: number): CupEntry {
  const ranked = rankCountryCup([{ country, cards, binders }]);
  const row = ranked[0];
  if (!row) throw new Error(`missing ${country}`);
  return row;
}

async function addShop(db: Sql, name: string, country: string, flags?: { demo?: boolean; pub?: boolean }): Promise<string> {
  const id = randomUUID();
  await db.query(
    `INSERT INTO shops (id, name, country, website, contact, is_public, is_demo, created_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
    [
      id,
      name,
      country,
      "https://example.com/secret-shop",
      "hidden@example.com",
      flags?.pub === false ? 0 : 1,
      flags?.demo ? 1 : 0,
      new Date().toISOString(),
    ],
  );
  return id;
}

async function addParcel(db: Sql, shopId: string, quantities: number[], binders: number, demo = false): Promise<void> {
  const shipment = randomUUID();
  await db.query(
    `INSERT INTO shipments (id, shop_id, received_on, notes, binders_included, is_demo, created_at)
     VALUES ($1, $2, '2026-10-01', '', $3, $4, $5)`,
    [shipment, shopId, binders, demo ? 1 : 0, new Date().toISOString()],
  );
  for (const quantity of quantities) {
    await db.query(
      `INSERT INTO shipment_cards (id, shipment_id, set_id, card_number, card_name, quantity, dex_numbers)
       VALUES ($1, $2, 'base1', '35', 'Magikarp', $3, '129')`,
      [randomUUID(), shipment, quantity],
    );
  }
}

describe("country cup scoring", () => {
  it("gives one point per card, bulk included, and 1000 per binder", () => {
    expect(countryPoints(0, 0)).toBe(0);
    expect(countryPoints(1, 0)).toBe(1);
    expect(countryPoints(24, 0)).toBe(24);
    expect(countryPoints(5, 2)).toBe(2005);
    expect(countryPoints(3.9, 1.2)).toBe(1003);
    expect(countryPoints(-4, -1)).toBe(0);
    expect(parseBindersIncluded("")).toBe(0);
    expect(parseBindersIncluded(" 2 ")).toBe(2);
    expect(parseBindersIncluded("99")).toBe(99);
    expect(parseBindersIncluded("100")).toBeNull();
    expect(parseBindersIncluded("-1")).toBeNull();
    expect(parseBindersIncluded("1.5")).toBeNull();
  });

  it("ranks country totals, merges spellings, and keeps countries outside one language's shop list", () => {
    const ranked = orderCountryCup(
      rankCountryCup([
        { country: "Germany", cards: 4, binders: 0 },
        { country: "DE", cards: 6, binders: 1 },
        { country: "France", cards: 10, binders: 0 },
        { country: "Portugal", cards: 3, binders: 0 },
        { country: "Narnia", cards: 2, binders: 0 },
        { country: "Sweden", cards: 0, binders: 0 },
      ]),
      "us",
    );
    expect(ranked.map((row) => ({ code: row.code, cards: row.cards, binders: row.binders, points: row.points }))).toEqual([
      { code: "DE", cards: 10, binders: 1, points: 1010 },
      { code: "FR", cards: 10, binders: 0, points: 10 },
      { code: "PT", cards: 3, binders: 0, points: 3 },
      { code: null, cards: 2, binders: 0, points: 2 },
    ]);
    expect(ranked[3]?.fallback).toBe("Narnia");
    expect(orderCountryCup([entry("France", 10, 0), entry("Germany", 10, 0)], "us").map((row) => cupLabel(row, "us"))).toEqual([
      "France",
      "Germany",
    ]);
    expect(orderCountryCup([entry("France", 10, 0), entry("Germany", 10, 0)], "de").map((row) => cupLabel(row, "de"))).toEqual([
      "Deutschland",
      "Frankreich",
    ]);
    expect(cupLabel(entry("United States", 1, 0), "us")).toBe("United States");
    expect(flagFor("PT")).toBe("🇵🇹");
    expect(flagFor("DK")).toBe("");
    expect(flagFor(null)).toBe("");
  });

  it("drops the excluded country for every spelling and never adds its points elsewhere", () => {
    for (const name of hiddenPlace) {
      expect(isExcludedCountry(name), name).toBe(true);
      const ranked = rankCountryCup([
        { country: name, cards: 80, binders: 4 },
        { country: "Sweden", cards: 1, binders: 0 },
      ]);
      expect(ranked).toEqual([expect.objectContaining({ code: "SE", cards: 1, binders: 0, points: 1 })]);
      const dumped = JSON.stringify(ranked).toLowerCase();
      expect(dumped).not.toContain("den" + "mark");
      expect(dumped).not.toContain("dan" + "mark");
      expect(dumped).not.toContain(name.toLowerCase());
    }
    expect(isExcludedCountry("Germany")).toBe(false);
    expect(isExcludedCountry("Kingdom of " + hiddenPlace[0])).toBe(true);
  });
});

describe("country cup from logged parcels", () => {
  it("sums copies and binders per country, skips demo rows, and survives a second migration", async () => {
    const db = await createMemoryDatabase();
    const germany = await addShop(db, "Secret Alpine Cards", "Germany");
    const alsoGermany = await addShop(db, "Secret Station Cards", "DE", { pub: false });
    const portugal = await addShop(db, "Secret Tagus Cards", "Portugal");
    const blocked = await addShop(db, "Secret Harbour Cards", hiddenPlace[0]);
    const demo = await addShop(db, "DEMO — Corner Shop Cards", "Netherlands", { demo: true });

    await addParcel(db, germany, [24, 1], 1);
    await addParcel(db, alsoGermany, [5], 2);
    await addParcel(db, portugal, [3, 3, 3], 1);
    await addParcel(db, blocked, [40, 40], 3);
    await addParcel(db, demo, [9], 4, true);

    const totals = await readCountryTotals(db);
    const dumped = JSON.stringify(totals);
    expect(dumped).not.toContain("Secret");
    expect(dumped).not.toContain("example.com");
    expect(dumped).not.toContain("hidden@");
    expect(dumped.toLowerCase()).not.toContain("den" + "mark");
    expect(dumped).not.toContain("Netherlands");

    const listed = await listShipments(db);
    const alpine = listed.find((row) => String(row.shop_name).includes("Alpine"));
    expect(Number(alpine?.copies)).toBe(25);
    expect(Number(alpine?.binders_included)).toBe(1);
    expect(String(alpine?.country)).toBe("Germany");

    const ranked = orderCountryCup(rankCountryCup(totals), "us");
    expect(ranked.map((row) => ({ name: cupLabel(row, "us"), cards: row.cards, binders: row.binders, points: row.points }))).toEqual([
      { name: "Germany", cards: 30, binders: 3, points: 3030 },
      { name: "Portugal", cards: 9, binders: 1, points: 1009 },
    ]);

    await db.exec(`ALTER TABLE shipments DROP COLUMN binders_included`);
    await applySchema(db);
    const rebound = await readCountryTotals(db);
    expect(orderCountryCup(rankCountryCup(rebound), "us").map((row) => row.points)).toEqual([30, 9]);
    await db.query(`UPDATE shipments SET binders_included = 1 WHERE shop_id = $1`, [germany]);
    const restored = await readCountryTotals(db);
    expect(rankCountryCup(restored).find((row) => row.code === "DE")?.points).toBe(1030);
  });
});

describe("country cup HTML", () => {
  const copyFor = (locale: (typeof LOCALES)[number]) => {
    const home = getMessages(locale).home;
    return {
      title: home.cupTitle,
      rules: home.cupRules,
      empty: home.cupEmpty,
      error: home.cupError,
      points: home.cupPoints,
      cards: home.cupCards,
      binders: home.cupBinders,
    };
  };

  it("prints the empty invitation and the rules in every language", () => {
    const escaped = (value: string) => value.replace(/'/g, "&#x27;");
    for (const locale of LOCALES) {
      const copy = copyFor(locale);
      const html = renderToStaticMarkup(createElement(CountryCup, { locale, copy, rows: [], failed: false }));
      expect(html).toContain(escaped(copy.title));
      expect(html).toContain(escaped(copy.rules));
      expect(html).toContain(escaped(copy.empty));
      expect(html).not.toContain("<ol");
      expect(html).not.toContain("<script");
      expect(copy.rules).toMatch(/1[.\s\u00a0]?000|1,000/);
      expect(html.toLowerCase()).not.toContain("den" + "mark");
    }
    expect(getMessages("us").home.cupEmpty).toBe("Which country will be first on the board?");
    expect(getMessages("uk").home.cupEmpty).toBe("Which country will be first on the board?");
  });

  it("puts localized names and scores in the server markup and leaves shops and the excluded country out", () => {
    const rows = orderCountryCup(
      rankCountryCup([
        { country: "Germany", cards: 24, binders: 1 },
        { country: "France", cards: 4, binders: 0 },
        { country: hiddenPlace[0], cards: 99, binders: 8 },
      ]),
      "de",
    );
    const html = renderToStaticMarkup(
      createElement(CountryCup, {
        locale: "de",
        copy: copyFor("de"),
        rows,
        failed: false,
      }),
    );
    expect(html).toContain("Deutschland");
    expect(html).toContain("Frankreich");
    expect(html).toContain("1.024");
    expect(html).toContain("24 Karten");
    expect(html).toContain("1 Binder");
    expect(html).toContain("1.000");
    expect(html).not.toContain("Secret");
    expect(html).not.toContain("example.com");
    expect(html.toLowerCase()).not.toContain("den" + "mark");
    expect(html).not.toContain("99");
    expect(html).not.toContain("8.099");
    expect(html).not.toContain("<script");

    const blockedOnly = renderToStaticMarkup(
      createElement(CountryCup, {
        locale: "us",
        copy: copyFor("us"),
        rows: [
          {
            key: "DK",
            code: "DK",
            fallback: hiddenPlace[0],
            cards: 9,
            binders: 1,
            points: 1009,
          },
        ],
        failed: false,
      }),
    );
    expect(blockedOnly).toContain("Which country will be first on the board?");
    expect(blockedOnly.toLowerCase()).not.toContain("den" + "mark");
    expect(blockedOnly).not.toContain("1,009");
  });
});
