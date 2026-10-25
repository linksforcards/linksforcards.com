import { describe, expect, it } from "vitest";
import { getSetCards, getSets, setsBySeries } from "../src/lib/catalog";
import { fill } from "../src/lib/format";
import { SPECIES_TOTAL } from "../src/lib/generations";
import { getMessages } from "../src/lib/i18n";
import { SPECIES_INDEX_LOCALES, speciesPageIndexed } from "../src/lib/locales";
import { seriesSlug } from "../src/lib/series";
import { speciesByDex } from "../src/lib/species-index";
import { setFacts } from "../src/lib/set-facts";

describe("collection landing data", () => {
  it("builds one stable series slug per series", () => {
    expect(seriesSlug("Diamond & Pearl")).toBe("diamond-and-pearl");
    expect(seriesSlug("HeartGold & SoulSilver")).toBe("heartgold-and-soulsilver");
    const slugs = setsBySeries().map((group) => seriesSlug(group.series));
    expect(new Set(slugs).size).toBe(slugs.length);
    expect(slugs).toContain("scarlet-and-violet");
  });

  it("indexes every species and keeps a shared combo printing unchanged", () => {
    for (let dex = 1; dex <= SPECIES_TOTAL; dex += 1) {
      expect(speciesByDex(dex)?.printings.length).toBeGreaterThan(0);
    }
    const pikachu = speciesByDex(25);
    expect(pikachu?.printings.length).toBeGreaterThan(200);
    expect(pikachu?.first.setId).toBeTruthy();
    const before = pikachu?.first.setId;
    expect(speciesByDex(25)?.first.setId).toBe(before);

    let combo: { setId: string; number: string; dex: number[] } | null = null;
    for (const set of getSets()) {
      const card = (getSetCards(set.id) ?? []).find((item) => (item.dex?.length ?? 0) > 1);
      if (card?.dex) {
        combo = { setId: set.id, number: card.n, dex: card.dex };
        break;
      }
    }
    expect(combo).not.toBeNull();
    if (!combo) return;
    const [first, second] = combo.dex;
    const left = speciesByDex(first)?.printings.find((item) => item.setId === combo?.setId && item.number === combo.number);
    const right = speciesByDex(second)?.printings.find((item) => item.setId === combo?.setId && item.number === combo.number);
    expect(left).toBeTruthy();
    expect(left).toBe(right);
    expect(left?.setId).toBe(combo.setId);
  });

  it("describes a set from the catalog without inventing a chase card", () => {
    const base = setFacts("base1");
    expect(base?.kinds.p).toBeGreaterThan(0);
    expect(base?.kinds.e).toBeGreaterThan(0);
    expect(base?.dexes).toContain(129);
    expect(base?.generations).toEqual([1]);
  });

  it("indexes species pages only where the name is translated", () => {
    expect(SPECIES_INDEX_LOCALES).toEqual(["us", "uk", "de", "fr", "es", "it"]);
    expect(speciesPageIndexed("de")).toBe(true);
    expect(speciesPageIndexed("nl")).toBe(false);
    expect(speciesPageIndexed("sv")).toBe(false);
    expect(speciesPageIndexed("no")).toBe(false);
    expect(speciesPageIndexed("fi")).toBe(false);
    expect(speciesPageIndexed("pl")).toBe(false);
    expect(fill(getMessages("us").meta.setTitle, { name: "Base" })).toBe("Base card list and checklist");
    expect(fill(getMessages("de").meta.setTitle, { name: "Base" })).toContain("Kartenliste");
    expect(fill(getMessages("de").meta.speciesTitle, { name: "Pikachu" })).toContain("Kartenliste");
    expect(getMessages("de").meta.guidesTitle).toContain("Sammelordner");
    expect(getMessages("de").guides.pillarLabel).toContain("anfangen");
    expect(getMessages("us").guides.toc).toBe("On this page");
    expect(getMessages("fr").meta.setTitle).toContain("liste de cartes");
    expect(getMessages("es").meta.setTitle).toContain("lista de cartas");
    expect(getMessages("it").meta.setTitle).toContain("lista carte");
    expect(getMessages("nl").meta.setTitle).toContain("kaartenlijst");
    expect(getMessages("sv").meta.setTitle).toContain("kortlista");
    expect(getMessages("no").meta.setTitle).toContain("kortliste");
    expect(getMessages("fi").meta.setTitle).toContain("korttilista");
    expect(getMessages("pl").meta.setTitle).toContain("lista kart");
  });
});
