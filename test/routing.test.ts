import { describe, expect, it } from "vitest";
import { localePath, resolveLocaleRequest, stripLocale } from "../src/lib/routing";

describe("locale routing", () => {
  it("keeps English unprefixed and prefixes the other languages", () => {
    expect(localePath("en", "/binders")).toBe("/binders");
    expect(localePath("de", "/")).toBe("/de");
    expect(localePath("de", "/binders/set/sv4pt5")).toBe("/de/binders/set/sv4pt5");
    expect(stripLocale("/en/binders")).toBe("/binders");
    expect(stripLocale("/pl/privacy")).toBe("/privacy");
  });

  it("rewrites the public root, redirects /en, and leaves admin and files alone", () => {
    expect(resolveLocaleRequest("/")).toEqual({ action: "rewrite", pathname: "/en" });
    expect(resolveLocaleRequest("/binders")).toEqual({ action: "rewrite", pathname: "/en/binders" });
    expect(resolveLocaleRequest("/en")).toEqual({ action: "redirect", pathname: "/" });
    expect(resolveLocaleRequest("/en/updates")).toEqual({ action: "redirect", pathname: "/updates" });
    expect(resolveLocaleRequest("/fr/binders")).toEqual({ action: "next", noindex: false });
    expect(resolveLocaleRequest("/admin")).toEqual({ action: "next", noindex: true });
    expect(resolveLocaleRequest("/admin/login")).toEqual({ action: "next", noindex: true });
    expect(resolveLocaleRequest("/og/de")).toEqual({ action: "next", noindex: false });
    expect(resolveLocaleRequest("/robots.txt")).toEqual({ action: "next", noindex: false });
    expect(resolveLocaleRequest("/sitemap.xml")).toEqual({ action: "next", noindex: false });
  });
});
