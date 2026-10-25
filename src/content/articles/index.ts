import type { ArticleCopy } from "@/lib/articles";
import type { Locale } from "@/lib/locales";
import { germanArticles } from "./de";
import { englishArticles } from "./en";
import { spanishArticles } from "./es";
import { finnishArticles } from "./fi";
import { frenchArticles } from "./fr";
import { italianArticles } from "./it";
import { dutchArticles } from "./nl";
import { norwegianArticles } from "./no";
import { polishArticles } from "./pl";
import { swedishArticles } from "./sv";

export function articlesFor(locale: Locale): ArticleCopy[] {
  if (locale === "us") return englishArticles("us");
  if (locale === "uk") return englishArticles("uk");
  if (locale === "de") return germanArticles();
  if (locale === "fr") return frenchArticles();
  if (locale === "es") return spanishArticles();
  if (locale === "it") return italianArticles();
  if (locale === "nl") return dutchArticles();
  if (locale === "sv") return swedishArticles();
  if (locale === "no") return norwegianArticles();
  if (locale === "fi") return finnishArticles();
  return polishArticles();
}
