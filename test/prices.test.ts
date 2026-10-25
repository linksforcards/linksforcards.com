import { describe, expect, it } from "vitest";
import { extractEstimates, toCents } from "../src/lib/prices";

describe("price estimates", () => {
  it("uses the lowest positive market and ignores zero or huge figures", () => {
    const estimate = extractEstimates({
      tcgplayer: {
        updatedAt: "2024/01/02",
        prices: {
          holofoil: { market: 1.2 },
          normal: { market: 0.4 },
          reverseHolofoil: { market: 0 },
          unbounded: { market: 100_000 },
        },
      },
      cardmarket: {
        updatedAt: "2024-03-04T12:00:00.000Z",
        prices: { trendPrice: 0, reverseHoloTrend: 2.25, avg7: 9, averageSellPrice: 8 },
      },
    });
    expect(estimate.tcgCents).toBe(40);
    expect(estimate.cmCents).toBe(225);
    expect(estimate.tcgAsOf).toBe("2024-01-02");
    expect(estimate.cmAsOf).toBe("2024-03-04");
    expect(estimate.note).toContain("normal");
    expect(estimate.note).toContain("reverseHoloTrend");
  });

  it("falls through Cardmarket averages and drops non-positive results", () => {
    expect(toCents(0)).toBe(0);
    expect(toCents(100_000)).toBe(0);
    const estimate = extractEstimates({
      cardmarket: { prices: { trendPrice: 0, avg7: 1.5 } },
    });
    expect(estimate.cmCents).toBe(150);
    expect(estimate.tcgCents).toBeNull();
  });
});
