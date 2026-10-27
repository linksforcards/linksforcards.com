import { listCardPaths } from "./card-page";
import { getSets, setsBySeries } from "./catalog";
import { GENERATIONS, SPECIES_TOTAL } from "./generations";
import { GUIDE_SLUGS, GUIDE_UPDATED } from "./guides";
import { cardPageIndexed, isLocale, LOCALES, SPECIES_INDEX_LOCALES, speciesPageIndexed } from "./locales";
import { localePath } from "./routing";
import { hreflangMap } from "./seo";
import { seriesSlug } from "./series";
import { absoluteUrl } from "./site";
import { getThemes, themeHreflangLocales, themeIndexed } from "./themes";

const PAGE_PATHS = ["/", "/collections", "/collections/themes", "/guides", "/partners", "/updates", "/donations", "/privacy", "/imprint"];

/**
 * Split a card sitemap before a file reaches 10,000 URLs or 5 MB.
 * Google allows 50,000 URLs and 50 MiB. A prerendered Vercel response fails
 * above 20 MB, so each file stays under 5 MB. These files list the loc only.
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

export function sitemapIds(): string[] {
  const ids: string[] = [];
  const paths = listCardPaths();
  for (const locale of LOCALES) {
    ids.push(`${locale}-pages`, `${locale}-sets`, `${locale}-guides`, `${locale}-themes`);
    if (speciesPageIndexed(locale)) ids.push(`${locale}-species`);
    if (cardPageIndexed(locale)) {
      const slices = cardSitemapSlices(locale, paths);
      for (let part = 1; part <= slices.length; part += 1) ids.push(cardSitemapId(locale, part, slices.length));
    }
  }
  return ids;
}

export const SITEMAP_IDS = sitemapIds();

export type SitemapEntry = { url: string; lastModified?: string; languages?: Record<string, string> };

function pagePaths(): string[] {
  return [
    ...PAGE_PATHS,
    ...GENERATIONS.map((generation) => `/collections/generation/${generation.id}`),
    ...setsBySeries().map((group) => `/collections/series/${seriesSlug(group.series)}`),
  ];
}

function pathsFor(kind: string, locale: string): string[] {
  if (kind === "pages") return pagePaths();
  if (kind === "sets") return getSets().map((set) => `/collections/set/${set.id}`);
  if (kind === "guides") return GUIDE_SLUGS.map((slug) => `/guides/${slug}`);
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

function cardSitemapEntries(id: string): SitemapEntry[] | null {
  const match = id.match(/^([a-z]{2})-cards(?:-(\d+))?$/);
  if (!match) return null;
  const locale = match[1] ?? "";
  if (!isLocale(locale) || !cardPageIndexed(locale)) return null;
  const slices = cardSitemapSlices(locale, listCardPaths());
  const parts = slices.length;
  const numbered = Boolean(match[2]);
  if ((parts === 1 && numbered) || (parts > 1 && !numbered)) return null;
  const part = match[2] ? Number(match[2]) : 1;
  if (!Number.isInteger(part) || part < 1 || part > parts) return null;
  const slice = slices[part - 1] ?? [];
  return slice.map((path) => ({
    url: absoluteUrl(localePath(locale, path)),
  }));
}

export function sitemapEntries(id: string): SitemapEntry[] | null {
  if (id.includes("-cards")) return cardSitemapEntries(id);
  const split = id.match(/^([a-z]{2})-(pages|sets|guides|species|themes)$/);
  if (!split) return null;
  const locale = split[1] ?? "";
  const kind = split[2] ?? "";
  if (!isLocale(locale)) return null;
  if (kind === "species" && !speciesPageIndexed(locale)) return null;
  const languagesFor = (path: string) => {
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
