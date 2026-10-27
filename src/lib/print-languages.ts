export const PRINT_LANGUAGES = ["en", "de", "fr", "it", "es", "pt", "ja", "zh-tw", "zh-cn", "ko", "th", "id"] as const;

export type PrintLanguage = (typeof PRINT_LANGUAGES)[number];

export const WESTERN_PRINT_LANGUAGES = ["en", "de", "fr", "it", "es", "pt"] as const;

export const ASIAN_PRINT_LANGUAGES = ["ja", "zh-tw", "zh-cn", "ko", "th", "id"] as const;

const ALL = new Set<string>(PRINT_LANGUAGES);
const WESTERN = new Set<string>(WESTERN_PRINT_LANGUAGES);

/** English labels for the admin form. Public pages use the translated message catalog. */
export const PRINT_LANGUAGE_LABELS: Record<PrintLanguage, string> = {
  en: "English",
  de: "German",
  fr: "French",
  it: "Italian",
  es: "Spanish",
  pt: "Portuguese",
  ja: "Japanese",
  "zh-tw": "Traditional Chinese",
  "zh-cn": "Simplified Chinese",
  ko: "Korean",
  th: "Thai",
  id: "Indonesian",
};

export function canonicalPrintLanguage(value: string): PrintLanguage | null {
  const key = value.trim().toLowerCase();
  return ALL.has(key) ? (key as PrintLanguage) : null;
}

export function isPrintLanguage(value: string): value is PrintLanguage {
  return ALL.has(value);
}

/** de, fr, it, es, and pt share set id and collector number with English. */
export function isWesternPrintLanguage(value: string): boolean {
  return WESTERN.has(value);
}

export function isAsianPrintLanguage(value: string): boolean {
  return isPrintLanguage(value) && !WESTERN.has(value);
}
