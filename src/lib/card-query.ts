import type { Locale } from "./locales";
import { localePath } from "./routing";
import { cardPath } from "./slug";

export const CARD_PAGE_SIZE = 48;

export const CARD_QUERY_KEYS = ["q", "set", "series", "year", "rarity", "type", "supertype", "illustrator", "need", "page"] as const;

export type CardIndexSet = { id: string; name: string; series: number; year: number; printed: number };
export type CardIndexLabel = { name: string; slug: string };

/** [set, number, name, kind, rarity, illustrator, typeMask, ...dex] */
export type CardTuple = [number, string, number, number, number, number, number, ...number[]];

export type CardIndexPayload = {
  sets: CardIndexSet[];
  series: CardIndexLabel[];
  years: number[];
  rarities: CardIndexLabel[];
  types: string[];
  artists: CardIndexLabel[];
  names: string[];
  cards: CardTuple[];
};

export type CardQuery = {
  q: string;
  set: string;
  series: string;
  year: string;
  rarity: string;
  type: string;
  supertype: string;
  illustrator: string;
  need: boolean;
  page: number;
};

export type SearchHit = {
  href: string;
  name: string;
  fraction: string;
  setName: string;
  year: string;
  illustrator: string;
};

export type PreparedIndex = {
  payload: CardIndexPayload;
  species: string[];
  foldedNames: string[];
  foldedSpecies: string[];
};

const KINDS = new Set(["p", "t", "e", "o"]);

export function emptyCardQuery(): CardQuery {
  return { q: "", set: "", series: "", year: "", rarity: "", type: "", supertype: "", illustrator: "", need: false, page: 1 };
}

function one(value: string | string[] | undefined): string {
  const raw = Array.isArray(value) ? value[0] : value;
  return (raw ?? "").trim().slice(0, 80);
}

export function parseCardQuery(input: Record<string, string | string[] | undefined>): CardQuery {
  const page = Number(one(input.page));
  const supertype = one(input.supertype);
  return {
    q: one(input.q).slice(0, 60),
    set: one(input.set),
    series: one(input.series),
    year: one(input.year),
    rarity: one(input.rarity),
    type: one(input.type),
    supertype: KINDS.has(supertype) ? supertype : supertype ? supertype : "",
    illustrator: one(input.illustrator),
    need: one(input.need) === "1",
    page: Number.isInteger(page) && page > 1 ? Math.min(page, 5000) : 1,
  };
}

/** Any recognized filter, including a later page, is a duplicate of the database. */
export function queryIsFiltered(query: CardQuery): boolean {
  return Boolean(
    query.q ||
      query.set ||
      query.series ||
      query.year ||
      query.rarity ||
      query.type ||
      query.supertype ||
      query.illustrator ||
      query.need ||
      query.page > 1,
  );
}

export function cardQueryString(query: CardQuery): string {
  const params = new URLSearchParams();
  if (query.q) params.set("q", query.q);
  if (query.set) params.set("set", query.set);
  if (query.series) params.set("series", query.series);
  if (query.year) params.set("year", query.year);
  if (query.rarity) params.set("rarity", query.rarity);
  if (query.type) params.set("type", query.type);
  if (query.supertype) params.set("supertype", query.supertype);
  if (query.illustrator) params.set("illustrator", query.illustrator);
  if (query.need) params.set("need", "1");
  if (query.page > 1) params.set("page", String(query.page));
  const text = params.toString();
  return text ? `?${text}` : "";
}

export function foldSearch(value: string): string {
  return value.normalize("NFKD").replace(/\p{M}/gu, "").toLowerCase();
}

export function prepareIndex(payload: CardIndexPayload, species: readonly string[]): PreparedIndex {
  return {
    payload,
    species: [...species],
    foldedNames: payload.names.map((name) => foldSearch(name)),
    foldedSpecies: species.map((name) => foldSearch(name)),
  };
}

function kindIndex(value: string): number {
  if (value === "p") return 0;
  if (value === "t") return 1;
  if (value === "e") return 2;
  if (value === "o") return 3;
  return -1;
}

export function decodeHeldBits(value: string): Uint8Array | null {
  if (!value) return null;
  const bin = atob(value);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i += 1) out[i] = bin.charCodeAt(i);
  return out;
}

function heldAt(bits: Uint8Array | null, index: number): boolean {
  if (!bits) return false;
  const byte = bits[index >> 3] ?? 0;
  return (byte & (1 << (index & 7))) !== 0;
}

export function searchCards(
  prepared: PreparedIndex,
  query: CardQuery,
  options: { locale: Locale; held: Uint8Array | null; needEnabled: boolean },
): { total: number; pages: number; hits: SearchHit[] } {
  const { payload, foldedNames, foldedSpecies } = prepared;
  const needle = foldSearch(query.q.trim());
  const dexHits = new Set<number>();
  if (needle) {
    for (let i = 0; i < foldedSpecies.length; i += 1) {
      if (foldedSpecies[i]?.includes(needle)) dexHits.add(i + 1);
    }
  }
  const setIndex = query.set ? payload.sets.findIndex((set) => set.id === query.set) : -2;
  const seriesIndex = query.series ? payload.series.findIndex((item) => item.slug === query.series) : -2;
  const year = /^\d{4}$/.test(query.year) ? Number(query.year) : query.year ? -1 : 0;
  const rarityIndex = query.rarity ? payload.rarities.findIndex((item) => item.slug === query.rarity) : -2;
  const typeIndex = query.type ? payload.types.indexOf(query.type) : -2;
  const typeBit = typeIndex >= 0 ? 1 << typeIndex : 0;
  const artistIndex = query.illustrator ? payload.artists.findIndex((item) => item.slug === query.illustrator) : -2;
  const kind = query.supertype ? kindIndex(query.supertype) : -2;

  const matched: number[] = [];
  for (let i = 0; i < payload.cards.length; i += 1) {
    const card = payload.cards[i];
    if (!card) continue;
    const set = payload.sets[card[0]];
    if (!set) continue;
    if (query.set && card[0] !== setIndex) continue;
    if (query.series && set.series !== seriesIndex) continue;
    if (query.year && set.year !== year) continue;
    if (query.rarity && card[4] !== rarityIndex) continue;
    if (query.type && (typeBit === 0 || (card[6] & typeBit) === 0)) continue;
    if (query.supertype && card[3] !== kind) continue;
    if (query.illustrator && card[5] !== artistIndex) continue;
    if (query.need && options.needEnabled && heldAt(options.held, i)) continue;
    if (needle) {
      const nameHit = foldedNames[card[2]]?.includes(needle) ?? false;
      if (!nameHit) {
        let dexHit = false;
        for (let d = 7; d < card.length; d += 1) {
          const dex = card[d];
          if (typeof dex === "number" && dexHits.has(dex)) {
            dexHit = true;
            break;
          }
        }
        if (!dexHit) continue;
      }
    }
    matched.push(i);
  }

  const pages = Math.max(1, Math.ceil(matched.length / CARD_PAGE_SIZE));
  const start = (query.page - 1) * CARD_PAGE_SIZE;
  const hits = matched.slice(start, start + CARD_PAGE_SIZE).flatMap((index) => {
    const card = payload.cards[index];
    if (!card) return [];
    const set = payload.sets[card[0]];
    const name = payload.names[card[2]];
    if (!set || !name) return [];
    const artist = card[5] >= 0 ? payload.artists[card[5]] : undefined;
    return [
      {
        href: localePath(options.locale, cardPath(set.id, { n: card[1], name })),
        name,
        fraction: `${card[1]}/${set.printed}`,
        setName: set.name,
        year: set.year ? String(set.year) : "",
        illustrator: artist?.name ?? "",
      },
    ];
  });
  return { total: matched.length, pages, hits };
}
