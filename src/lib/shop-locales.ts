import type { Locale } from "./locales";

/**
 * Countries whose shops appear on each language.
 * Belgium has no language field, so BE is listed for both French and Dutch.
 * Codes are ISO 3166-1 alpha-2. Change this map to move a country.
 */
export const SHOP_COUNTRIES: Record<Locale, readonly string[]> = {
  us: ["US"],
  uk: ["GB", "IE"],
  de: ["DE", "AT", "CH"],
  fr: ["FR", "BE"],
  nl: ["NL", "BE"],
  sv: ["SE"],
  no: ["NO"],
  fi: ["FI"],
  pl: ["PL"],
  it: ["IT"],
  es: ["ES"],
};

const ALIASES: Record<string, string> = {
  uk: "GB",
  "united kingdom": "GB",
  "great britain": "GB",
  britain: "GB",
  ireland: "IE",
  eire: "IE",
  "united states": "US",
  "united states of america": "US",
  usa: "US",
  "u s": "US",
  "u s a": "US",
  germany: "DE",
  deutschland: "DE",
  austria: "AT",
  osterreich: "AT",
  switzerland: "CH",
  schweiz: "CH",
  suisse: "CH",
  svizzera: "CH",
  france: "FR",
  frankreich: "FR",
  belgium: "BE",
  belgie: "BE",
  belgique: "BE",
  belgien: "BE",
  netherlands: "NL",
  "the netherlands": "NL",
  nederland: "NL",
  holland: "NL",
  sweden: "SE",
  sverige: "SE",
  norway: "NO",
  norge: "NO",
  finland: "FI",
  suomi: "FI",
  poland: "PL",
  polska: "PL",
  italy: "IT",
  italia: "IT",
  spain: "ES",
  espana: "ES",
  spanien: "ES",
};

const KNOWN = new Set(Object.values(SHOP_COUNTRIES).flat());

export function normalizeCountry(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/ß/g, "ss")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export function countryCode(value: string): string | null {
  const key = normalizeCountry(value);
  if (!key) return null;
  const alias = ALIASES[key];
  if (alias) return alias;
  if (/^[a-z]{2}$/.test(key)) {
    const code = key.toUpperCase();
    if (KNOWN.has(code)) return code;
  }
  return null;
}

export function shopMatchesLocale(country: string, locale: Locale): boolean {
  const code = countryCode(country);
  return code !== null && SHOP_COUNTRIES[locale].includes(code);
}

export function shopsForLocale<T extends { country: string }>(shops: T[], locale: Locale): T[] {
  return shops.filter((shop) => shopMatchesLocale(shop.country, locale));
}
