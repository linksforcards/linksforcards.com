import { cardImageUrl, tcgdexBase, type ImageQuality } from "./card-images";
import { isWesternPrintLanguage } from "./print-languages";

export type TcgdexBrief = {
  id: string;
  localId: string;
  name: string;
  image: string | null;
};

/** Thirty days. A printing name does not change between deploys. */
export const TCGDEX_REVALIDATE_SECONDS = 60 * 60 * 24 * 30;

const MEMORY_TTL_MS = TCGDEX_REVALIDATE_SECONDS * 1000;
const memory = new Map<string, { at: number; card: TcgdexBrief | null }>();
const inflight = new Map<string, Promise<TcgdexBrief | null>>();

let nextNetworkAt = 0;

/**
 * TCGdex card id from the English asset path built into the image sidecar.
 * `https://assets.tcgdex.net/en/swsh/swsh3/136` becomes `swsh3-136`.
 * Returns null when this catalog card has no TCGdex scan.
 */
export function tcgdexIdForCatalog(setId: string, number: string): string | null {
  const base = tcgdexBase(setId, number);
  if (!base) return null;
  let pathname = base;
  try {
    pathname = new URL(base).pathname;
  } catch {
    return null;
  }
  const parts = pathname.split("/").filter(Boolean);
  const localId = parts.at(-1);
  const tcgSet = parts.at(-2);
  if (!localId || !tcgSet) return null;
  if (!/^[A-Za-z0-9.]+$/.test(tcgSet) || !/^[A-Za-z0-9!?]+$/.test(localId)) return null;
  return `${tcgSet}-${localId}`;
}

export function tcgdexImageUrl(imageBase: string, quality: ImageQuality): string | null {
  if (!/^https:\/\/assets\.tcgdex\.net\/[a-z0-9-]+\/[A-Za-z0-9./_-]+$/i.test(imageBase)) return null;
  return `${imageBase.replace(/\/+$/, "")}/${quality}.webp`;
}

/**
 * Localized scan when we have one. Otherwise the English scan, then nothing.
 * Asian printings have no English scan to borrow.
 */
export function localizedImageUrl(
  language: string,
  setId: string,
  number: string,
  quality: ImageQuality,
  imageBase?: string | null,
): string | null {
  if (imageBase) {
    const direct = tcgdexImageUrl(imageBase, quality);
    if (direct) return direct;
  }
  if (!isWesternPrintLanguage(language)) return null;
  const english = cardImageUrl(setId, number, quality);
  if (!english) return null;
  if (language !== "en" && english.startsWith("https://assets.tcgdex.net/en/")) {
    return `https://assets.tcgdex.net/${language}/${english.slice("https://assets.tcgdex.net/en/".length)}`;
  }
  return english;
}

async function waitTurn(): Promise<void> {
  const now = Date.now();
  const start = Math.max(now, nextNetworkAt);
  nextNetworkAt = start + 120;
  const wait = start - now;
  if (wait > 0) await new Promise((resolve) => setTimeout(resolve, wait));
}

/**
 * One TCGdex card. Hits the in-process cache, then `fetch` with a 30-day
 * revalidation. Do not call this while painting a set list or a bulk paste
 * of hundreds of lines. Shipment logging uses it for a short list, or not at all.
 */
export async function getTcgdexCard(language: string, id: string): Promise<TcgdexBrief | null> {
  const lang = language.trim().toLowerCase();
  if (!/^[a-z]{2}(?:-[a-z]{2})?$/.test(lang)) return null;
  if (!/^[A-Za-z0-9.!?-]+$/.test(id) || id.length > 80) return null;
  const key = `${lang}:${id}`;
  const hit = memory.get(key);
  if (hit && Date.now() - hit.at < MEMORY_TTL_MS) return hit.card;
  const pending = inflight.get(key);
  if (pending) return pending;
  const run = fetchTcgdexCard(lang, id, key);
  inflight.set(key, run);
  try {
    return await run;
  } finally {
    inflight.delete(key);
  }
}

async function fetchTcgdexCard(lang: string, id: string, key: string): Promise<TcgdexBrief | null> {
  await waitTurn();
  const url = `https://api.tcgdex.net/v2/${encodeURIComponent(lang)}/cards/${encodeURIComponent(id)}`;
  try {
    const response = await fetch(url, {
      headers: { Accept: "application/json", "User-Agent": "linksforcards.com" },
      signal: AbortSignal.timeout(8_000),
      next: { revalidate: TCGDEX_REVALIDATE_SECONDS },
    } as RequestInit);
    if (response.status === 404) {
      memory.set(key, { at: Date.now(), card: null });
      return null;
    }
    if (!response.ok) return null;
    const data = (await response.json()) as { id?: unknown; localId?: unknown; name?: unknown; image?: unknown };
    const name = typeof data.name === "string" ? data.name.trim() : "";
    if (!name || name.length > 120) {
      memory.set(key, { at: Date.now(), card: null });
      return null;
    }
    const image =
      typeof data.image === "string" && tcgdexImageUrl(data.image, "low") ? data.image.replace(/\/+$/, "") : null;
    const card: TcgdexBrief = {
      id: typeof data.id === "string" ? data.id : id,
      localId: typeof data.localId === "string" ? data.localId : "",
      name,
      image,
    };
    memory.set(key, { at: Date.now(), card });
    return card;
  } catch {
    return null;
  }
}

export function clearTcgdexCache(): void {
  memory.clear();
  inflight.clear();
  nextNetworkAt = 0;
}
