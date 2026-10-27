import { readFileSync } from "node:fs";
import path from "node:path";
import type { CardKind } from "./catalog";

/** Compact printing facts stored once so a card page does not open every set file. */
export type LookupPrinting = {
  s: string;
  n: string;
  m: string;
  k: CardKind;
  hp?: string;
  r?: string;
  a?: string;
  rm?: string;
  rc?: number;
};

type CardLookupFile = {
  artists: Record<string, number>;
  names: Record<string, number[]>;
  dex: Record<string, LookupPrinting[]>;
};

let cache: CardLookupFile | null = null;

export function cardLookup(): CardLookupFile {
  if (!cache) {
    const file = path.join(process.cwd(), "data", "catalog", "card-lookup.json");
    cache = JSON.parse(readFileSync(file, "utf8")) as CardLookupFile;
  }
  return cache;
}

export function artistCardCount(name: string): number {
  return cardLookup().artists[name] ?? 0;
}

/** Dex numbers printed under this exact English card name, when the name maps to one species. */
export function dexesForPrintedName(name: string): number[] {
  return cardLookup().names[name] ?? [];
}

export function printingsForDex(dex: number): LookupPrinting[] {
  return cardLookup().dex[String(dex)] ?? [];
}
