import { unstable_cache } from "next/cache";
import { getSetCards } from "./catalog";
import { numbersMatch, parseDex } from "./cards";
import { generationOf } from "./generations";
import { databaseUrl, getDatabase, localDbAllowed } from "./db";
import { inventoryIdentity } from "./inventory";
import { canonicalPrintLanguage } from "./print-languages";
import { num, str, type Sql } from "./sql";
import { safeHttpUrl } from "./urls";

export type BinderMark = {
  kind: "set" | "generation" | "theme";
  key: string;
  status: "completed" | "given_away";
  completedOn: string | null;
  givenOn: string | null;
  recipient: string;
  notes: string;
};

export type PublicShop = {
  id: string;
  name: string;
  country: string;
  website: string | null;
  latest: string;
  setIds: string[];
  generations: number[];
};

export type PublicUpdate = {
  id: string;
  title: string;
  body: string;
  publishedAt: string;
};

/** A copy that is not an English-catalog card. Shown in lists, never as its own page. */
export type OtherPrinting = {
  language: string;
  setId: string;
  number: string;
  name: string;
  quantity: number;
};

export type PublicSnapshot = {
  state: "ok" | "unconfigured" | "error";
  differentCards: number;
  copies: number;
  species: number[];
  setCounts: Record<string, number>;
  held: Record<string, string[]>;
  /** Languages held for an English-catalog card, including en. Key is setId:number. */
  languages: Record<string, string[]>;
  otherPrintings: OtherPrinting[];
  marks: BinderMark[];
  shops: PublicShop[];
  updates: PublicUpdate[];
};

export function emptyPublic(state: PublicSnapshot["state"]): PublicSnapshot {
  return {
    state,
    differentCards: 0,
    copies: 0,
    species: [],
    setCounts: {},
    held: {},
    languages: {},
    otherPrintings: [],
    marks: [],
    shops: [],
    updates: [],
  };
}

type CardRow = {
  set_id: string;
  card_number: string;
  card_name: string;
  quantity: unknown;
  dex_numbers: string;
  language: string;
};
type ShopRow = {
  shop_id: string;
  name: string;
  country: string;
  website: string | null;
  received_on: string;
  set_id: string;
  card_number: string;
  language: string;
  dex_numbers: string;
};
type MarkRow = {
  binder_kind: string;
  binder_key: string;
  status: string;
  completed_on: string | null;
  given_on: string | null;
  recipient: string;
  notes: string;
};
type UpdateRow = { id: string; title: string; body: string; published_at: string };

export const PUBLIC_SNAPSHOT_TAG = "public-snapshot";

export async function readPublic(db: Sql): Promise<PublicSnapshot> {
  const [cardRows, shopRows, markRows, updateRows] = await Promise.all([
    db.query<CardRow>(
      `SELECT sc.set_id, sc.card_number, sc.card_name, sc.quantity, sc.dex_numbers, sc.language
       FROM shipment_cards sc
       JOIN shipments s ON s.id = sc.shipment_id
       WHERE s.is_demo = 0`,
    ),
    db.query<ShopRow>(
      `SELECT sh.id AS shop_id, sh.name, sh.country, sh.website, s.received_on,
              sc.set_id, sc.card_number, sc.language, sc.dex_numbers
       FROM shops sh
       JOIN shipments s ON s.shop_id = sh.id
       JOIN shipment_cards sc ON sc.shipment_id = s.id
       WHERE sh.is_demo = 0 AND sh.is_public = 1 AND s.is_demo = 0`,
    ),
    db.query<MarkRow>(
      `SELECT binder_kind, binder_key, status, completed_on, given_on, recipient, notes
       FROM binders
       WHERE is_demo = 0 AND is_public = 1`,
    ),
    db.query<UpdateRow>(
      `SELECT id, title, body, published_at FROM updates WHERE is_demo = 0 ORDER BY published_at DESC`,
    ),
  ]);
  const catalogHeld = new Map<string, { setId: string; number: string; qty: number; dex: number[]; languages: Set<string> }>();
  const other = new Map<string, OtherPrinting>();
  for (const row of cardRows) {
    const language = canonicalPrintLanguage(str(row.language)) ?? "en";
    const setId = str(row.set_id);
    const number = str(row.card_number);
    const qty = num(row.quantity);
    if (qty <= 0) continue;
    const identity = inventoryIdentity(language, setId, number);
    if (identity?.kind === "catalog") {
      const key = `${identity.setId}:${identity.number}`;
      const current = catalogHeld.get(key) ?? {
        setId: identity.setId,
        number: identity.number,
        qty: 0,
        dex: parseDex(str(row.dex_numbers)),
        languages: new Set<string>(),
      };
      current.qty += qty;
      current.languages.add(language);
      if (!current.dex.length) current.dex = parseDex(str(row.dex_numbers));
      catalogHeld.set(key, current);
      continue;
    }
    const key = `${language}:${setId}:${number}`;
    const current = other.get(key) ?? { language, setId, number, name: str(row.card_name), quantity: 0 };
    current.quantity += qty;
    if (!current.name) current.name = str(row.card_name);
    other.set(key, current);
  }

  const species = new Set<number>();
  const heldMap = new Map<string, Set<string>>();
  const languages: Record<string, string[]> = {};
  let copies = 0;
  for (const entry of catalogHeld.values()) {
    copies += entry.qty;
    const bucket = heldMap.get(entry.setId) ?? new Set<string>();
    bucket.add(entry.number);
    heldMap.set(entry.setId, bucket);
    languages[`${entry.setId}:${entry.number}`] = [...entry.languages].sort();
    for (const dex of entry.dex) species.add(dex);
  }
  for (const entry of other.values()) copies += entry.quantity;

  const held: Record<string, string[]> = {};
  const setCounts: Record<string, number> = {};
  for (const [setId, numbers] of heldMap) {
    const list = [...numbers];
    held[setId] = list;
    const cards = getSetCards(setId);
    setCounts[setId] = cards ? cards.filter((card) => list.some((number) => numbersMatch(card.n, number))).length : list.length;
  }

  const shops = new Map<string, PublicShop>();
  for (const row of shopRows) {
    const id = str(row.shop_id);
    const current = shops.get(id) ?? {
      id,
      name: str(row.name),
      country: str(row.country),
      website: safeHttpUrl(row.website),
      latest: str(row.received_on),
      setIds: [],
      generations: [],
    };
    if (str(row.received_on) > current.latest) current.latest = str(row.received_on);
    const identity = inventoryIdentity(
      canonicalPrintLanguage(str(row.language)) ?? "en",
      str(row.set_id),
      str(row.card_number),
    );
    if (identity?.kind === "catalog" && !current.setIds.includes(identity.setId)) current.setIds.push(identity.setId);
    if (identity?.kind === "catalog") {
      for (const dex of parseDex(str(row.dex_numbers))) {
        const generation = generationOf(dex);
        if (generation && !current.generations.includes(generation)) current.generations.push(generation);
      }
    }
    shops.set(id, current);
  }

  const marks: BinderMark[] = markRows
    .filter((row) => row.binder_kind === "set" || row.binder_kind === "generation" || row.binder_kind === "theme")
    .filter((row) => row.status === "completed" || row.status === "given_away")
    .map((row) => ({
      kind: row.binder_kind as BinderMark["kind"],
      key: str(row.binder_key),
      status: row.status as BinderMark["status"],
      completedOn: row.completed_on ? str(row.completed_on) : null,
      givenOn: row.given_on ? str(row.given_on) : null,
      recipient: str(row.recipient),
      notes: str(row.notes),
    }));

  return {
    state: "ok",
    differentCards: catalogHeld.size + other.size,
    copies,
    species: [...species].sort((a, b) => a - b),
    setCounts,
    held,
    languages,
    otherPrintings: [...other.values()].sort(
      (a, b) => a.language.localeCompare(b.language) || a.setId.localeCompare(b.setId) || a.number.localeCompare(b.number, "en", { numeric: true }),
    ),
    marks,
    shops: [...shops.values()].sort((a, b) => b.latest.localeCompare(a.latest) || a.name.localeCompare(b.name)),
    updates: updateRows.map((row) => ({
      id: str(row.id),
      title: str(row.title),
      body: str(row.body),
      publishedAt: str(row.published_at),
    })),
  };
}

const loadPublicCached = unstable_cache(
  async () => {
    const db = await getDatabase();
    if (!db) throw new Error("database unavailable");
    return readPublic(db);
  },
  ["public-snapshot-v2"],
  { revalidate: 86400, tags: [PUBLIC_SNAPSHOT_TAG] },
);

/**
 * One tagged snapshot for every page. A miss runs the four registration
 * reads in parallel and stores the result for a day under a single cache key,
 * not one entry per card. A failed read is not stored, so the next request
 * tries again. With no database configured, the result is an empty snapshot
 * and nothing is cached.
 */
export async function loadPublic(): Promise<PublicSnapshot> {
  if (!databaseUrl() && !localDbAllowed()) return emptyPublic("unconfigured");
  try {
    return await loadPublicCached();
  } catch (error) {
    console.error("public read failed", error instanceof Error ? error.message : "error");
    return emptyPublic("error");
  }
}

export function speciesInRange(species: number[], start: number, end: number): number {
  return species.filter((dex) => dex >= start && dex <= end).length;
}

export function markFor(snapshot: PublicSnapshot, kind: BinderMark["kind"], key: string): BinderMark | null {
  return snapshot.marks.find((mark) => mark.kind === kind && mark.key === key) ?? null;
}

/** Languages other than English held for this English-catalog card. */
export function otherLanguagesHeld(snapshot: PublicSnapshot, setId: string, number: string): string[] {
  return (snapshot.languages[`${setId}:${number}`] ?? []).filter((language) => language !== "en");
}
