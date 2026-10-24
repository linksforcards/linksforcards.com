export const LOCALES = ["us", "uk", "de", "fr", "it", "es", "nl", "sv", "no", "fi", "pl"] as const;

export type Locale = (typeof LOCALES)[number];

export function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value);
}

/** Every public language lives under its own prefix, including both Englishes. */
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
