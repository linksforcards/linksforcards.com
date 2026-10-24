export const GENERATIONS = [
  { id: 1, start: 1, end: 151 },
  { id: 2, start: 152, end: 251 },
  { id: 3, start: 252, end: 386 },
  { id: 4, start: 387, end: 493 },
  { id: 5, start: 494, end: 649 },
  { id: 6, start: 650, end: 721 },
  { id: 7, start: 722, end: 809 },
  { id: 8, start: 810, end: 905 },
  { id: 9, start: 906, end: 1025 },
] as const;

export type Generation = (typeof GENERATIONS)[number];

export const SPECIES_TOTAL = 1025;

export function generationById(id: number): Generation | null {
  return GENERATIONS.find((generation) => generation.id === id) ?? null;
}

export function generationOf(dex: number): number | null {
  const generation = GENERATIONS.find((item) => dex >= item.start && dex <= item.end);
  return generation?.id ?? null;
}

export function formatDexNumber(dex: number): string {
  const width = dex > 999 ? 4 : 3;
  return `#${String(dex).padStart(width, "0")}`;
}
