import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArticleDiagram } from "@/components/site/article-diagrams";
import { Breadcrumbs } from "@/components/site/breadcrumbs";
import { DoodleCluster } from "@/components/site/doodles";
import { JsonLd } from "@/components/site/json-ld";
import { RelatedLinks } from "@/components/site/related-links";
import { RichText } from "@/components/site/rich-text";
import { SiteLinks } from "@/components/site/site-links";
import { ARTICLE_LINKS, ARTICLE_SLUGS, articleFaqSchema, getArticle, getArticles, GUIDE_UPDATED, isGuideSlug } from "@/lib/articles";
import { getMeta, setsBySeries } from "@/lib/catalog";
import { fill, formatDay, formatInt } from "@/lib/format";
import { readLocale } from "@/lib/i18n";
import { breadcrumbNode, faqNode, ldGraph, pageNode } from "@/lib/jsonld";
import { localePath } from "@/lib/routing";
import { pageMetadata } from "@/lib/seo";
import { seriesSlug } from "@/lib/series";

export const revalidate = 3600;
export const dynamicParams = false;

const SPECIES_TOTAL = 1025;

export function generateStaticParams() {
  return ARTICLE_SLUGS.map((slug) => ({ slug }));
}

function facts(locale: Parameters<typeof formatInt>[1]) {
  const meta = getMeta();
  return {
    sets: formatInt(meta.sets, locale),
    seriesCount: formatInt(setsBySeries().length, locale),
    cards: formatInt(meta.cards, locale),
    species: formatInt(SPECIES_TOTAL, locale),
    built: formatDay(meta.builtAt, locale),
  };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale } = await readLocale(params);
  const { slug } = await params;
  const copy = getArticle(locale, slug);
  if (!copy || !isGuideSlug(slug)) return {};
  const image = `/og/${locale}/guides/${slug}`;
  return pageMetadata(locale, `/guides/${slug}`, copy.title, copy.description, { image, imageAlt: copy.h1 });
}

export default async function GuidePage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, m } = await readLocale(params);
  const { slug } = await params;
  const copy = getArticle(locale, slug);
  if (!copy || !isGuideSlug(slug)) notFound();
  const vars = facts(locale);
  const text = (value: string) => fill(value, vars);
  const path = `/guides/${slug}`;
  const crumbs = [
    { name: m.nav.home, href: localePath(locale, "/") },
    { name: m.nav.guides, href: localePath(locale, "/guides") },
    { name: copy.h1, href: localePath(locale, path) },
  ];
  const page = pageNode({
    kind: "BlogPosting",
    locale,
    path,
    name: copy.h1,
    description: copy.description,
    datePublished: GUIDE_UPDATED,
    dateModified: GUIDE_UPDATED,
    imagePath: `/og/${locale}/guides/${slug}`,
  });
  const nodes = [page, breadcrumbNode(crumbs)];
  if (articleFaqSchema(copy)) {
    nodes.push(faqNode(localePath(locale, path), copy.faqs.map((faq) => ({ q: text(faq.q), a: text(faq.a) }))));
  }
  const articles = new Map(getArticles(locale).map((article) => [article.slug, article]));
  const next = ARTICLE_LINKS[copy.slug]
    .filter((href) => href.startsWith("/guides/"))
    .map((href) => {
      const id = href.slice("/guides/".length);
      return { href: localePath(locale, href), name: articles.get(id as typeof copy.slug)?.h1 ?? id };
    });

  return (
    <>
      <JsonLd graph={ldGraph(nodes)} />
      <article className="article">
        <section className="page-head">
          <DoodleCluster />
          <Breadcrumbs label={m.nav.breadcrumbs} items={crumbs} />
          <p className="kicker">{m.guides.kicker}</p>
          <h1>{copy.h1}</h1>
          <p className="lede">
            <RichText text={text(copy.lede)} locale={locale} />
          </p>
        </section>
        <p>{fill(m.guides.updated, { date: formatDay(GUIDE_UPDATED, locale) })}</p>
        <nav className="toc" aria-label={m.guides.toc}>
          <p>{m.guides.toc}</p>
          <ol>
            {copy.sections.map((section) => (
              <li key={section.id}>
                <a href={`#${section.id}`}>{section.heading}</a>
              </li>
            ))}
          </ol>
        </nav>
        {copy.diagram ? (
          <ArticleDiagram
            kind={copy.diagram.kind}
            title={copy.diagram.title}
            description={copy.diagram.description}
            caption={copy.diagram.caption}
          />
        ) : null}
        {copy.sections.map((section) => (
          <section key={section.id} id={section.id}>
            <h2>{section.heading}</h2>
            {section.paragraphs.map((paragraph) => (
              <p key={paragraph.slice(0, 48)}>
                <RichText text={text(paragraph)} locale={locale} />
              </p>
            ))}
          </section>
        ))}
        {slug === "sets-in-order" ? <SetTimeline locale={locale} heading={m.guides.timelineLabel} /> : null}
        {copy.faqs.length > 0 ? (
          <section className="faq">
            <h2>{m.home.faqTitle}</h2>
            {copy.faqs.map((item) => (
              <div key={item.q}>
                <h3>{text(item.q)}</h3>
                <p>
                  <RichText text={text(item.a)} locale={locale} />
                </p>
              </div>
            ))}
          </section>
        ) : null}
      </article>
      <h2>{m.guides.readNext}</h2>
      <RelatedLinks label={m.guides.readNext} links={next} />
      <SiteLinks locale={locale} m={m} current={path} />
    </>
  );
}

function SetTimeline({ locale, heading }: { locale: Parameters<typeof formatDay>[1]; heading: string }) {
  const groups = setsBySeries();
  return (
    <section className="set-timeline" id="timeline">
      <h2>{heading}</h2>
      {groups.map((group) => (
        <section key={group.series}>
          <h3>
            <a href={localePath(locale, `/collections/series/${seriesSlug(group.series)}`)}>{group.series}</a>
          </h3>
          <ol>
            {group.sets.map((set) => (
              <li key={set.id}>
                <a href={localePath(locale, `/collections/set/${set.id}`)}>{set.name}</a>
                <span>
                  {formatDay(set.releaseDate, locale)} · {formatInt(set.count, locale)}
                </span>
              </li>
            ))}
          </ol>
        </section>
      ))}
    </section>
  );
}
