import { describe, expect, it } from "vitest";
import { numbersMatch, parseBulk } from "../src/lib/cards";

describe("parseBulk", () => {
  it("reads singles, quantities, ranges, and comments", () => {
    const parsed = parseBulk("4\n4 x3\n# skip me\n\n12-14 x2\nTG05");
    expect(parsed.errors).toEqual([]);
    expect(parsed.items).toEqual([
      { number: "4", quantity: 4 },
      { number: "12", quantity: 2 },
      { number: "13", quantity: 2 },
      { number: "14", quantity: 2 },
      { number: "TG05", quantity: 1 },
    ]);
  });

  it("rejects an empty or oversized range and a bad quantity", () => {
    expect(parseBulk("20-12").errors[0]?.reason).toMatch(/range/i);
    expect(parseBulk("1-200").errors[0]?.reason).toMatch(/151/);
    expect(parseBulk("4 x0").errors[0]?.reason).toMatch(/1 to 999/);
    expect(parseBulk("hello world").errors).toHaveLength(1);
  });
});

describe("numbersMatch", () => {
  it("ignores case and leading zeros on plain numbers", () => {
    expect(numbersMatch("004", "4")).toBe(true);
    expect(numbersMatch("TG05", "tg05")).toBe(true);
    expect(numbersMatch("TG05", "5")).toBe(false);
    expect(numbersMatch("!", "!")).toBe(true);
  });
});
