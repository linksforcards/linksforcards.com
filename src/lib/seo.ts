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
  const fallback = !locales || locales.includes("uk") ? "uk" : locales[0];
  map["x-default"] = path === "/" ? absoluteUrl("/") : absoluteUrl(localePath(fallback, path));
  return map;
}

export function pageMetadata(
  locale: Locale,
  path: string,
  title: string,
  description: string,
  options?: { locales?: readonly Locale[]; index?: boolean; image?: string; imageAlt?: string },
): Metadata {
  const canonical = absoluteUrl(localePath(locale, path));
  const m = getMessages(locale);
  const currentOg = ogLocale(locale);
  const allowed = options?.locales ? new Set<string>(options.locales) : null;
  return {
    title,
    description,
    ...(options?.index === false ? { robots: { index: false, follow: true } } : {}),
    alternates: { canonical, languages: hreflangMap(path, options?.locales) },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: site.name,
      locale: currentOg,
      alternateLocale: OG_LOCALES.filter((item) => item !== currentOg && (!allowed || allowed.has(OG_PAGE_LOCALE[item]))),
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

export function pickerMetadata(): Metadata {
  const title = "LinksForCards";
  const description = "Choose a language. I'm Magnus Schmidt, and this is the public record of the binders I collect and give away.";
  return {
    title: { absolute: title },
    description,
    alternates: { canonical: absoluteUrl("/"), languages: hreflangMap("/") },
    openGraph: {
      title,
      description,
      url: absoluteUrl("/"),
      siteName: site.name,
      locale: "en_GB",
      alternateLocale: OG_LOCALES.filter((item) => item !== "en_GB"),
      type: "website",
      images: [{ url: "/og/uk", width: 1200, height: 630, alt: "LinksForCards, a personal project by Magnus Schmidt" }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/og/uk"],
    },
  };
}
