import type { Graph } from "schema-dts";
import { cardImageAlt, cardImageUrl } from "./card-images";
import { speciesName } from "./catalog";
import { metaDescription } from "./card-page";
import { fill, formatInt } from "./format";
import type { Messages } from "./i18n";
import { type Illustrator, type IllustratorGroup, illustratorPath } from "./illustrators";
import { breadcrumbNode, ldGraph, pageNode, type Crumb } from "./jsonld";
import { cardPageIndexed, type Locale } from "./locales";
import { localePath } from "./routing";

export type IllustratorLink = { href: string; name: string };

export type IllustratorView = {
  path: string;
  title: string;
  description: string;
  paragraph: string;
  indexed: boolean;
  crumbs: Crumb[];
  have: string;
  sets: IllustratorLink[];
  groups: {
    id: string;
    heading: string;
    href: string;
    cards: { href: string; name: string; image: string | null; alt: string }[];
  }[];
};

function joinList(m: Messages, items: string[]): string {
  if (items.length <= 1) return items[0] ?? "";
  if (items.length === 2) return fill(m.cardPage.listTwo, { a: items[0] ?? "", b: items[1] ?? "" });
  return fill(m.cardPage.listLast, { list: items.slice(0, -1).join(", "), last: items.at(-1) ?? "" });
}

function yearClause(m: Messages, year: string): string {
  return year ? fill(m.illustratorsPage.yearClause, { year }) : "";
}

function cardLabel(card: { name: string; number: string }, printed: number): string {
  return `${card.name} ${card.number}/${printed}`;
}

function groupPrinted(group: IllustratorGroup): number {
  return group.printed;
}

export function buildIllustratorView(
  locale: Locale,
  m: Messages,
  artist: Illustrator,
  collected: number | null,
): IllustratorView {
  const path = illustratorPath(artist.slug);
  const title = fill(m.meta.illustratorTitle, { name: artist.name });
  const count = formatInt(artist.count, locale);
  const sets = formatInt(artist.setCount, locale);
  const onlySet = artist.groups[0];
  let lead: string;
  if (artist.count === 1 && onlySet) {
    lead = fill(m.illustratorsPage.leadOneCard, { name: artist.name, set: onlySet.setName });
  } else if (artist.setCount === 1 && onlySet) {
    lead = fill(m.illustratorsPage.leadOneSet, { name: artist.name, count, set: onlySet.setName });
  } else {
    lead = fill(m.illustratorsPage.leadMany, { name: artist.name, count, sets });
  }

  const sentences = [lead];
  const sameCard = artist.first.card.path === artist.latest.card.path;
  const firstGroup = artist.groups[0];
  const lastGroup = artist.groups[artist.groups.length - 1];
  if (sameCard && firstGroup) {
    sentences.push(
      fill(m.illustratorsPage.only, {
        card: cardLabel(artist.first.card, groupPrinted(firstGroup)),
        set: artist.first.setName,
        year: yearClause(m, artist.first.year),
      }),
    );
  } else if (firstGroup && lastGroup) {
    sentences.push(
      fill(m.illustratorsPage.span, {
        card: cardLabel(artist.first.card, groupPrinted(firstGroup)),
        set: artist.first.setName,
        year: yearClause(m, artist.first.year),
        latest: cardLabel(artist.latest.card, groupPrinted(lastGroup)),
        latestSet: artist.latest.setName,
        latestYear: yearClause(m, artist.latest.year),
      }),
    );
  }
  if (artist.yearStart && artist.yearEnd && artist.yearStart !== artist.yearEnd) {
    sentences.push(fill(m.illustratorsPage.yearSpan, { start: artist.yearStart, end: artist.yearEnd }));
  } else if (artist.yearStart) {
    sentences.push(fill(m.illustratorsPage.sameYear, { year: artist.yearStart }));
  }

  if (artist.speciesCount === 0) sentences.push(m.illustratorsPage.pokemonNone);
  else if (artist.topPokemon.length === 0) {
    sentences.push(fill(m.illustratorsPage.pokemonOnce, { count: formatInt(artist.speciesCount, locale) }));
  } else if (artist.topPokemon.length === 1) {
    const top = artist.topPokemon[0];
    if (top) {
      sentences.push(
        fill(m.illustratorsPage.pokemonTop, {
          name: speciesName(top.dex, locale),
          count: formatInt(top.count, locale),
        }),
      );
    }
  } else {
    const list = joinList(
      m,
      artist.topPokemon.map((item) => `${speciesName(item.dex, locale)} (${formatInt(item.count, locale)})`),
    );
    sentences.push(fill(m.illustratorsPage.pokemonTops, { list }));
  }

  let have = "";
  if (collected === null) have = m.illustratorsPage.unknown;
  else if (collected === 0) have = m.illustratorsPage.haveNone;
  else have = fill(m.illustratorsPage.have, { collected: formatInt(collected, locale) });
  sentences.push(have);

  const paragraph = sentences.join(" ");
  const crumbs: Crumb[] = [
    { name: m.nav.home, href: localePath(locale, "/") },
    { name: m.illustratorsPage.crumb, href: localePath(locale, "/illustrators") },
    { name: artist.name, href: localePath(locale, path) },
  ];

  return {
    path,
    title,
    description: metaDescription(paragraph),
    paragraph,
    indexed: artist.indexed && cardPageIndexed(locale),
    crumbs,
    have,
    sets: artist.groups.map((group) => ({
      href: `#set-${group.setId}`,
      name: group.year ? `${group.setName} (${group.year})` : group.setName,
    })),
    groups: artist.groups.map((group) => ({
      id: `set-${group.setId}`,
      heading: group.year ? `${group.setName} · ${group.year}` : group.setName,
      href: localePath(locale, `/collections/set/${group.setId}`),
      cards: group.cards.map((card) => ({
        href: localePath(locale, card.path),
        name: `${card.name} ${card.number}/${group.printed}`,
        image: cardImageUrl(group.setId, card.number, "low"),
        alt: cardImageAlt(m.checklist.cardAlt, card.name, group.setName, card.number),
      })),
    })),
  };
}

export function illustratorPageGraph(locale: Locale, view: IllustratorView): Graph {
  return ldGraph([
    pageNode({
      kind: "CollectionPage",
      locale,
      path: view.path,
      name: view.title,
      description: view.description,
    }),
    breadcrumbNode(view.crumbs),
  ]);
}
