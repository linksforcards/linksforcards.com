import { describe, expect, it } from "vitest";
import type { Graph } from "schema-dts";
import { getMessages } from "../src/lib/i18n";
import { HREFLANG_TARGETS, LOCALES } from "../src/lib/locales";
import {
  blogPostNodes,
  breadcrumbNode,
  faqNode,
  itemListNode,
  ldGraph,
  pageNode,
  type PageKind,
} from "../src/lib/jsonld";
import { hreflangMap } from "../src/lib/seo";
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
    const binders = hreflangMap("/binders");
    expect(home["x-default"]).toBe(absoluteUrl("/"));
    expect(binders["x-default"]).toBe(absoluteUrl("/uk/binders"));
    expect(home["en-US"]).toBe(absoluteUrl("/us"));
    expect(home["en-GB"]).toBe(absoluteUrl("/uk"));
    expect(home["en-IE"]).toBe(home["en-GB"]);
    expect(binders["de-AT"]).toBe(binders.de);
    expect(binders["de-CH"]).toBe(binders.de);
    expect(binders["fr-BE"]).toBe(binders.fr);
    expect(binders["nl-BE"]).toBe(binders.nl);
    expect(binders.nb).toBe(binders.no);
    for (const code of [...HREFLANG_TARGETS.map((item) => item.code), "x-default"]) {
      expect(home[code]).toMatch(/^https:\/\/linksforcards\.com\//);
      expect(binders[code]).toBe(hreflangMap("/binders")[code]);
    }
    for (const locale of LOCALES) {
      const path = hreflangMap("/partners");
      expect(Object.values(path)).toContain(absoluteUrl(`/${locale}/partners`));
    }
  });
});

describe("json-ld", () => {
  const kinds: PageKind[] = ["AboutPage", "WebPage", "CollectionPage", "ContactPage", "Blog"];

  it("parses a graph for each page type and stays free of offers and ratings", () => {
    const crumbs = [
      { name: "Home", href: "/uk" },
      { name: "Binders", href: "/uk/binders" },
    ];
    const graphs = kinds.map((kind) =>
      parse(
        ldGraph([
          pageNode({
            kind,
            locale: "uk",
            path: kind === "AboutPage" ? "/" : "/binders",
            name: "Sample",
            description: "A sample page.",
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
    expect(index).toContain(absoluteUrl("/sitemap/root.xml"));
    expect(index).toContain(absoluteUrl("/sitemap/us.xml"));
    expect(index).toContain(absoluteUrl("/sitemap/de.xml"));
    const uk = sitemapEntries("uk");
    expect(uk?.[0]?.url).toBe(absoluteUrl("/uk"));
    const xml = renderUrlset(uk ?? []);
    expect(xml).toContain('hreflang="en-GB"');
    expect(xml).toContain('hreflang="en-IE"');
    expect(xml).toContain('hreflang="x-default"');
    expect(xml).toContain(`href="${absoluteUrl("/uk")}"`);
    expect(sitemapEntries("nope")).toBeNull();
  });
});
