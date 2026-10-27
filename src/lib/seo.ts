import type { Metadata } from "next";
import { getMessages } from "./i18n";
import { HREFLANG_TARGETS, OG_LOCALES, OG_PAGE_LOCALE, ogLocale, type Locale } from "./locales";
import { localePath } from "./routing";
import { absoluteUrl, site } from "./site";

export function hreflangMap(path: string, locales?: readonly Locale[]): Record<string, string> {
  const allowed = locales ? new Set<string>(locales) : null;
  const map: Record<string, string> = {};
  for (const item of HREFLANG_TARGETS) {
    if (allowed && !allowed.has(item.locale)) continue;
    map[item.code] = absoluteUrl(localePath(item.locale, path));
  }
  map["x-default"] = absoluteUrl(localePath("us", path));
  return map;
}

const BRAND_SUFFIX = ` · ${site.name}`;

export function pageMetadata(
  locale: Locale,
  path: string,
  title: string,
  description: string,
  options?: {
    locales?: readonly Locale[];
    index?: boolean;
    /** When false, the page keeps its canonical and emits no hreflang. */
    hreflang?: boolean;
    /** Drop the brand suffix when the templated title would pass 60 characters. */
    fitTitle?: boolean;
    image?: string;
    imageAlt?: string;
  },
): Metadata {
  const canonical = absoluteUrl(localePath(locale, path));
  const m = getMessages(locale);
  const currentOg = ogLocale(locale);
  const allowed = options?.locales ? new Set<string>(options.locales) : null;
  const emitHreflang = options?.hreflang !== false;
  const documentTitle =
    options?.fitTitle && title.length + BRAND_SUFFIX.length > 60 ? { absolute: title } : title;
  return {
    title: documentTitle,
    description,
    ...(options?.index === false ? { robots: { index: false, follow: true } } : {}),
    alternates: {
      canonical,
      ...(emitHreflang ? { languages: hreflangMap(path, options?.locales) } : {}),
    },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: site.name,
      locale: currentOg,
      alternateLocale: emitHreflang
        ? OG_LOCALES.filter((item) => item !== currentOg && (!allowed || allowed.has(OG_PAGE_LOCALE[item])))
        : [],
      type: "website",
      images: [{ url: options?.image ?? `/og/${locale}`, width: 1200, height: 630, alt: options?.imageAlt ?? m.meta.ogAlt }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [options?.image ?? `/og/${locale}`],
    },
  };
}
