import type { Locale } from "./locales";
import { articlesFor } from "@/content/articles";

export const ARTICLE_SLUGS = [
  "collecting-binders",
  "organize-binder",
  "bulk-cards",
  "pokedex-binder",
  "gen-1-checklist",
  "read-a-card",
  "protect-cards",
  "donating-cards",
  "sets-in-order",
  "collecting-with-a-child",
] as const;

export type ArticleSlug = (typeof ARTICLE_SLUGS)[number];

export const PILLAR_SLUG: ArticleSlug = "collecting-binders";

export const GUIDE_SLUGS = ARTICLE_SLUGS;
export const GUIDE_UPDATED = "2026-10-24";

export type ArticleSection = { id: string; heading: string; paragraphs: string[] };

export type ArticleCopy = {
  slug: ArticleSlug;
  title: string;
  description: string;
  h1: string;
  lede: string;
  diagram?: { kind: "binders" | "pockets" | "card"; title: string; description: string; caption: string };
  sections: ArticleSection[];
  faqs: { q: string; a: string }[];
};

/** Contextual links that every locale of an article must include in the prose. */
export const ARTICLE_LINKS: Record<ArticleSlug, readonly string[]> = {
  "collecting-binders": [
    "/guides/organize-binder",
    "/guides/bulk-cards",
    "/guides/pokedex-binder",
    "/guides/gen-1-checklist",
    "/guides/read-a-card",
    "/guides/protect-cards",
    "/guides/donating-cards",
    "/guides/sets-in-order",
    "/guides/collecting-with-a-child",
    "/",
    "/collections",
    "/collections/generation/1",
    "/collections/set/base1",
    "/pokedex/25",
    "/collections/themes",
    "/collections/themes/pikachu",
  ],
  "organize-binder": [
    "/guides/collecting-binders",
    "/guides/protect-cards",
    "/guides/pokedex-binder",
    "/guides/gen-1-checklist",
    "/guides/sets-in-order",
    "/collections",
    "/collections/set/sv4pt5",
    "/collections/generation/1",
  ],
  "bulk-cards": [
    "/guides/collecting-binders",
    "/guides/read-a-card",
    "/guides/donating-cards",
    "/guides/pokedex-binder",
    "/guides/collecting-with-a-child",
    "/collections",
    "/pokedex/129",
    "/collections/themes",
    "/collections/themes/yuka-morii",
  ],
  "pokedex-binder": [
    "/guides/collecting-binders",
    "/guides/gen-1-checklist",
    "/guides/bulk-cards",
    "/guides/organize-binder",
    "/collections",
    "/collections/generation/1",
    "/pokedex/1",
    "/collections/themes",
    "/collections/themes/pikachu",
  ],
  "gen-1-checklist": [
    "/guides/collecting-binders",
    "/guides/pokedex-binder",
    "/guides/sets-in-order",
    "/collections/generation/1",
    "/collections/set/base1",
    "/collections/series/base",
    "/pokedex/6",
    "/pokedex/25",
  ],
  "read-a-card": [
    "/guides/collecting-binders",
    "/guides/bulk-cards",
    "/guides/sets-in-order",
    "/collections/set/base1",
    "/pokedex/25",
  ],
  "protect-cards": [
    "/guides/collecting-binders",
    "/guides/organize-binder",
    "/guides/collecting-with-a-child",
    "/guides/donating-cards",
    "/collections",
  ],
  "donating-cards": [
    "/guides/collecting-binders",
    "/guides/bulk-cards",
    "/guides/collecting-with-a-child",
    "/guides/protect-cards",
    "/donations",
    "/collections",
  ],
  "sets-in-order": [
    "/guides/collecting-binders",
    "/guides/gen-1-checklist",
    "/guides/organize-binder",
    "/collections",
    "/collections/series/base",
    "/collections/set/base1",
    "/collections/set/me1",
  ],
  "collecting-with-a-child": [
    "/guides/collecting-binders",
    "/guides/protect-cards",
    "/guides/bulk-cards",
    "/guides/donating-cards",
    "/guides/gen-1-checklist",
    "/collections/generation/1",
    "/collections",
  ],
};

export function isArticleSlug(value: string): value is ArticleSlug {
  return (ARTICLE_SLUGS as readonly string[]).includes(value);
}

export function isGuideSlug(value: string): value is ArticleSlug {
  return isArticleSlug(value);
}

export function getArticle(locale: Locale, slug: string): ArticleCopy | null {
  if (!isArticleSlug(slug)) return null;
  return articlesFor(locale).find((article) => article.slug === slug) ?? null;
}

export function getArticles(locale: Locale): ArticleCopy[] {
  const bySlug = new Map(articlesFor(locale).map((article) => [article.slug, article]));
  return ARTICLE_SLUGS.map((slug) => {
    const article = bySlug.get(slug);
    if (!article) throw new Error(`Missing article ${locale}/${slug}`);
    return article;
  });
}
