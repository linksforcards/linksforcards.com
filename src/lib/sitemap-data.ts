import { listCardPaths } from "./card-page";
import { getSets, setsBySeries } from "./catalog";
import { GENERATIONS, SPECIES_TOTAL } from "./generations";
import { GUIDE_SLUGS, GUIDE_UPDATED } from "./guides";
import { listIndexedIllustratorPaths } from "./illustrators";
import { DELTA_REIGN_PATH } from "./delta-reign";
import { CARD_INDEX_LOCALES, cardPageIndexed, isLocale, LOCALES, SPECIES_INDEX_LOCALES, speciesPageIndexed } from "./locales";
import { localePath } from "./routing";
import { hreflangMap } from "./seo";
import { seriesSlug } from "./series";
import { absoluteUrl } from "./site";
import { checklistSitemapPaths } from "./checklists";
import { getThemes, themeHreflangLocales, themeIndexed } from "./themes";

const PAGE_PATHS = [
  "/",
  "/collections",
  "/collections/themes",
  "/guides",
  "/partners",
  "/updates",
  "/donations",
  "/privacy",
  "/imprint",
];

/** Editorial pages that follow the card-page index: US, German, French, Spanish, Italian. */
const LIMITED_SITEMAP_PATHS = new Set<string>([DELTA_REIGN_PATH, "/guides/spot-fakes"]);

/**
 * Split a loc-only sitemap before a file reaches 10,000 URLs or 5 MB.
 * Google allows 50,000 URLs and 50 MiB. A prerendered Vercel response fails
 * above 20 MB, so each file stays under 5 MB. Card, illustrator, and card-list
 * files list the loc only: no hreflang alternate and no lastmod.
 */
export const CARD_SITEMAP_URL_LIMIT = 10_000;
export const CARD_SITEMAP_BYTE_LIMIT = 5 * 1024 * 1024;

function cardLocBytes(locale: string, path: string): number {
  const url = absoluteUrl(localePath(locale, path));
  return url.length + 25;
}

export function cardSitemapSlices(locale: string, paths: readonly string[]): string[][] {
  const slices: string[][] = [];
  let current: string[] = [];
  let bytes = 120;
  for (const path of paths) {
    const next = cardLocBytes(locale, path);
    const full = current.length >= CARD_SITEMAP_URL_LIMIT || bytes + next > CARD_SITEMAP_BYTE_LIMIT;
    if (current.length > 0 && full) {
      slices.push(current);
      current = [];
      bytes = 120;
    }
    current.push(path);
    bytes += next;
  }
  if (current.length > 0) slices.push(current);
  return slices;
}

export function cardSitemapId(locale: string, part: number, parts: number): string {
  return parts === 1 ? `${locale}-cards` : `${locale}-cards-${part}`;
}

function illustratorSitemapPaths(): string[] {
  return ["/illustrators", ...listIndexedIllustratorPaths()];
}

export function illustratorSitemapId(locale: string, part: number, parts: number): string {
  return parts === 1 ? `${locale}-illustrators` : `${locale}-illustrators-${part}`;
}

export function sitemapIds(): string[] {
  const ids: string[] = [];
  const cardPaths = listCardPaths();
  const illustratorPaths = illustratorSitemapPaths();
  for (const locale of LOCALES) {
    ids.push(`${locale}-pages`, `${locale}-sets`, `${locale}-guides`, `${locale}-themes`);
    if (speciesPageIndexed(locale)) ids.push(`${locale}-species`);
    if (cardPageIndexed(locale)) {
      ids.push(`${locale}-checklists`);
      const cardSlices = cardSitemapSlices(locale, cardPaths);
      for (let part = 1; part <= cardSlices.length; part += 1) ids.push(cardSitemapId(locale, part, cardSlices.length));
      const artistSlices = cardSitemapSlices(locale, illustratorPaths);
      for (let part = 1; part <= artistSlices.length; part += 1) {
        ids.push(illustratorSitemapId(locale, part, artistSlices.length));
      }
      ids.push(`${locale}-database`);
    }
  }
  return ids;
}

export const SITEMAP_IDS = sitemapIds();

export type SitemapEntry = { url: string; lastModified?: string; languages?: Record<string, string> };

function pagePaths(locale: string): string[] {
  return [
    ...PAGE_PATHS,
    ...(cardPageIndexed(locale) ? [DELTA_REIGN_PATH] : []),
    ...GENERATIONS.map((generation) => `/collections/generation/${generation.id}`),
    ...setsBySeries().map((group) => `/collections/series/${seriesSlug(group.series)}`),
  ];
}

function pathsFor(kind: string, locale: string): string[] {
  if (kind === "pages") return pagePaths(locale);
  if (kind === "sets") return getSets().map((set) => `/collections/set/${set.id}`);
  if (kind === "guides") {
    return GUIDE_SLUGS.filter((slug) => slug !== "spot-fakes" || cardPageIndexed(locale)).map((slug) => `/guides/${slug}`);
  }
  if (kind === "themes") {
    return getThemes()
      .filter((theme) => themeIndexed(theme, locale))
      .map((theme) => `/collections/themes/${theme.slug}`);
  }
  if (kind === "species") {
    const paths: string[] = [];
    for (let dex = 1; dex <= SPECIES_TOTAL; dex += 1) paths.push(`/pokedex/${dex}`);
    return paths;
  }
  return [];
}

function locEntries(locale: string, paths: readonly string[]): SitemapEntry[] {
  return paths.map((path) => ({ url: absoluteUrl(localePath(locale, path)) }));
}

function slicedLocEntries(id: string, kind: "cards" | "illustrators", paths: readonly string[]): SitemapEntry[] | null {
  const match = id.match(kind === "cards" ? /^([a-z]{2})-cards(?:-(\d+))?$/ : /^([a-z]{2})-illustrators(?:-(\d+))?$/);
  if (!match) return null;
  const locale = match[1] ?? "";
  if (!isLocale(locale) || !cardPageIndexed(locale)) return null;
  const slices = cardSitemapSlices(locale, paths);
  const parts = slices.length;
  const numbered = Boolean(match[2]);
  if ((parts === 1 && numbered) || (parts > 1 && !numbered)) return null;
  const part = match[2] ? Number(match[2]) : 1;
  if (!Number.isInteger(part) || part < 1 || part > parts) return null;
  return locEntries(locale, slices[part - 1] ?? []);
}

function databaseSitemapEntries(id: string): SitemapEntry[] | null {
  const match = id.match(/^([a-z]{2})-database$/);
  if (!match) return null;
  const locale = match[1] ?? "";
  if (!isLocale(locale) || !cardPageIndexed(locale)) return null;
  return locEntries(locale, ["/cards"]);
}

function checklistSitemapEntries(id: string): SitemapEntry[] | null {
  const match = id.match(/^([a-z]{2})-checklists$/);
  if (!match) return null;
  const locale = match[1] ?? "";
  if (!isLocale(locale) || !cardPageIndexed(locale)) return null;
  return locEntries(locale, checklistSitemapPaths(locale));
}

export function sitemapEntries(id: string): SitemapEntry[] | null {
  if (id.endsWith("-checklists")) return checklistSitemapEntries(id);
  if (id.includes("-cards")) return slicedLocEntries(id, "cards", listCardPaths());
  if (id.includes("-illustrators")) return slicedLocEntries(id, "illustrators", illustratorSitemapPaths());
  if (id.endsWith("-database")) return databaseSitemapEntries(id);
  const split = id.match(/^([a-z]{2})-(pages|sets|guides|species|themes)$/);
  if (!split) return null;
  const locale = split[1] ?? "";
  const kind = split[2] ?? "";
  if (!isLocale(locale)) return null;
  if (kind === "species" && !speciesPageIndexed(locale)) return null;
  const languagesFor = (path: string) => {
    if (LIMITED_SITEMAP_PATHS.has(path)) return hreflangMap(path, CARD_INDEX_LOCALES);
    if (kind === "species") return hreflangMap(path, SPECIES_INDEX_LOCALES);
    if (kind === "themes") {
      const slug = path.split("/").at(-1) ?? "";
      const theme = getThemes().find((item) => item.slug === slug);
      return hreflangMap(path, theme ? themeHreflangLocales(theme) : undefined);
    }
    return hreflangMap(path);
  };
  return pathsFor(kind, locale).map((path) => ({
    url: absoluteUrl(localePath(locale, path)),
    languages: languagesFor(path),
    ...(kind === "guides" ? { lastModified: GUIDE_UPDATED } : {}),
  }));
}

function xml(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

export function renderUrlset(entries: SitemapEntry[]): string {
  const anyLang = entries.some((entry) => entry.languages && Object.keys(entry.languages).length > 0);
  const xmlns = anyLang ? ` xmlns:xhtml="http://www.w3.org/1999/xhtml"` : "";
  const links = entries
    .map((entry) => {
      const alternates = entry.languages
        ? Object.entries(entry.languages)
            .map(([lang, href]) => `<xhtml:link rel="alternate" hreflang="${xml(lang)}" href="${xml(href)}" />`)
            .join("\n")
        : "";
      const lastmod = entry.lastModified ? `\n<lastmod>${xml(entry.lastModified)}</lastmod>` : "";
      const alternateBlock = alternates ? `\n${alternates}` : "";
      return `<url>\n<loc>${xml(entry.url)}</loc>${alternateBlock}${lastmod}\n</url>`;
    })
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"${xmlns}>\n${links}\n</urlset>\n`;
}

export function renderSitemapIndex(): string {
  const body = SITEMAP_IDS.map((id) => `<sitemap>\n<loc>${xml(absoluteUrl(`/sitemap/${id}.xml`))}</loc>\n</sitemap>`).join(
    "\n",
  );
  return `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</sitemapindex>\n`;
}
