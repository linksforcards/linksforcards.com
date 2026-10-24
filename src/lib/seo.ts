import type { Metadata } from "next";
import { absoluteUrl, site } from "./site";
import { getMessages } from "./i18n";
import { LOCALES, ogLocale, type Locale } from "./locales";
import { localePath } from "./routing";

export function pageMetadata(locale: Locale, path: string, title: string, description: string): Metadata {
  const canonical = absoluteUrl(localePath(locale, path));
  const languages: Record<string, string> = {};
  for (const item of LOCALES) languages[item] = absoluteUrl(localePath(item, path));
  languages["x-default"] = absoluteUrl(localePath("en", path));
  const m = getMessages(locale);
  return {
    title,
    description,
    alternates: { canonical, languages },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: site.name,
      locale: ogLocale(locale),
      type: "website",
      images: [{ url: `/og/${locale}`, width: 1200, height: 630, alt: m.meta.ogAlt }],
    },
    twitter: { card: "summary_large_image", title, description },
  };
}
