import { describe, expect, it } from "vitest";
import { GENERATIONS, SPECIES_TOTAL, generationOf } from "../src/lib/generations";

describe("generations", () => {
  it("covers every national dex number from 1 through 1025 once", () => {
    const seen = new Map<number, number>();
    for (const generation of GENERATIONS) {
      for (let dex = generation.start; dex <= generation.end; dex += 1) {
        expect(seen.has(dex)).toBe(false);
        seen.set(dex, generation.id);
        expect(generationOf(dex)).toBe(generation.id);
      }
    }
    expect(seen.size).toBe(SPECIES_TOTAL);
    expect(Math.min(...seen.keys())).toBe(1);
    expect(Math.max(...seen.keys())).toBe(1025);
    expect(generationOf(0)).toBeNull();
    expect(generationOf(1026)).toBeNull();
  });
});
