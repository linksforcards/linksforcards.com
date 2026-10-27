export const LOCALES = ["us", "uk", "de", "fr", "it", "es", "nl", "sv", "no", "fi", "pl"] as const;

export type Locale = (typeof LOCALES)[number];

export function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value);
}

/**
 * True when `value` is a locale code. US English is served at the root, but
 * the `us` segment still appears on the internal route the root rewrites to.
 */
export function isPrefixLocale(value: string): boolean {
  return isLocale(value);
}

export function htmlLang(locale: Locale): string {
  if (locale === "us") return "en-US";
  if (locale === "uk") return "en-GB";
  if (locale === "no") return "nb";
  return locale;
}

export function intlLocale(locale: Locale): string {
  return htmlLang(locale);
}

export function primaryHreflang(locale: Locale): string {
  return htmlLang(locale);
}

export function ogLocale(locale: Locale): string {
  const map: Record<Locale, string> = {
    us: "en_US",
    uk: "en_GB",
    de: "de_DE",
    fr: "fr_FR",
    it: "it_IT",
    es: "es_ES",
    nl: "nl_NL",
    sv: "sv_SE",
    no: "nb_NO",
    fi: "fi_FI",
    pl: "pl_PL",
  };
  return map[locale];
}

/** hreflang codes that share one URL when the page already covers that region. */
export const HREFLANG_TARGETS: { code: string; locale: Locale }[] = [
  { code: "en-US", locale: "us" },
  { code: "en", locale: "us" },
  { code: "en-GB", locale: "uk" },
  { code: "en-IE", locale: "uk" },
  { code: "de", locale: "de" },
  { code: "de-AT", locale: "de" },
  { code: "de-CH", locale: "de" },
  { code: "fr", locale: "fr" },
  { code: "fr-BE", locale: "fr" },
  { code: "nl", locale: "nl" },
  { code: "nl-BE", locale: "nl" },
  { code: "sv", locale: "sv" },
  { code: "nb", locale: "no" },
  { code: "no", locale: "no" },
  { code: "fi", locale: "fi" },
  { code: "pl", locale: "pl" },
  { code: "it", locale: "it" },
  { code: "es", locale: "es" },
];

export const OG_LOCALES = ["en_US", "en_GB", "en_IE", "de_DE", "de_AT", "de_CH", "fr_FR", "fr_BE", "nl_NL", "nl_BE", "sv_SE", "nb_NO", "fi_FI", "pl_PL", "it_IT", "es_ES"] as const;

export const OG_PAGE_LOCALE: Record<(typeof OG_LOCALES)[number], Locale> = {
  en_US: "us",
  en_GB: "uk",
  en_IE: "uk",
  de_DE: "de",
  de_AT: "de",
  de_CH: "de",
  fr_FR: "fr",
  fr_BE: "fr",
  nl_NL: "nl",
  nl_BE: "nl",
  sv_SE: "sv",
  nb_NO: "no",
  fi_FI: "fi",
  pl_PL: "pl",
  it_IT: "it",
  es_ES: "es",
};

/**
 * Species pages are indexed where the Pokédex name is translated: English,
 * German, French, Spanish, and Italian. Dutch, Swedish, Norwegian, Finnish,
 * and Polish reuse the English name, so those URLs stay in the language menu
 * but are noindex and left out of hreflang and the sitemap.
 */
export const SPECIES_INDEX_LOCALES = ["us", "uk", "de", "fr", "es", "it"] as const satisfies readonly Locale[];

export function speciesPageIndexed(locale: string): boolean {
  return (SPECIES_INDEX_LOCALES as readonly string[]).includes(locale);
}

/**
 * Card pages are indexed for US English, German, French, Spanish, and Italian.
 * UK English, Dutch, Swedish, Norwegian, Finnish, and Polish stay reachable
 * from the language menu, with noindex and without a card hreflang entry.
 */
export const CARD_INDEX_LOCALES = ["us", "de", "fr", "es", "it"] as const satisfies readonly Locale[];

export function cardPageIndexed(locale: string): boolean {
  return (CARD_INDEX_LOCALES as readonly string[]).includes(locale);
}
