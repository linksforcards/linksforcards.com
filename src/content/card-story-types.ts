export type FieldCompare = "same" | "diff" | "skip";

export type SpeciesFact = {
  name: string;
  dexLabel: string;
  generation: number;
  region: string;
  total: number;
  others: number;
  totalLabel: string;
  othersLabel: string;
};

export type ComparedPrinting = {
  name: string;
  setName: string;
  fraction: string;
  year: string;
  hp: string | null;
  rarity: string | null;
  artist: string | null;
  regulation: string | null;
  retreat: number | null;
};

export type StoryAttack = { name: string; damage: string | null; cost: string | null; text: string | null };
export type StoryAbility = { name: string; type: string | null; text: string | null };
export type StoryLink = { printed: string; name: string | null; dexLabel: string | null };

export type CardStory = {
  variant: 0 | 1;
  name: string;
  fraction: string;
  setName: string;
  series: string;
  release: string | null;
  printed: number | null;
  count: number;
  countLabel: string;
  place: number;
  placeLabel: string;
  secret: boolean;
  prev: { number: string; name: string } | null;
  next: { number: string; name: string } | null;
  kind: "p" | "t" | "e" | "o";
  subtypes: string[];
  types: string[];
  hp: string | null;
  rarity: string | null;
  artist: string | null;
  artistOthers: number | null;
  artistOthersLabel: string | null;
  level: string | null;
  species: SpeciesFact[];
  evolvesFrom: string | null;
  evolvesFromSpecies: { printed: string; name: string; dexLabel: string } | null;
  evolvesTo: StoryLink[];
  attacks: StoryAttack[];
  abilities: StoryAbility[];
  weaknesses: string[];
  resistances: string[];
  retreat: number | null;
  flavor: string | null;
  regulation: string | null;
  rules: string[];
  ancient: { name: string; text: string } | null;
  otherSets: number;
  yearFrom: string | null;
  yearTo: string | null;
  differentHp: number | null;
  differentHpLabel: string | null;
  earliest: ComparedPrinting | null;
  hpCompare: FieldCompare;
  rarityCompare: FieldCompare;
  artistCompare: FieldCompare;
  regulationCompare: FieldCompare;
  retreatCompare: FieldCompare;
  setBinder: string;
  genBinders: string[];
  themes: string[];
  statusLine: string;
};

export type CardFaq = { q: string; a: string };

export function keep(parts: Array<string | false | null | undefined>): string {
  return parts.filter((part): part is string => Boolean(part)).join(" ");
}

export function quoted(locale: string, text: string): string {
  if (locale === "de" || locale === "pl" || locale === "nl") return `„${text}“`;
  if (locale === "fr" || locale === "es" || locale === "it" || locale === "no") return `« ${text} »`;
  if (locale === "sv" || locale === "fi") return `”${text}”`;
  return `"${text}"`;
}
