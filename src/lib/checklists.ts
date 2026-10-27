import { themeCopy } from "@/content/theme-copy";
import { cardImageAlt, cardImageUrl } from "@/lib/card-images";
import { getSet, getSetCards, getSets, setsBySeries, speciesName, speciesNamesAreTranslated } from "@/lib/catalog";
import { fill, formatDay, formatInt } from "@/lib/format";
import { formatDexNumber, GENERATIONS, generationById } from "@/lib/generations";
import { getMessages, type Messages } from "@/lib/i18n";
import { cardPageIndexed, isLocale, type Locale } from "@/lib/locales";
import { getTheme, getThemes, resolveThemeCards } from "@/lib/themes";

export type ChecklistKind = "set" | "theme" | "generation";
export type Paper = "a4" | "letter";

export type ChecklistLine = { number: string; name: string; rarity: string; image?: string | null; alt?: string };

export type ChecklistBlock = { heading: string; lines: ChecklistLine[] };

export type ChecklistLabels = {
  number: string;
  name: string;
  rarity: string;
  tick: string;
  footerNote: string;
  print: string;
  downloadA4: string;
  downloadLetter: string;
  back: string;
  kicker: string;
  missingRarity: string;
};

export type ChecklistModel = {
  kind: ChecklistKind;
  id: string;
  path: string;
  title: string;
  description: string;
  detail: string;
  note: string;
  countLabel: string;
  blocks: ChecklistBlock[];
  indexed: boolean;
  sourcePath: string;
  sourceLabel: string;
  labels: ChecklistLabels;
};

export function isChecklistKind(value: string): value is ChecklistKind {
  return value === "set" || value === "theme" || value === "generation";
}

export function paperOf(value: string): Paper | null {
  return value === "a4" || value === "letter" ? value : null;
}

export function checklistStaticParams(): { kind: ChecklistKind; id: string }[] {
  return [
    ...getSets().map((set) => ({ kind: "set" as const, id: set.id })),
    ...getThemes().map((theme) => ({ kind: "theme" as const, id: theme.slug })),
    ...GENERATIONS.map((generation) => ({ kind: "generation" as const, id: String(generation.id) })),
  ];
}

export function checklistPath(kind: ChecklistKind, id: string): string {
  return `/checklists/${kind}/${id}`;
}

export function checklistPdfPath(kind: ChecklistKind, id: string, paper: Paper): string {
  return `${checklistPath(kind, id)}/pdf/${paper}`;
}

function labelsOf(m: Messages): ChecklistLabels {
  return {
    number: m.printChecklist.number,
    name: m.printChecklist.name,
    rarity: m.printChecklist.rarity,
    tick: m.printChecklist.tick,
    footerNote: m.printChecklist.footerNote,
    print: m.printChecklist.print,
    downloadA4: m.printChecklist.downloadA4,
    downloadLetter: m.printChecklist.downloadLetter,
    back: m.printChecklist.back,
    kicker: m.printChecklist.kicker,
    missingRarity: m.printChecklist.missingRarity,
  };
}

export function rarityOf(setId: string, number: string): string {
  const cards = getSetCards(setId) ?? [];
  for (let index = cards.length - 1; index >= 0; index -= 1) {
    const card = cards[index];
    if (card?.n === number) return card.r ?? "";
  }
  return "";
}

function speciesNote(locale: Locale, m: Messages): string {
  return speciesNamesAreTranslated(locale)
    ? fill(m.bindersPage.speciesLocal, { language: m.langName })
    : m.bindersPage.speciesEnglish;
}

export function getChecklist(locale: string, kind: string, id: string): ChecklistModel | null {
  if (!isLocale(locale) || !isChecklistKind(kind)) return null;
  const m = getMessages(locale);
  const labels = labelsOf(m);
  const model =
    kind === "set"
      ? setChecklist(locale, id, m, labels)
      : kind === "theme"
        ? themeChecklist(locale, id, m, labels)
        : generationChecklist(locale, id, m, labels);
  if (!model) return null;
  return { ...model, indexed: cardPageIndexed(locale) };
}

function setChecklist(locale: Locale, id: string, m: Messages, labels: ChecklistLabels): ChecklistModel | null {
  const set = getSet(id);
  const cards = set ? getSetCards(set.id) : null;
  if (!set || !cards) return null;
  return {
    kind: "set",
    id: set.id,
    path: checklistPath("set", set.id),
    title: fill(m.printChecklist.setTitle, { name: set.name }),
    description: fill(m.printChecklist.metaDescription, { name: set.name, count: formatInt(cards.length, locale) }),
    detail: fill(m.printChecklist.setDetail, { series: set.series, date: formatDay(set.releaseDate, locale) }),
    note: m.printChecklist.namesNote,
    countLabel: fill(m.printChecklist.cards, { count: formatInt(cards.length, locale) }),
    blocks: [
      {
        heading: "",
        lines: cards.map((card) => ({
          number: card.n,
          name: card.name,
          rarity: card.r ?? "",
          image: cardImageUrl(set.id, card.n, "low"),
          alt: cardImageAlt(m.checklist.cardAlt, card.name, set.name, card.n),
        })),
      },
    ],
    indexed: false,
    sourcePath: `/collections/set/${set.id}`,
    sourceLabel: m.printChecklist.openSet,
    labels,
  };
}

function themeChecklist(locale: Locale, id: string, m: Messages, labels: ChecklistLabels): ChecklistModel | null {
  const theme = getTheme(id);
  const copy = theme ? themeCopy(locale, theme.slug) : null;
  if (!theme || !copy) return null;
  const blocks: ChecklistBlock[] = [];
  for (const item of resolveThemeCards(theme)) {
    const line = {
      number: item.number,
      name: item.card.name,
      rarity: item.card.r ?? "",
      image: cardImageUrl(item.set.id, item.number, "low"),
      alt: cardImageAlt(m.checklist.cardAlt, item.card.name, item.set.name, item.number),
    };
    const last = blocks.at(-1);
    if (!last || last.heading !== item.set.name) blocks.push({ heading: item.set.name, lines: [line] });
    else last.lines.push(line);
  }
  return {
    kind: "theme",
    id: theme.slug,
    path: checklistPath("theme", theme.slug),
    title: copy.h1,
    description: fill(m.printChecklist.metaDescription, { name: copy.h1, count: formatInt(theme.total, locale) }),
    detail: fill(m.printChecklist.themeDetail, {
      count: formatInt(theme.total, locale),
      sets: formatInt(theme.setCount, locale),
    }),
    note: m.printChecklist.namesNote,
    countLabel: "",
    blocks,
    indexed: false,
    sourcePath: `/collections/themes/${theme.slug}`,
    sourceLabel: m.printChecklist.openTheme,
    labels,
  };
}

function generationChecklist(locale: Locale, id: string, m: Messages, labels: ChecklistLabels): ChecklistModel | null {
  const generation = generationById(Number(id));
  if (!generation || String(generation.id) !== id) return null;
  const region = m.regions[generation.id - 1] ?? "";
  const total = generation.end - generation.start + 1;
  const lines: ChecklistLine[] = [];
  for (let dex = generation.start; dex <= generation.end; dex += 1) {
    lines.push({ number: formatDexNumber(dex), name: speciesName(dex, locale), rarity: m.printChecklist.anyRarity });
  }
  const name = fill(m.printChecklist.generationTitle, { gen: generation.id, region });
  return {
    kind: "generation",
    id: String(generation.id),
    path: checklistPath("generation", String(generation.id)),
    title: name,
    description: fill(m.printChecklist.metaDescription, { name, count: formatInt(total, locale) }),
    detail: m.printChecklist.generationDetail,
    note: `${m.printChecklist.generationNote} ${speciesNote(locale, m)}`,
    countLabel: fill(m.printChecklist.species, { count: formatInt(total, locale) }),
    blocks: [{ heading: "", lines }],
    indexed: false,
    sourcePath: `/collections/generation/${generation.id}`,
    sourceLabel: m.printChecklist.openGeneration,
    labels,
  };
}

export type ChecklistIndex = {
  generations: { id: string; name: string; count: number; path: string }[];
  themes: { id: string; name: string; count: number; path: string }[];
  series: { series: string; sets: { id: string; name: string; count: number; path: string }[] }[];
};

export function checklistIndex(locale: Locale): ChecklistIndex {
  const m = getMessages(locale);
  return {
    generations: GENERATIONS.map((generation) => {
      const region = m.regions[generation.id - 1] ?? "";
      return {
        id: String(generation.id),
        name: fill(m.printChecklist.generationTitle, { gen: generation.id, region }),
        count: generation.end - generation.start + 1,
        path: checklistPath("generation", String(generation.id)),
      };
    }),
    themes: getThemes().flatMap((theme) => {
      const copy = themeCopy(locale, theme.slug);
      return copy
        ? [{ id: theme.slug, name: copy.h1, count: theme.total, path: checklistPath("theme", theme.slug) }]
        : [];
    }),
    series: setsBySeries().map((group) => ({
      series: group.series,
      sets: group.sets.map((set) => ({
        id: set.id,
        name: set.name,
        count: set.count,
        path: checklistPath("set", set.id),
      })),
    })),
  };
}

export function checklistSitemapPaths(locale: string): string[] {
  if (!isLocale(locale) || !cardPageIndexed(locale)) return [];
  return ["/checklists", ...checklistStaticParams().map((item) => checklistPath(item.kind, item.id))];
}
