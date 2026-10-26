import type { Graph } from "schema-dts";
import { themeCopy } from "@/content/theme-copy";
import { numbersMatch } from "./cards";
import { getSet, getSetCards, getSets, speciesName, type CatalogCard, type CatalogSet } from "./catalog";
import { fill, formatDay } from "./format";
import { formatDexNumber, generationOf, SPECIES_TOTAL } from "./generations";
import type { Messages } from "./i18n";
import { breadcrumbNode, ldGraph, pageNode, type Crumb } from "./jsonld";
import type { Locale } from "./locales";
import { localePath } from "./routing";
import { seriesSlug } from "./series";
import { speciesByDex, type Printing } from "./species-index";
import { themesForCard } from "./themes";

export type CardLink = { href: string; name: string };
export type PrintingCard = {
  href: string;
  name: string;
  fraction: string;
  setName: string;
  year: string;
};
export type CardStatus = "have" | "need" | "unknown";
export type CardFact = { label: string; value?: string; href?: string; links?: CardLink[] };

/** Other printings shown on the card page. The rest stay on the Pokédex page. */
export const PRINTING_CAP = 8;

export type ResolvedCard = {
  set: CatalogSet;
  card: CatalogCard;
  canonical: string;
};

export type CardView = {
  path: string;
  title: string;
  paragraph: string;
  fraction: string;
  status: CardStatus;
  crumbs: Crumb[];
  facts: CardFact[];
  binders: CardLink[];
  others: PrintingCard[];
  morePrintings: { href: string; count: number } | null;
  prev: CardLink | null;
  next: CardLink | null;
};

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)+$/;

let setsLongest: CatalogSet[] | null = null;
let pathCache: string[] | null = null;

/** Denominator printed on the card. Secret rares keep a number above this. */
export function setPrintedTotal(set: CatalogSet): number {
  return set.printed && set.printed > 0 ? set.printed : set.count;
}

export function cardFraction(set: CatalogSet, card: { n: string }): string {
  return `${card.n}/${setPrintedTotal(set)}`;
}

/**
 * Stable URL piece. Symbols that are not letters are spelled out so two Unown
 * and two Nidoran cards do not collapse into one slug.
 */
export function slugPart(value: string): string {
  const replaced = value
    .replace(/♂/g, "-m")
    .replace(/♀/g, "-f")
    .replace(/[δ∆Δ]/g, "-delta")
    .replace(/α/g, "-alpha")
    .replace(/β/g, "-beta")
    .replace(/γ/g, "-gamma")
    .replace(/★/g, "-star")
    .replace(/◇/g, "-prism")
    .replace(/!/g, "-excl")
    .replace(/\?/g, "-qmark")
    .replace(/['’]/g, "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
  return replaced.replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

export function cardSlug(setId: string, card: { n: string; name: string }): string {
  const number = slugPart(card.n);
  const name = slugPart(card.name);
  if (!number) return name ? `${setId}-card-${name}` : `${setId}-card`;
  return name ? `${setId}-${number}-${name}` : `${setId}-${number}`;
}

export function cardPath(setId: string, card: { n: string; name: string }): string {
  return `/cards/${cardSlug(setId, card)}`;
}

export function cardRowHref(locale: string, setId: string, card: { n: string; name: string }, _fallback?: string): string {
  return localePath(locale, cardPath(setId, card));
}

function setsLongestFirst(): CatalogSet[] {
  if (!setsLongest) {
    setsLongest = getSets()
      .slice()
      .sort((a, b) => b.id.length - a.id.length || a.id.localeCompare(b.id));
  }
  return setsLongest;
}

/** Every English card path, in set order. Cached after the first pass. */
export function listCardPaths(): string[] {
  if (pathCache) return pathCache;
  const paths: string[] = [];
  for (const set of getSets()) {
    const cards = getSetCards(set.id);
    if (!cards) continue;
    for (const card of cards) paths.push(cardPath(set.id, card));
  }
  pathCache = paths;
  return paths;
}

export function resolveCardSlug(slug: string): ResolvedCard | null {
  if (!SLUG.test(slug) || slug.length > 180) return null;
  for (const set of setsLongestFirst()) {
    if (!slug.startsWith(`${set.id}-`)) continue;
    const cards = getSetCards(set.id);
    if (!cards) return null;
    const rest = slug.slice(set.id.length + 1);
    let match: CatalogCard | null = null;
    let matchLen = -1;
    for (const card of cards) {
      const number = slugPart(card.n);
      if (!number) continue;
      if (rest === number || rest.startsWith(`${number}-`)) {
        if (number.length > matchLen) {
          match = card;
          matchLen = number.length;
        }
      }
    }
    if (!match) return null;
    return { set, card: match, canonical: cardSlug(set.id, match) };
  }
  return null;
}

export function cardIsHeld(held: Record<string, readonly string[]>, setId: string, number: string): boolean {
  return (held[setId] ?? []).some((value) => numbersMatch(number, value));
}

export function cardStatus(state: "ok" | "unconfigured" | "error", held: boolean): CardStatus {
  if (state === "error") return "unknown";
  return held ? "have" : "need";
}

function joinList(m: Messages, items: string[]): string {
  if (items.length <= 1) return items[0] ?? "";
  if (items.length === 2) return fill(m.cardPage.listTwo, { a: items[0] ?? "", b: items[1] ?? "" });
  return fill(m.cardPage.listLast, { list: items.slice(0, -1).join(", "), last: items.at(-1) ?? "" });
}

function traits(card: CatalogCard): string {
  return [...(card.st ?? []), ...(card.ty ?? [])].join(" ");
}

function kindSentence(m: Messages, card: CatalogCard): string {
  const line = traits(card);
  if (card.k === "p") {
    if (line && card.hp) return fill(m.cardPage.pokemonHp, { traits: line, hp: card.hp });
    if (line) return fill(m.cardPage.pokemon, { traits: line });
    if (card.hp) return fill(m.cardPage.pokemonPlainHp, { hp: card.hp });
    return m.cardPage.pokemonPlain;
  }
  if (card.k === "t") return line ? fill(m.cardPage.trainer, { traits: line }) : m.cardPage.trainerPlain;
  if (card.k === "e") return line ? fill(m.cardPage.energy, { traits: line }) : m.cardPage.energyPlain;
  return line ? fill(m.cardPage.other, { traits: line }) : m.cardPage.otherPlain;
}

function speciesLinks(locale: Locale, card: CatalogCard): CardLink[] {
  const links: CardLink[] = [];
  for (const dex of card.dex ?? []) {
    if (!Number.isInteger(dex) || dex < 1 || dex > SPECIES_TOTAL) continue;
    links.push({
      href: localePath(locale, `/pokedex/${dex}`),
      name: `${speciesName(dex, locale)} (${formatDexNumber(dex)})`,
    });
  }
  return links;
}

function binderLinks(locale: Locale, m: Messages, set: CatalogSet, card: CatalogCard): CardLink[] {
  const links: CardLink[] = [
    {
      href: localePath(locale, `/collections/set/${set.id}`),
      name: fill(m.cardPage.setBinder, { name: set.name }),
    },
  ];
  const generations: number[] = [];
  for (const dex of card.dex ?? []) {
    if (!Number.isInteger(dex) || dex < 1 || dex > SPECIES_TOTAL) continue;
    const generation = generationOf(dex);
    if (generation && !generations.includes(generation)) generations.push(generation);
  }
  generations.sort((a, b) => a - b);
  for (const generation of generations) {
    links.push({
      href: localePath(locale, `/collections/generation/${generation}`),
      name: fill(m.cardPage.genBinder, { gen: generation, region: m.regions[generation - 1] ?? "" }),
    });
  }
  for (const theme of themesForCard(set.id, card.n)) {
    const copy = themeCopy(locale, theme.slug);
    if (!copy) continue;
    links.push({ href: localePath(locale, `/collections/themes/${theme.slug}`), name: copy.h1 });
  }
  return links;
}

function otherPrintings(setId: string, card: CatalogCard): Printing[] {
  const seen = new Set<string>();
  const current = `${setId}:${card.n}`;
  const out: Printing[] = [];
  for (const dex of card.dex ?? []) {
    const record = speciesByDex(dex);
    if (!record) continue;
    for (const printing of record.printings) {
      const key = `${printing.setId}:${printing.number}`;
      if (key === current || seen.has(key)) continue;
      seen.add(key);
      out.push(printing);
    }
  }
  return out;
}

function releaseYear(value: string | undefined): string {
  const year = value?.slice(0, 4) ?? "";
  return /^\d{4}$/.test(year) ? year : "";
}

function fullestDex(card: CatalogCard): { dex: number; count: number } | null {
  let best: { dex: number; count: number } | null = null;
  for (const dex of card.dex ?? []) {
    if (!Number.isInteger(dex) || dex < 1 || dex > SPECIES_TOTAL) continue;
    const count = speciesByDex(dex)?.printings.length ?? 0;
    if (!best || count > best.count) best = { dex, count };
  }
  return best;
}

function neighbor(locale: Locale, set: CatalogSet, card: CatalogCard | null, label: string): CardLink | null {
  if (!card) return null;
  return { href: localePath(locale, cardPath(set.id, card)), name: `${label}: ${card.n} ${card.name}` };
}

export function buildCardView(
  locale: Locale,
  m: Messages,
  set: CatalogSet,
  card: CatalogCard,
  status: CardStatus,
): CardView {
  const fraction = cardFraction(set, card);
  const path = cardPath(set.id, card);
  const title = fill(m.cardPage.title, { name: card.name, fraction, set: set.name });
  const binders = binderLinks(locale, m, set, card);
  const species = speciesLinks(locale, card);
  const released = set.releaseDate
    ? fill(m.cardPage.releasedClause, { date: formatDay(set.releaseDate, locale) })
    : ".";
  const sentences = [
    fill(m.cardPage.lead, { name: card.name, fraction, set: set.name, series: set.series, released }),
    kindSentence(m, card),
  ];
  if (card.r) sentences.push(fill(m.cardPage.rarityLine, { rarity: card.r }));
  if (card.a) sentences.push(fill(m.cardPage.illustratorLine, { name: card.a }));
  if (species.length) sentences.push(fill(m.cardPage.speciesLine, { names: joinList(m, species.map((link) => link.name)) }));
  const numeric = /^(\d+)/.exec(card.n);
  if (set.printed && numeric && Number(numeric[1]) > set.printed) {
    sentences.push(fill(m.cardPage.secretLine, { printed: set.printed }));
  }
  sentences.push(fill(m.cardPage.belongsLine, { list: joinList(m, binders.map((link) => link.name)) }));
  if (status === "have") sentences.push(m.cardPage.statusHave);
  else if (status === "need") sentences.push(m.cardPage.statusNeed);
  else sentences.push(m.cardPage.statusUnknown);

  const facts: CardFact[] = [
    { label: m.cardPage.number, value: fraction },
    { label: m.cardPage.set, value: set.name, href: localePath(locale, `/collections/set/${set.id}`) },
    { label: m.cardPage.series, value: set.series, href: localePath(locale, `/collections/series/${seriesSlug(set.series)}`) },
  ];
  if (set.releaseDate) facts.push({ label: m.cardPage.released, value: formatDay(set.releaseDate, locale) });
  if (card.r) facts.push({ label: m.cardPage.rarity, value: card.r });
  facts.push({ label: m.cardPage.supertype, value: supertypeLabel(m, card) });
  if (card.st?.length) facts.push({ label: m.cardPage.subtypes, value: card.st.join(", ") });
  if (card.hp) facts.push({ label: m.cardPage.hp, value: card.hp });
  if (card.ty?.length) facts.push({ label: m.cardPage.types, value: card.ty.join(", ") });
  if (card.a) facts.push({ label: m.cardPage.illustrator, value: card.a });
  if (species.length) facts.push({ label: m.cardPage.pokedex, links: species });

  const cards = getSetCards(set.id) ?? [];
  const index = cards.findIndex((item) => item.n === card.n);
  const allOthers = otherPrintings(set.id, card);
  const fullest = fullestDex(card);
  const others = allOthers.slice(0, PRINTING_CAP).flatMap((printing) => {
    const printingSet = getSet(printing.setId);
    if (!printingSet) return [];
    const full = getSetCards(printing.setId)?.find((item) => item.n === printing.number);
    const named = full ?? { n: printing.number, name: printing.name };
    return [
      {
        href: localePath(locale, cardPath(printing.setId, named)),
        name: named.name,
        fraction: cardFraction(printingSet, named),
        setName: printingSet.name,
        year: releaseYear(printingSet.releaseDate),
      },
    ];
  });
  const morePrintings =
    fullest && allOthers.length > PRINTING_CAP
      ? { href: localePath(locale, `/pokedex/${fullest.dex}`), count: fullest.count }
      : null;

  return {
    path,
    title,
    paragraph: sentences.join(" "),
    fraction,
    status,
    crumbs: [
      { name: m.nav.home, href: localePath(locale, "/") },
      { name: m.nav.collections, href: localePath(locale, "/collections") },
      { name: set.series, href: localePath(locale, `/collections/series/${seriesSlug(set.series)}`) },
      { name: set.name, href: localePath(locale, `/collections/set/${set.id}`) },
      { name: `${card.name} ${fraction}`, href: localePath(locale, path) },
    ],
    facts,
    binders,
    others,
    morePrintings,
    prev: neighbor(locale, set, index > 0 ? (cards[index - 1] ?? null) : null, m.cardPage.previous),
    next: neighbor(locale, set, index >= 0 ? (cards[index + 1] ?? null) : null, m.cardPage.next),
  };
}

function supertypeLabel(m: Messages, card: CatalogCard): string {
  if (card.k === "p") return m.checklist.supertypeP;
  if (card.k === "t") return m.checklist.supertypeT;
  if (card.k === "e") return m.checklist.supertypeE;
  return m.checklist.supertypeO;
}

export function metaDescription(paragraph: string): string {
  if (paragraph.length <= 240) return paragraph;
  const cut = paragraph.slice(0, 237);
  const space = cut.lastIndexOf(" ");
  return `${(space > 140 ? cut.slice(0, space) : cut).trimEnd()}…`;
}

export function cardPageGraph(locale: Locale, view: CardView): Graph {
  return ldGraph([
    pageNode({
      kind: "WebPage",
      locale,
      path: view.path,
      name: view.title,
      description: view.paragraph,
    }),
    breadcrumbNode(view.crumbs),
  ]);
}
