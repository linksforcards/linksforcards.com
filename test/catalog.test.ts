import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const root = path.join(process.cwd(), "data", "catalog");

describe("catalog", () => {
  it("keeps prices and images out of the committed card files", () => {
    const names = readdirSync(path.join(root, "cards"));
    expect(names.length).toBeGreaterThan(100);
    for (const name of names) {
      const text = readFileSync(path.join(root, "cards", name), "utf8");
      expect(text).not.toMatch(/tcgplayer|cardmarket|trendPrice|"images"|"image"/i);
    }
  });

  it("knows base-set Magikarp by number and national dex", () => {
    const cards = JSON.parse(readFileSync(path.join(root, "cards", "base1.json"), "utf8")) as {
      n: string;
      name: string;
      dex?: number[];
    }[];
    const magikarp = cards.find((card) => card.name === "Magikarp");
    expect(magikarp).toMatchObject({ n: "35", dex: [129] });
    const charizard = cards.find((card) => card.n === "4");
    expect(charizard).toMatchObject({
      name: "Charizard",
      r: "Rare Holo",
      st: ["Stage 2"],
      hp: "120",
      ty: ["Fire"],
      a: "Mitsuhiro Arita",
    });
    const sets = JSON.parse(readFileSync(path.join(root, "sets.json"), "utf8")) as { id: string; printed?: number; count: number }[];
    expect(sets.find((set) => set.id === "base1")?.printed).toBe(102);
    expect(sets.find((set) => set.id === "sv3pt5")).toMatchObject({ printed: 165, count: 207 });
    const meta = JSON.parse(readFileSync(path.join(root, "meta.json"), "utf8")) as { maxDexSeen: number; cards: number };
    expect(meta.maxDexSeen).toBe(1025);
    expect(meta.cards).toBeGreaterThan(20000);
  });
});
