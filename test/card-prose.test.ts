import { describe, expect, it } from "vitest";
import { buildCardView } from "../src/lib/card-page";
import { getSet, getSetCards, getSets } from "../src/lib/catalog";
import { getMessages } from "../src/lib/i18n";
import type { Locale } from "../src/lib/locales";

function words(text: string): number {
  return text.split(/\s+/).filter(Boolean).length;
}

function median(values: number[]): number {
  const sorted = values.slice().sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 1) return sorted[mid] ?? 0;
  return ((sorted[mid - 1] ?? 0) + (sorted[mid] ?? 0)) / 2;
}

/** Let the vitest worker answer RPC while a full-catalog scan is running. */
async function paragraphCounts(locale: Locale): Promise<number[]> {
  const messages = getMessages(locale);
  const totals: number[] = [];
  for (const set of getSets()) {
    for (const card of getSetCards(set.id) ?? []) {
      totals.push(words(buildCardView(locale, messages, set, card, "need").paragraph));
    }
    await new Promise((resolve) => setImmediate(resolve));
  }
  return totals;
}

describe("card prose length", () => {
  it("gives a typical card several hundred words of catalog prose", async () => {
    const english = await paragraphCounts("us");
    const german = await paragraphCounts("de");
    const enMedian = median(english);
    const deMedian = median(german);
    const set = getSet("base1");
    const card = getSetCards("base1")?.find((item) => item.n === "4");
    if (!set || !card) throw new Error("missing charizard");
    const enWords = words(buildCardView("us", getMessages("us"), set, card, "need").paragraph);
    const deWords = words(buildCardView("de", getMessages("de"), set, card, "need").paragraph);
    console.log(
      `card prose words median en=${enMedian} de=${deMedian} charizard en=${enWords} de=${deWords} min en=${Math.min(...english)} de=${Math.min(...german)}`,
    );
    expect(enMedian).toBeGreaterThanOrEqual(160);
    expect(deMedian).toBeGreaterThanOrEqual(160);
    expect(Math.min(...english)).toBeGreaterThanOrEqual(50);
    expect(Math.min(...german)).toBeGreaterThanOrEqual(50);
  }, 120_000);

  it.each(["nl", "sv", "no", "fi", "pl"] as const)(
    "measures %s card prose from the catalog",
    async (locale) => {
      const set = getSet("base1");
      const card = getSetCards("base1")?.find((item) => item.n === "4");
      if (!set || !card) throw new Error("missing charizard");
      const totals = await paragraphCounts(locale);
      const mid = median(totals);
      console.log(
        `card prose words median ${locale}=${mid} min=${Math.min(...totals)} charizard=${words(buildCardView(locale, getMessages(locale), set, card, "need").paragraph)}`,
      );
      expect(mid).toBeGreaterThanOrEqual(160);
    },
    60_000,
  );
});
