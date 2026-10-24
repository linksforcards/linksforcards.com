import { describe, expect, it } from "vitest";
import { countryCode, SHOP_COUNTRIES, shopMatchesLocale, shopsForLocale } from "../src/lib/shop-locales";

describe("shop locales", () => {
  it("keeps the country map in one place", () => {
    expect(SHOP_COUNTRIES.en).toEqual(["GB", "IE", "US"]);
    expect(SHOP_COUNTRIES.de).toEqual(["DE", "AT", "CH"]);
    expect(SHOP_COUNTRIES.fr).toEqual(["FR", "BE"]);
    expect(SHOP_COUNTRIES.nl).toEqual(["NL", "BE"]);
    expect(SHOP_COUNTRIES.sv).toEqual(["SE"]);
    expect(SHOP_COUNTRIES.no).toEqual(["NO"]);
    expect(SHOP_COUNTRIES.fi).toEqual(["FI"]);
    expect(SHOP_COUNTRIES.pl).toEqual(["PL"]);
    expect(SHOP_COUNTRIES.it).toEqual(["IT"]);
    expect(SHOP_COUNTRIES.es).toEqual(["ES"]);
  });

  it("reads codes and common country names", () => {
    expect(countryCode(" de ")).toBe("DE");
    expect(countryCode("Germany")).toBe("DE");
    expect(countryCode("Deutschland")).toBe("DE");
    expect(countryCode("Österreich")).toBe("AT");
    expect(countryCode("UK")).toBe("GB");
    expect(countryCode("United States")).toBe("US");
    expect(countryCode("The Netherlands")).toBe("NL");
    expect(countryCode("België")).toBe("BE");
    expect(countryCode("España")).toBe("ES");
    expect(countryCode("Suomi")).toBe("FI");
    expect(countryCode("")).toBeNull();
    expect(countryCode("Somewhere")).toBeNull();
  });

  it("lists a shop only on the languages for its country", () => {
    const shops = [
      { name: "Harbour", country: "GB" },
      { name: "Lake", country: "United States" },
      { name: "Bahnhof", country: "Germany" },
      { name: "Alpine", country: "AT" },
      { name: "Quai", country: "FR" },
      { name: "Canal", country: "Belgium" },
      { name: "River", country: "Netherlands" },
      { name: "Mystery", country: "Elsewhere" },
    ];
    expect(shopsForLocale(shops, "en").map((shop) => shop.name)).toEqual(["Harbour", "Lake"]);
    expect(shopsForLocale(shops, "de").map((shop) => shop.name)).toEqual(["Bahnhof", "Alpine"]);
    expect(shopsForLocale(shops, "fr").map((shop) => shop.name)).toEqual(["Quai", "Canal"]);
    expect(shopsForLocale(shops, "nl").map((shop) => shop.name)).toEqual(["Canal", "River"]);
    expect(shopsForLocale(shops, "sv")).toEqual([]);
    expect(shopMatchesLocale("CH", "de")).toBe(true);
    expect(shopMatchesLocale("CH", "fr")).toBe(false);
    expect(shopMatchesLocale("BE", "fr")).toBe(true);
    expect(shopMatchesLocale("BE", "nl")).toBe(true);
    expect(shopMatchesLocale("BE", "en")).toBe(false);
  });
});
