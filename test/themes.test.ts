import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { themeCopy, themeCopyLocales } from "../src/content/theme-copy";
import { getSetCards } from "../src/lib/catalog";
import { LOCALES, SPECIES_INDEX_LOCALES } from "../src/lib/locales";
import { bulkTone, getTheme, getThemes, themeFromCurated, themeIndexed, themeHreflangLocales } from "../src/lib/themes";

const plural: Record<string, RegExp[]> = {
  en: [/\bwe\b/i, /\bour\b/i, /\bours\b/i],
  de: [/\bwir\b/i, /\bunser\w*/i, /\buns\b/i],
  fr: [/\bnous\b/i, /\bnotre\b/i, /\bnos\b/i],
  es: [/\bnosotros\b/i, /\bnuestro\w*/i],
  it: [/\bnoi\b/i, /\bnostro\b/i, /\bnostra\b/i, /\bnostri\b/i, /\bnostre\b/i],
  nl: [/\bwij\b/i, /\bons\b/i, /\bonze\b/i],
  sv: [/\bvi\b/i, /\bvår\b/i, /\bvåra\b/i, /\bvårt\b/i],
  no: [/\bvi\b/i, /\bvår\b/i, /\bvåre\b/i, /\bvårt\b/i],
  fi: [/\bme\b/i, /\bmeidän\b/i],
  pl: [/\bmy\b/i, /\bnasz\w*/i],
};

describe("themed binders", () => {
  it("regenerates the first batch from the pinned dataset and leaves room for a curated list", () => {
    const raw = JSON.parse(readFileSync(path.join(process.cwd(), "data/catalog/themes.json"), "utf8")) as {
      sourceCommit: string;
      themes: { slug: string }[];
    };
    expect(raw.sourceCommit).toBe("39a26a144c8b6ef6c2fb17b2c29d0bb7121e3a11");
    expect(JSON.stringify(raw)).not.toMatch(/tcgplayer|cardmarket|prices|images/i);
    const themes = getThemes();
    expect(themes.map((theme) => theme.slug)).toEqual([
      "pikachu",
      "eeveelutions",
      "eevee",
      "gastly-line",
      "snorlax",
      "charizard",
      "yuka-morii",
      "mitsuhiro-arita",
      "trainers-pokemon",
      "team-rocket",
      "delta-species",
      "baby-pokemon",
    ]);
    expect(themes.map((theme) => theme.total)).toEqual([213, 386, 85, 119, 61, 107, 205, 722, 537, 273, 194, 177]);
    const pikachu = getTheme("pikachu");
    const charizard = getTheme("charizard");
    expect(pikachu?.cards.some((card) => card.setId === "base1" && card.number === "58")).toBe(true);
    expect(charizard?.cards.some((card) => card.setId === "base1" && card.number === "4")).toBe(true);
    expect(charizard && charizard.bulk != null && bulkTone(charizard.bulk, charizard.total)).toBe("rare");
    expect(getTheme("yuka-morii") && bulkTone(getTheme("yuka-morii")!.bulk ?? 0, getTheme("yuka-morii")!.total)).toBe("mostly");
    const eeveeIds = new Set((getTheme("eevee")?.cards ?? []).map((card) => `${card.setId}:${card.number}`));
    expect((getTheme("eeveelutions")?.cards ?? []).filter((card) => eeveeIds.has(`${card.setId}:${card.number}`))).toHaveLength(eeveeIds.size);
    const delta = getTheme("delta-species");
    const deltaCard = delta?.cards
      .map((card) => getSetCards(card.setId)?.find((item) => item.n === card.number))
      .find((card) => card?.name.includes("δ"));
    expect(deltaCard?.name).toMatch(/δ/);
    expect(themes.some((theme) => /sleep|cameo/i.test(theme.slug))).toBe(false);
    const curated = themeFromCurated({ slug: "sleeping", cards: ["base1:58"] }, new Set(themes.map((theme) => theme.slug)));
    expect(curated).toMatchObject({ kind: "curated", total: 1, bulk: null, chase: null, setCount: 1 });
    expect(() => themeFromCurated({ slug: "pikachu", cards: ["base1:58"] }, new Set(["pikachu"]))).toThrow(/duplicates/);
    expect(() => themeFromCurated({ slug: "sleeping", cards: ["base1:missing"] }, new Set())).toThrow(/unknown card/);
  });

  it("indexes species themes only where the name is translated, and concept themes everywhere", () => {
    const pikachu = getTheme("pikachu");
    const yuka = getTheme("yuka-morii");
    expect(pikachu && themeHreflangLocales(pikachu)).toEqual(SPECIES_INDEX_LOCALES);
    expect(yuka && themeHreflangLocales(yuka)).toBeUndefined();
    for (const locale of LOCALES) {
      expect(pikachu && themeIndexed(pikachu, locale)).toBe(SPECIES_INDEX_LOCALES.includes(locale as (typeof SPECIES_INDEX_LOCALES)[number]));
      expect(yuka && themeIndexed(yuka, locale)).toBe(true);
    }
  });

  it("keeps the target phrases and the first-person voice in every language", () => {
    expect([...themeCopyLocales()].sort()).toEqual([...LOCALES].sort());
    expect(themeCopy("us", "pikachu")?.title).toMatch(/all pikachu cards/i);
    expect(themeCopy("us", "pikachu")?.title).toMatch(/master set list/i);
    expect(themeCopy("us", "pikachu")?.title).toMatch(/checklist/i);
    expect(themeCopy("de", "pikachu")?.title).toMatch(/alle pikachu karten liste/i);
    expect(themeCopy("de", "charizard")?.title).toMatch(/alle glurak karten übersicht/i);
    expect(themeCopy("de", "eevee")?.title).toMatch(/alle evoli karten liste/i);
    expect(themeCopy("de", "eeveelutions")?.title).toMatch(/alle evoli karten liste/i);
    expect(themeCopy("de", "team-rocket")?.title).toMatch(/team rocket kartenliste/i);
    expect(themeCopy("fr", "pikachu")?.title).toMatch(/toutes les cartes pikachu/i);
    expect(themeCopy("fr", "charizard")?.title).toMatch(/dracaufeu/i);
    expect(themeCopy("fr", "eevee")?.title).toMatch(/évoli/i);
    expect(themeCopy("es", "pikachu")?.title).toMatch(/todas las cartas de pikachu/i);
    expect(themeCopy("it", "pikachu")?.title).toMatch(/tutte le carte pikachu/i);
    for (const locale of LOCALES) {
      const voice = locale === "us" || locale === "uk" ? "en" : locale;
      for (const theme of getThemes()) {
        const copy = themeCopy(locale, theme.slug);
        expect(copy, `${locale}/${theme.slug}`).toBeTruthy();
        const text = `${copy?.title}\n${copy?.h1}\n${copy?.description}\n${copy?.lede}`;
        expect(text).toContain("{total}");
        expect(text).not.toMatch(/[$€£]/);
        for (const pattern of plural[voice] ?? []) expect(text, `${locale}/${theme.slug}`).not.toMatch(pattern);
      }
    }
  });
});
