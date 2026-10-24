import { getSets } from "./catalog";
import { GENERATIONS } from "./generations";
import { isLocale, LOCALES } from "./locales";
import { localePath } from "./routing";
import { hreflangMap } from "./seo";
import { absoluteUrl } from "./site";

export const SITEMAP_IDS = ["root", ...LOCALES] as const;

const LAST_MODIFIED = "2026-10-24";

export function publicPaths(): string[] {
  return [
    "/",
    "/binders",
    "/partners",
    "/updates",
    "/donations",
    "/privacy",
    "/imprint",
    ...GENERATIONS.map((generation) => `/binders/generation/${generation.id}`),
    ...getSets().map((set) => `/binders/set/${set.id}`),
  ];
}

export type SitemapEntry = { url: string; lastModified: string; languages: Record<string, string> };

export function sitemapEntries(id: string): SitemapEntry[] | null {
  if (id === "root") {
    return [{ url: absoluteUrl("/"), lastModified: LAST_MODIFIED, languages: hreflangMap("/") }];
  }
  if (!isLocale(id)) return null;
  return publicPaths().map((path) => ({
    url: absoluteUrl(localePath(id, path)),
    lastModified: LAST_MODIFIED,
    languages: hreflangMap(path),
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
  const body = SITEMAP_IDS.map(
    (id) => `<sitemap>\n<loc>${xml(absoluteUrl(`/sitemap/${id}.xml`))}</loc>\n</sitemap>`,
  ).join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</sitemapindex>\n`;
}
