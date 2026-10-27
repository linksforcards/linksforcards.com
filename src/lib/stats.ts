import { unstable_cache } from "next/cache";
import { getSetCards } from "./catalog";
import { numbersMatch, parseDex } from "./cards";
import { generationOf } from "./generations";
import { databaseUrl, getDatabase, localDbAllowed } from "./db";
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

export type PublicSnapshot = {
  state: "ok" | "unconfigured" | "error";
  differentCards: number;
  copies: number;
  species: number[];
  setCounts: Record<string, number>;
  held: Record<string, string[]>;
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
    marks: [],
    shops: [],
    updates: [],
  };
}

type CardRow = { set_id: string; card_number: string; quantity: unknown; dex_numbers: string };
type ShopRow = {
  shop_id: string;
  name: string;
  country: string;
  website: string | null;
  received_on: string;
  set_id: string;
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
      `SELECT sc.set_id, sc.card_number, sc.quantity, sc.dex_numbers
       FROM shipment_cards sc
       JOIN shipments s ON s.id = sc.shipment_id
       WHERE s.is_demo = 0`,
    ),
    db.query<ShopRow>(
      `SELECT sh.id AS shop_id, sh.name, sh.country, sh.website, s.received_on, sc.set_id, sc.dex_numbers
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
  const unique = new Map<string, { setId: string; number: string; qty: number; dex: number[] }>();
  for (const row of cardRows) {
    const setId = str(row.set_id);
    const number = str(row.card_number);
    const key = `${setId}:${number}`;
    const current = unique.get(key) ?? { setId, number, qty: 0, dex: parseDex(str(row.dex_numbers)) };
    current.qty += num(row.quantity);
    unique.set(key, current);
  }

  const species = new Set<number>();
  const heldMap = new Map<string, Set<string>>();
  let copies = 0;
  for (const entry of unique.values()) {
    if (entry.qty <= 0) continue;
    copies += entry.qty;
    const bucket = heldMap.get(entry.setId) ?? new Set<string>();
    bucket.add(entry.number);
    heldMap.set(entry.setId, bucket);
    for (const dex of entry.dex) species.add(dex);
  }

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
    const setId = str(row.set_id);
    if (setId && !current.setIds.includes(setId)) current.setIds.push(setId);
    for (const dex of parseDex(str(row.dex_numbers))) {
      const generation = generationOf(dex);
      if (generation && !current.generations.includes(generation)) current.generations.push(generation);
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
    differentCards: [...unique.values()].filter((entry) => entry.qty > 0).length,
    copies,
    species: [...species].sort((a, b) => a - b),
    setCounts,
    held,
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
  ["public-snapshot-v1"],
  { revalidate: 86400, tags: [PUBLIC_SNAPSHOT_TAG] },
);

/**
 * One tagged snapshot for every page. A miss runs the four registration
 * reads in parallel and stores the result for a day. A failed read is not
 * stored, so the next request tries again. With no database configured, the
 * result is an empty snapshot and nothing is cached.
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
