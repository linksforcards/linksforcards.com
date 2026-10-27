/**
 * Derives data/catalog/card-lookup.json from the committed catalog files.
 * A card page reads this one file plus the current set, instead of every set.
 */
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const SPECIES_TOTAL = 1025;

export function buildCardLookup() {
  const root = path.resolve(import.meta.dirname, "..");
  const dir = path.join(root, "data", "catalog");
  const sets = JSON.parse(readFileSync(path.join(dir, "sets.json"), "utf8"));
  const dates = new Map(sets.map((set) => [set.id, String(set.releaseDate ?? "")]));
  const artists = new Map();
  const names = new Map();
  const buckets = new Map();

  function compare(a, b) {
    const byDate = (dates.get(a.s) ?? "").localeCompare(dates.get(b.s) ?? "");
    if (byDate) return byDate;
    const bySet = a.s.localeCompare(b.s);
    if (bySet) return bySet;
    return a.n.localeCompare(b.n, "en", { numeric: true });
  }

  for (const set of sets) {
    const cards = JSON.parse(readFileSync(path.join(dir, "cards", `${set.id}.json`), "utf8"));
    for (const card of cards) {
      if (typeof card.a === "string" && card.a) artists.set(card.a, (artists.get(card.a) ?? 0) + 1);
      const dexes = Array.isArray(card.dex) ? card.dex : [];
      const valid = dexes.filter((dex) => Number.isInteger(dex) && dex >= 1 && dex <= SPECIES_TOTAL);
      if (valid.length && typeof card.name === "string") {
        let named = names.get(card.name);
        if (!named) {
          named = new Set();
          names.set(card.name, named);
        }
        for (const dex of valid) named.add(dex);
      }
      if (!valid.length) continue;
      const printing = { s: set.id, n: card.n, m: card.name, k: card.k };
      if (card.hp) printing.hp = String(card.hp);
      if (card.r) printing.r = card.r;
      if (card.a) printing.a = card.a;
      if (card.rm) printing.rm = card.rm;
      if (card.rc != null) printing.rc = card.rc;
      for (const dex of valid) {
        const list = buckets.get(dex);
        if (list) list.push(printing);
        else buckets.set(dex, [printing]);
      }
    }
  }

  for (const list of buckets.values()) list.sort(compare);

  const artistOut = {};
  for (const [name, count] of [...artists.entries()].sort((a, b) => a[0].localeCompare(b[0]))) artistOut[name] = count;
  const nameOut = {};
  for (const [name, dexes] of [...names.entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
    nameOut[name] = [...dexes].sort((a, b) => a - b);
  }
  const dexOut = {};
  for (const dex of [...buckets.keys()].sort((a, b) => a - b)) dexOut[String(dex)] = buckets.get(dex);

  const file = path.join(dir, "card-lookup.json");
  writeFileSync(file, JSON.stringify({ artists: artistOut, names: nameOut, dex: dexOut }));
  return file;
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  const file = buildCardLookup();
  console.log(file);
}
