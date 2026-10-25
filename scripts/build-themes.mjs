/**
 * Builds data/catalog/themes.json from the pinned Pokémon TCG dataset.
 * Membership rules match the research script: dex intersection, exact artist,
 * δ in the name, Trainer's Pokémon, and Team Rocket / Dark Pokémon.
 * Prices and image URLs are never written. Curated card-id lists live in
 * data/themes/curated and are merged at read time, not here.
 */
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const OUT = path.join(ROOT, "data", "catalog", "themes.json");
const REPO = "PokemonTCG/pokemon-tcg-data";
const CONCURRENCY = 6;

const BULK = new Set(["Common", "Uncommon", "Rare"]);
const CHASE = new Set([
  "Illustration Rare",
  "Special Illustration Rare",
  "Ultra Rare",
  "Rare Ultra",
  "Double Rare",
  "Rare Secret",
  "Rare Rainbow",
  "Hyper Rare",
  "Rare Holo EX",
  "Rare Holo V",
  "Rare Holo GX",
  "Rare Holo VMAX",
  "Rare Holo VSTAR",
  "Rare Shiny GX",
  "Shiny Ultra Rare",
  "Mega Hyper Rare",
  "Trainer Gallery Rare Holo",
  "Rare Holo LV.X",
  "Rare Prism Star",
  "Rare Holo Star",
  "Radiant Rare",
  "Amazing Rare",
  "ACE SPEC Rare",
  "Rare Shining",
  "Rare BREAK",
  "Rare Prime",
  "LEGEND",
  "Rare ACE",
  "Black White Rare",
  "Futuristic Rare",
  "MEGA_ATTACK_RARE",
]);

const BABIES = [172, 173, 174, 175, 236, 238, 239, 240, 298, 360, 406, 433, 438, 439, 440, 446, 447, 458, 848];
const EEVEELUTIONS = [133, 134, 135, 136, 196, 197, 470, 471, 700];

const THEMES = [
  spec("pikachu", "species", [25], "Pokémon whose nationalPokedexNumbers include 25"),
  spec("eeveelutions", "species", EEVEELUTIONS, "Pokémon whose nationalPokedexNumbers include Eevee or an Eeveelution"),
  spec("eevee", "species", [133], "Pokémon whose nationalPokedexNumbers include 133"),
  spec("gastly-line", "species", [92, 93, 94], "Pokémon whose nationalPokedexNumbers include 92, 93, or 94"),
  spec("snorlax", "species", [143, 446], "Pokémon whose nationalPokedexNumbers include 143 or 446"),
  spec("charizard", "species", [6], "Pokémon whose nationalPokedexNumbers include 6"),
  artist("yuka-morii", ["Yuka Morii"]),
  artist("mitsuhiro-arita", ["Mitsuhiro Arita"]),
  {
    slug: "trainers-pokemon",
    index: "all",
    dex: [],
    rule: "Pokémon whose English name contains \"'s \"",
    test: (card) => card.pokemon && /'s /.test(card.name),
  },
  {
    slug: "team-rocket",
    index: "all",
    dex: [],
    rule: "Name contains Rocket, or a Pokémon whose name starts with \"Dark \"",
    test: (card) => card.name.includes("Rocket") || (card.name.startsWith("Dark ") && card.pokemon),
  },
  {
    slug: "delta-species",
    index: "all",
    dex: [],
    rule: "English name contains δ",
    test: (card) => card.name.includes("δ"),
  },
  spec("baby-pokemon", "all", BABIES, "Pokémon whose nationalPokedexNumbers include a baby species"),
];

function spec(slug, index, dex, rule) {
  const wanted = new Set(dex);
  return {
    slug,
    index,
    dex: [...dex],
    rule,
    test: (card) => card.pokemon && card.dex.some((number) => wanted.has(number)),
  };
}

function artist(slug, names) {
  const wanted = new Set(names.map((name) => name.trim().toLowerCase()));
  return {
    slug,
    index: "all",
    dex: [],
    rule: `artist is ${names.join(" or ")}`,
    test: (card) => wanted.has(card.artist),
  };
}

async function getJson(url) {
  let lastError;
  for (let attempt = 1; attempt <= 5; attempt += 1) {
    try {
      const response = await fetch(url, {
        headers: { "User-Agent": "linksforcards-theme-build", Accept: "application/json" },
      });
      if (!response.ok) throw new Error(`${response.status} ${url}`);
      return await response.json();
    } catch (error) {
      lastError = error;
      await new Promise((resolve) => setTimeout(resolve, attempt * 500));
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

async function main() {
  const meta = JSON.parse(await readFile(path.join(ROOT, "data", "catalog", "meta.json"), "utf8"));
  const commit = String(meta.sourceCommit ?? "");
  if (!/^[a-f0-9]{40}$/.test(commit)) throw new Error(`Catalog sourceCommit is not pinned: ${commit}`);
  const catalogSets = JSON.parse(await readFile(path.join(ROOT, "data", "catalog", "sets.json"), "utf8"));
  const known = new Set();
  const setById = new Map();
  for (const set of catalogSets) {
    setById.set(set.id, set);
    const cards = JSON.parse(await readFile(path.join(ROOT, "data", "catalog", "cards", `${set.id}.json`), "utf8"));
    for (const card of cards) known.add(`${set.id}:${card.n}`);
  }

  console.log(`themes from ${commit}`);
  const tree = await getJson(`https://api.github.com/repos/${REPO}/git/trees/${commit}?recursive=1`);
  const cardPaths = tree.tree
    .filter((entry) => entry.type === "blob" && /^cards\/en\/[a-z0-9]+\.json$/.test(entry.path))
    .map((entry) => entry.path);
  if (cardPaths.length < 100) throw new Error(`Unexpected card file count: ${cardPaths.length}`);

  const selected = THEMES.map(() => []);
  let finished = 0;
  await mapPool(cardPaths, CONCURRENCY, async (cardPath) => {
    const setId = path.basename(cardPath, ".json");
    const set = setById.get(setId);
    if (!set) return;
    const rawCards = await getJson(`https://raw.githubusercontent.com/${REPO}/${commit}/${cardPath}`);
    const byNumber = new Map();
    for (const card of rawCards) {
      const number = String(card.number ?? "").trim();
      const name = String(card.name ?? "").trim();
      if (!number || !name || !known.has(`${setId}:${number}`)) continue;
      if (number.includes(":")) throw new Error(`Collector number contains a colon: ${setId}:${number}`);
      const dex = Array.isArray(card.nationalPokedexNumbers)
        ? [...new Set(card.nationalPokedexNumbers.filter((n) => Number.isInteger(n) && n > 0))]
        : [];
      byNumber.set(number, {
        setId,
        number,
        name,
        pokemon: card.supertype === "Pokémon",
        dex,
        artist: String(card.artist ?? "").trim().toLowerCase(),
        rarity: String(card.rarity ?? ""),
        releaseDate: String(set.releaseDate ?? ""),
      });
    }
    for (const card of byNumber.values()) {
      THEMES.forEach((theme, index) => {
        if (theme.test(card)) selected[index].push(card);
      });
    }
    finished += 1;
    if (finished % 25 === 0) console.log(`  ${finished}/${cardPaths.length}`);
  });

  const themes = THEMES.map((theme, index) => {
    const cards = selected[index].sort((a, b) => {
      const byDate = a.releaseDate.localeCompare(b.releaseDate);
      if (byDate !== 0) return byDate;
      const bySet = a.setId.localeCompare(b.setId);
      if (bySet !== 0) return bySet;
      return a.number.localeCompare(b.number, "en");
    });
    let bulk = 0;
    let chase = 0;
    const sets = new Set();
    for (const card of cards) {
      sets.add(card.setId);
      if (BULK.has(card.rarity)) bulk += 1;
      if (CHASE.has(card.rarity)) chase += 1;
    }
    return {
      slug: theme.slug,
      kind: "auto",
      rule: theme.rule,
      index: theme.index,
      dex: theme.dex,
      total: cards.length,
      setCount: sets.size,
      bulk,
      chase,
      first: cards[0]?.releaseDate ?? "",
      last: cards.at(-1)?.releaseDate ?? "",
      cards: cards.map((card) => `${card.setId}:${card.number}`),
    };
  });

  const payload = {
    source: `https://github.com/${REPO}`,
    sourceCommit: commit,
    builtAt: new Date().toISOString().slice(0, 10),
    note: "English cards from the open dataset. Reverse holos, stamps, and Japanese-only cards are not included. Curated lists can be added later as data/themes/curated/{slug}.json.",
    themes,
  };
  assertNoForbiddenKeys(payload, "themes");
  await writeFile(OUT, `${JSON.stringify(payload)}\n`);
  for (const theme of themes) {
    const share = theme.total ? (theme.bulk / theme.total).toFixed(3) : "0";
    console.log(`${theme.slug.padEnd(20)} ${String(theme.total).padStart(4)} sets=${String(theme.setCount).padStart(3)} bulk=${share}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
