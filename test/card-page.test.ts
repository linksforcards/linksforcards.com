import { describe, expect, it } from "vitest";
import { getSet, getSetCards, getSets } from "../src/lib/catalog";
import {
  buildCardView,
  cardFraction,
  PRINTING_CAP,
  cardIsHeld,
  cardMetaDescription,
  cardPageGraph,
  cardPath,
  cardSlug,
  cardStatus,
  listCardPaths,
  metaDescription,
  resolveCardSlug,
  slugPart,
} from "../src/lib/card-page";
import { readFileSync } from "node:fs";
import { cardLookup } from "../src/lib/card-lookup";
import { speciesName } from "../src/lib/catalog";
import { fill } from "../src/lib/format";
import { getMessages } from "../src/lib/i18n";
import { emptyPublic } from "../src/lib/stats";
import { localePath } from "../src/lib/routing";
import { LOCALES, type Locale } from "../src/lib/locales";
import { absoluteUrl } from "../src/lib/site";

describe("card slugs", () => {
  it("builds one stable slug per English card", () => {
    expect(slugPart("Farfetch'd")).toBe("farfetchd");
    expect(slugPart("Nidoran ♂")).toBe("nidoran-m");
    expect(slugPart("Nidoran ♀")).toBe("nidoran-f");
    expect(slugPart("Pokémon Breeder")).toBe("pokemon-breeder");
    expect(cardSlug("base1", { n: "4", name: "Charizard" })).toBe("base1-4-charizard");
    expect(cardSlug("ex10", { n: "!", name: "Unown" })).toBe("ex10-excl-unown");
    expect(cardSlug("ex10", { n: "?", name: "Unown" })).toBe("ex10-qmark-unown");
    expect(cardSlug("ex13", { n: "104", name: "Pikachu ★" })).toBe("ex13-104-pikachu-star");
    expect(cardSlug("sv8pt5", { n: "28", name: "Pikachu ex" })).toBe("sv8pt5-28-pikachu-ex");
    const paths = listCardPaths();
    expect(new Set(paths).size).toBe(paths.length);
    expect(paths).toContain("/cards/base1-4-charizard");
    expect(paths).toContain("/cards/base1-58-pikachu");
    expect(paths).toContain("/cards/sv3pt5-25-pikachu");
    expect(paths).toContain("/cards/sv8pt5-28-pikachu-ex");
  });

  it("resolves the canonical slug and a shorter number", () => {
    const resolved = resolveCardSlug("base1-4-charizard");
    expect(resolved?.set.id).toBe("base1");
    expect(resolved?.card.name).toBe("Charizard");
    expect(resolved?.canonical).toBe("base1-4-charizard");
    expect(resolveCardSlug("base1-4")?.canonical).toBe("base1-4-charizard");
    expect(resolveCardSlug("base1-40-raticate")?.card.n).toBe("40");
    expect(resolveCardSlug("swsh45sv-sv001-rowlet")?.set.id).toBe("swsh45sv");
    expect(resolveCardSlug("not-a-card")).toBeNull();
    expect(resolveCardSlug("base1-999-missing")).toBeNull();
  });
});

describe("card page copy", () => {
  const m = getMessages("us");

  function viewFor(setId: string, number: string, held = false) {
    const set = getSet(setId);
    const card = getSetCards(setId)?.find((item) => item.n === number);
    if (!set || !card) throw new Error(`missing ${setId} ${number}`);
    const status = cardStatus(held ? "ok" : "unconfigured", held);
    return { set, card, view: buildCardView("us", m, set, card, status) };
  }

  it("writes a distinct paragraph for Base Set Charizard and shows it as needed", () => {
    const { view } = viewFor("base1", "4");
    expect(view.path).toBe("/cards/base1-4-charizard");
    expect(view.title).toBe("Charizard 4/102 · Base");
    expect(view.description).toBe("Charizard 4/102 is a Rare Holo card in the Base set.");
    expect(view.description.length).toBeLessThanOrEqual(155);
    expect(view.fraction).toBe("4/102");
    expect(view.status).toBe("need");
    expect(view.paragraphs.length).toBeGreaterThanOrEqual(4);
    expect(view.paragraph).toContain("4/102");
    expect(view.paragraph).toContain("Base");
    expect(view.paragraph).toContain("Stage 2 Fire Pokémon with 120 HP");
    expect(view.paragraph).toContain("Rare Holo");
    expect(view.paragraph).toContain("Mitsuhiro Arita");
    expect(view.paragraph).toContain("Charizard (#006)");
    expect(view.paragraph).toContain("Charmeleon");
    expect(view.paragraph).toContain("level 76");
    expect(view.paragraph).toContain("Fire Spin");
    expect(view.paragraph).toContain("Energy Burn");
    expect(view.paragraph).toContain("melt boulders");
    expect(view.paragraph).toMatch(/other cards in the catalog/);
    expect(view.faqs.some((faq) => faq.q.toLowerCase().includes("set"))).toBe(true);
    expect(view.faqs.some((faq) => faq.a.includes("Mitsuhiro Arita"))).toBe(true);
    expect(view.facts.some((fact) => fact.label === "Level" && fact.value === "76")).toBe(true);
    expect(view.facts.some((fact) => fact.label === "Retreat" && fact.value === "3")).toBe(true);
    expect(view.paragraph).toContain("Base set binder");
    expect(view.paragraph).toContain("Generation 1 binder (Kanto)");
    expect(view.paragraph).toContain("All Charizard cards");
    expect(view.paragraph).toContain("Mitsuhiro Arita cards");
    expect(view.paragraph).toContain("I still need this card.");
    expect(view.paragraph).not.toMatch(/price|worth|\$|cardmarket|tcgplayer/i);
    expect(view.facts.find((fact) => fact.label === "Set")?.href).toBe("/collections/set/base1");
    expect(view.facts.find((fact) => fact.label === "Pokédex")?.links?.[0]?.href).toBe("/pokedex/6");
    expect(view.binders.some((link) => link.href === "/collections/themes/charizard")).toBe(true);
    expect(view.others).toHaveLength(PRINTING_CAP);
    expect(view.others[0]?.fraction).toMatch(/\//);
    expect(view.others[0]?.setName).toBeTruthy();
    expect(view.others[0]?.year).toMatch(/^\d{4}$/);
    expect(view.morePrintings?.href).toBe("/pokedex/6");
    expect(view.morePrintings && view.morePrintings.count).toBeGreaterThan(PRINTING_CAP);
    const bonsly = viewFor("dp1", "71");
    expect(bonsly.view.others).toHaveLength(1);
    expect(bonsly.view.others[0]?.name).toBe("Bonsly");
    expect(bonsly.view.morePrintings).toBeNull();
    const graph = JSON.stringify(cardPageGraph("us", view));
    expect(graph).toContain("BreadcrumbList");
    expect(graph).toContain("WebPage");
    expect(graph).not.toContain("Product");
    expect(graph).not.toContain("Offer");
    expect(graph).not.toContain("FAQPage");
    expect(graph).not.toContain('"price"');
    expect(graph.length).toBeLessThan(view.paragraph.length + 2500);
  });

  it("uses the printed total for a modern card and marks a logged card as held", () => {
    const set = getSet("sv3pt5");
    expect(set && cardFraction(set, { n: "25" })).toBe("25/165");
    const needed = viewFor("sv3pt5", "25");
    expect(needed.view.paragraph).toContain("25/165");
    expect(needed.view.paragraph).toContain("Pikachu");
    expect(needed.view.paragraph).toContain("Naoyo Kimura");
    expect(needed.view.paragraph).toContain("The regulation mark is G.");
    expect(needed.view.paragraph).toContain("Raichu");
    expect(needed.view.paragraph).toContain("I still need this card.");
    const held = viewFor("sv3pt5", "25", true);
    expect(held.view.status).toBe("have");
    expect(held.view.paragraph).toContain("I already have this card.");
    expect(held.view.paragraph).not.toContain("I still need this card.");
    const modern = viewFor("sv8pt5", "28");
    expect(modern.view.path).toBe(cardPath("sv8pt5", modern.card));
    expect(modern.view.paragraph).toContain("Pikachu ex");
    expect(modern.view.paragraph).toContain("Double Rare");
    expect(modern.view.paragraph).toContain("Prize cards");
    expect(modern.view.paragraph).toContain("The regulation mark is H.");
    expect(modern.view.paragraph).not.toContain("The illustrator is");
    const bill = viewFor("base1", "91");
    expect(bill.view.paragraphs.length).toBeGreaterThanOrEqual(4);
    expect(bill.view.paragraph).toContain("Draw 2 cards.");
    expect(bill.view.paragraph).toContain("Ken Sugimori");
    const energy = viewFor("base1", "98");
    expect(energy.view.paragraphs.length).toBeGreaterThanOrEqual(3);
    expect(energy.view.paragraph).toContain("Fire Energy");
    expect(energy.view.paragraph).toContain("Keiji Kinebuchi");
    expect(energy.view.paragraph).toContain("Energy card");
    const secret = viewFor("sv3pt5", "199");
    expect(secret.view.fraction).toBe("199/165");
    expect(secret.view.paragraph).toContain("above the printed set size of 165");
    expect(metaDescription(secret.view.paragraph).length).toBeLessThanOrEqual(240);
    expect(metaDescription("Short.")).toBe("Short.");
  });

  it("treats a missing registration as needed and an unread checklist as unknown", () => {
    expect(cardIsHeld({}, "base1", "4")).toBe(false);
    expect(cardIsHeld({ base1: ["4"] }, "base1", "4")).toBe(true);
    expect(cardIsHeld({ base1: ["04"] }, "base1", "4")).toBe(true);
    expect(cardStatus("unconfigured", false)).toBe("need");
    expect(cardStatus("ok", false)).toBe("need");
    expect(cardStatus("ok", true)).toBe("have");
    expect(cardStatus("error", true)).toBe("unknown");
    const set = getSet("base1");
    const card = getSetCards("base1")?.find((item) => item.n === "4");
    if (!set || !card) throw new Error("missing charizard");
    const unknown = buildCardView("us", m, set, card, "unknown");
    expect(unknown.paragraph).toContain("The checklist did not load");
    expect(unknown.paragraph).not.toContain("I still need this card.");
    expect(emptyPublic("unconfigured").held.base1).toBeUndefined();
  });

  it("keeps the US card URL at the root", () => {
    const { view } = viewFor("base1", "58");
    expect(view.path).toBe("/cards/base1-58-pikachu");
    expect(absoluteUrl(view.path)).toBe("https://linksforcards.com/cards/base1-58-pikachu");
    expect(view.paragraph).not.toBe(viewFor("base1", "4").view.paragraph);
  });

  it("translates German, French, and Swedish pages and keeps printed names", () => {
    const set = getSet("base1");
    const card = getSetCards("base1")?.find((item) => item.n === "4");
    if (!set || !card) throw new Error("missing charizard");

    const de = buildCardView("de", getMessages("de"), set, card, "need");
    expect(localePath("de", de.path)).toBe("/de/cards/base1-4-charizard");
    expect(JSON.stringify(cardPageGraph("de", de))).toContain("https://linksforcards.com/de/cards/base1-4-charizard");
    expect(de.title).toContain("Charizard");
    expect(de.title).toContain("Base");
    expect(de.paragraph).toContain("Charizard");
    expect(de.paragraph).toContain("Base");
    expect(de.paragraph).toContain("Glurak (#006)");
    expect(de.paragraph).toContain("Set-Binder Base");
    expect(de.paragraph).toContain("Binder der Generation 1 (Kanto)");
    expect(de.paragraph).toContain("Alle Glurak-Karten");
    expect(de.paragraph).toContain("Charmeleon");
    expect(de.paragraph).toContain("Fire Spin");
    expect(de.paragraph).toContain("Energy Burn");
    expect(de.faqs.length).toBeGreaterThanOrEqual(4);
    expect(de.paragraph).toContain("Ich brauche diese Karte noch.");
    expect(de.paragraph).not.toContain("I still need");
    expect(de.paragraph).not.toContain(" and ");
    expect(de.morePrintings?.href).toBe("/de/pokedex/6");
    expect(de.facts.find((fact) => fact.label === "Set")?.href).toBe("/de/collections/set/base1");

    const fr = buildCardView("fr", getMessages("fr"), set, card, "need");
    expect(localePath("fr", fr.path)).toBe("/fr/cards/base1-4-charizard");
    expect(fr.paragraph).toContain("Charizard");
    expect(fr.paragraph).toContain("Base");
    expect(fr.paragraph).toContain("Dracaufeu (#006)");
    expect(fr.paragraph).toContain("Classeur du set Base");
    expect(fr.paragraph).toContain("Il me manque encore cette carte.");
    expect(fr.paragraph).not.toContain("I still need");
    expect(fr.morePrintings?.href).toBe("/fr/pokedex/6");

    const sv = buildCardView("sv", getMessages("sv"), set, card, "need");
    expect(localePath("sv", sv.path)).toBe("/sv/cards/base1-4-charizard");
    expect(sv.paragraph).toContain("Charizard");
    expect(sv.paragraph).toContain("Base");
    expect(sv.paragraph).toContain("Setpärm Base");
    expect(sv.paragraph).toContain("Generationspärm 1 (Kanto)");
    expect(sv.paragraph).toContain("Jag behöver fortfarande det här kortet.");
    expect(sv.paragraph).not.toContain("I still need");
    expect(sv.morePrintings?.href).toBe("/sv/pokedex/6");
  });

  it("stays in the first person on sample cards in every language", () => {
    const voice: Record<string, RegExp[]> = {
      en: [/\bwe\b/i, /\bour\b/i, /\bours\b/i],
      de: [/\bwir\b/i, /\bunser\w*/i, /\buns\b/i],
      fr: [/\bnous\b/i, /\bnotre\b/i, /\bnos\b/i],
      es: [/\bnosotros\b/i, /\bnuestro\w*/i],
      it: [/\bnoi\b/i, /\bnostro\b/i, /\bnostra\b/i, /\bnostri\b/i],
      nl: [/\bwij\b/i, /\bons\b/i, /\bonze\b/i],
      sv: [/\bvi\b/i, /\bvår\b/i, /\bvåra\b/i, /\bvårt\b/i],
      no: [/\bvi\b/i, /\bvår\b/i, /\bvåre\b/i, /\bvårt\b/i],
      fi: [/\bme\b/i, /\bmeidän\b/i],
      pl: [/\bmy\b/i, /\bnasz\w*/i],
    };
    const samples = [
      ["base1", "4"],
      ["sv3pt5", "25"],
      ["base1", "91"],
      ["base1", "98"],
      ["sv8pt5", "28"],
    ] as const;
    for (const locale of LOCALES) {
      const messages = getMessages(locale);
      const code = locale === "us" || locale === "uk" ? "en" : locale;
      for (const [setId, number] of samples) {
        const set = getSet(setId);
        const card = getSetCards(setId)?.find((item) => item.n === number);
        if (!set || !card) throw new Error(`missing ${setId} ${number}`);
        const view = buildCardView(locale as Locale, messages, set, card, "need");
        expect(view.paragraphs.length, `${locale} ${setId}-${number}`).toBeGreaterThanOrEqual(3);
        const text = `${view.paragraphs.join("\n")}\n${view.description}`;
        for (const pattern of voice[code] ?? []) expect(text, `${locale} ${setId}-${number} ${pattern}`).not.toMatch(pattern);
      }
    }
  });

  it("gives a typical card several hundred words of catalog prose", () => {
    function words(text: string): number {
      return text.split(/\s+/).filter(Boolean).length;
    }
    function median(values: number[]): number {
      const sorted = values.slice().sort((a, b) => a - b);
      const mid = Math.floor(sorted.length / 2);
      if (sorted.length % 2 === 1) return sorted[mid] ?? 0;
      return ((sorted[mid - 1] ?? 0) + (sorted[mid] ?? 0)) / 2;
    }
    function counts(locale: "us" | "de"): number[] {
      const messages = getMessages(locale);
      const totals: number[] = [];
      for (const set of getSets()) {
        for (const card of getSetCards(set.id) ?? []) {
          totals.push(words(buildCardView(locale, messages, set, card, "need").paragraph));
        }
      }
      return totals;
    }
    const english = counts("us");
    const german = counts("de");
    const enMedian = median(english);
    const deMedian = median(german);
    const charizard = viewFor("base1", "4").view.paragraph;
    const deSet = getSet("base1");
    const deCard = getSetCards("base1")?.find((item) => item.n === "4");
    if (!deSet || !deCard) throw new Error("missing charizard");
    const deWords = words(buildCardView("de", getMessages("de"), deSet, deCard, "need").paragraph);
    console.log(
      `card prose words median en=${enMedian} de=${deMedian} charizard en=${words(charizard)} de=${deWords} min en=${Math.min(...english)} de=${Math.min(...german)}`,
    );
    expect(enMedian).toBeGreaterThanOrEqual(160);
    expect(deMedian).toBeGreaterThanOrEqual(160);
    expect(Math.min(...english)).toBeGreaterThanOrEqual(50);
    expect(Math.min(...german)).toBeGreaterThanOrEqual(50);
  }, 120_000);

  it.each(["nl", "sv", "no", "fi", "pl"] as const)("measures %s card prose from the catalog", (locale) => {
    function words(text: string): number {
      return text.split(/\s+/).filter(Boolean).length;
    }
    function median(values: number[]): number {
      const sorted = values.slice().sort((a, b) => a - b);
      const mid = Math.floor(sorted.length / 2);
      if (sorted.length % 2 === 1) return sorted[mid] ?? 0;
      return ((sorted[mid - 1] ?? 0) + (sorted[mid] ?? 0)) / 2;
    }
    const set = getSet("base1");
    const card = getSetCards("base1")?.find((item) => item.n === "4");
    if (!set || !card) throw new Error("missing charizard");
    const messages = getMessages(locale);
    const totals: number[] = [];
    for (const entry of getSets()) {
      for (const item of getSetCards(entry.id) ?? []) {
        totals.push(words(buildCardView(locale, messages, entry, item, "need").paragraph));
      }
    }
    const mid = median(totals);
    console.log(
      `card prose words median ${locale}=${mid} min=${Math.min(...totals)} charizard=${words(buildCardView(locale, messages, set, card, "need").paragraph)}`,
    );
    expect(mid).toBeGreaterThanOrEqual(160);
  }, 60_000);

  it("uses a translated species name only where dex.json has one", () => {
    const dex = JSON.parse(readFileSync("data/catalog/dex.json", "utf8")) as Record<string, string[]>;
    expect(Object.keys(dex).sort()).toEqual(["de", "en", "es", "fr", "it"]);
    const set = getSet("base1");
    const card = getSetCards("base1")?.find((item) => item.n === "4");
    if (!set || !card) throw new Error("missing charizard");
    expect(speciesName(6, "de")).toBe(dex.de?.[5]);
    expect(speciesName(6, "fr")).toBe(dex.fr?.[5]);
    expect(speciesName(6, "es")).toBe(dex.es?.[5]);
    expect(speciesName(6, "it")).toBe(dex.it?.[5]);
    for (const locale of ["nl", "sv", "no", "fi", "pl"] as const) {
      expect(speciesName(6, locale)).toBe(dex.en?.[5]);
      const view = buildCardView(locale, getMessages(locale), set, card, "need");
      expect(view.paragraph).toContain(`${dex.en?.[5]} (#006)`);
      if (dex.de?.[5] && dex.de[5] !== dex.en?.[5]) expect(view.paragraph).not.toContain(dex.de[5]);
    }
    const german = buildCardView("de", getMessages("de"), set, card, "need");
    expect(german.paragraph).toContain(`${dex.de?.[5]} (#006)`);
  });

  it("keeps card descriptions within 155 characters", () => {
    const suffix = " · LinksForCards";
    let over = 0;
    let total = 0;
    let longest = 0;
    for (const locale of LOCALES) {
      const messages = getMessages(locale);
      for (const set of getSets()) {
        for (const card of getSetCards(set.id) ?? []) {
          total += 1;
          const fraction = cardFraction(set, card);
          const fullTitle = fill(messages.cardPage.title, { name: card.name, fraction, set: set.name });
          const title = fullTitle.length <= 60 ? fullTitle : fill(messages.cardPage.titleShort, { name: card.name, fraction });
          const visible = title.length + suffix.length <= 60 ? title.length + suffix.length : title.length;
          if (visible > 60) over += 1;
          if (visible > longest) longest = visible;
          const description = cardMetaDescription(messages, set, card, fraction);
          if (description.length > 155) {
            throw new Error(`${locale} ${set.id} ${card.n} description is ${description.length}: ${description}`);
          }
          if (!description.includes(card.name) || !description.includes(fraction)) {
            throw new Error(`${locale} ${set.id} ${card.n} description dropped the name or number: ${description}`);
          }
        }
      }
    }
    console.log(`card titles over 60: ${over} of ${total}, longest visible ${longest}`);
    expect(over).toBe(0);
    const lookup = cardLookup();
    let arita = 0;
    for (const set of getSets()) {
      for (const card of getSetCards(set.id) ?? []) {
        if (card.a === "Mitsuhiro Arita") arita += 1;
      }
    }
    expect(lookup.artists["Mitsuhiro Arita"]).toBe(arita);
    expect(lookup.dex["6"]?.find((printing) => printing.s === "base1" && printing.n === "4")?.hp).toBe("120");
  });
});
