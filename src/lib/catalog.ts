import { readFileSync } from "node:fs";
import path from "node:path";
import { numbersMatch } from "./cards";

export type CardKind = "p" | "t" | "e" | "o";

export type CatalogCard = {
  n: string;
  name: string;
  k: CardKind;
  dex?: number[];
};

export type CatalogSet = {
  id: string;
  name: string;
  series: string;
  releaseDate: string;
  count: number;
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

const TRANSLATED = new Set(["en", "de", "fr", "es", "it"]);

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

export function getSets(): CatalogSet[] {
  if (!setsCache) {
    setsCache = JSON.parse(readFileSync(catalogFile("sets.json"), "utf8")) as CatalogSet[];
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
  const cards = parsed.map((card) => ({ ...card, k: asKind(card.k) }));
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
  return TRANSLATED.has(locale);
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
