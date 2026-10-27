import type { BulkItem } from "./cards";
import { formatDexList } from "./cards";
import { getSetCards, matchCard, type CatalogCard } from "./catalog";
import { clip } from "./format";
import {
  canonicalPrintLanguage,
  isWesternPrintLanguage,
  type PrintLanguage,
} from "./print-languages";
import { getTcgdexCard, tcgdexIdForCatalog, type TcgdexBrief } from "./tcgdex";

export type CatalogIdentity = { kind: "catalog"; setId: string; number: string };
export type LocalIdentity = { kind: "local"; language: PrintLanguage; setId: string; number: string };
export type InventoryIdentity = CatalogIdentity | LocalIdentity;

/**
 * Western printings that exist in the English catalog share one identity.
 * Asian printings stay on their own key, even when the set id looks familiar.
 */
export function inventoryIdentity(language: string, setId: string, number: string): InventoryIdentity | null {
  const lang = canonicalPrintLanguage(language);
  const set = setId.trim();
  const printed = number.trim();
  if (!lang || !set || !printed) return null;
  if (isWesternPrintLanguage(lang)) {
    const cards = getSetCards(set.toLowerCase());
    const card = cards ? matchCard(cards, printed) : null;
    if (card) return { kind: "catalog", setId: set.toLowerCase(), number: card.n };
  }
  return { kind: "local", language: lang, setId: set, number: printed };
}

export type ResolvedLine = {
  language: PrintLanguage;
  setId: string;
  number: string;
  name: string;
  quantity: number;
  dex: string;
  externalSource: "tcgdex" | "manual" | null;
  externalId: string | null;
};

export type PrintingLookup = (language: string, id: string) => Promise<Pick<TcgdexBrief, "name" | "image"> | null>;

/** Above this, a western paste keeps the English catalog name and does not call TCGdex. */
export const WESTERN_LOOKUP_CAP = 30;

/** Unnamed Asian lines need a TCGdex name. A larger paste has to carry `= name`. */
export const ASIAN_LOOKUP_CAP = 40;

type Draft = {
  language: PrintLanguage;
  setId: string;
  number: string;
  quantity: number;
  manualName: string | null;
  catalog: CatalogCard | null;
  externalId: string | null;
};

function draftKey(draft: Draft): string {
  return `${draft.language}\0${draft.setId}\0${draft.number}`;
}

export async function resolveShipmentLines(
  items: BulkItem[],
  defaults: { language: string; setId: string },
  lookup: PrintingLookup = getTcgdexCard,
): Promise<{ lines: ResolvedLine[]; errors: string[] }> {
  const language = canonicalPrintLanguage(defaults.language);
  if (!language) return { lines: [], errors: ["Choose a language."] };
  const defaultSet = defaults.setId.trim();
  const errors: string[] = [];
  const drafts: Draft[] = [];

  for (const item of items) {
    const lang = item.language ? canonicalPrintLanguage(item.language) : language;
    if (!lang) {
      errors.push(`Unknown language: ${item.language}.`);
      continue;
    }
    const setRaw = (item.setId ?? defaultSet).trim();
    if (!setRaw) {
      errors.push("Choose a set, or write the set id on the line.");
      continue;
    }
    const printed = item.number.trim();
    if (!printed) {
      errors.push("A line is missing its collector number.");
      continue;
    }
    const manualName = item.name ? clip(item.name, 120) : null;
    if (isWesternPrintLanguage(lang)) {
      const setId = setRaw.toLowerCase();
      const cards = getSetCards(setId);
      const card = cards ? matchCard(cards, printed) : null;
      if (!card) {
        errors.push(`Not in the English list: ${setId} ${printed}.`);
        continue;
      }
      drafts.push({
        language: lang,
        setId,
        number: card.n,
        quantity: item.quantity,
        manualName,
        catalog: card,
        externalId: tcgdexIdForCatalog(setId, card.n),
      });
      continue;
    }
    if (!/^[A-Za-z0-9]+(?:\.[A-Za-z0-9]+)*$/.test(setRaw) || setRaw.length > 40) {
      errors.push(`That set id is not one I can store: ${setRaw}.`);
      continue;
    }
    if (!/^[A-Za-z0-9!?]+$/.test(printed) || printed.length > 16) {
      errors.push(`That collector number is not one I can store: ${printed}.`);
      continue;
    }
    drafts.push({
      language: lang,
      setId: setRaw,
      number: printed,
      quantity: item.quantity,
      manualName,
      catalog: null,
      externalId: `${setRaw}-${printed}`,
    });
  }
  if (errors.length) return { lines: [], errors };
  if (!drafts.length) return { lines: [], errors: ["Add at least one card number."] };

  const westernKeys = new Set(
    drafts
      .filter((draft) => draft.catalog && draft.language !== "en" && !draft.manualName && draft.externalId)
      .map((draft) => `${draft.language}:${draft.externalId}`),
  );
  const asianKeys = new Set(
    drafts
      .filter((draft) => !draft.catalog && !draft.manualName && draft.externalId)
      .map((draft) => `${draft.language}:${draft.externalId}`),
  );
  if (asianKeys.size > ASIAN_LOOKUP_CAP) {
    return {
      lines: [],
      errors: ["Too many cards without a name. Add = name on each line, or log fewer at a time."],
    };
  }
  const lookupWestern = westernKeys.size > 0 && westernKeys.size <= WESTERN_LOOKUP_CAP;
  const found = new Map<string, Pick<TcgdexBrief, "name" | "image"> | null>();
  async function read(lang: PrintLanguage, id: string): Promise<Pick<TcgdexBrief, "name" | "image"> | null> {
    const key = `${lang}:${id}`;
    if (found.has(key)) return found.get(key) ?? null;
    const card = await lookup(lang, id).catch(() => null);
    found.set(key, card);
    return card;
  }

  const merged = new Map<string, ResolvedLine>();
  for (const draft of drafts) {
    let name = draft.manualName ?? "";
    let source: ResolvedLine["externalSource"] = draft.manualName ? "manual" : null;
    if (!draft.manualName && draft.externalId && (draft.catalog ? lookupWestern && draft.language !== "en" : true)) {
      const card = await read(draft.language, draft.externalId);
      if (card?.name) {
        name = clip(card.name, 120);
        source = "tcgdex";
      }
    }
    if (!name && draft.catalog) {
      name = draft.catalog.name;
      source = draft.externalId ? "tcgdex" : null;
    }
    if (!name) {
      errors.push(`No name for ${draft.language} ${draft.setId} ${draft.number}. Add one with = .`);
      continue;
    }
    if (!source && draft.externalId && !draft.manualName) source = "tcgdex";
    const key = draftKey(draft);
    const current = merged.get(key);
    if (current) {
      current.quantity += draft.quantity;
      if (current.externalSource !== "tcgdex" && source === "tcgdex") {
        current.name = name;
        current.externalSource = source;
      }
      continue;
    }
    merged.set(key, {
      language: draft.language,
      setId: draft.setId,
      number: draft.number,
      name,
      quantity: draft.quantity,
      dex: formatDexList(draft.catalog?.dex ?? []),
      externalSource: source,
      externalId: draft.externalId,
    });
  }
  if (errors.length) return { lines: [], errors };
  return { lines: [...merged.values()], errors: [] };
}
