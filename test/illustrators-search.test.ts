import { gzipSync } from "node:zlib";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { CardSearch } from "../src/components/site/card-search";
import { getCardIndexPayload, heldBitsFor, preparedCardIndex } from "../src/lib/card-index";
import {
  decodeHeldBits,
  emptyCardQuery,
  parseCardQuery,
  queryIsFiltered,
  searchCards,
} from "../src/lib/card-query";
import { cardsDatabaseText, illustratorsIndexText } from "../src/lib/database-page";
import { getMessages } from "../src/lib/i18n";
import { buildIllustratorView, illustratorPageGraph } from "../src/lib/illustrator-page";
import {
  ILLUSTRATOR_INDEX_MIN,
  getIllustrator,
  getIllustrators,
  illustratorPath,
  listIndexedIllustratorPaths,
} from "../src/lib/illustrators";
import { sitemapEntries } from "../src/lib/sitemap-data";
import { pageMetadata } from "../src/lib/seo";
import { absoluteUrl } from "../src/lib/site";
import { speciesName } from "../src/lib/catalog";

describe("illustrator pages", () => {
  it("keeps a page for every named illustrator and leaves the short ones out of the sitemap", () => {
    const people = getIllustrators();
    expect(new Set(people.map((person) => person.slug)).size).toBe(people.length);
    expect(people.length).toBeGreaterThan(300);
    const arita = getIllustrator("mitsuhiro-arita");
    expect(arita?.name).toBe("Mitsuhiro Arita");
    expect(arita?.indexed).toBe(true);
    expect(arita && arita.count).toBeGreaterThan(ILLUSTRATOR_INDEX_MIN);
    expect(arita?.first.card.name).toBe("Charizard");
    expect(arita?.first.setName).toBe("Base");
    expect(arita?.topPokemon[0]?.count).toBeGreaterThan(1);
    const thin = people.filter((person) => !person.indexed);
    expect(thin.length).toBeGreaterThan(0);
    expect(thin.every((person) => person.count < ILLUSTRATOR_INDEX_MIN)).toBe(true);
    const indexed = listIndexedIllustratorPaths();
    expect(indexed).toContain("/illustrators/mitsuhiro-arita");
    expect(indexed).not.toContain(illustratorPath(thin[0]?.slug ?? ""));
    const sitemap = sitemapEntries("de-illustrators");
    expect(sitemap?.some((entry) => entry.url === absoluteUrl("/de/illustrators/mitsuhiro-arita"))).toBe(true);
    expect(sitemap?.some((entry) => entry.url.endsWith(`/illustrators/${thin[0]?.slug}`))).toBe(false);
    const sample = sitemap?.find((entry) => entry.url.endsWith("/illustrators/mitsuhiro-arita"));
    expect(sample?.languages.de).toBe(absoluteUrl("/de/illustrators/mitsuhiro-arita"));
    expect(sample?.languages["x-default"]).toBe(absoluteUrl("/illustrators/mitsuhiro-arita"));
    expect(sample?.languages.fr).toBe(absoluteUrl("/fr/illustrators/mitsuhiro-arita"));
  });

  it("writes German prose from the catalog and links every card", () => {
    const artist = getIllustrator("mitsuhiro-arita");
    if (!artist) throw new Error("missing Arita");
    const view = buildIllustratorView("de", getMessages("de"), artist, 0);
    const top = artist.topPokemon[0];
    expect(view.path).toBe("/illustrators/mitsuhiro-arita");
    expect(view.title).toContain("Mitsuhiro Arita");
    expect(view.paragraph).toContain("gezeichnet");
    expect(view.paragraph).toContain("Charizard 4/102");
    expect(view.paragraph).toContain("Base");
    expect(view.paragraph).toContain("Ich habe noch keine dieser Karten eingetragen.");
    if (top) expect(view.paragraph).toContain(speciesName(top.dex, "de"));
    expect(view.paragraph).not.toMatch(/price|worth|\$|cardmarket|tcgplayer/i);
    expect(view.groups.some((group) => group.cards.some((card) => card.href === "/de/cards/base1-4-charizard"))).toBe(true);
    const graph = JSON.stringify(illustratorPageGraph("de", view));
    expect(graph).toContain("CollectionPage");
    expect(graph).toContain("BreadcrumbList");
    expect(graph).toContain("https://linksforcards.com/de/illustrators/mitsuhiro-arita");
    expect(graph).not.toContain("Offer");
    expect(graph).not.toContain("Product");
    const hidden = pageMetadata("de", view.path, view.title, view.description, { index: false });
    expect(hidden.robots).toEqual({ index: false, follow: true });
  });
});

describe("card database", () => {
  it("searches names in English and German from one compact index", () => {
    const payload = getCardIndexPayload();
    const raw = JSON.stringify(payload);
    expect(raw.length).toBeLessThan(1_200_000);
    expect(gzipSync(raw).length).toBeLessThan(400_000);
    expect(raw).not.toMatch(/"price"/);
    expect(payload.cards.length).toBeGreaterThan(20_000);
    const us = searchCards(preparedCardIndex("us"), { ...emptyCardQuery(), q: "charizard", set: "base1" }, {
      locale: "us",
      held: null,
      needEnabled: true,
    });
    expect(us.hits.some((hit) => hit.href === "/cards/base1-4-charizard")).toBe(true);
    expect(us.hits[0]?.illustrator).toBe("Mitsuhiro Arita");
    const de = searchCards(preparedCardIndex("de"), { ...emptyCardQuery(), q: "Glurak" }, {
      locale: "de",
      held: null,
      needEnabled: true,
    });
    expect(de.hits.some((hit) => hit.href === "/de/cards/base1-4-charizard")).toBe(true);
    const fire = searchCards(preparedCardIndex("us"), { ...emptyCardQuery(), set: "base1", type: "Fire", supertype: "p" }, {
      locale: "us",
      held: null,
      needEnabled: true,
    });
    expect(fire.hits.some((hit) => hit.href === "/cards/base1-4-charizard")).toBe(true);
    const trainer = searchCards(preparedCardIndex("us"), { ...emptyCardQuery(), set: "base1", supertype: "t", q: "charizard" }, {
      locale: "us",
      held: null,
      needEnabled: true,
    });
    expect(trainer.total).toBe(0);
    const bits = decodeHeldBits(heldBitsFor({ base1: ["04"] }));
    const needed = searchCards(
      preparedCardIndex("us"),
      { ...emptyCardQuery(), q: "charizard", set: "base1", need: true },
      { locale: "us", held: bits, needEnabled: true },
    );
    expect(needed.total).toBe(0);
    const illustrator = getIllustrator("mitsuhiro-arita");
    const byIllustrator = searchCards(
      preparedCardIndex("us"),
      { ...emptyCardQuery(), illustrator: "mitsuhiro-arita" },
      { locale: "us", held: null, needEnabled: true },
    );
    expect(byIllustrator.total).toBe(illustrator?.count);
    expect(queryIsFiltered(parseCardQuery({ q: "pikachu" }))).toBe(true);
    expect(queryIsFiltered(parseCardQuery({ page: "2" }))).toBe(true);
    expect(queryIsFiltered(parseCardQuery({}))).toBe(false);
    const filtered = pageMetadata("us", "/cards", "Pokémon card list", "A list.", { index: false });
    expect(filtered.robots).toEqual({ index: false, follow: true });
    expect(filtered.alternates?.canonical).toBe(absoluteUrl("/cards"));
    const open = pageMetadata("us", "/cards", "Pokémon card list", "A list.");
    expect(open.robots).toBeUndefined();
    expect(open.alternates?.languages?.de).toBe(absoluteUrl("/de/cards"));
  });

  it("puts real card links in the first HTML and translates the introduction", () => {
    const en = cardsDatabaseText("us", getMessages("us"));
    const de = cardsDatabaseText("de", getMessages("de"));
    const index = illustratorsIndexText("de", getMessages("de"));
    expect(en.paragraph).toContain("20,628");
    expect(en.paragraph).toContain("1999");
    expect(en.note).toContain("English");
    expect(de.paragraph).toContain("Karten");
    expect(de.paragraph).not.toContain("This list has");
    expect(de.note).toContain("Deutsch");
    expect(index.paragraph).toContain("Illustratoren");
    expect(index.paragraph).toContain("gezeichnet");
    const html = renderToStaticMarkup(
      createElement(CardSearch, {
        locale: "de",
        labels: {
          search: "Suche",
          placeholder: "Name",
          set: "Set",
          series: "Serie",
          year: "Jahr",
          rarity: "Seltenheit",
          type: "Element",
          supertype: "Typ",
          illustrator: "Illustrator",
          any: "Alle",
          need: "Karten, die ich noch brauche",
          needUnavailable: "aus",
          submit: "Karten zeigen",
          countOne: "{count} Karte",
          countMany: "{count} Karten",
          empty: "Keine Karte passt.",
          page: "{page} / {pages}",
          previous: "Zurück",
          next: "Weiter",
          results: "Ergebnisse",
          filters: "Filter",
          fallback: "fallback",
          supertypes: { p: "Pokémon", t: "Trainer", e: "Energie", o: "Andere" },
        },
        initialQuery: emptyCardQuery(),
        initialHits: [
          {
            href: "/de/cards/base1-4-charizard",
            name: "Charizard",
            fraction: "4/102",
            setName: "Base",
            year: "1999",
            illustrator: "Mitsuhiro Arita",
          },
        ],
        initialTotal: 1,
        initialPages: 1,
        species: ["Bisasam"],
        held: "",
        needEnabled: true,
        sets: [{ series: "Base", options: [{ value: "base1", label: "Base" }] }],
        series: [{ value: "base", label: "Base" }],
        years: ["1999"],
        rarities: [{ value: "rare-holo", label: "Rare Holo" }],
        types: ["Fire"],
        illustrators: [{ value: "mitsuhiro-arita", label: "Mitsuhiro Arita" }],
      }),
    );
    expect(html).toContain('action="/de/cards"');
    expect(html).toContain('href="/de/cards/base1-4-charizard"');
    expect(html).toContain("Charizard");
    expect(html).toContain("Mitsuhiro Arita");
    expect(html).toContain("Karten, die ich noch brauche");
    expect(html).not.toMatch(/price|worth|\$|cardmarket/i);
  });
});
