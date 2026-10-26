import { listCardPaths } from "./card-page";
import { getMeta, getSets, setsBySeries } from "./catalog";
import { GENERATIONS, SPECIES_TOTAL } from "./generations";
import { GUIDE_SLUGS, GUIDE_UPDATED } from "./guides";
import { isLocale, LOCALES, SPECIES_INDEX_LOCALES, speciesPageIndexed } from "./locales";
import { localePath } from "./routing";
import { hreflangMap } from "./seo";
import { seriesSlug } from "./series";
import { absoluteUrl } from "./site";
import { getThemes, themeHreflangLocales, themeIndexed } from "./themes";

const PAGE_PATHS = ["/", "/collections", "/collections/themes", "/guides", "/partners", "/updates", "/donations", "/privacy", "/imprint"];

/** Stay under the 50,000 URL sitemap limit with room for hreflang weight. */
const CARD_SITEMAP_LIMIT = 40_000;

function catalogLastMod(): string {
  return getMeta().builtAt.slice(0, 10);
}

function cardSitemapParts(): number {
  return Math.max(1, Math.ceil(listCardPaths().length / CARD_SITEMAP_LIMIT));
}

export function cardSitemapId(locale: string, part: number, parts: number): string {
  return parts === 1 ? `${locale}-cards` : `${locale}-cards-${part}`;
}

export function sitemapIds(): string[] {
  const ids: string[] = [];
  const parts = cardSitemapParts();
  for (const locale of LOCALES) {
    ids.push(`${locale}-pages`, `${locale}-sets`, `${locale}-guides`, `${locale}-themes`);
    if (speciesPageIndexed(locale)) ids.push(`${locale}-species`);
    for (let part = 1; part <= parts; part += 1) ids.push(cardSitemapId(locale, part, parts));
  }
  return ids;
}

export const SITEMAP_IDS = sitemapIds();

export type SitemapEntry = { url: string; lastModified: string; languages: Record<string, string> };

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
  if (!isLocale(locale)) return null;
  const paths = listCardPaths();
  const parts = Math.max(1, Math.ceil(paths.length / CARD_SITEMAP_LIMIT));
  const numbered = Boolean(match[2]);
  if ((parts === 1 && numbered) || (parts > 1 && !numbered)) return null;
  const part = match[2] ? Number(match[2]) : 1;
  if (!Number.isInteger(part) || part < 1 || part > parts) return null;
  const slice = paths.slice((part - 1) * CARD_SITEMAP_LIMIT, part * CARD_SITEMAP_LIMIT);
  const catalogDate = catalogLastMod();
  return slice.map((path) => ({
    url: absoluteUrl(localePath(locale, path)),
    lastModified: catalogDate,
    languages: hreflangMap(path),
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
  const catalogDate = catalogLastMod();
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
    lastModified: kind === "guides" ? GUIDE_UPDATED : catalogDate,
    languages: languagesFor(path),
  }));
}

function xml(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

export function renderUrlset(entries: SitemapEntry[]): string {
  const links = entries
    .map((entry) => {
      const alternates = Object.entries(entry.languages)
        .map(([lang, href]) => `<xhtml:link rel="alternate" hreflang="${xml(lang)}" href="${xml(href)}" />`)
        .join("\n");
      return `<url>\n<loc>${xml(entry.url)}</loc>\n${alternates}\n<lastmod>${entry.lastModified}</lastmod>\n</url>`;
    })
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${links}\n</urlset>\n`;
}

export function renderSitemapIndex(): string {
  const body = SITEMAP_IDS.map((id) => `<sitemap>\n<loc>${xml(absoluteUrl(`/sitemap/${id}.xml`))}</loc>\n</sitemap>`).join(
    "\n",
  );
  return `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</sitemapindex>\n`;
}
