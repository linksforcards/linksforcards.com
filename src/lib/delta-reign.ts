import { getSetCards, getSets, type CatalogSet } from "./catalog";

/**
 * Dates published by The Pokémon Company International.
 * Retail and card count: https://www.pokemon.com/us/pokemon-tcg/mega-evolution-delta-reign
 * Press alert (20 Aug 2026): TCG Live on 5 Nov 2026, prereleases beginning 24 Oct 2026.
 * https://press.pokemon.com/en/MEDIA-ALERT-New-Pokemon-Trading-Card-Game-Mega-EvolutionDelta-Reign-Ex
 */
export const DELTA_REIGN_DATES = {
  announced: "2026-08-20",
  prereleaseNote: "2026-09-28",
  showcase: "2026-10-23",
  prerelease: "2026-10-24",
  live: "2026-11-05",
  retail: "2026-11-06",
} as const;

export const DELTA_REIGN_PATH = "/collections/set/delta-reign";
export const DELTA_REIGN_SERIES = "Mega Evolution";

/**
 * Attach the checklist when the public dataset adds this expansion.
 * Pokémon.com files the product images under me06 (showcase page, 23 Oct 2026).
 * The open dataset has been using me1, me2, me5, and so on, so me6 is the other id to watch.
 * A set whose name contains "Delta Reign" matches even if the id differs.
 */
export const DELTA_REIGN_CATALOG_IDS = ["me6", "me06"] as const;

export function matchDeltaReignSet<T extends { id: string; name: string }>(sets: readonly T[]): T | null {
  for (const id of DELTA_REIGN_CATALOG_IDS) {
    const found = sets.find((set) => set.id === id);
    if (found) return found;
  }
  return sets.find((set) => set.name.toLowerCase().includes("delta reign")) ?? null;
}

export function findDeltaReignSet(): CatalogSet | null {
  return matchDeltaReignSet(getSets());
}

export function deltaReignCardList(): { set: CatalogSet; cards: NonNullable<ReturnType<typeof getSetCards>> } | null {
  const set = findDeltaReignSet();
  if (!set) return null;
  const cards = getSetCards(set.id);
  if (!cards || cards.length === 0) return null;
  return { set, cards };
}
