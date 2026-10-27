/**
 * One-time, cached enrichment of TCGdex image base URLs.
 *
 * The serie segment is taken from the API `image` field. It is never guessed.
 * Set ids that differ from PokemonTCG/pokemon-tcg-data are an explicit map,
 * accepted only when card names overlap. Cards TCGdex lacks can fall back to
 * images.pokemontcg.io when a sample of those URLs returns 200.
 *
 * Writes data/catalog/images.json. Does not write prices or image files.
 */
import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const CATALOG = path.join(ROOT, "data", "catalog");
const CACHE = path.join(ROOT, ".cache", "tcgdex");
const OUT = path.join(CATALOG, "images.json");
const SET_CONCURRENCY = 4;
const HEAD_CONCURRENCY = 6;

/**
 * PokemonTCG set id → TCGdex set id, where the public ids differ.
 * Paired by the published English set name, then checked against card names.
 */
const SET_ID_MAP = {
  base6: "lc",
  bp: "bog",
  cel25c: "cel25cc",
  fut20: "fut2020",
  hsp: "hgssp",
  mcd11: "2011bw",
  mcd12: "2012bw",
  mcd14: "2014xy",
  mcd15: "2015xy",
  mcd16: "2016xy",
  mcd17: "2017sm",
  mcd18: "2018sm",
  mcd19: "2019sm",
  mcd21: "2021swsh",
  mcd22: "2022swsh",
  me1: "me01",
  me2: "me02",
  me2pt5: "me02.5",
  me3: "me03",
  me4: "me04",
  me5: "me05",
  me55: "30th",
  me55c: "30th-c",
  pgo: "swsh10.5",
  rsv10pt5: "sv10.5w",
  sm35: "sm3.5",
  sm75: "sm7.5",
  sv1: "sv01",
  sv2: "sv02",
  sv3: "sv03",
  sv3pt5: "sv03.5",
  sv4: "sv04",
  sv4pt5: "sv04.5",
  sv5: "sv05",
  sv6: "sv06",
  sv6pt5: "sv06.5",
  sv7: "sv07",
  sv8: "sv08",
  sv8pt5: "sv08.5",
  sv9: "sv09",
  swsh12pt5: "swsh12.5",
  swsh12pt5gg: "swsh12.5gg",
  swsh35: "swsh3.5",
  swsh45: "swsh4.5",
  swsh45sv: "swsh4.5sv",
  tk1a: "tk-ex-latia",
  tk1b: "tk-ex-latio",
  tk2a: "tk-ex-p",
  tk2b: "tk-ex-m",
  zsv10pt5: "sv10.5b",
};

async function getJson(url) {
  const file = path.join(CACHE, `${createHash("sha256").update(url).digest("hex").slice(0, 32)}.json`);
  try {
    return JSON.parse(await readFile(file, "utf8"));
  } catch {
    // Cache miss. Fetch below.
  }
  let lastError;
  for (let attempt = 1; attempt <= 4; attempt += 1) {
    try {
      const response = await fetch(url, {
        headers: { "User-Agent": "linksforcards-catalog-build", Accept: "application/json" },
      });
      if (!response.ok) throw new Error(`${response.status} ${url}`);
      const data = await response.json();
      await mkdir(CACHE, { recursive: true });
      await writeFile(file, JSON.stringify(data));
      return data;
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
      const current = index;
      index += 1;
      results[current] = await fn(items[current], current);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, () => worker()));
  return results;
}

function normName(value) {
  return String(value)
    .normalize("NFKD")
    .replace(/\p{M}/gu, "")
    .replace(/[★☆]/g, " star ")
    .replace(/[δ∆Δ]/g, " delta ")
    .replace(/♂/g, " m ")
    .replace(/♀/g, " f ")
    .replace(/['’ʻ]/g, "")
    .replace(/[^a-z0-9]+/gi, " ")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

function splitImage(url) {
  if (typeof url !== "string" || !url.startsWith("https://assets.tcgdex.net/")) return null;
  let parsed;
  try {
    parsed = new URL(url);
  } catch {
    return null;
  }
  if (parsed.search || parsed.hash) return { full: url };
  const parts = parsed.pathname.split("/").filter(Boolean);
  if (parts.length < 4 || parts[0] !== "en") return null;
  const local = parts[parts.length - 1] ?? "";
  const prefix = url.slice(0, url.length - local.length);
  if (!prefix.endsWith("/")) return null;
  return { prefix, local, stored: url };
}

function indexTcgCards(cards) {
  const byLocal = new Map();
  const byNumeric = new Map();
  const byName = new Map();
  for (const card of cards) {
    const split = splitImage(card.image);
    if (!split) continue;
    const entry = {
      localId: String(card.localId ?? ""),
      name: normName(card.name),
      base: split.stored ?? split.full,
      prefix: split.prefix ?? null,
      suffix: split.local ?? null,
    };
    if (entry.localId) byLocal.set(entry.localId, entry);
    if (/^\d+$/.test(entry.localId)) {
      const key = String(Number(entry.localId));
      const existing = byNumeric.get(key);
      if (existing && existing.base !== entry.base) byNumeric.set(key, null);
      else if (!existing) byNumeric.set(key, entry);
    }
    const list = byName.get(entry.name);
    if (list) list.push(entry);
    else byName.set(entry.name, [entry]);
  }
  return { byLocal, byNumeric, byName };
}

function matchSet(catalogCards, tcgCards) {
  const index = indexTcgCards(tcgCards);
  const used = new Set();
  const matched = [];
  const nameCounts = new Map();
  for (const card of catalogCards) nameCounts.set(normName(card.name), (nameCounts.get(normName(card.name)) ?? 0) + 1);

  function take(card, entry, how) {
    if (!entry || used.has(entry.base)) return false;
    used.add(entry.base);
    matched.push({ number: card.n, base: entry.base, prefix: entry.prefix, suffix: entry.suffix, how });
    return true;
  }

  const unmatched = [];
  for (const card of catalogCards) {
    const exact = index.byLocal.get(card.n);
    const numeric = /^\d+$/.test(card.n) ? index.byNumeric.get(String(Number(card.n))) : undefined;
    const candidate = exact || numeric || null;
    if (candidate && candidate.name === normName(card.name) && take(card, candidate, exact ? "id" : "num")) continue;
    unmatched.push(card);
  }

  const still = [];
  for (const card of unmatched) {
    const name = normName(card.name);
    const options = (index.byName.get(name) ?? []).filter((entry) => !used.has(entry.base));
    if (name && nameCounts.get(name) === 1 && options.length === 1 && take(card, options[0], "name")) continue;
    still.push(card);
  }
  return { matched, missing: still.map((card) => card.n) };
}

function compact(matched, missing) {
  if (matched.length === 0) return null;
  const prefixes = new Set(matched.map((item) => item.prefix).filter(Boolean));
  const record = {};
  if (prefixes.size !== 1 || matched.some((item) => !item.prefix || !item.suffix)) {
    record.full = {};
    for (const item of matched) record.full[item.number] = item.base;
  } else {
    record.p = [...prefixes][0];
    let width = null;
    let padOk = true;
    const alias = {};
    for (const item of matched) {
      const { number, suffix } = item;
      if (suffix === number) continue;
      const bothNumeric = /^\d+$/.test(number) && /^\d+$/.test(suffix);
      if (
        bothNumeric &&
        Number(suffix) === Number(number) &&
        suffix === number.padStart(suffix.length, "0")
      ) {
        if (width == null) width = suffix.length;
        else if (width !== suffix.length) padOk = false;
      } else {
        alias[number] = suffix;
      }
    }
    if (!padOk) {
      for (const item of matched) {
        if (item.suffix !== item.number) alias[item.number] = item.suffix;
      }
    } else if (width) {
      record.pad = width;
    }
    if (Object.keys(alias).length) record.alias = alias;
  }
  if (missing.length) record.miss = [...missing].sort((a, b) => a.localeCompare(b, "en", { numeric: true }));
  return record;
}

function resolveBase(record, number) {
  if (!record) return null;
  if (record.full?.[number]) return record.full[number];
  if (record.miss?.includes(number)) return null;
  if (!record.p) return null;
  const local = record.alias?.[number] ?? (record.pad ? number.padStart(record.pad, "0") : number);
  return `${record.p}${local}`;
}

const headCache = new Map();
let headWrite = Promise.resolve();

async function loadHeads() {
  try {
    const saved = JSON.parse(await readFile(path.join(CACHE, "heads.json"), "utf8"));
    for (const [url, status] of Object.entries(saved)) headCache.set(url, status);
  } catch {
    // First run.
  }
}

let headDirty = 0;

function rememberHead(url, status) {
  headCache.set(url, status);
  headDirty += 1;
  if (headDirty < 200) return;
  headDirty = 0;
  headWrite = headWrite.then(async () => {
    await mkdir(CACHE, { recursive: true });
    await writeFile(path.join(CACHE, "heads.json"), JSON.stringify(Object.fromEntries(headCache)));
  });
}

async function flushHeads() {
  headDirty = 0;
  headWrite = headWrite.then(async () => {
    await mkdir(CACHE, { recursive: true });
    await writeFile(path.join(CACHE, "heads.json"), JSON.stringify(Object.fromEntries(headCache)));
  });
  await headWrite;
}

async function headStatus(url) {
  const cached = headCache.get(url);
  if (cached === 200 || cached === 404) return cached;
  let status = 0;
  for (let attempt = 1; attempt <= 4; attempt += 1) {
    try {
      const response = await fetch(url, {
        method: "HEAD",
        headers: { "User-Agent": "linksforcards-catalog-build" },
      });
      status = response.status;
      if (status === 200 || status === 404) break;
    } catch {
      status = 0;
    }
    await new Promise((resolve) => setTimeout(resolve, attempt * 350));
  }
  if (status === 200 || status === 404) rememberHead(url, status);
  return status;
}

async function headOk(url) {
  return (await headStatus(url)) === 200;
}

function fallbackUrl(setId, number, hires) {
  const id = encodeURIComponent(setId);
  const n = encodeURIComponent(number);
  return hires
    ? `https://images.pokemontcg.io/${id}/${n}_hires.png`
    : `https://images.pokemontcg.io/${id}/${n}.png`;
}

function sampleOf(numbers) {
  if (numbers.length <= 3) return [...numbers];
  const mid = numbers[Math.floor(numbers.length / 2)];
  return [numbers[0], mid, numbers[numbers.length - 1]];
}

async function main() {
  await loadHeads();
  const sets = JSON.parse(await readFile(path.join(CATALOG, "sets.json"), "utf8"));
  const tcgSets = await getJson("https://api.tcgdex.net/v2/en/sets");
  const tcgIds = new Set(tcgSets.map((set) => set.id));
  for (const [from, to] of Object.entries(SET_ID_MAP)) {
    if (!tcgIds.has(to)) throw new Error(`Mapped TCGdex set ${to} (from ${from}) is not in the set list`);
  }

  const plans = [];
  for (const set of sets) {
    const mapped = SET_ID_MAP[set.id];
    const same = tcgIds.has(set.id) ? set.id : null;
    const tcgId = same ?? mapped ?? null;
    if (!tcgId) {
      plans.push({ set, tcgId: null, mapped: false });
      continue;
    }
    plans.push({ set, tcgId, mapped: Boolean(mapped) && mapped !== set.id });
  }

  let finished = 0;
  const built = await mapPool(plans, SET_CONCURRENCY, async (plan) => {
    const cards = JSON.parse(await readFile(path.join(CATALOG, "cards", `${plan.set.id}.json`), "utf8"));
    finished += 1;
    if (finished % 25 === 0) console.log(`  matched ${finished}/${plans.length}`);
    if (!plan.tcgId) return { id: plan.set.id, cards, record: null, missing: cards.map((card) => card.n), mapped: false };
    const remote = await getJson(`https://api.tcgdex.net/v2/en/sets/${encodeURIComponent(plan.tcgId)}`);
    const { matched, missing } = matchSet(cards, remote.cards ?? []);
    const overlap = cards.length ? matched.length / cards.length : 0;
    if (plan.mapped && overlap < 0.5) {
      console.warn(`reject map ${plan.set.id} → ${plan.tcgId} overlap ${overlap.toFixed(2)} (${remote.name})`);
      return { id: plan.set.id, cards, record: null, missing: cards.map((card) => card.n), mapped: true };
    }
    const record = compact(matched, missing);
    if (record) {
      for (const item of matched) {
        const resolved = resolveBase(record, item.number);
        if (resolved !== item.base) {
          throw new Error(`Rebuild mismatch ${plan.set.id} ${item.number}: ${resolved} !== ${item.base}`);
        }
      }
      for (const number of missing) {
        if (resolveBase(record, number)) throw new Error(`Missing card resolved ${plan.set.id} ${number}`);
      }
    }
    if (overlap < 0.85) {
      console.log(
        `  low ${plan.set.id} → ${plan.tcgId} ${remote.name}: ${matched.length}/${cards.length} missing ${missing.slice(0, 8).join(",")}`,
      );
    }
    return { id: plan.set.id, cards, record, missing, matched, mapped: plan.mapped, tcgId: plan.tcgId };
  });

  console.log("checking TCGdex files");
  let droppedFiles = 0;
  let hiOnlyFiles = 0;
  await mapPool(
    built.filter((item) => item.matched?.length),
    2,
    async (item) => {
      const checks = await mapPool(item.matched, 4, async (entry) => {
        const low = await headStatus(`${entry.base}/low.webp`);
        if (low !== 404) return { entry, hi: false };
        const high = await headStatus(`${entry.base}/high.webp`);
        if (high === 404) return null;
        // low.webp is missing. high.webp is present, or the check never got a definitive 404.
        return { entry, hi: high === 200 };
      });
      const kept = checks.filter(Boolean);
      const dropped = item.matched.filter((entry) => !kept.some((row) => row.entry === entry));
      const hiOnly = kept.filter((row) => row.hi).map((row) => row.entry.number);
      if (!dropped.length && !hiOnly.length) return;
      if (dropped.length) {
        droppedFiles += dropped.length;
        console.warn(`  drop ${item.id} ${dropped.map((entry) => entry.number).slice(0, 12).join(",")}`);
        item.missing = [...item.missing, ...dropped.map((entry) => entry.number)];
        item.matched = kept.map((row) => row.entry);
        item.record = compact(item.matched, item.missing);
        for (const entry of item.matched) {
          if (resolveBase(item.record, entry.number) !== entry.base) {
            throw new Error(`Rebuild mismatch after drop ${item.id} ${entry.number}`);
          }
        }
      }
      if (hiOnly.length && item.record) {
        hiOnlyFiles += hiOnly.length;
        item.record.hi = [...hiOnly].sort((a, b) => a.localeCompare(b, "en", { numeric: true }));
        console.warn(`  high-only ${item.id} ${item.record.hi.slice(0, 12).join(",")}`);
      }
    },
  );
  console.log(`  dropped ${droppedFiles} missing files, ${hiOnlyFiles} high-only`);
  await flushHeads();

  console.log("sampling pokemontcg.io fallbacks");
  const fb = {};
  const fbHires = [];
  await mapPool(
    built.filter((item) => item.missing.length),
    2,
    async (item) => {
      const sample = sampleOf(item.missing);
      const checks = await mapPool(sample, HEAD_CONCURRENCY, async (number) => headOk(fallbackUrl(item.id, number, false)));
      const hits = checks.filter(Boolean).length;
      let accepted = [];
      if (hits === sample.length) accepted = item.missing;
      else if (hits === 0) accepted = [];
      else {
        const each = await mapPool(item.missing, HEAD_CONCURRENCY, async (number) =>
          (await headOk(fallbackUrl(item.id, number, false))) ? number : null,
        );
        accepted = each.filter(Boolean);
      }
      if (!accepted.length) return;
      fb[item.id] = [...accepted].sort((a, b) => a.localeCompare(b, "en", { numeric: true }));
      const hiresNumber = accepted[0];
      if (hiresNumber && (await headOk(fallbackUrl(item.id, hiresNumber, true)))) fbHires.push(item.id);
    },
  );

  const imageSets = {};
  for (const item of built) {
    if (item.record) imageSets[item.id] = item.record;
  }

  let tcgdex = 0;
  let fallback = 0;
  let none = 0;
  for (const item of built) {
    const fbSet = new Set(fb[item.id] ?? []);
    for (const card of item.cards) {
      if (resolveBase(item.record, card.n)) tcgdex += 1;
      else if (fbSet.has(card.n)) fallback += 1;
      else none += 1;
    }
  }
  const total = tcgdex + fallback + none;
  const file = {
    v: 1,
    source: "https://api.tcgdex.net/v2/en/sets",
    assets: "https://assets.tcgdex.net",
    fallback: "https://images.pokemontcg.io",
    builtAt: new Date().toISOString().slice(0, 10),
    stats: { cards: total, tcgdex, fallback, none },
    sets: imageSets,
    fb,
    fbHires: fbHires.sort(),
  };
  await headWrite;
  await writeFile(OUT, `${JSON.stringify(file)}\n`);
  const bytes = Buffer.byteLength(JSON.stringify(file));
  console.log(
    JSON.stringify(
      {
        ...file.stats,
        tcgdexPct: `${((100 * tcgdex) / total).toFixed(1)}%`,
        fallbackPct: `${((100 * fallback) / total).toFixed(1)}%`,
        nonePct: `${((100 * none) / total).toFixed(1)}%`,
        bytes,
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
