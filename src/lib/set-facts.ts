import { getSetCards, type CardKind } from "./catalog";
import { formatInt } from "./format";
import { SPECIES_TOTAL, generationOf } from "./generations";
import type { Locale } from "./locales";

export type SetFacts = {
  kinds: Record<CardKind, number>;
  dexes: number[];
  generations: number[];
};

export function setFacts(setId: string): SetFacts | null {
  const cards = getSetCards(setId);
  if (!cards) return null;
  const kinds: Record<CardKind, number> = { p: 0, t: 0, e: 0, o: 0 };
  const dexes = new Set<number>();
  const generations = new Set<number>();
  for (const card of cards) {
    kinds[card.k] += 1;
    for (const dex of card.dex ?? []) {
      if (!Number.isInteger(dex) || dex < 1 || dex > SPECIES_TOTAL) continue;
      dexes.add(dex);
      const generation = generationOf(dex);
      if (generation) generations.add(generation);
    }
  }
  return {
    kinds,
    dexes: [...dexes].sort((a, b) => a - b),
    generations: [...generations].sort((a, b) => a - b),
  };
}

export function kindSummary(kinds: Record<CardKind, number>, labels: Record<CardKind, string>, locale: Locale): string {
  const order: CardKind[] = ["p", "t", "e", "o"];
  return order
    .filter((kind) => kinds[kind] > 0)
    .map((kind) => `${formatInt(kinds[kind], locale)} ${labels[kind]}`)
    .join(", ");
}
