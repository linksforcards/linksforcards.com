import { describe, expect, it } from "vitest";
import type { Graph } from "schema-dts";
import { getMessages } from "../src/lib/i18n";
import { HREFLANG_TARGETS, LOCALES, SPECIES_INDEX_LOCALES } from "../src/lib/locales";
import {
  blogPostNodes,
  breadcrumbNode,
  faqNode,
  itemListNode,
  ldGraph,
  pageNode,
  type PageKind,
} from "../src/lib/jsonld";
import { localePath } from "../src/lib/routing";
import { hreflangMap, pageMetadata } from "../src/lib/seo";
import { renderSitemapIndex, renderUrlset, sitemapEntries } from "../src/lib/sitemap-data";
import { absoluteUrl } from "../src/lib/site";

function typesOf(value: unknown, found = new Set<string>()): Set<string> {
  if (Array.isArray(value)) {
    for (const item of value) typesOf(item, found);
    return found;
  }
  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    if (typeof record["@type"] === "string") found.add(record["@type"]);
    for (const child of Object.values(record)) typesOf(child, found);
  }
  return found;
}

function keysOf(value: unknown, found = new Set<string>()): Set<string> {
  if (Array.isArray(value)) {
    for (const item of value) keysOf(item, found);
    return found;
  }
  if (value && typeof value === "object") {
    for (const [key, child] of Object.entries(value)) {
      found.add(key);
      keysOf(child, found);
    }
  }
  return found;
}

function parse(graph: Graph): Graph {
  return JSON.parse(JSON.stringify(graph).replace(/</g, "\\u003c")) as Graph;
}

describe("hreflang", () => {
  it("uses absolute reciprocal alternates, including region codes that share a URL", () => {
    const home = hreflangMap("/");
    const collections = hreflangMap("/collections");
    expect(home["x-default"]).toBe(absoluteUrl("/"));
    expect(home.en).toBe(absoluteUrl("/"));
    expect(home["en-US"]).toBe(absoluteUrl("/"));
    expect(collections["x-default"]).toBe(absoluteUrl("/collections"));
    expect(collections.en).toBe(absoluteUrl("/collections"));
    expect(collections["en-US"]).toBe(absoluteUrl("/collections"));
    expect(home["en-GB"]).toBe(absoluteUrl("/uk"));
    expect(home["en-IE"]).toBe(home["en-GB"]);
    expect(collections["de-AT"]).toBe(collections.de);
    expect(collections["de-CH"]).toBe(collections.de);
    expect(collections["fr-BE"]).toBe(collections.fr);
    expect(collections["nl-BE"]).toBe(collections.nl);
    expect(collections.nb).toBe(collections.no);
    for (const code of [...HREFLANG_TARGETS.map((item) => item.code), "x-default"]) {
      expect(home[code]).toMatch(/^https:\/\/linksforcards\.com(\/|$)/);
      expect(collections[code]).toBe(hreflangMap("/collections")[code]);
    }
    const species = hreflangMap("/pokedex/25", SPECIES_INDEX_LOCALES);
    expect(species["x-default"]).toBe(absoluteUrl("/pokedex/25"));
    expect(species.en).toBe(absoluteUrl("/pokedex/25"));
    expect(species["en-US"]).toBe(absoluteUrl("/pokedex/25"));
    expect(species.de).toBe(absoluteUrl("/de/pokedex/25"));
    expect(species.nl).toBeUndefined();
    expect(species.sv).toBeUndefined();
    expect(species.no).toBeUndefined();
    expect(species.fi).toBeUndefined();
    expect(species.pl).toBeUndefined();
    const hidden = pageMetadata("nl", "/pokedex/25", "Pikachu cards list", "A list.", {
      locales: SPECIES_INDEX_LOCALES,
      index: false,
    });
    expect(hidden.robots).toEqual({ index: false, follow: true });
    expect(hidden.alternates?.canonical).toBe(absoluteUrl("/nl/pokedex/25"));
    expect(hidden.alternates?.languages).not.toHaveProperty("nl");
    const partners = pageMetadata("us", "/guides/bulk-cards", "Bulk", "What to do with bulk.");
    expect(partners.alternates?.canonical).toBe(absoluteUrl("/guides/bulk-cards"));
    expect(partners.openGraph?.url).toBe(absoluteUrl("/guides/bulk-cards"));
    expect(partners.alternates?.languages?.en).toBe(absoluteUrl("/guides/bulk-cards"));
    expect(partners.alternates?.languages?.["en-GB"]).toBe(absoluteUrl("/uk/guides/bulk-cards"));
    for (const locale of LOCALES) {
      const path = hreflangMap("/partners");
      expect(Object.values(path)).toContain(absoluteUrl(localePath(locale, "/partners")));
    }
  });
});

describe("json-ld", () => {
  const kinds: PageKind[] = ["AboutPage", "WebPage", "CollectionPage", "ContactPage", "Blog", "Article"];

  it("parses a graph for each page type and stays free of offers and ratings", () => {
    const crumbs = [
      { name: "Home", href: "/uk" },
      { name: "Collections", href: "/uk/collections" },
    ];
    const graphs = kinds.map((kind) =>
      parse(
        ldGraph([
          pageNode({
            kind,
            locale: "uk",
            path: kind === "AboutPage" ? "/" : "/collections",
            name: "Sample",
            description: "A sample page.",
            ...(kind === "Article" ? { datePublished: "2026-10-24", dateModified: "2026-10-24" } : {}),
          }),
          breadcrumbNode(crumbs),
        ]),
      ),
    );
    const m = getMessages("uk");
    graphs.push(
      parse(
        ldGraph([
          faqNode("/uk", [
            { q: m.home.faq1q, a: m.home.faq1a },
            { q: m.home.faq2q, a: m.home.faq2a },
          ]),
        ]),
      ),
    );
    graphs.push(parse(ldGraph([itemListNode("/uk/partners", "Thanks", [{ name: "Harbour" }])])));
    graphs.push(
      parse(
        ldGraph(
          blogPostNodes("/uk/updates", "uk", [
            { id: "note-1", title: "First parcel", body: "A note.", publishedAt: "2026-10-24" },
          ]),
        ),
      ),
    );

    const seen = new Set<string>();
    for (const graph of graphs) {
      expect(graph["@context"]).toBe("https://schema.org");
      expect(Array.isArray(graph["@graph"])).toBe(true);
      for (const type of typesOf(graph)) seen.add(type);
      const keys = keysOf(graph);
      expect(keys.has("offers")).toBe(false);
      expect(keys.has("aggregateRating")).toBe(false);
      expect(keys.has("review")).toBe(false);
      expect(keys.has("price")).toBe(false);
    }
    for (const type of ["Organization", "Person", "WebSite", "BreadcrumbList", "FAQPage", "ItemList", "BlogPosting", "ImageObject"]) {
      expect(seen.has(type)).toBe(true);
    }
    for (const kind of kinds) expect(seen.has(kind)).toBe(true);
    expect(seen.has("Offer")).toBe(false);
    expect(seen.has("Product")).toBe(false);
    expect(seen.has("AggregateRating")).toBe(false);
    expect(seen.has("Review")).toBe(false);
  });
});

describe("sitemap xml", () => {
  it("indexes every locale and prints absolute xhtml alternates", () => {
    const index = renderSitemapIndex();
    expect(index).toContain("<sitemapindex");
    expect(index).not.toContain("/sitemap/root.xml");
    expect(index).toContain(absoluteUrl("/sitemap/us-pages.xml"));
    expect(index).toContain(absoluteUrl("/sitemap/uk-sets.xml"));
    expect(index).toContain(absoluteUrl("/sitemap/de-guides.xml"));
    expect(index).toContain(absoluteUrl("/sitemap/uk-species.xml"));
    expect(index).not.toContain(absoluteUrl("/sitemap/nl-species.xml"));
    const us = sitemapEntries("us-pages");
    expect(us?.[0]?.url).toBe(absoluteUrl("/"));
    expect(us?.some((entry) => entry.url === absoluteUrl("/collections"))).toBe(true);
    expect(us?.some((entry) => entry.url.includes("/us/"))).toBe(false);
    expect(us?.[0]?.languages.en).toBe(absoluteUrl("/"));
    expect(us?.[0]?.languages["x-default"]).toBe(absoluteUrl("/"));
    const uk = sitemapEntries("uk-pages");
    expect(uk?.[0]?.url).toBe(absoluteUrl("/uk"));
    expect(uk?.some((entry) => entry.url === absoluteUrl("/uk/collections"))).toBe(true);
    expect(uk?.every((entry) => entry.lastModified === "2026-10-24")).toBe(true);
    const xml = renderUrlset(uk ?? []);
    expect(xml).toContain('hreflang="en"');
    expect(xml).toContain('hreflang="en-US"');
    expect(xml).toContain('hreflang="en-GB"');
    expect(xml).toContain('hreflang="en-IE"');
    expect(xml).toContain('hreflang="x-default"');
    expect(xml).toContain("<lastmod>2026-10-24</lastmod>");
    const species = sitemapEntries("de-species");
    expect(species).toHaveLength(1025);
    expect(species?.[24]?.url).toBe(absoluteUrl("/de/pokedex/25"));
    expect(species?.[24]?.languages.nl).toBeUndefined();
    expect(species?.[24]?.languages.en).toBe(absoluteUrl("/pokedex/25"));
    expect(species?.[24]?.languages["en-US"]).toBe(absoluteUrl("/pokedex/25"));
    expect(species?.[24]?.languages["x-default"]).toBe(absoluteUrl("/pokedex/25"));
    expect(sitemapEntries("nl-species")).toBeNull();
    expect(sitemapEntries("nope")).toBeNull();
  });
});
