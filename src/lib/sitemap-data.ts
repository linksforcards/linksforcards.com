import { getMeta, getSets, setsBySeries } from "./catalog";
import { GENERATIONS, SPECIES_TOTAL } from "./generations";
import { GUIDE_SLUGS, GUIDE_UPDATED } from "./guides";
import { isLocale, LOCALES, SPECIES_INDEX_LOCALES, speciesPageIndexed } from "./locales";
import { localePath } from "./routing";
import { hreflangMap } from "./seo";
import { seriesSlug } from "./series";
import { absoluteUrl } from "./site";

const PAGE_PATHS = ["/", "/collections", "/guides", "/partners", "/updates", "/donations", "/privacy", "/imprint"];

function catalogLastMod(): string {
  return getMeta().builtAt.slice(0, 10);
}

export function sitemapIds(): string[] {
  const ids: string[] = [];
  for (const locale of LOCALES) {
    ids.push(`${locale}-pages`, `${locale}-sets`, `${locale}-guides`);
    if (speciesPageIndexed(locale)) ids.push(`${locale}-species`);
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

function pathsFor(kind: string): string[] {
  if (kind === "pages") return pagePaths();
  if (kind === "sets") return getSets().map((set) => `/collections/set/${set.id}`);
  if (kind === "guides") return GUIDE_SLUGS.map((slug) => `/guides/${slug}`);
  if (kind === "species") {
    const paths: string[] = [];
    for (let dex = 1; dex <= SPECIES_TOTAL; dex += 1) paths.push(`/pokedex/${dex}`);
    return paths;
  }
  return [];
}

export function sitemapEntries(id: string): SitemapEntry[] | null {
  const split = id.match(/^([a-z]{2})-(pages|sets|guides|species)$/);
  if (!split) return null;
  const locale = split[1] ?? "";
  const kind = split[2] ?? "";
  if (!isLocale(locale)) return null;
  if (kind === "species" && !speciesPageIndexed(locale)) return null;
  const catalogDate = catalogLastMod();
  const languagesFor = (path: string) =>
    kind === "species" ? hreflangMap(path, SPECIES_INDEX_LOCALES) : hreflangMap(path);
  return pathsFor(kind).map((path) => ({
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
