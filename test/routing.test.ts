import { describe, expect, it } from "vitest";
import { localePath, resolveLocaleRequest, stripLocale } from "../src/lib/routing";

function follow(pathname: string) {
  const first = resolveLocaleRequest(pathname);
  if (first.action !== "redirect") return first;
  return resolveLocaleRequest(first.pathname);
}

describe("locale routing", () => {
  it("keeps US English at the root and prefixes every other language", () => {
    expect(localePath("us", "/")).toBe("/");
    expect(localePath("us", "/collections")).toBe("/collections");
    expect(localePath("us", "/us/guides/bulk-cards")).toBe("/guides/bulk-cards");
    expect(localePath("uk", "/")).toBe("/uk");
    expect(localePath("de", "/")).toBe("/de");
    expect(localePath("de", "/collections/set/sv4pt5")).toBe("/de/collections/set/sv4pt5");
    expect(stripLocale("/uk/collections")).toBe("/collections");
    expect(stripLocale("/us/pokedex/25")).toBe("/pokedex/25");
    expect(stripLocale("/pl/privacy")).toBe("/privacy");
  });

  it("serves US pages at the root and redirects /us in one hop", () => {
    expect(resolveLocaleRequest("/")).toEqual({ action: "rewrite", pathname: "/us" });
    expect(resolveLocaleRequest("/collections")).toEqual({ action: "rewrite", pathname: "/us/collections" });
    expect(resolveLocaleRequest("/collections/themes")).toEqual({ action: "rewrite", pathname: "/us/collections/themes" });
    expect(resolveLocaleRequest("/collections/themes/pikachu")).toEqual({
      action: "rewrite",
      pathname: "/us/collections/themes/pikachu",
    });
    expect(resolveLocaleRequest("/us/collections/themes/pikachu")).toEqual({
      action: "redirect",
      pathname: "/collections/themes/pikachu",
    });
    expect(resolveLocaleRequest("/de/collections/themes")).toEqual({ action: "next", noindex: false });
    expect(resolveLocaleRequest("/guides/bulk-cards")).toEqual({ action: "rewrite", pathname: "/us/guides/bulk-cards" });
    expect(resolveLocaleRequest("/pokedex/25")).toEqual({ action: "rewrite", pathname: "/us/pokedex/25" });
    expect(resolveLocaleRequest("/cards/base1-4-charizard")).toEqual({
      action: "rewrite",
      pathname: "/us/cards/base1-4-charizard",
    });
    expect(resolveLocaleRequest("/us/cards/base1-4-charizard")).toEqual({
      action: "redirect",
      pathname: "/cards/base1-4-charizard",
    });
    expect(resolveLocaleRequest("/uk/cards/base1-4-charizard")).toEqual({ action: "next", noindex: false });
    expect(resolveLocaleRequest("/de/cards/base1-4-charizard")).toEqual({ action: "next", noindex: false });
    expect(resolveLocaleRequest("/cards")).toEqual({ action: "next", noindex: false });
    expect(resolveLocaleRequest("/partners")).toEqual({ action: "rewrite", pathname: "/us/partners" });
    expect(resolveLocaleRequest("/us")).toEqual({ action: "redirect", pathname: "/" });
    expect(resolveLocaleRequest("/us/")).toEqual({ action: "redirect", pathname: "/" });
    expect(resolveLocaleRequest("/us/collections")).toEqual({ action: "redirect", pathname: "/collections" });
    expect(resolveLocaleRequest("/us/collections/")).toEqual({ action: "redirect", pathname: "/collections" });
    expect(resolveLocaleRequest("/us/guides/bulk-cards")).toEqual({ action: "redirect", pathname: "/guides/bulk-cards" });
    expect(resolveLocaleRequest("/us/binders/")).toEqual({ action: "redirect", pathname: "/collections" });
    expect(resolveLocaleRequest("/us/binders/set/base1")).toEqual({ action: "redirect", pathname: "/collections/set/base1" });
    expect(resolveLocaleRequest("/uk/collections")).toEqual({ action: "next", noindex: false });
    expect(resolveLocaleRequest("/binders")).toEqual({ action: "redirect", pathname: "/collections" });
    expect(resolveLocaleRequest("/binders/")).toEqual({ action: "redirect", pathname: "/collections" });
    expect(resolveLocaleRequest("/binders/generation/1")).toEqual({
      action: "redirect",
      pathname: "/collections/generation/1",
    });
    expect(resolveLocaleRequest("/binders/set/sv4pt5")).toEqual({
      action: "redirect",
      pathname: "/collections/set/sv4pt5",
    });
    expect(resolveLocaleRequest("/fr/binders/set/base1")).toEqual({
      action: "redirect",
      pathname: "/fr/collections/set/base1",
    });
    expect(resolveLocaleRequest("/en")).toEqual({ action: "redirect", pathname: "/" });
    expect(resolveLocaleRequest("/en/")).toEqual({ action: "redirect", pathname: "/" });
    expect(resolveLocaleRequest("/en/updates")).toEqual({ action: "redirect", pathname: "/updates" });
    expect(resolveLocaleRequest("/en/binders/")).toEqual({ action: "redirect", pathname: "/collections" });
    expect(resolveLocaleRequest("/en/us/collections")).toEqual({ action: "redirect", pathname: "/collections" });
    expect(resolveLocaleRequest("/us/en/partners")).toEqual({ action: "redirect", pathname: "/partners" });
    expect(resolveLocaleRequest("/partners/")).toEqual({ action: "redirect", pathname: "/partners" });
    expect(resolveLocaleRequest("/sitemap/root.xml")).toEqual({ action: "redirect", pathname: "/sitemap/us-pages.xml" });
    expect(resolveLocaleRequest("/missing")).toEqual({ action: "next", noindex: false });
    expect(resolveLocaleRequest("/fr/collections")).toEqual({ action: "next", noindex: false });
    expect(resolveLocaleRequest("/admin")).toEqual({ action: "next", noindex: true });
    expect(resolveLocaleRequest("/admin/login")).toEqual({ action: "next", noindex: true });
    expect(resolveLocaleRequest("/og/de")).toEqual({ action: "next", noindex: false });
    expect(resolveLocaleRequest("/og/us/guides/bulk-cards")).toEqual({ action: "next", noindex: false });
    expect(resolveLocaleRequest("/robots.txt")).toEqual({ action: "next", noindex: false });
    expect(resolveLocaleRequest("/sitemap.xml")).toEqual({ action: "next", noindex: false });
    expect(resolveLocaleRequest("/sitemap/uk.xml")).toEqual({ action: "next", noindex: false });
  });

  it("does not chain a redirect into a second hop", () => {
    const samples = [
      "/",
      "/us",
      "/us/",
      "/us/collections",
      "/us/collections/",
      "/us/binders",
      "/us/binders/",
      "/us/binders/generation/1",
      "/us/guides/bulk-cards",
      "/binders",
      "/binders/",
      "/collections",
      "/collections/",
      "/pokedex/25",
      "/cards/base1-4-charizard",
      "/cards/base1-4-charizard/",
      "/us/cards/base1-4-charizard",
      "/en/cards/base1-4-charizard",
      "/guides/organize-binder",
      "/partners",
      "/partners/",
      "/en",
      "/en/",
      "/en/updates",
      "/en/binders/",
      "/en/collections",
      "/en/us",
      "/en/us/pokedex/25",
      "/uk/binders/",
      "/fr/binders/set/base1",
      "/sitemap/root.xml",
    ];
    for (const sample of samples) {
      const first = resolveLocaleRequest(sample);
      if (first.action !== "redirect") continue;
      expect(follow(sample).action).not.toBe("redirect");
    }
  });
});
