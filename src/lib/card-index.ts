import { numbersMatch } from "./cards";
import { getSetCards, getSets, speciesName } from "./catalog";
import { prepareIndex, type CardIndexPayload, type CardTuple, type PreparedIndex } from "./card-query";
import { SPECIES_TOTAL } from "./generations";
import { getIllustrators } from "./illustrators";
import type { Locale } from "./locales";
import { seriesSlug } from "./series";
import { slugPart } from "./slug";

const KIND: Record<string, number> = { p: 0, t: 1, e: 2, o: 3 };

let payloadCache: CardIndexPayload | null = null;

function uniqueSlug(base: string, used: Map<string, number>): string {
  const seen = (used.get(base) ?? 0) + 1;
  used.set(base, seen);
  return seen === 1 ? base : `${base}-${seen}`;
}

function build(): CardIndexPayload {
  const sets = getSets();
  const seriesUsed = new Map<string, number>();
  const series: CardIndexPayload["series"] = [];
  const seriesOf = new Map<string, number>();
  for (const set of sets) {
    if (seriesOf.has(set.series)) continue;
    const slug = uniqueSlug(seriesSlug(set.series) || "series", seriesUsed);
    seriesOf.set(set.series, series.length);
    series.push({ name: set.series, slug });
  }

  const rarityUsed = new Map<string, number>();
  const rarities: CardIndexPayload["rarities"] = [];
  const rarityOf = new Map<string, number>();
  const types: string[] = [];
  const typeOf = new Map<string, number>();
  const names: string[] = [];
  const nameOf = new Map<string, number>();
  const artists = getIllustrators().map((item) => ({ name: item.name, slug: item.slug }));
  const artistOf = new Map(artists.map((item, index) => [item.name, index]));

  const setRows: CardIndexPayload["sets"] = [];
  const cards: CardTuple[] = [];
  const years = new Set<number>();

  for (const set of sets) {
    const yearText = set.releaseDate.slice(0, 4);
    const year = /^\d{4}$/.test(yearText) ? Number(yearText) : 0;
    if (year) years.add(year);
    const printed = set.printed && set.printed > 0 ? set.printed : set.count;
    const setIndex = setRows.length;
    setRows.push({
      id: set.id,
      name: set.name,
      series: seriesOf.get(set.series) ?? 0,
      year,
      printed,
    });
    const list = getSetCards(set.id);
    if (!list) continue;
    for (const card of list) {
      let nameIndex = nameOf.get(card.name);
      if (nameIndex === undefined) {
        nameIndex = names.length;
        names.push(card.name);
        nameOf.set(card.name, nameIndex);
      }
      let rarity = -1;
      if (card.r) {
        const existing = rarityOf.get(card.r);
        if (existing === undefined) {
          rarity = rarities.length;
          rarityOf.set(card.r, rarity);
          rarities.push({ name: card.r, slug: uniqueSlug(slugPart(card.r) || "rarity", rarityUsed) });
        } else rarity = existing;
      }
      let typeMask = 0;
      for (const type of card.ty ?? []) {
        let bit = typeOf.get(type);
        if (bit === undefined) {
          bit = types.length;
          if (bit > 30) continue;
          types.push(type);
          typeOf.set(type, bit);
        }
        typeMask |= 1 << bit;
      }
      const artist = card.a ? (artistOf.get(card.a) ?? -1) : -1;
      const tuple: CardTuple = [
        setIndex,
        card.n,
        nameIndex,
        KIND[card.k] ?? 3,
        rarity,
        artist,
        typeMask,
      ];
      for (const dex of card.dex ?? []) {
        if (Number.isInteger(dex) && dex > 0) tuple.push(dex);
      }
      cards.push(tuple);
    }
  }

  return {
    sets: setRows,
    series,
    years: [...years].sort((a, b) => a - b),
    rarities,
    types,
    artists,
    names,
    cards,
  };
}

export function getCardIndexPayload(): CardIndexPayload {
  if (!payloadCache) payloadCache = build();
  return payloadCache;
}

const preparedByLocale = new Map<string, PreparedIndex>();

export function preparedCardIndex(locale: Locale): PreparedIndex {
  const cached = preparedByLocale.get(locale);
  if (cached) return cached;
  const species: string[] = [];
  for (let dex = 1; dex <= SPECIES_TOTAL; dex += 1) species.push(speciesName(dex, locale));
  const prepared = prepareIndex(getCardIndexPayload(), species);
  preparedByLocale.set(locale, prepared);
  return prepared;
}

export function speciesNames(locale: Locale): string[] {
  return preparedCardIndex(locale).species;
}

export function heldBitsFor(held: Record<string, readonly string[]>): string {
  const payload = getCardIndexPayload();
  const lists = new Map<string, readonly string[]>();
  for (const [setId, numbers] of Object.entries(held)) lists.set(setId, numbers);
  const bytes = new Uint8Array(Math.ceil(payload.cards.length / 8));
  payload.cards.forEach((card, index) => {
    const setId = payload.sets[card[0]]?.id;
    const numbers = setId ? lists.get(setId) : undefined;
    if (!setId || !numbers?.some((value) => numbersMatch(card[1], value))) return;
    bytes[index >> 3] |= 1 << (index & 7);
  });
  return Buffer.from(bytes).toString("base64");
}
