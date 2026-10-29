import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { numbersMatch } from "./cards";
import { getSet, getSetCards, type CatalogCard, type CatalogSet } from "./catalog";
import { SPECIES_INDEX_LOCALES, speciesPageIndexed, type Locale } from "./locales";

export type ThemeIndex = "species" | "all";

export type ThemeCardRef = { setId: string; number: string };

export type Theme = {
  slug: string;
  kind: "auto" | "curated";
  rule: string;
  index: ThemeIndex;
  dex: number[];
  total: number;
  setCount: number;
  bulk: number | null;
  chase: number | null;
  first: string;
  last: string;
  cards: ThemeCardRef[];
};

type ThemeFile = {
  sourceCommit?: string;
  themes: Array<{
    slug: string;
    kind?: string;
    rule: string;
    index: ThemeIndex;
    dex?: number[];
    total: number;
    setCount: number;
    bulk: number;
    chase: number;
    first: string;
    last: string;
    cards: string[];
  }>;
};

export type CuratedThemeFile = {
  slug: string;
  cards: string[];
  index?: ThemeIndex;
  dex?: number[];
  rule?: string;
};

const RELATED: Record<string, readonly string[]> = {
  pikachu: ["eeveelutions", "charizard"],
  eeveelutions: ["eevee", "pikachu"],
  eevee: ["eeveelutions"],
  "gastly-line": ["team-rocket"],
  snorlax: ["baby-pokemon"],
  charizard: ["pikachu", "mitsuhiro-arita"],
  "yuka-morii": ["mitsuhiro-arita", "baby-pokemon"],
  "mitsuhiro-arita": ["yuka-morii", "charizard"],
  "trainers-pokemon": ["team-rocket"],
  "team-rocket": ["trainers-pokemon", "gastly-line"],
  "delta-species": ["trainers-pokemon"],
  "baby-pokemon": ["snorlax", "eevee"],
  "paldea-starters": ["kanto-starters", "galar-starters"],
  "halloween-ghosts": ["gastly-line", "winter-holiday"],
  "pikachu-friends": ["pikachu", "baby-pokemon"],
  "paradox-pokemon": ["ultra-beasts", "tera-pokemon"],
  "kanto-starters": ["charizard", "johto-starters"],
  "fossil-pokemon": ["dragons", "legendary-birds"],
  "legendary-birds": ["legendary-beasts", "winter-ice"],
  "sweets-and-snacks": ["pink-pokemon", "baby-pokemon"],
  "dragons": ["dratini-line", "fossil-pokemon"],
  "winter-ice": ["eeveelutions", "winter-holiday"],
  "legendary-beasts": ["legendary-birds", "mew-mewtwo"],
  "mew-mewtwo": ["mythical-modern", "legendary-birds"],
  "mythical-modern": ["mew-mewtwo", "ultra-beasts"],
  "galarian-forms": ["alolan-forms", "hisuian-paldean-forms"],
  "alolan-forms": ["galarian-forms", "hisuian-paldean-forms"],
  "hisuian-paldean-forms": ["galarian-forms", "alolan-forms"],
  "mega-evolution": ["tera-pokemon", "gardevoir-line"],
  "johto-starters": ["kanto-starters", "hoenn-starters"],
  "hoenn-starters": ["johto-starters", "sinnoh-starters"],
  "sinnoh-starters": ["hoenn-starters", "unova-starters"],
  "unova-starters": ["sinnoh-starters", "kalos-starters"],
  "kalos-starters": ["greninja-line", "unova-starters"],
  "alola-starters": ["galar-starters", "kalos-starters"],
  "galar-starters": ["alola-starters", "paldea-starters"],
  "dratini-line": ["dragons", "magikarp-gyarados"],
  "magikarp-gyarados": ["dratini-line", "psyduck"],
  "lucario-riolu": ["baby-pokemon", "mega-evolution"],
  "gardevoir-line": ["mega-evolution", "lucario-riolu"],
  "greninja-line": ["kalos-starters", "psyduck"],
  "jigglypuff-line": ["baby-pokemon", "pink-pokemon"],
  psyduck: ["magikarp-gyarados", "ditto"],
  unown: ["ditto", "baby-pokemon"],
  mimikyu: ["halloween-ghosts", "pikachu"],
  ditto: ["unown", "psyduck"],
  "winter-holiday": ["winter-ice", "halloween-ghosts"],
  "bug-catcher": ["pink-pokemon", "fossil-pokemon"],
  "pink-pokemon": ["jigglypuff-line", "sweets-and-snacks"],
  "fire-basics-modern": ["kanto-starters", "dragons"],
  "special-illustration-rares": ["tera-pokemon", "trainer-gallery"],
  "tera-pokemon": ["special-illustration-rares", "mega-evolution"],
  "trainer-gallery": ["special-illustration-rares", "mitsuhiro-arita"],
  "ultra-beasts": ["paradox-pokemon", "mythical-modern"],
  "tomokazu-komiya": ["yuka-morii", "saya-tsuruta"],
  "saya-tsuruta": ["tomokazu-komiya", "sowsow"],
  sowsow: ["saya-tsuruta", "yuka-morii"],
  "atsuko-nishida": ["atsuko-nishida-later", "mitsuhiro-arita"],
  "atsuko-nishida-later": ["atsuko-nishida", "mitsuhiro-arita"],
  "kanto-gym-leaders": ["misty", "trainers-pokemon"],
  misty: ["kanto-gym-leaders", "psyduck"],
  erika: ["kanto-gym-leaders", "kanto-starters"],
  brock: ["kanto-gym-leaders", "misty"],
  sabrina: ["kanto-gym-leaders", "gastly-line"],
  blaine: ["kanto-gym-leaders", "kanto-starters"],
  "lt-surge": ["kanto-gym-leaders", "pikachu-friends"],
  giovanni: ["kanto-gym-leaders", "team-rocket"],
  "n-pokemon": ["trainers-pokemon", "cynthia"],
  cynthia: ["n-pokemon", "creation-trio"],
  hop: ["marnie", "trainers-pokemon"],
  lillie: ["clefairy-line", "trainers-pokemon"],
  iono: ["n-pokemon", "trainers-pokemon"],
  ethan: ["trainers-pokemon", "johto-starters"],
  marnie: ["hop", "trainers-pokemon"],
  steven: ["box-legendaries", "trainers-pokemon"],
  "team-aqua-magma": ["team-plasma", "weather-trio"],
  "team-plasma": ["team-aqua-magma", "modern-villains"],
  "modern-villains": ["team-plasma", "team-rocket"],
  stadiums: ["poke-balls", "professors"],
  "poke-balls": ["professors", "stadiums"],
  professors: ["poke-balls", "trainers-pokemon"],
  "mcdonalds-promos": ["pop-series", "pikachu"],
  "pop-series": ["mcdonalds-promos", "delta-species"],
  "card-number-one": ["first-151", "kanto-starters"],
  "first-151": ["living-dex-151", "card-number-one"],
  "living-dex-151": ["first-151", "kanto-starters"],
  "living-dex-paldea": ["paldea-starters", "living-dex-151"],
  "box-legendaries": ["weather-trio", "creation-trio"],
  "pseudo-legendaries": ["dratini-line", "dragons"],
  "latias-latios": ["weather-trio", "mega-evolution"],
  "weather-trio": ["box-legendaries", "rayquaza"],
  "creation-trio": ["box-legendaries", "cynthia"],
  "swords-of-justice": ["lake-guardians", "tapus"],
  tapus: ["swords-of-justice", "ultra-beasts"],
  "lake-guardians": ["creation-trio", "swords-of-justice"],
  "dog-pokemon": ["cat-pokemon", "snorlax"],
  "cat-pokemon": ["dog-pokemon", "meowth"],
  "bird-pokemon": ["legendary-birds", "dog-pokemon"],
  "tiny-pokemon": ["baby-pokemon", "mimikyu"],
  "giant-pokemon": ["magikarp-gyarados", "weather-trio"],
  "nap-time": ["snorlax", "jigglypuff-line"],
  "night-pokemon": ["halloween-ghosts", "nap-time"],
  "beach-pokemon": ["lapras", "magikarp-gyarados"],
  "flower-pokemon": ["berry-lovers", "kanto-starters"],
  "berry-lovers": ["flower-pokemon", "sweets-and-snacks"],
  vmax: ["rapid-strike", "single-strike"],
  "rapid-strike": ["single-strike", "vmax"],
  "single-strike": ["rapid-strike", "vmax"],
  "level-x": ["prism-star", "break"],
  "prism-star": ["level-x", "pokemon-legend"],
  break: ["level-x", "mega-evolution"],
  "pokemon-legend": ["legendary-beasts", "level-x"],
  meowth: ["cat-pokemon", "team-rocket"],
  "magnemite-line": ["pikachu-friends", "team-rocket"],
  "vulpix-line": ["kanto-starters", "alolan-forms"],
  "slowpoke-line": ["psyduck", "galarian-forms"],
  "clefairy-line": ["jigglypuff-line", "baby-pokemon"],
  "dedenne-morpeko": ["pikachu-friends", "tiny-pokemon"],
  rayquaza: ["weather-trio", "mega-evolution"],
  "togepi-line": ["baby-pokemon", "clefairy-line"],
  lapras: ["beach-pokemon", "misty"],
  rotom: ["night-pokemon", "pikachu"],
  lugia: ["box-legendaries", "legendary-birds"],
};

let cache: Theme[] | null = null;

function parseRef(ref: string): ThemeCardRef {
  const split = ref.indexOf(":");
  if (split <= 0 || split === ref.length - 1) throw new Error(`Bad theme card id ${ref}`);
  return { setId: ref.slice(0, split), number: ref.slice(split + 1) };
}

function catalogHas(ref: ThemeCardRef): boolean {
  const cards = getSetCards(ref.setId);
  return Boolean(cards?.some((card) => card.n === ref.number));
}

export function bulkTone(bulk: number, total: number): "mostly" | "mixed" | "rare" {
  if (total <= 0) return "mixed";
  const share = bulk / total;
  if (share >= 0.55) return "mostly";
  if (share >= 0.25) return "mixed";
  return "rare";
}

export function themeIndexed(theme: Theme, locale: string): boolean {
  if (theme.index === "all") return true;
  return speciesPageIndexed(locale);
}

export function themeHreflangLocales(theme: Theme): readonly Locale[] | undefined {
  return theme.index === "species" ? SPECIES_INDEX_LOCALES : undefined;
}

/** Turns a hand-built card-id list into a theme. Bulk counts stay empty until a later pass supplies them. */
export function themeFromCurated(file: CuratedThemeFile, taken: Set<string>): Theme {
  const slug = file.slug;
  if (!/^[a-z0-9-]+$/.test(slug)) throw new Error(`Unsafe curated theme slug ${slug}`);
  if (taken.has(slug)) throw new Error(`Curated theme duplicates ${slug}`);
  if (!Array.isArray(file.cards) || file.cards.length === 0) throw new Error(`Curated theme ${slug} has no cards`);
  const cards = file.cards.map(parseRef);
  for (const card of cards) {
    if (!catalogHas(card)) throw new Error(`Curated theme ${slug} names an unknown card ${card.setId}:${card.number}`);
  }
  const sets = new Set<string>();
  const dates: string[] = [];
  for (const card of cards) {
    sets.add(card.setId);
    const release = getSet(card.setId)?.releaseDate;
    if (release) dates.push(release);
  }
  dates.sort((a, b) => a.localeCompare(b));
  return {
    slug,
    kind: "curated",
    rule: file.rule?.trim() || "Curated card-id list",
    index: file.index === "species" ? "species" : "all",
    dex: Array.isArray(file.dex) ? file.dex.filter((n) => Number.isInteger(n) && n > 0) : [],
    total: cards.length,
    setCount: sets.size,
    bulk: null,
    chase: null,
    first: dates[0] ?? "",
    last: dates.at(-1) ?? "",
    cards,
  };
}

function readAuto(): Theme[] {
  const file = JSON.parse(readFileSync(path.join(process.cwd(), "data", "catalog", "themes.json"), "utf8")) as ThemeFile;
  return file.themes.map((theme) => ({
    slug: theme.slug,
    kind: "auto",
    rule: theme.rule,
    index: theme.index === "species" ? "species" : "all",
    dex: theme.dex ?? [],
    total: theme.total,
    setCount: theme.setCount,
    bulk: theme.bulk,
    chase: theme.chase,
    first: theme.first,
    last: theme.last,
    cards: theme.cards.map(parseRef),
  }));
}

export function readCuratedFiles(): CuratedThemeFile[] {
  const dir = path.join(process.cwd(), "data", "themes", "curated");
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((name) => name.endsWith(".json"))
    .sort()
    .map((name) => JSON.parse(readFileSync(path.join(dir, name), "utf8")) as CuratedThemeFile);
}

export function getThemes(): Theme[] {
  if (!cache) {
    const auto = readAuto();
    const taken = new Set(auto.map((theme) => theme.slug));
    cache = [...auto, ...readCuratedFiles().map((file) => themeFromCurated(file, taken))];
  }
  return cache;
}

export function getTheme(slug: string): Theme | null {
  if (!/^[a-z0-9-]+$/.test(slug)) return null;
  return getThemes().find((theme) => theme.slug === slug) ?? null;
}

export function relatedThemes(slug: string): Theme[] {
  const wanted = RELATED[slug] ?? [];
  return wanted.flatMap((id) => {
    const theme = getTheme(id);
    return theme ? [theme] : [];
  });
}

export function themesForDex(dex: number): Theme[] {
  return getThemes().filter((theme) => theme.dex.includes(dex));
}

let themesByCard: Map<string, Theme[]> | null = null;

/** Themes whose checklist includes this exact printing. */
export function themesForCard(setId: string, number: string): Theme[] {
  if (!themesByCard) {
    themesByCard = new Map();
    for (const theme of getThemes()) {
      for (const card of theme.cards) {
        const key = `${card.setId}:${card.number}`;
        const list = themesByCard.get(key);
        if (list) list.push(theme);
        else themesByCard.set(key, [theme]);
      }
    }
  }
  return themesByCard.get(`${setId}:${number}`) ?? [];
}

export function topSets(theme: Theme, limit = 8): { id: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const card of theme.cards) counts.set(card.setId, (counts.get(card.setId) ?? 0) + 1);
  return [...counts.entries()]
    .map(([id, count]) => ({ id, count }))
    .sort((a, b) => b.count - a.count || a.id.localeCompare(b.id))
    .slice(0, limit);
}

export function themesForSet(setId: string, limit = 6): Theme[] {
  const ranked = getThemes()
    .map((theme) => ({ theme, count: theme.cards.filter((card) => card.setId === setId).length }))
    .filter((item) => item.count > 0)
    .sort((a, b) => b.count - a.count || a.theme.slug.localeCompare(b.theme.slug));
  return ranked.slice(0, limit).map((item) => item.theme);
}

export function themeCollected(theme: Theme, held: Record<string, readonly string[]>): number {
  let collected = 0;
  for (const card of theme.cards) {
    const numbers = held[card.setId];
    if (numbers?.some((number) => numbersMatch(card.number, number))) collected += 1;
  }
  return collected;
}

export type ResolvedThemeCard = ThemeCardRef & { card: CatalogCard; set: CatalogSet };

export function resolveThemeCards(theme: Theme): ResolvedThemeCard[] {
  const resolved: ResolvedThemeCard[] = [];
  for (const ref of theme.cards) {
    const set = getSet(ref.setId);
    const card = getSetCards(ref.setId)?.find((item) => item.n === ref.number);
    if (!set || !card) continue;
    resolved.push({ ...ref, card, set });
  }
  return resolved;
}

export function anchorFor(ref: ThemeCardRef): string {
  const safe = `${ref.setId}-${ref.number}`.replace(/[^A-Za-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return `line-${safe}`;
}
