import { getSetCards, getSets, type CardKind } from "./catalog";
import { SPECIES_TOTAL, generationOf } from "./generations";

export type Printing = {
  setId: string;
  number: string;
  name: string;
  kind: CardKind;
};

export type SpeciesRecord = {
  dex: number;
  generation: number;
  printings: Printing[];
  setIds: string[];
  kinds: Record<CardKind, number>;
  first: Printing;
  latest: Printing;
};

let cache: Map<number, SpeciesRecord> | null = null;

function comparePrintings(dates: Map<string, string>, a: Printing, b: Printing): number {
  const byDate = (dates.get(a.setId) ?? "").localeCompare(dates.get(b.setId) ?? "");
  if (byDate) return byDate;
  const bySet = a.setId.localeCompare(b.setId);
  if (bySet) return bySet;
  return a.number.localeCompare(b.number, "en", { numeric: true });
}

/**
 * One pass over the catalog. A combo card shares one printing object across
 * each of its dex numbers. Callers must not mutate those objects.
 */
export function speciesIndex(): Map<number, SpeciesRecord> {
  if (cache) return cache;
  const dates = new Map(getSets().map((set) => [set.id, set.releaseDate]));
  const buckets = new Map<number, Printing[]>();
  for (const set of getSets()) {
    const cards = getSetCards(set.id);
    if (!cards) continue;
    for (const card of cards) {
      if (!card.dex || card.dex.length === 0) continue;
      const printing: Printing = { setId: set.id, number: card.n, name: card.name, kind: card.k };
      for (const dex of card.dex) {
        if (!Number.isInteger(dex) || dex < 1 || dex > SPECIES_TOTAL) continue;
        const list = buckets.get(dex);
        if (list) list.push(printing);
        else buckets.set(dex, [printing]);
      }
    }
  }

  const map = new Map<number, SpeciesRecord>();
  for (const [dex, printings] of buckets) {
    printings.sort((a, b) => comparePrintings(dates, a, b));
    const setIds: string[] = [];
    const seen = new Set<string>();
    const kinds: Record<CardKind, number> = { p: 0, t: 0, e: 0, o: 0 };
    for (const printing of printings) {
      kinds[printing.kind] += 1;
      if (seen.has(printing.setId)) continue;
      seen.add(printing.setId);
      setIds.push(printing.setId);
    }
    const first = printings[0];
    const latest = printings[printings.length - 1];
    if (!first || !latest) continue;
    map.set(dex, {
      dex,
      generation: generationOf(dex) ?? 1,
      printings,
      setIds,
      kinds,
      first,
      latest,
    });
  }
  cache = map;
  return map;
}

export function speciesByDex(dex: number): SpeciesRecord | null {
  if (!Number.isInteger(dex) || dex < 1 || dex > SPECIES_TOTAL) return null;
  return speciesIndex().get(dex) ?? null;
}
