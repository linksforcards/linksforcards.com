import { getSetCards, getSets, type CatalogCard, type CatalogSet } from "./catalog";
import { cardPath, slugPart } from "./slug";

/**
 * Pages with fewer than this many cards stay on the site so a card page can
 * link to them, but they are noindex and left out of the sitemap.
 *
 * One to three cards mostly repeat those card pages. There is not a real
 * set/year group, and a "most frequent Pokémon" count cannot repeat.
 * Four is the smallest list that can show a group and a species that
 * actually appears more than once.
 */
export const ILLUSTRATOR_INDEX_MIN = 4;

export type IllustratorCard = {
  number: string;
  name: string;
  path: string;
  dex: number[];
};

export type IllustratorGroup = {
  setId: string;
  setName: string;
  series: string;
  year: string;
  releaseDate: string;
  printed: number;
  cards: IllustratorCard[];
};

export type IllustratorPokemon = { dex: number; count: number };

export type Illustrator = {
  name: string;
  slug: string;
  count: number;
  /** True when the page is long enough for the sitemap. */
  indexed: boolean;
  setCount: number;
  groups: IllustratorGroup[];
  first: { card: IllustratorCard; setName: string; year: string };
  latest: { card: IllustratorCard; setName: string; year: string };
  /** Species that appear at least twice, most frequent first, at most three. */
  topPokemon: IllustratorPokemon[];
  speciesCount: number;
  yearStart: string;
  yearEnd: string;
};

export type IllustratorSummary = {
  name: string;
  slug: string;
  count: number;
  indexed: boolean;
};

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

let cache: Illustrator[] | null = null;
let bySlug: Map<string, Illustrator> | null = null;
let byName: Map<string, Illustrator> | null = null;

function yearOf(value: string): string {
  const year = value.slice(0, 4);
  return /^\d{4}$/.test(year) ? year : "";
}

function printedTotal(set: CatalogSet): number {
  return set.printed && set.printed > 0 ? set.printed : set.count;
}

function cardOf(set: CatalogSet, card: CatalogCard): IllustratorCard {
  return {
    number: card.n,
    name: card.name,
    path: cardPath(set.id, card),
    dex: (card.dex ?? []).filter((dex) => Number.isInteger(dex) && dex > 0),
  };
}

function assignSlugs(names: string[]): Map<string, string> {
  const slugs = new Map<string, string>();
  const used = new Map<string, number>();
  for (const name of names) {
    const base = slugPart(name) || "illustrator";
    const seen = (used.get(base) ?? 0) + 1;
    used.set(base, seen);
    slugs.set(name, seen === 1 ? base : `${base}-${seen}`);
  }
  return slugs;
}

function build(): Illustrator[] {
  const buckets = new Map<string, { set: CatalogSet; card: CatalogCard }[]>();
  for (const set of getSets()) {
    const cards = getSetCards(set.id);
    if (!cards) continue;
    for (const card of cards) {
      const name = card.a?.trim();
      if (!name) continue;
      const list = buckets.get(name);
      const row = { set, card };
      if (list) list.push(row);
      else buckets.set(name, [row]);
    }
  }

  const names = [...buckets.keys()].sort((a, b) => a.localeCompare(b, "en"));
  const slugs = assignSlugs(names);
  const illustrators: Illustrator[] = [];

  for (const name of names) {
    const rows = buckets.get(name) ?? [];
    const grouped = new Map<string, IllustratorGroup>();
    for (const row of rows) {
      let group = grouped.get(row.set.id);
      if (!group) {
        group = {
          setId: row.set.id,
          setName: row.set.name,
          series: row.set.series,
          year: yearOf(row.set.releaseDate),
          releaseDate: row.set.releaseDate,
          printed: printedTotal(row.set),
          cards: [],
        };
        grouped.set(row.set.id, group);
      }
      group.cards.push(cardOf(row.set, row.card));
    }
    const groups = [...grouped.values()].sort((a, b) => {
      const byDate = (a.releaseDate || "9999").localeCompare(b.releaseDate || "9999");
      if (byDate) return byDate;
      return a.setId.localeCompare(b.setId);
    });
    const firstGroup = groups[0];
    const lastGroup = groups[groups.length - 1];
    const firstCard = firstGroup?.cards[0];
    const latestCard = lastGroup?.cards[lastGroup.cards.length - 1];
    if (!firstGroup || !lastGroup || !firstCard || !latestCard) continue;

    const species = new Map<number, number>();
    for (const group of groups) {
      for (const card of group.cards) {
        for (const dex of card.dex) species.set(dex, (species.get(dex) ?? 0) + 1);
      }
    }
    const topPokemon = [...species.entries()]
      .filter(([, count]) => count >= 2)
      .sort((a, b) => b[1] - a[1] || a[0] - b[0])
      .slice(0, 3)
      .map(([dex, count]) => ({ dex, count }));
    const years = groups.map((group) => group.year).filter(Boolean).sort();

    illustrators.push({
      name,
      slug: slugs.get(name) ?? slugPart(name),
      count: rows.length,
      indexed: rows.length >= ILLUSTRATOR_INDEX_MIN,
      setCount: groups.length,
      groups,
      first: { card: firstCard, setName: firstGroup.setName, year: firstGroup.year },
      latest: { card: latestCard, setName: lastGroup.setName, year: lastGroup.year },
      topPokemon,
      speciesCount: species.size,
      yearStart: years[0] ?? "",
      yearEnd: years[years.length - 1] ?? "",
    });
  }

  illustrators.sort((a, b) => a.name.localeCompare(b.name, "en") || a.slug.localeCompare(b.slug));
  return illustrators;
}

function ensure(): Illustrator[] {
  if (!cache || !bySlug || !byName) {
    cache = build();
    bySlug = new Map(cache.map((item) => [item.slug, item]));
    byName = new Map(cache.map((item) => [item.name, item]));
  }
  return cache;
}

export function getIllustrators(): Illustrator[] {
  return ensure();
}

export function illustratorForName(name: string): Illustrator | null {
  ensure();
  return byName?.get(name.trim()) ?? null;
}

export function getIllustrator(slug: string): Illustrator | null {
  if (!SLUG.test(slug) || slug.length > 160) return null;
  ensure();
  return bySlug?.get(slug) ?? null;
}

export function illustratorPath(slug: string): string {
  return `/illustrators/${slug}`;
}

/** Illustrators with enough cards to sit in the sitemap. */
export function listIndexedIllustratorPaths(): string[] {
  return getIllustrators()
    .filter((item) => item.indexed)
    .map((item) => illustratorPath(item.slug));
}

export function illustratorSummaries(): IllustratorSummary[] {
  return getIllustrators().map((item) => ({
    name: item.name,
    slug: item.slug,
    count: item.count,
    indexed: item.indexed,
  }));
}

export function illustratorCardTotal(): number {
  return getIllustrators().reduce((sum, item) => sum + item.count, 0);
}
