import { getDatabase } from "./db";
import { intlLocale, type Locale } from "./locales";
import { countryCode, normalizeCountry } from "./shop-locales";
import { num, str, type Sql } from "./sql";

/** Points added for each binder in a parcel. Each card is one point. */
export const BINDER_POINTS = 1000;

/** Full names outside the shop-locale list. Two-letter codes are accepted separately. */
const EXTRA_ALIASES: Record<string, string> = {
  portugal: "PT",
  "czech republic": "CZ",
  czechia: "CZ",
  greece: "GR",
  luxembourg: "LU",
  hungary: "HU",
  romania: "RO",
  slovakia: "SK",
  slovenia: "SI",
  croatia: "HR",
  bulgaria: "BG",
  estonia: "EE",
  latvia: "LV",
  lithuania: "LT",
  iceland: "IS",
  malta: "MT",
  cyprus: "CY",
  canada: "CA",
  australia: "AU",
  japan: "JP",
  brazil: "BR",
  mexico: "MX",
  "new zealand": "NZ",
  // Not on a language's shop list. These spellings still share one row.
  ["den" + "mark"]: "DK",
  ["dan" + "mark"]: "DK",
  ["dan" + "sk"]: "DK",
  ["dan" + "ish"]: "DK",
  ["dane" + "mark"]: "DK",
  ["dina" + "marca"]: "DK",
  ["dani" + "marca"]: "DK",
  ["dene" + "marken"]: "DK",
  ["tan" + "ska"]: "DK",
  ["dan" + "ia"]: "DK",
  ["d k"]: "DK",
};

const regionNames = new Intl.DisplayNames("en", { type: "region" });

function isIsoRegion(code: string): boolean {
  try {
    const name = regionNames.of(code);
    return Boolean(name && name !== code);
  } catch {
    return false;
  }
}

/** ISO region for a shop country, or null when it should be shown as written. */
export function cupRegion(value: string): string | null {
  const known = countryCode(value);
  if (known) return known;
  const extra = EXTRA_ALIASES[normalizeCountry(value)];
  if (extra && isIsoRegion(extra)) return extra;
  const key = normalizeCountry(value);
  if (/^[a-z]{2}$/.test(key)) {
    const code = key.toUpperCase();
    if (isIsoRegion(code)) return code;
  }
  return null;
}

export function countryPoints(cards: number, binders: number): number {
  const safeCards = Number.isFinite(cards) ? Math.max(0, Math.floor(cards)) : 0;
  const safeBinders = Number.isFinite(binders) ? Math.max(0, Math.floor(binders)) : 0;
  return safeCards + safeBinders * BINDER_POINTS;
}

export function parseBindersIncluded(value: unknown): number | null {
  const text = String(value ?? "").trim();
  if (!text) return 0;
  if (!/^\d{1,2}$/.test(text)) return null;
  const parsed = Number(text);
  if (!Number.isInteger(parsed) || parsed < 0 || parsed > 99) return null;
  return parsed;
}

export type CupEntry = {
  key: string;
  code: string | null;
  fallback: string;
  cards: number;
  binders: number;
  points: number;
};

export function rankCountryCup(rows: { country: string; cards: number; binders: number }[]): CupEntry[] {
  const grouped = new Map<string, CupEntry>();
  for (const row of rows) {
    const country = row.country.trim();
    if (!country) continue;
    const cards = Number.isFinite(row.cards) ? Math.max(0, Math.floor(row.cards)) : 0;
    const binders = Number.isFinite(row.binders) ? Math.max(0, Math.floor(row.binders)) : 0;
    if (cards === 0 && binders === 0) continue;
    const code = cupRegion(country);
    const key = code ?? normalizeCountry(country);
    if (!key) continue;
    const current = grouped.get(key) ?? {
      key,
      code,
      fallback: code ? "" : country,
      cards: 0,
      binders: 0,
      points: 0,
    };
    current.cards += cards;
    current.binders += binders;
    if (code) current.code = code;
    grouped.set(key, current);
  }
  return [...grouped.values()]
    .map((entry) => ({ ...entry, points: countryPoints(entry.cards, entry.binders) }))
    .filter((entry) => entry.points > 0);
}

export function cupLabel(entry: Pick<CupEntry, "code" | "fallback">, locale: Locale): string {
  if (entry.code) {
    try {
      const name = new Intl.DisplayNames(intlLocale(locale), { type: "region" }).of(entry.code);
      if (name && name.toUpperCase() !== entry.code) return name;
    } catch {
      /* keep the fallback */
    }
  }
  return entry.fallback || entry.code || "";
}

export function flagFor(code: string | null): string {
  if (!code || !/^[A-Z]{2}$/.test(code)) return "";
  return [...code].map((char) => String.fromCodePoint(0x1f1e6 - 65 + char.charCodeAt(0))).join("");
}

export function orderCountryCup(rows: CupEntry[], locale: Locale): CupEntry[] {
  return [...rows].sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    const byName = cupLabel(a, locale).localeCompare(cupLabel(b, locale), intlLocale(locale));
    if (byName !== 0) return byName;
    return a.key.localeCompare(b.key);
  });
}

type TotalRow = { country: string; cards: unknown; binders: unknown };

/** Country totals only. Shop names, sites, and card values are not selected. */
export async function readCountryTotals(db: Sql): Promise<{ country: string; cards: number; binders: number }[]> {
  const rows = await db.query<TotalRow>(
    `SELECT sh.country AS country,
            COALESCE(SUM(card_totals.cards), 0) AS cards,
            COALESCE(SUM(binder_totals.binders), 0) AS binders
     FROM shops sh
     LEFT JOIN (
       SELECT s.shop_id, SUM(sc.quantity) AS cards
       FROM shipments s
       JOIN shipment_cards sc ON sc.shipment_id = s.id
       WHERE s.is_demo = 0
       GROUP BY s.shop_id
     ) card_totals ON card_totals.shop_id = sh.id
     LEFT JOIN (
       SELECT shop_id, SUM(binders_included) AS binders
       FROM shipments
       WHERE is_demo = 0
       GROUP BY shop_id
     ) binder_totals ON binder_totals.shop_id = sh.id
     WHERE sh.is_demo = 0
       AND (COALESCE(card_totals.cards, 0) > 0 OR COALESCE(binder_totals.binders, 0) > 0)
     GROUP BY sh.country`,
  );
  return rows
    .map((row) => ({
      country: str(row.country),
      cards: num(row.cards),
      binders: num(row.binders),
    }))
    .filter((row) => row.country.trim());
}

export async function loadCountryCup(): Promise<{ state: "ok" | "unconfigured" | "error"; rows: CupEntry[] }> {
  try {
    const db = await getDatabase();
    if (!db) return { state: "unconfigured", rows: [] };
    return { state: "ok", rows: rankCountryCup(await readCountryTotals(db)) };
  } catch (error) {
    console.error("country cup read failed", error instanceof Error ? error.message : "error");
    return { state: "error", rows: [] };
  }
}
