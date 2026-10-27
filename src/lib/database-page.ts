import { getMeta, getSets, speciesNamesAreTranslated } from "./catalog";
import { metaDescription } from "./card-page";
import { fill, formatInt } from "./format";
import type { Messages } from "./i18n";
import { illustratorCardTotal, getIllustrators } from "./illustrators";
import type { Locale } from "./locales";

export function cardsDatabaseText(locale: Locale, m: Messages): { title: string; paragraph: string; note: string; description: string } {
  const years = getSets()
    .map((set) => set.releaseDate.slice(0, 4))
    .filter((year) => /^\d{4}$/.test(year))
    .sort();
  const paragraph = fill(m.cardSearch.intro, {
    cards: formatInt(getMeta().cards, locale),
    sets: formatInt(getSets().length, locale),
    start: years[0] ?? "",
    end: years[years.length - 1] ?? "",
  });
  const note = speciesNamesAreTranslated(locale)
    ? fill(m.cardSearch.pokemonLocal, { language: m.langName })
    : m.cardSearch.pokemonEnglish;
  return {
    title: m.meta.cardsTitle,
    paragraph,
    note,
    description: metaDescription(`${paragraph} ${note}`),
  };
}

export function illustratorsIndexText(locale: Locale, m: Messages): { title: string; paragraph: string; description: string } {
  const paragraph = fill(m.illustratorsPage.intro, {
    artists: formatInt(getIllustrators().length, locale),
    cards: formatInt(illustratorCardTotal(), locale),
  });
  const more = m.illustratorsPage.introMore;
  return {
    title: m.meta.illustratorsTitle,
    paragraph: `${paragraph} ${more}`,
    description: metaDescription(`${paragraph} ${more}`),
  };
}
