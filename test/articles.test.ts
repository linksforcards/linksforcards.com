import { describe, expect, it } from "vitest";
import { englishArticles } from "@/content/articles/en";
import { dutchArticles } from "@/content/articles/nl";
import { finnishArticles } from "@/content/articles/fi";
import { frenchArticles } from "@/content/articles/fr";
import { germanArticles } from "@/content/articles/de";
import { italianArticles } from "@/content/articles/it";
import { norwegianArticles } from "@/content/articles/no";
import { polishArticles } from "@/content/articles/pl";
import { spanishArticles } from "@/content/articles/es";
import { swedishArticles } from "@/content/articles/sv";
import { ARTICLE_LINKS, ARTICLE_SLUGS, PILLAR_SLUG, type ArticleCopy } from "@/lib/articles";

const packs: { name: string; articles: ArticleCopy[]; banned: RegExp[] }[] = [
  { name: "en-US", articles: englishArticles("us"), banned: [/\bwe\b/i, /\bour\b/i, /\bours\b/i] },
  { name: "en-GB", articles: englishArticles("uk"), banned: [/\bwe\b/i, /\bour\b/i, /\bours\b/i] },
  { name: "de", articles: germanArticles(), banned: [/\bwir\b/i, /\bunser\w*/i, /\buns\b/i] },
  { name: "fr", articles: frenchArticles(), banned: [/\bnous\b/i, /\bnotre\b/i, /\bnos\b/i] },
  { name: "es", articles: spanishArticles(), banned: [/\bnosotros\b/i, /\bnuestro\w*/i] },
  { name: "it", articles: italianArticles(), banned: [/\bnoi\b/i, /\bnostro\b/i, /\bnostra\b/i, /\bnostri\b/i, /\bnostre\b/i] },
  { name: "nl", articles: dutchArticles(), banned: [/\bwij\b/i, /\bons\b/i, /\bonze\b/i] },
  { name: "sv", articles: swedishArticles(), banned: [/\bvi\b/i, /\bvår\b/i, /\bvåra\b/i, /\bvårt\b/i] },
  { name: "no", articles: norwegianArticles(), banned: [/\bvi\b/i, /\bvår\b/i, /\bvåre\b/i, /\bvårt\b/i] },
  { name: "fi", articles: finnishArticles(), banned: [/\bme\b/i, /\bmeidän\b/i] },
  { name: "pl", articles: polishArticles(), banned: [/\bmy\b/i, /\bnasz\w*/i] },
];

const marketing = [/\bbacklinks?\b/i, /link building/i, /\bcampaigns?\b/i, /\bcustomers?\b/i, /\bpremium\b/i];

function prose(article: ArticleCopy): string {
  return [article.lede, ...article.sections.flatMap((section) => section.paragraphs), ...article.faqs.flatMap((faq) => [faq.q, faq.a])].join(
    "\n",
  );
}

function words(article: ArticleCopy): number {
  const visible = prose(article)
    .replace(/\[\[([^\]|]+)\|[^\]]+\]\]/g, "$1")
    .replace(/\{[A-Za-z0-9]+\}/g, "0");
  return visible.split(/\s+/).filter(Boolean).length;
}

describe("article cluster", () => {
  it("keeps eleven articles, the required links, and the word counts in every locale", () => {
    for (const pack of packs) {
      expect(pack.articles.map((article) => article.slug), pack.name).toEqual([...ARTICLE_SLUGS]);
      for (const article of pack.articles) {
        const body = prose(article);
        const count = words(article);
        const range = article.slug === PILLAR_SLUG ? [1000, 2000] : [700, 1400];
        expect(count, `${pack.name}/${article.slug}`).toBeGreaterThanOrEqual(range[0]);
        expect(count, `${pack.name}/${article.slug}`).toBeLessThanOrEqual(range[1]);
        for (const href of ARTICLE_LINKS[article.slug]) expect(body, `${pack.name}/${article.slug} ${href}`).toContain(`|${href}]]`);
        for (const pattern of pack.banned) expect(body, `${pack.name}/${article.slug}`).not.toMatch(pattern);
        for (const pattern of marketing) expect(body, `${pack.name}/${article.slug}`).not.toMatch(pattern);
        expect(body, pack.name).not.toMatch(/[$€£]/);
        expect(article.faqs).toHaveLength(2);
        expect(article.sections.length).toBeGreaterThanOrEqual(4);
        if (article.slug === "spot-fakes") expect(article.faqSchema, pack.name).toBe(false);
      }
      expect(pack.articles.find((article) => article.slug === "organize-binder")?.sections.some((section) => section.id === "by-type")).toBe(true);
      expect(pack.articles.find((article) => article.slug === "read-a-card")?.sections.some((section) => section.id === "regulation")).toBe(true);
      expect(pack.articles.find((article) => article.slug === "protect-cards")?.sections.some((section) => section.id === "toploader")).toBe(true);
      const donating = pack.articles.find((article) => article.slug === "donating-cards");
      expect(prose(donating!)).toContain("mailto:magnus@linksforcards.com");
      expect(pack.articles.find((article) => article.slug === "collecting-binders")?.diagram?.kind).toBe("binders");
      expect(pack.articles.find((article) => article.slug === "organize-binder")?.diagram?.kind).toBe("pockets");
      expect(pack.articles.find((article) => article.slug === "read-a-card")?.diagram?.kind).toBe("card");
    }
    expect(prose(englishArticles("us").find((article) => article.slug === "donating-cards")!)).toMatch(/\bdonate\b/);
    expect(prose(germanArticles().find((article) => article.slug === "bulk-cards")!).toLowerCase()).toContain("bulk");
    expect(germanArticles().find((article) => article.slug === "collecting-binders")?.h1.toLowerCase()).toMatch(/sammelordner|pokédex|pokemon|pokémon/);
    expect(englishArticles("uk").find((article) => article.slug === "organize-binder")?.h1).toMatch(/organise/);
    expect(englishArticles("us").find((article) => article.slug === "organize-binder")?.h1).toMatch(/organize/);
    expect(englishArticles("uk").map((article) => prose(article)).join("\n")).toMatch(/newsagent/);
  });
});
