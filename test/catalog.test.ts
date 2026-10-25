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
    const meta = JSON.parse(readFileSync(path.join(root, "meta.json"), "utf8")) as { maxDexSeen: number; cards: number };
    expect(meta.maxDexSeen).toBe(1025);
    expect(meta.cards).toBeGreaterThan(20000);
  });
});
