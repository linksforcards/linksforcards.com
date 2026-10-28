import type { Metadata } from "next";
import type { CollectionPage } from "schema-dts";
import { Breadcrumbs } from "@/components/site/breadcrumbs";
import { DoodleCluster } from "@/components/site/doodles";
import { JsonLd } from "@/components/site/json-ld";
import { SiteLinks } from "@/components/site/site-links";
import { checklistIndex } from "@/lib/checklists";
import { fill, formatInt } from "@/lib/format";
import { readLocale } from "@/lib/i18n";
import { breadcrumbNode, itemListNode, ldGraph, pageNode } from "@/lib/jsonld";
import { CARD_INDEX_LOCALES, cardPageIndexed } from "@/lib/locales";
import { localePath } from "@/lib/routing";
import { pageMetadata } from "@/lib/seo";
import { absoluteUrl } from "@/lib/site";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale, m } = await readLocale(params);
  const indexed = cardPageIndexed(locale);
  return pageMetadata(locale, "/checklists", m.printChecklist.indexTitle, m.printChecklist.indexDescription, {
    index: indexed,
    hreflang: indexed,
    locales: CARD_INDEX_LOCALES,
  });
}

export default async function ChecklistIndexPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale, m } = await readLocale(params);
  const index = checklistIndex(locale);
  const crumbs = [
    { name: m.nav.home, href: localePath(locale, "/") },
    { name: m.printChecklist.indexH1, href: localePath(locale, "/checklists") },
  ];
  const entries = [
    ...index.generations.map((item) => ({ name: item.name, url: absoluteUrl(localePath(locale, item.path)) })),
    ...index.themes.map((item) => ({ name: item.name, url: absoluteUrl(localePath(locale, item.path)) })),
    ...index.series.flatMap((group) =>
      group.sets.map((set) => ({ name: set.name, url: absoluteUrl(localePath(locale, set.path)) })),
    ),
  ];
  const list = itemListNode(localePath(locale, "/checklists"), m.printChecklist.indexTitle, entries);
  const page = pageNode({
    kind: "CollectionPage",
    locale,
    path: "/checklists",
    name: m.printChecklist.indexTitle,
    description: m.printChecklist.indexDescription,
  }) as CollectionPage;
  Object.assign(page, { mainEntity: { "@id": String(list["@id"]) } });
  const graph = ldGraph([page, list, breadcrumbNode(crumbs)]);

  return (
    <>
      <JsonLd graph={graph} />
      <section className="page-head">
        <DoodleCluster />
        <Breadcrumbs label={m.nav.breadcrumbs} items={crumbs} />
        <p className="kicker">{m.printChecklist.kicker}</p>
        <h1>{m.printChecklist.indexH1}</h1>
        <p className="lede">{m.printChecklist.indexIntro}</p>
      </section>
      <p>{m.printChecklist.indexPaper}</p>
      <h2>{m.printChecklist.indexGenerations}</h2>
      <ul className="gen-list">
        {index.generations.map((item) => (
          <li key={item.id}>
            <a href={localePath(locale, item.path)}>{item.name}</a>
            <span />
            <span className="count">{fill(m.printChecklist.species, { count: formatInt(item.count, locale) })}</span>
          </li>
        ))}
      </ul>
      <h2>{m.printChecklist.indexThemes}</h2>
      <ul className="gen-list">
        {index.themes.map((item) => (
          <li key={item.id}>
            <a href={localePath(locale, item.path)}>{item.name}</a>
            <span />
            <span className="count">{fill(m.printChecklist.cards, { count: formatInt(item.count, locale) })}</span>
          </li>
        ))}
      </ul>
      <h2>{m.printChecklist.indexSets}</h2>
      {index.series.map((group) => (
        <section key={group.series}>
          <h3>{group.series}</h3>
          <ul className="gen-list">
            {group.sets.map((set) => (
              <li key={set.id}>
                <a href={localePath(locale, set.path)}>{set.name}</a>
                <span />
                <span className="count">{fill(m.printChecklist.cards, { count: formatInt(set.count, locale) })}</span>
              </li>
            ))}
          </ul>
        </section>
      ))}
      <SiteLinks locale={locale} m={m} current="/checklists" />
    </>
  );
}
