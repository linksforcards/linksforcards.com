import { readFileSync } from "node:fs";
import path from "node:path";
import { numbersMatch } from "./cards";

export type CardKind = "p" | "t" | "e" | "o";

export type CatalogCard = {
  n: string;
  name: string;
  k: CardKind;
  dex?: number[];
  /** Rarity label from the open dataset, when it has one. */
  r?: string;
  /** Subtypes such as Basic, Stage 2, Item, or Supporter. */
  st?: string[];
  /** Hit points, digits only. Pokémon cards. */
  hp?: string;
  /** Energy types, when the card has them. */
  ty?: string[];
  /** Illustrator. The dataset calls this field artist. */
  a?: string;
};

export type CatalogSet = {
  id: string;
  name: string;
  series: string;
  releaseDate: string;
  /** Cards in the checklist, including numbers above the printed size. */
  count: number;
  /** Denominator printed on the card, such as 102 in 4/102. */
  printed?: number;
};

export type CatalogMeta = {
  source: string;
  sourceCommit: string;
  speciesSource: string;
  builtAt: string;
  sets: number;
  cards: number;
  maxDexSeen: number;
  generationScope: string;
  contents: string;
};

type DexFile = { en: string[]; de: string[]; fr: string[]; es: string[]; it: string[] };

const TRANSLATED = new Set(["de", "fr", "es", "it"]);
const ENGLISH = new Set(["us", "uk", "en"]);

let setsCache: CatalogSet[] | null = null;
let dexCache: DexFile | null = null;
let metaCache: CatalogMeta | null = null;
const cardCache = new Map<string, CatalogCard[]>();

function catalogFile(...parts: string[]): string {
  return path.join(process.cwd(), "data", "catalog", ...parts);
}

function asKind(value: string): CardKind {
  if (value === "p" || value === "t" || value === "e" || value === "o") return value;
  return "o";
}

function cleanText(value: unknown, max: number): string | undefined {
  if (typeof value !== "string") return undefined;
  const text = value.trim();
  if (!text || text.length > max) return undefined;
  return text;
}

function cleanList(value: unknown): string[] | undefined {
  if (!Array.isArray(value)) return undefined;
  const items = value.map((item) => cleanText(item, 40)).filter((item): item is string => Boolean(item));
  return items.length ? items : undefined;
}

function normalizeCard(card: CatalogCard): CatalogCard {
  const hp = cleanText(card.hp, 4);
  const rarity = cleanText(card.r, 80);
  const artist = cleanText(card.a, 120);
  const subtypes = cleanList(card.st);
  const types = cleanList(card.ty);
  return {
    n: card.n,
    name: card.name,
    k: asKind(card.k),
    ...(card.dex?.length ? { dex: card.dex } : {}),
    ...(rarity ? { r: rarity } : {}),
    ...(subtypes ? { st: subtypes } : {}),
    ...(hp && /^\d{1,4}$/.test(hp) ? { hp } : {}),
    ...(types ? { ty: types } : {}),
    ...(artist ? { a: artist } : {}),
  };
}

export function getSets(): CatalogSet[] {
  if (!setsCache) {
    const parsed = JSON.parse(readFileSync(catalogFile("sets.json"), "utf8")) as CatalogSet[];
    setsCache = parsed.map((set) => ({
      id: set.id,
      name: set.name,
      series: set.series,
      releaseDate: set.releaseDate,
      count: set.count,
      ...(Number.isInteger(set.printed) && (set.printed ?? 0) > 0 ? { printed: set.printed } : {}),
    }));
  }
  return setsCache;
}

export function getMeta(): CatalogMeta {
  if (!metaCache) {
    metaCache = JSON.parse(readFileSync(catalogFile("meta.json"), "utf8")) as CatalogMeta;
  }
  return metaCache;
}

export function getSet(id: string): CatalogSet | null {
  if (!/^[a-z0-9]+$/.test(id)) return null;
  return getSets().find((set) => set.id === id) ?? null;
}

export function getSetCards(id: string): CatalogCard[] | null {
  if (!getSet(id)) return null;
  const cached = cardCache.get(id);
  if (cached) return cached;
  const parsed = JSON.parse(readFileSync(catalogFile("cards", `${id}.json`), "utf8")) as CatalogCard[];
  const cards = parsed.map((card) => normalizeCard(card));
  cardCache.set(id, cards);
  return cards;
}

export function matchCard(cards: CatalogCard[], input: string): CatalogCard | null {
  return cards.find((card) => numbersMatch(card.n, input)) ?? null;
}

export function setsBySeries(): { series: string; sets: CatalogSet[] }[] {
  const order: string[] = [];
  const groups = new Map<string, CatalogSet[]>();
  for (const set of getSets()) {
    if (!groups.has(set.series)) {
      groups.set(set.series, []);
      order.push(set.series);
    }
    groups.get(set.series)?.push(set);
  }
  return order.map((series) => ({ series, sets: groups.get(series) ?? [] }));
}

function dexFile(): DexFile {
  if (!dexCache) dexCache = JSON.parse(readFileSync(catalogFile("dex.json"), "utf8")) as DexFile;
  return dexCache;
}

export function speciesNamesAreTranslated(locale: string): boolean {
  return TRANSLATED.has(locale) || ENGLISH.has(locale);
}

export function speciesName(dexNumber: number, locale: string): string {
  const dex = dexFile();
  const lang = TRANSLATED.has(locale) ? (locale as keyof DexFile) : "en";
  return dex[lang][dexNumber - 1] || dex.en[dexNumber - 1] || `Pokémon ${dexNumber}`;
}

/** Reserved for a rights-cleared image source. Returns null until one exists. */
export function cardImageSrc(_setId: string, _number: string): string | null {
  return null;
}
