/**
 * Adds card text from the commit already recorded in data/catalog/meta.json.
 * The card list does not move. Prices and images are dropped. Re-running is safe.
 */
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { cardFacts, CATALOG_CONTENTS } from "./card-facts.mjs";

const ROOT = path.resolve(import.meta.dirname, "..");
const OUT = path.join(ROOT, "data", "catalog");
const REPO = "PokemonTCG/pokemon-tcg-data";
const CONCURRENCY = 8;

function assertNoForbiddenKeys(value, label) {
  if (!value || typeof value !== "object") return;
  for (const key of Object.keys(value)) {
    const lowered = key.toLowerCase();
    if (["tcgplayer", "cardmarket", "prices", "images", "image", "low", "mid", "high", "market"].includes(lowered)) {
      throw new Error(`Refusing to write forbidden key "${key}" in ${label}`);
    }
    assertNoForbiddenKeys(value[key], label);
  }
}

async function getJson(url) {
  let lastError;
  for (let attempt = 1; attempt <= 4; attempt += 1) {
    try {
      const response = await fetch(url, {
        headers: { "User-Agent": "linksforcards-catalog-enrich", Accept: "application/json" },
      });
      if (!response.ok) throw new Error(`${response.status} ${url}`);
      return await response.json();
    } catch (error) {
      lastError = error;
      await new Promise((resolve) => setTimeout(resolve, attempt * 400));
    }
  }
  throw lastError;
}

async function mapPool(items, limit, fn) {
  let index = 0;
  async function worker() {
    while (index < items.length) {
      const current = index;
      index += 1;
      await fn(items[current], current);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, () => worker()));
}

async function main() {
  const meta = JSON.parse(await readFile(path.join(OUT, "meta.json"), "utf8"));
  const commit = meta.sourceCommit;
  if (!/^[a-f0-9]{40}$/.test(commit)) throw new Error(`Unexpected source commit ${commit}`);
  console.log(`enriching from ${commit}`);

  const setsRaw = await getJson(`https://raw.githubusercontent.com/${REPO}/${commit}/sets/en.json`);
  const printedById = new Map(
    setsRaw
      .filter((set) => Number.isInteger(set.printedTotal) && set.printedTotal > 0)
      .map((set) => [set.id, set.printedTotal]),
  );

  const sets = JSON.parse(await readFile(path.join(OUT, "sets.json"), "utf8"));
  let withPrinted = 0;
  const nextSets = sets.map((set) => {
    const printed = printedById.get(set.id);
    const next = { id: set.id, name: set.name, series: set.series, releaseDate: set.releaseDate, count: set.count };
    if (printed) {
      next.printed = printed;
      withPrinted += 1;
    }
    return next;
  });
  assertNoForbiddenKeys(nextSets, "sets");
  await writeFile(path.join(OUT, "sets.json"), JSON.stringify(nextSets));

  let cards = 0;
  let withArtist = 0;
  let withRarity = 0;
  let missingRaw = 0;
  await mapPool(nextSets, CONCURRENCY, async (set) => {
    const file = path.join(OUT, "cards", `${set.id}.json`);
    const current = JSON.parse(await readFile(file, "utf8"));
    const rawCards = await getJson(`https://raw.githubusercontent.com/${REPO}/${commit}/cards/en/${set.id}.json`);
    const byNumber = new Map();
    for (const raw of rawCards) {
      const number = String(raw.number ?? "").trim();
      if (!number) continue;
      const list = byNumber.get(number) ?? [];
      list.push(raw);
      byNumber.set(number, list);
    }
    const next = current.map((card) => {
      const options = byNumber.get(card.n) ?? [];
      const match = [...options].reverse().find((raw) => String(raw.name ?? "").trim() === card.name) ?? options.at(-1);
      const compact = { n: card.n, name: card.name, k: card.k };
      if (Array.isArray(card.dex) && card.dex.length) compact.dex = card.dex;
      if (!match) {
        missingRaw += 1;
        return compact;
      }
      const facts = cardFacts(match);
      if (facts.a) withArtist += 1;
      if (facts.r) withRarity += 1;
      return Object.assign(compact, facts);
    });
    assertNoForbiddenKeys(next, set.id);
    if (next.length !== current.length) throw new Error(`${set.id} card count changed`);
    cards += next.length;
    await writeFile(file, JSON.stringify(next));
  });

  meta.contents = CATALOG_CONTENTS;
  await writeFile(path.join(OUT, "meta.json"), `${JSON.stringify(meta, null, 2)}\n`);
  console.log(JSON.stringify({ cards, withArtist, withRarity, withPrinted, missingRaw, sets: nextSets.length }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
