import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { findDeltaReignSet } from "@/lib/delta-reign";
import { getMessages } from "@/lib/i18n";
import { cardImageKind, cardImageUrl, imageStats, tcgdexBase } from "@/lib/card-images";
import { getSetCards, getSets } from "@/lib/catalog";
import { LOCALES } from "@/lib/locales";

describe("card images", () => {
  it("hotlinks Base Charizard from the TCGdex base URL", () => {
    expect(tcgdexBase("base1", "4")).toBe("https://assets.tcgdex.net/en/base/base1/4");
    expect(cardImageUrl("base1", "4", "high")).toBe("https://assets.tcgdex.net/en/base/base1/4/high.webp");
    expect(cardImageUrl("base1", "4", "low")).toBe("https://assets.tcgdex.net/en/base/base1/4/low.webp");
    expect(cardImageKind("base1", "4")).toBe("tcgdex");
  });

  it("uses the TCGdex local id, including padding, instead of guessing a series", () => {
    expect(cardImageUrl("sv3pt5", "6", "high")).toBe("https://assets.tcgdex.net/en/sv/sv03.5/006/high.webp");
    expect(cardImageUrl("me1", "3", "low")).toBe("https://assets.tcgdex.net/en/me/me01/003/low.webp");
  });

  it("keeps a TCGdex card when only the high file exists and falls back when both are missing", () => {
    expect(cardImageKind("g1", "19")).toBe("tcgdex");
    expect(cardImageUrl("g1", "19", "low")).toBe("https://assets.tcgdex.net/en/xy/g1/19/high.webp");
    expect(cardImageUrl("g1", "19", "high")).toBe("https://assets.tcgdex.net/en/xy/g1/19/high.webp");
    expect(cardImageKind("dc1", "1")).toBe("pokemontcg");
    expect(cardImageUrl("dc1", "1", "low")).toBe("https://images.pokemontcg.io/dc1/1.png");
  });

  it("counts every catalog card once", () => {
    const stats = imageStats();
    let tcgdex = 0;
    let fallback = 0;
    let none = 0;
    for (const set of getSets()) {
      for (const card of getSetCards(set.id) ?? []) {
        const kind = cardImageKind(set.id, card.n);
        if (kind === "tcgdex") tcgdex += 1;
        else if (kind === "pokemontcg") fallback += 1;
        else none += 1;
      }
    }
    expect(tcgdex + fallback + none).toBe(stats.cards);
    expect(stats).toEqual({ cards: tcgdex + fallback + none, tcgdex, fallback, none });
    expect(tcgdex).toBeGreaterThan(fallback);
    expect(stats.cards).toBeGreaterThan(20000);
  });

  it("keeps prices out of the image sidecar and scans out of the card files", () => {
    const sidecar = readFileSync(path.join(process.cwd(), "data/catalog/images.json"), "utf8");
    expect(sidecar).not.toMatch(/tcgplayer|cardmarket|trendPrice|"prices"|"market"/i);
    const names = readdirSync(path.join(process.cwd(), "data/catalog/cards"));
    for (const name of names) {
      const text = readFileSync(path.join(process.cwd(), "data/catalog/cards", name), "utf8");
      expect(text).not.toContain("assets.tcgdex.net");
      expect(text).not.toContain("images.pokemontcg.io");
    }
  });

  it("does not opt card art into next/image", () => {
    const config = readFileSync(path.join(process.cwd(), "next.config.ts"), "utf8");
    expect(config).not.toContain("remotePatterns");
    const checklist = readFileSync(path.join(process.cwd(), "src/components/site/checklist.tsx"), "utf8");
    expect(checklist).not.toContain("next/image");
    const picture = readFileSync(path.join(process.cwd(), "src/components/site/card-picture.tsx"), "utf8");
    expect(picture).toContain("<img");
    expect(picture).not.toContain("next/image");
  });

  it("credits TCGdex in every locale and keeps the English card name in the alt template", () => {
    for (const locale of LOCALES) {
      const footer = getMessages(locale).footer;
      expect(footer.disclaimer, locale).toContain("TCGdex");
      expect(footer.disclaimer, locale).toContain("Nintendo");
      expect(footer.disclaimer, locale).toContain("GAME FREAK");
      expect(footer.disclaimer, locale).toMatch(/Pokémon Company/);
      expect(footer.data, locale).not.toMatch(/scan/i);
      expect(getMessages(locale).checklist.cardAlt).toBe("{name}, {set} #{number}");
    }
  });

  it("leaves the Delta Reign checklist empty until the catalog has the set", () => {
    expect(findDeltaReignSet()).toBeNull();
    const source = readFileSync(
      path.join(process.cwd(), "src/app/(site)/[locale]/collections/set/delta-reign/page.tsx"),
      "utf8",
    );
    expect(source).toContain("cardImageSrc");
  });
});
