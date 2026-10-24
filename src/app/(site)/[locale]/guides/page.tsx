import type { Metadata } from "next";
import type { CollectionPage } from "schema-dts";
import { Breadcrumbs } from "@/components/site/breadcrumbs";
import { DoodleCluster } from "@/components/site/doodles";
import { JsonLd } from "@/components/site/json-ld";
import { SiteLinks } from "@/components/site/site-links";
import { fill, formatDay } from "@/lib/format";
import { GUIDE_SLUGS, GUIDE_UPDATED } from "@/lib/guides";
import { readLocale } from "@/lib/i18n";
import { breadcrumbNode, itemListNode, ldGraph, pageNode } from "@/lib/jsonld";
import { localePath } from "@/lib/routing";
import { pageMetadata } from "@/lib/seo";
import { absoluteUrl } from "@/lib/site";

export const revalidate = 3600;

const SLUGS = GUIDE_SLUGS;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale, m } = await readLocale(params);
  return pageMetadata(locale, "/guides", m.meta.guidesTitle, m.meta.guidesDescription);
}

export default async function GuidesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale, m } = await readLocale(params);
  const entries = [
    { slug: SLUGS[0], title: m.guides.organize.title, description: m.guides.organize.description },
    { slug: SLUGS[1], title: m.guides.bulk.title, description: m.guides.bulk.description },
    { slug: SLUGS[2], title: m.guides.donating.title, description: m.guides.donating.description },
  ];
  const crumbs = [
    { name: m.nav.home, href: localePath(locale, "/") },
    { name: m.nav.guides, href: localePath(locale, "/guides") },
  ];
  const list = itemListNode(
    localePath(locale, "/guides"),
    m.meta.guidesTitle,
    entries.map((entry) => ({ name: entry.title, url: absoluteUrl(localePath(locale, `/guides/${entry.slug}`)) })),
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
      <ul className="guide-list">
        {entries.map((entry) => (
          <li key={entry.slug}>
            <a href={localePath(locale, `/guides/${entry.slug}`)}>{entry.title}</a>
            <p>{entry.description}</p>
          </li>
        ))}
      </ul>
      <SiteLinks locale={locale} m={m} current="/guides" />
    </>
  );
}
