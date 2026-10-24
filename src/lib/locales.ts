export const LOCALES = ["en", "de", "fr", "it", "es", "nl", "sv", "no", "fi", "pl"] as const;

export type Locale = (typeof LOCALES)[number];

export const PREFIX_LOCALES = ["de", "fr", "it", "es", "nl", "sv", "no", "fi", "pl"] as const;

export function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value);
}

export function isPrefixLocale(value: string): boolean {
  return (PREFIX_LOCALES as readonly string[]).includes(value);
}

export function intlLocale(locale: Locale): string {
  if (locale === "no") return "nb";
  return locale;
}

export function ogLocale(locale: Locale): string {
  const map: Record<Locale, string> = {
    en: "en_US",
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

export function htmlLang(locale: Locale): string {
  return locale === "no" ? "nb" : locale;
}
