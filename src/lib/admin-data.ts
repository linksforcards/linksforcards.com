import { themeCopy } from "@/content/theme-copy";
import { getSet, getSetCards } from "./catalog";
import { numbersMatch, parseDex } from "./cards";
import { GENERATIONS, generationOf, SPECIES_TOTAL } from "./generations";
import { lineCents } from "./money";
import { isWesternPrintLanguage } from "./print-languages";
import { intOrNull, num, str, type Sql } from "./sql";
import { getThemes, themeCollected } from "./themes";
import { safeHttpUrl } from "./urls";

export type AdminCard = {
  language: string;
  setId: string;
  setName: string;
  number: string;
  name: string;
  qty: number;
  dex: number[];
  shops: { id: string; name: string; demo: boolean; qty: number }[];
  cmCents: number | null;
  tcgCents: number | null;
  cmAsOf: string | null;
  tcgAsOf: string | null;
  fetchedAt: string | null;
  note: string;
  demoOnly: boolean;
};

export type ShopTotal = {
  id: string;
  name: string;
  country: string;
  demo: boolean;
  copies: number;
  cmCents: number;
  tcgCents: number;
  cmMissing: number;
  tcgMissing: number;
};

export type BinderTotal = {
  kind: "set" | "generation" | "theme";
  key: string;
  label: string;
  collected: number;
  total: number;
  cmCents: number;
  tcgCents: number;
  cmMissing: number;
  tcgMissing: number;
  status: string | null;
  recipient: string;
  givenOn: string | null;
};

export type AdminOverview = {
  demoPresent: boolean;
  cards: AdminCard[];
  copies: number;
  differentCards: number;
  cmTotal: number;
  tcgTotal: number;
  cmMissing: number;
  tcgMissing: number;
  shops: ShopTotal[];
  binders: BinderTotal[];
  newestFetch: string | null;
  oldestFetch: string | null;
};

type Line = {
  language: string;
  setId: string;
  number: string;
  name: string;
  qty: number;
  dex: number[];
  shopId: string;
  shopName: string;
  country: string;
  demo: boolean;
};

function countsTowardEnglishList(line: { language: string; setId: string }): boolean {
  return isWesternPrintLanguage(line.language) && Boolean(getSet(line.setId));
}

type PriceRow = {
  set_id: string;
  card_number: string;
  cardmarket_cents: unknown;
  tcgplayer_cents: unknown;
  cardmarket_as_of: string | null;
  tcgplayer_as_of: string | null;
  note: string;
  fetched_at: string;
};

export async function readAdmin(db: Sql): Promise<AdminOverview> {
  const lineRows = await db.query<{
    set_id: string;
    card_number: string;
    card_name: string;
    quantity: unknown;
    dex_numbers: string;
    language: string;
    shop_id: string;
    shop_name: string;
    country: string;
    shop_demo: unknown;
    shipment_demo: unknown;
  }>(
    `SELECT sc.set_id, sc.card_number, sc.card_name, sc.quantity, sc.dex_numbers, sc.language,
            sh.id AS shop_id, sh.name AS shop_name, sh.country,
            sh.is_demo AS shop_demo, s.is_demo AS shipment_demo
     FROM shipment_cards sc
     JOIN shipments s ON s.id = sc.shipment_id
     JOIN shops sh ON sh.id = s.shop_id`,
  );
  const lines: Line[] = lineRows.map((row) => ({
    language: str(row.language) || "en",
    setId: str(row.set_id),
    number: str(row.card_number),
    name: str(row.card_name),
    qty: num(row.quantity),
    dex: parseDex(str(row.dex_numbers)),
    shopId: str(row.shop_id),
    shopName: str(row.shop_name),
    country: str(row.country),
    demo: num(row.shop_demo) === 1 || num(row.shipment_demo) === 1,
  }));

  const prices = new Map<string, PriceRow>();
  const priceRows = await db.query<PriceRow>(
    `SELECT set_id, card_number, cardmarket_cents, tcgplayer_cents, cardmarket_as_of, tcgplayer_as_of, note, fetched_at
     FROM price_cache`,
  );
  for (const row of priceRows) prices.set(`${str(row.set_id)}:${str(row.card_number)}`, row);

  const grouped = new Map<string, AdminCard>();
  for (const line of lines) {
    const key = `${line.language}:${line.setId}:${line.number}`;
    const price = prices.get(`${line.setId}:${line.number}`);
    const current = grouped.get(key) ?? {
      language: line.language,
      setId: line.setId,
      setName: isWesternPrintLanguage(line.language) ? (getSet(line.setId)?.name ?? line.setId) : line.setId,
      number: line.number,
      name: line.name,
      qty: 0,
      dex: line.dex,
      shops: [],
      cmCents: intOrNull(price?.cardmarket_cents),
      tcgCents: intOrNull(price?.tcgplayer_cents),
      cmAsOf: price?.cardmarket_as_of ? str(price.cardmarket_as_of) : null,
      tcgAsOf: price?.tcgplayer_as_of ? str(price.tcgplayer_as_of) : null,
      fetchedAt: price?.fetched_at ? str(price.fetched_at) : null,
      note: price?.note ? str(price.note) : "",
      demoOnly: true,
    };
    current.qty += line.qty;
    if (!line.demo) current.demoOnly = false;
    const shop = current.shops.find((item) => item.id === line.shopId);
    if (shop) shop.qty += line.qty;
    else current.shops.push({ id: line.shopId, name: line.shopName, demo: line.demo, qty: line.qty });
    grouped.set(key, current);
  }

  const cards = [...grouped.values()].sort(
    (a, b) =>
      a.setName.localeCompare(b.setName) ||
      a.number.localeCompare(b.number, "en", { numeric: true }) ||
      a.language.localeCompare(b.language),
  );
  let copies = 0;
  let cmTotal = 0;
  let tcgTotal = 0;
  let cmMissing = 0;
  let tcgMissing = 0;
  const fetches: string[] = [];
  for (const card of cards) {
    copies += card.qty;
    if (!countsTowardEnglishList(card)) continue;
    const cm = lineCents(card.qty, card.cmCents);
    const tcg = lineCents(card.qty, card.tcgCents);
    if (cm == null) cmMissing += 1;
    else cmTotal += cm;
    if (tcg == null) tcgMissing += 1;
    else tcgTotal += tcg;
    if (card.fetchedAt) fetches.push(card.fetchedAt);
  }
  fetches.sort();

  const shopTotals = new Map<string, ShopTotal>();
  for (const line of lines) {
    const priced = countsTowardEnglishList(line);
    const price = priced ? prices.get(`${line.setId}:${line.number}`) : undefined;
    const cmUnit = priced ? intOrNull(price?.cardmarket_cents) : null;
    const tcgUnit = priced ? intOrNull(price?.tcgplayer_cents) : null;
    const current = shopTotals.get(line.shopId) ?? {
      id: line.shopId,
      name: line.shopName,
      country: line.country,
      demo: line.demo,
      copies: 0,
      cmCents: 0,
      tcgCents: 0,
      cmMissing: 0,
      tcgMissing: 0,
    };
    current.copies += line.qty;
    if (priced) {
      const cm = lineCents(line.qty, cmUnit);
      const tcg = lineCents(line.qty, tcgUnit);
      if (cm == null) current.cmMissing += 1;
      else current.cmCents += cm;
      if (tcg == null) current.tcgMissing += 1;
      else current.tcgCents += tcg;
    }
    shopTotals.set(line.shopId, current);
  }

  const markRows = await db.query<{
    binder_kind: string;
    binder_key: string;
    status: string;
    recipient: string;
    given_on: string | null;
  }>(`SELECT binder_kind, binder_key, status, recipient, given_on FROM binders`);
  const marks = new Map(markRows.map((row) => [`${row.binder_kind}:${row.binder_key}`, row]));

  const species = new Set<number>();
  for (const card of cards) {
    if (!countsTowardEnglishList(card)) continue;
    for (const dex of card.dex) species.add(dex);
  }

  const binders: BinderTotal[] = [];
  for (const generation of GENERATIONS) {
    const inGen = cards.filter(
      (card) => countsTowardEnglishList(card) && card.dex.some((dex) => generationOf(dex) === generation.id),
    );
    const collected = [...species].filter((dex) => dex >= generation.start && dex <= generation.end).length;
    const mark = marks.get(`generation:${generation.id}`);
    if (!inGen.length && !mark) continue;
    binders.push(totalFor(inGen, "generation", String(generation.id), `Generation ${generation.id}`, collected, generation.end - generation.start + 1, mark));
  }

  const setIds = new Set<string>([
    ...cards.filter((card) => countsTowardEnglishList(card)).map((card) => card.setId),
    ...markRows.filter((row) => row.binder_kind === "set").map((row) => row.binder_key),
  ]);
  for (const setId of setIds) {
    const inSet = cards.filter((card) => card.setId === setId && countsTowardEnglishList(card));
    const catalog = getSetCards(setId);
    const collected = catalog
      ? catalog.filter((card) => inSet.some((held) => numbersMatch(card.n, held.number))).length
      : inSet.length;
    const mark = marks.get(`set:${setId}`);
    binders.push(
      totalFor(inSet, "set", setId, getSet(setId)?.name ?? setId, collected, catalog?.length ?? inSet.length, mark),
    );
  }

  const held: Record<string, string[]> = {};
  for (const card of cards) {
    if (!countsTowardEnglishList(card)) continue;
    const list = held[card.setId] ?? [];
    list.push(card.number);
    held[card.setId] = list;
  }
  for (const theme of getThemes()) {
    const inTheme = cards.filter((card) =>
      theme.cards.some((ref) => ref.setId === card.setId && numbersMatch(ref.number, card.number)),
    );
    const mark = marks.get(`theme:${theme.slug}`);
    binders.push(
      totalFor(
        inTheme,
        "theme",
        theme.slug,
        themeCopy("us", theme.slug)?.h1 ?? theme.slug,
        themeCollected(theme, held),
        theme.total,
        mark,
      ),
    );
  }

  return {
    demoPresent: lines.some((line) => line.demo),
    cards,
    copies,
    differentCards: cards.length,
    cmTotal,
    tcgTotal,
    cmMissing,
    tcgMissing,
    shops: [...shopTotals.values()].sort((a, b) => b.copies - a.copies || a.name.localeCompare(b.name)),
    binders,
    newestFetch: fetches.at(-1) ?? null,
    oldestFetch: fetches[0] ?? null,
  };
}

function totalFor(
  cards: AdminCard[],
  kind: BinderTotal["kind"],
  key: string,
  label: string,
  collected: number,
  total: number,
  mark: { status: string; recipient: string; given_on: string | null } | undefined,
): BinderTotal {
  let cmCents = 0;
  let tcgCents = 0;
  let cmMissing = 0;
  let tcgMissing = 0;
  for (const card of cards) {
    const cm = lineCents(card.qty, card.cmCents);
    const tcg = lineCents(card.qty, card.tcgCents);
    if (cm == null) cmMissing += 1;
    else cmCents += cm;
    if (tcg == null) tcgMissing += 1;
    else tcgCents += tcg;
  }
  return {
    kind,
    key,
    label,
    collected,
    total,
    cmCents,
    tcgCents,
    cmMissing,
    tcgMissing,
    status: mark?.status ?? null,
    recipient: mark ? str(mark.recipient) : "",
    givenOn: mark?.given_on ? str(mark.given_on) : null,
  };
}

export async function listShipments(db: Sql) {
  return db.query<{
    id: string;
    received_on: string;
    notes: string;
    is_demo: unknown;
    binders_included: unknown;
    shop_name: string;
    country: string;
    lines: unknown;
    copies: unknown;
    languages: string;
  }>(
    `SELECT s.id, s.received_on, s.notes, s.is_demo, s.binders_included, s.created_at,
            sh.name AS shop_name, sh.country,
            COUNT(sc.id) AS lines, COALESCE(SUM(sc.quantity), 0) AS copies,
            COALESCE(string_agg(DISTINCT sc.language, ', ' ORDER BY sc.language), '') AS languages
     FROM shipments s
     JOIN shops sh ON sh.id = s.shop_id
     LEFT JOIN shipment_cards sc ON sc.shipment_id = s.id
     GROUP BY s.id, sh.name, sh.country
     ORDER BY s.received_on DESC, s.created_at DESC`,
  );
}

export async function listShops(db: Sql) {
  return db.query<{
    id: string;
    name: string;
    country: string;
    website: string | null;
    contact: string | null;
    is_public: unknown;
    is_demo: unknown;
  }>(`SELECT id, name, country, website, contact, is_public, is_demo FROM shops ORDER BY is_demo, name`);
}

export async function listUpdates(db: Sql) {
  return db.query<{ id: string; title: string; body: string; published_at: string; is_demo: unknown }>(
    `SELECT id, title, body, published_at, is_demo FROM updates ORDER BY published_at DESC`,
  );
}

export function shopWebsite(value: string | null): string | null {
  return safeHttpUrl(value);
}

export const ADMIN_SPECIES_TOTAL = SPECIES_TOTAL;
