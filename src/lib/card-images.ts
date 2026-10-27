import raw from "../../data/catalog/images.json";
import { fill } from "./format";

export type ImageQuality = "low" | "high";
export type ImageKind = "tcgdex" | "pokemontcg";

type SetRecord = {
  p?: string;
  pad?: number;
  alias?: Record<string, string>;
  miss?: string[];
  full?: Record<string, string>;
  /** Numbers whose low.webp 404s while high.webp exists. Lists use the high file. */
  hi?: string[];
};

type ImageFile = {
  v: 1;
  source: string;
  assets: string;
  fallback: string;
  builtAt: string;
  stats: { cards: number; tcgdex: number; fallback: number; none: number };
  sets: Record<string, SetRecord>;
  fb: Record<string, string[]>;
  fbHires: string[];
};

const file = raw as ImageFile;
const missing = new Map<string, Set<string>>();
const fallback = new Map<string, Set<string>>();
const highOnly = new Map<string, Set<string>>();

for (const [setId, record] of Object.entries(file.sets)) {
  if (record.miss?.length) missing.set(setId, new Set(record.miss));
  if (record.hi?.length) highOnly.set(setId, new Set(record.hi));
}
for (const [setId, numbers] of Object.entries(file.fb)) {
  fallback.set(setId, new Set(numbers));
}
const hires = new Set(file.fbHires);

/** TCGdex base URL from the API `image` field, without a quality suffix. */
export function tcgdexBase(setId: string, number: string): string | null {
  const record = file.sets[setId];
  if (!record) return null;
  const full = record.full?.[number];
  if (full) return full;
  if (missing.get(setId)?.has(number)) return null;
  if (!record.p) return null;
  const local = record.alias?.[number] ?? (record.pad ? number.padStart(record.pad, "0") : number);
  return `${record.p}${local}`;
}

export function cardImageKind(setId: string, number: string): ImageKind | null {
  if (tcgdexBase(setId, number)) return "tcgdex";
  if (fallback.get(setId)?.has(number)) return "pokemontcg";
  return null;
}

export function cardImageUrl(setId: string, number: string, quality: ImageQuality): string | null {
  const base = tcgdexBase(setId, number);
  if (base) {
    const fileQuality = quality === "low" && highOnly.get(setId)?.has(number) ? "high" : quality;
    return `${base}/${fileQuality}.webp`;
  }
  if (!fallback.get(setId)?.has(number)) return null;
  const id = encodeURIComponent(setId);
  const n = encodeURIComponent(number);
  if (quality === "high" && hires.has(setId)) return `https://images.pokemontcg.io/${id}/${n}_hires.png`;
  return `https://images.pokemontcg.io/${id}/${n}.png`;
}

export function cardImageAlt(template: string, cardName: string, setName: string, number: string): string {
  return fill(template, { name: cardName, set: setName, number });
}

export function imageStats(): ImageFile["stats"] {
  return file.stats;
}
