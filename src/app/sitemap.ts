import type { MetadataRoute } from "next";
import { getSets } from "@/lib/catalog";
import { GENERATIONS } from "@/lib/generations";
import { LOCALES, type Locale } from "@/lib/locales";
import { localePath } from "@/lib/routing";
import { absoluteUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = [
    "/",
    "/binders",
    "/partners",
    "/updates",
    "/donations",
    "/privacy",
    "/imprint",
    ...GENERATIONS.map((generation) => `/binders/generation/${generation.id}`),
    ...getSets().map((set) => `/binders/set/${set.id}`),
  ];
  return paths.flatMap((path) =>
    LOCALES.map((locale) => ({
      url: absoluteUrl(localePath(locale, path)),
      lastModified: new Date("2026-10-24"),
      alternates: { languages: languages(path) },
    })),
  );
}

function languages(path: string): Record<string, string> {
  const map: Record<string, string> = {};
  for (const locale of LOCALES) map[locale as Locale] = absoluteUrl(localePath(locale, path));
  map["x-default"] = absoluteUrl(localePath("en", path));
  return map;
}
