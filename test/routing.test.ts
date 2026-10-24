import { describe, expect, it } from "vitest";
import { localePath, resolveLocaleRequest, stripLocale } from "../src/lib/routing";

describe("locale routing", () => {
  it("prefixes every language, including both Englishes", () => {
    expect(localePath("us", "/binders")).toBe("/us/binders");
    expect(localePath("uk", "/")).toBe("/uk");
    expect(localePath("de", "/")).toBe("/de");
    expect(localePath("de", "/binders/set/sv4pt5")).toBe("/de/binders/set/sv4pt5");
    expect(stripLocale("/uk/binders")).toBe("/binders");
    expect(stripLocale("/pl/privacy")).toBe("/privacy");
  });

  it("sends the picker and legacy English through one redirect, and leaves admin and files alone", () => {
    expect(resolveLocaleRequest("/")).toEqual({ action: "next", noindex: false });
    expect(resolveLocaleRequest("/us")).toEqual({ action: "next", noindex: false });
    expect(resolveLocaleRequest("/uk/binders")).toEqual({ action: "next", noindex: false });
    expect(resolveLocaleRequest("/binders")).toEqual({ action: "redirect", pathname: "/uk/binders" });
    expect(resolveLocaleRequest("/binders/")).toEqual({ action: "redirect", pathname: "/uk/binders" });
    expect(resolveLocaleRequest("/binders/generation/1")).toEqual({
      action: "redirect",
      pathname: "/uk/binders/generation/1",
    });
    expect(resolveLocaleRequest("/binders/set/sv4pt5")).toEqual({
      action: "redirect",
      pathname: "/uk/binders/set/sv4pt5",
    });
    expect(resolveLocaleRequest("/us/")).toEqual({ action: "redirect", pathname: "/us" });
    expect(resolveLocaleRequest("/en")).toEqual({ action: "redirect", pathname: "/" });
    expect(resolveLocaleRequest("/en/updates")).toEqual({ action: "redirect", pathname: "/uk/updates" });
    expect(resolveLocaleRequest("/en/binders/")).toEqual({ action: "redirect", pathname: "/uk/binders" });
    expect(resolveLocaleRequest("/missing")).toEqual({ action: "next", noindex: false });
    expect(resolveLocaleRequest("/fr/binders")).toEqual({ action: "next", noindex: false });
    expect(resolveLocaleRequest("/admin")).toEqual({ action: "next", noindex: true });
    expect(resolveLocaleRequest("/admin/login")).toEqual({ action: "next", noindex: true });
    expect(resolveLocaleRequest("/og/de")).toEqual({ action: "next", noindex: false });
    expect(resolveLocaleRequest("/robots.txt")).toEqual({ action: "next", noindex: false });
    expect(resolveLocaleRequest("/sitemap.xml")).toEqual({ action: "next", noindex: false });
    expect(resolveLocaleRequest("/sitemap/uk.xml")).toEqual({ action: "next", noindex: false });
  });

  it("does not chain a legacy redirect into a second hop", () => {
    const first = resolveLocaleRequest("/partners/");
    expect(first).toEqual({ action: "redirect", pathname: "/uk/partners" });
    if (first.action === "redirect") {
      expect(resolveLocaleRequest(first.pathname).action).toBe("next");
    }
  });
});
