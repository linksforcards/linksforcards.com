import { describe, expect, it } from "vitest";
import { getSet, getSetCards } from "../src/lib/catalog";
import {
  buildCardView,
  cardFraction,
  PRINTING_CAP,
  cardIsHeld,
  cardPageGraph,
  cardPath,
  cardSlug,
  cardStatus,
  listCardPaths,
  metaDescription,
  resolveCardSlug,
  slugPart,
} from "../src/lib/card-page";
import { getMessages } from "../src/lib/i18n";
import { emptyPublic } from "../src/lib/stats";
import { localePath } from "../src/lib/routing";
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
    expect(view.title).toBe("Charizard 4/102 · Base card");
    expect(view.fraction).toBe("4/102");
    expect(view.status).toBe("need");
    expect(view.paragraph).toContain("Charizard is card 4/102 in the Base set");
    expect(view.paragraph).toContain("Stage 2 Fire Pokémon with 120 HP");
    expect(view.paragraph).toContain("Rare Holo");
    expect(view.paragraph).toContain("Mitsuhiro Arita");
    expect(view.paragraph).toContain("Charizard (#006)");
    expect(view.paragraph).toContain("Base set binder");
    expect(view.paragraph).toContain("Generation 1 binder (Kanto)");
    expect(view.paragraph).toContain("All Charizard cards");
    expect(view.paragraph).toContain("Mitsuhiro Arita cards");
    expect(view.paragraph).toContain("I still need this card.");
    expect(view.paragraph).not.toMatch(/price|worth|\$|cardmarket|tcgplayer/i);
    expect(view.facts.find((fact) => fact.label === "Set")?.href).toBe("/collections/set/base1");
    expect(view.facts.find((fact) => fact.label === "Illustrator")?.href).toBe("/illustrators/mitsuhiro-arita");
    expect(view.facts.find((fact) => fact.label === "Illustrator")?.value).toBe("Mitsuhiro Arita");
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
    expect(graph).not.toContain('"price"');
  });

  it("uses the printed total for a modern card and marks a logged card as held", () => {
    const set = getSet("sv3pt5");
    expect(set && cardFraction(set, { n: "25" })).toBe("25/165");
    const needed = viewFor("sv3pt5", "25");
    expect(needed.view.paragraph).toContain("Pikachu is card 25/165");
    expect(needed.view.paragraph).toContain("Naoyo Kimura");
    expect(needed.view.paragraph).toContain("I still need this card.");
    const held = viewFor("sv3pt5", "25", true);
    expect(held.view.status).toBe("have");
    expect(held.view.paragraph).toContain("I already have this card.");
    expect(held.view.paragraph).not.toContain("I still need this card.");
    const modern = viewFor("sv8pt5", "28");
    expect(modern.view.path).toBe(cardPath("sv8pt5", modern.card));
    expect(modern.view.paragraph).toContain("Pikachu ex");
    expect(modern.view.paragraph).toContain("Double Rare");
    expect(modern.view.paragraph).not.toContain("The illustrator is");
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
    expect(de.paragraph).toContain("Ich brauche diese Karte noch.");
    expect(de.paragraph).not.toContain("I still need");
    expect(de.paragraph).not.toContain(" and ");
    expect(de.morePrintings?.href).toBe("/de/pokedex/6");
    expect(de.facts.find((fact) => fact.label === "Set")?.href).toBe("/de/collections/set/base1");
    expect(de.facts.find((fact) => fact.label === "Illustrator")?.href).toBe("/de/illustrators/mitsuhiro-arita");

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
});
