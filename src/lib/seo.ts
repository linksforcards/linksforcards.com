import type { Metadata } from "next";
import { getMessages } from "./i18n";
import { HREFLANG_TARGETS, OG_LOCALES, ogLocale, type Locale } from "./locales";
import { localePath } from "./routing";
import { absoluteUrl, site } from "./site";

export function hreflangMap(path: string): Record<string, string> {
  const map: Record<string, string> = {};
  for (const item of HREFLANG_TARGETS) map[item.code] = absoluteUrl(localePath(item.locale, path));
  map["x-default"] = path === "/" ? absoluteUrl("/") : absoluteUrl(localePath("uk", path));
  return map;
}

export function pageMetadata(locale: Locale, path: string, title: string, description: string): Metadata {
  const canonical = absoluteUrl(localePath(locale, path));
  const m = getMessages(locale);
  const currentOg = ogLocale(locale);
  return {
    title,
    description,
    alternates: { canonical, languages: hreflangMap(path) },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: site.name,
      locale: currentOg,
      alternateLocale: OG_LOCALES.filter((item) => item !== currentOg),
      type: "website",
      images: [{ url: `/og/${locale}`, width: 1200, height: 630, alt: m.meta.ogAlt }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`/og/${locale}`],
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
