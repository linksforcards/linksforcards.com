import type { Metadata } from "next";
import type { CollectionPage } from "schema-dts";
import { Breadcrumbs } from "@/components/site/breadcrumbs";
import { DoodleCluster } from "@/components/site/doodles";
import { JsonLd } from "@/components/site/json-ld";
import { SiteLinks } from "@/components/site/site-links";
import { getArticles, GUIDE_UPDATED, PILLAR_SLUG } from "@/lib/articles";
import { fill, formatDay } from "@/lib/format";
import { readLocale } from "@/lib/i18n";
import { breadcrumbNode, itemListNode, ldGraph, pageNode } from "@/lib/jsonld";
import { localePath } from "@/lib/routing";
import { pageMetadata } from "@/lib/seo";
import { absoluteUrl } from "@/lib/site";

export const revalidate = 3600;
export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale, m } = await readLocale(params);
  return pageMetadata(locale, "/guides", m.meta.guidesTitle, m.meta.guidesDescription);
}

export default async function GuidesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale, m } = await readLocale(params);
  const articles = getArticles(locale);
  const pillar = articles.find((article) => article.slug === PILLAR_SLUG) ?? articles[0];
  const rest = articles.filter((article) => article.slug !== pillar.slug);
  const crumbs = [
    { name: m.nav.home, href: localePath(locale, "/") },
    { name: m.nav.guides, href: localePath(locale, "/guides") },
  ];
  const list = itemListNode(
    localePath(locale, "/guides"),
    m.meta.guidesTitle,
    articles.map((article) => ({ name: article.title, url: absoluteUrl(localePath(locale, `/guides/${article.slug}`)) })),
  );
  const page = pageNode({
    kind: "CollectionPage",
    locale,
    path: "/guides",
    name: m.meta.guidesTitle,
    description: m.meta.guidesDescription,
  }) as CollectionPage;
  Object.assign(page, { mainEntity: { "@id": String(list["@id"]) } });
  const graph = ldGraph([page, list, breadcrumbNode(crumbs)]);

  return (
    <>
      <JsonLd graph={graph} />
      <section className="page-head">
        <DoodleCluster />
        <Breadcrumbs label={m.nav.breadcrumbs} items={crumbs} />
        <p className="kicker">{m.guides.kicker}</p>
        <h1>{m.meta.guidesTitle}</h1>
        <p className="lede">{m.guides.indexIntro}</p>
      </section>
      <p>{fill(m.guides.updated, { date: formatDay(GUIDE_UPDATED, locale) })}</p>
      <h2>{m.guides.pillarLabel}</h2>
      <ul className="guide-list">
        <li>
          <a href={localePath(locale, `/guides/${pillar.slug}`)}>{pillar.h1}</a>
          <p>{pillar.description}</p>
        </li>
      </ul>
      <h2>{m.guides.supportingLabel}</h2>
      <ul className="guide-list">
        {rest.map((article) => (
          <li key={article.slug}>
            <a href={localePath(locale, `/guides/${article.slug}`)}>{article.h1}</a>
            <p>{article.description}</p>
          </li>
        ))}
      </ul>
      <SiteLinks locale={locale} m={m} current="/guides" />
    </>
  );
}
