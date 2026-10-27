/**
 * Builds data/catalog from the public Pokémon TCG dataset.
 * Keeps names, collector numbers, and the card-text fields in scripts/card-facts.mjs.
 * Drops images, prices, and every other field on purpose.
 */
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { cardFacts, CATALOG_CONTENTS } from "./card-facts.mjs";

const ROOT = path.resolve(import.meta.dirname, "..");
const OUT = path.join(ROOT, "data", "catalog");
const REPO = "PokemonTCG/pokemon-tcg-data";
const CONCURRENCY = 8;

const DEX_LANGS = { en: "9", fr: "5", de: "6", es: "7", it: "8" };

async function getJson(url) {
  let lastError;
  for (let attempt = 1; attempt <= 4; attempt++) {
    try {
      const response = await fetch(url, {
        headers: { "User-Agent": "linksforcards-catalog-build", Accept: "application/json" },
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
  const results = new Array(items.length);
  let index = 0;
  async function worker() {
    while (index < items.length) {
      const current = index++;
      results[current] = await fn(items[current], current);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, () => worker()));
  return results;
}

function kindOf(supertype) {
  if (supertype === "Pokémon") return "p";
  if (supertype === "Trainer") return "t";
  if (supertype === "Energy") return "e";
  return "o";
}

function sortCards(cards) {
  return cards.sort((a, b) => {
    const an = /^(\d+)/.exec(a.n);
    const bn = /^(\d+)/.exec(b.n);
    if (an && bn && an[1] !== bn[1]) return Number(an[1]) - Number(bn[1]);
    return a.n.localeCompare(b.n, "en", { numeric: true });
  });
}

function assertNoForbiddenKeys(value, label) {
  if (!value || typeof value !== "object") return;
  for (const key of Object.keys(value)) {
    const lowered = key.toLowerCase();
    if (
      ["tcgplayer", "cardmarket", "prices", "images", "image", "low", "mid", "high", "market"].includes(
        lowered,
      )
    ) {
      throw new Error(`Refusing to write forbidden key "${key}" in ${label}`);
    }
    assertNoForbiddenKeys(value[key], label);
  }
}

async function main() {
  const commitPayload = await getJson(`https://api.github.com/repos/${REPO}/commits/master`);
  const commit = commitPayload.sha;
  console.log(`source commit ${commit}`);

  const tree = await getJson(`https://api.github.com/repos/${REPO}/git/trees/${commit}?recursive=1`);
  const cardPaths = tree.tree
    .filter((entry) => entry.type === "blob" && /^cards\/en\/[a-z0-9]+\.json$/.test(entry.path))
    .map((entry) => entry.path);
  if (cardPaths.length < 100) throw new Error(`Unexpected card file count: ${cardPaths.length}`);

  const setsRaw = await getJson(
    `https://raw.githubusercontent.com/${REPO}/${commit}/sets/en.json`,
  );
  const setById = new Map(setsRaw.map((set) => [set.id, set]));

  const numberChars = new Set();
  let maxDex = 0;
  let duplicates = 0;
  const cardsDir = path.join(OUT, "cards");
  await mkdir(cardsDir, { recursive: true });

  const setSummaries = [];
  let finished = 0;
  await mapPool(cardPaths, CONCURRENCY, async (cardPath) => {
    const setId = path.basename(cardPath, ".json");
    if (!/^[a-z0-9]+$/.test(setId)) throw new Error(`Unsafe set id ${setId}`);
    const rawCards = await getJson(
      `https://raw.githubusercontent.com/${REPO}/${commit}/${cardPath}`,
    );
    const byNumber = new Map();
    for (const card of rawCards) {
      const number = String(card.number ?? "").trim();
      if (!number) continue;
      for (const char of number) numberChars.add(char);
      const dex = Array.isArray(card.nationalPokedexNumbers)
        ? [...new Set(card.nationalPokedexNumbers.filter((n) => Number.isInteger(n) && n > 0))].sort(
            (a, b) => a - b,
          )
        : [];
      for (const n of dex) maxDex = Math.max(maxDex, n);
      const compact = { n: number, name: String(card.name ?? "").trim(), k: kindOf(card.supertype) };
      if (!compact.name) continue;
      if (dex.length) compact.dex = dex;
      Object.assign(compact, cardFacts(card));
      if (byNumber.has(number)) duplicates += 1;
      byNumber.set(number, compact);
    }
    const cards = sortCards([...byNumber.values()]);
    assertNoForbiddenKeys(cards, setId);
    await writeFile(path.join(cardsDir, `${setId}.json`), JSON.stringify(cards));
    const meta = setById.get(setId);
    const printed = meta?.printedTotal;
    setSummaries.push({
      id: setId,
      name: meta?.name ?? setId,
      series: meta?.series || "Other",
      releaseDate: meta?.releaseDate ?? "",
      count: cards.length,
      ...(Number.isInteger(printed) && printed > 0 ? { printed } : {}),
    });
    finished += 1;
    if (finished % 25 === 0) console.log(`  ${finished}/${cardPaths.length}`);
  });

  setSummaries.sort((a, b) => {
    const byDate = String(a.releaseDate).localeCompare(String(b.releaseDate));
    if (byDate !== 0) return byDate;
    return a.name.localeCompare(b.name);
  });

  const namesCsv = await (
    await fetch(
      "https://raw.githubusercontent.com/PokeAPI/pokeapi/master/data/v2/csv/pokemon_species_names.csv",
      { headers: { "User-Agent": "linksforcards-catalog-build" } },
    )
  ).text();
  const dex = { en: [], de: [], fr: [], es: [], it: [] };
  const rows = namesCsv.trim().split("\n").slice(1);
  const collected = { en: new Map(), de: new Map(), fr: new Map(), es: new Map(), it: new Map() };
  const idToLang = Object.fromEntries(Object.entries(DEX_LANGS).map(([lang, id]) => [id, lang]));
  for (const row of rows) {
    const [speciesId, langId, name] = row.split(",");
    const lang = idToLang[langId];
    if (!lang) continue;
    const id = Number(speciesId);
    if (id >= 1 && id <= 1025 && name) collected[lang].set(id, name);
  }
  for (const lang of Object.keys(dex)) {
    for (let id = 1; id <= 1025; id++) {
      const name = collected[lang].get(id) || collected.en.get(id);
      if (!name) throw new Error(`Missing species name ${lang} #${id}`);
      dex[lang].push(name);
    }
    if (dex[lang].length !== 1025) throw new Error(`Dex ${lang} length ${dex[lang].length}`);
  }

  const cardCount = setSummaries.reduce((sum, set) => sum + set.count, 0);
  const meta = {
    source: `https://github.com/${REPO}`,
    sourceCommit: commit,
    speciesSource: "https://github.com/PokeAPI/pokeapi",
    builtAt: new Date().toISOString().slice(0, 10),
    sets: setSummaries.length,
    cards: cardCount,
    maxDexSeen: maxDex,
    generationScope: "National Pokédex numbers 1–1025",
    contents: CATALOG_CONTENTS,
    duplicateNumbersCollapsed: duplicates,
  };
  assertNoForbiddenKeys(setSummaries, "sets");
  assertNoForbiddenKeys(dex, "dex");
  await writeFile(path.join(OUT, "sets.json"), JSON.stringify(setSummaries));
  await writeFile(path.join(OUT, "dex.json"), JSON.stringify(dex));
  await writeFile(path.join(OUT, "meta.json"), JSON.stringify(meta, null, 2) + "\n");
  console.log(JSON.stringify(meta, null, 2));
  console.log("number charset:", [...numberChars].sort().join(""));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
