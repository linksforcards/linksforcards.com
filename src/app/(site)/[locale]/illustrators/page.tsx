import type { Metadata } from "next";
import type { CollectionPage } from "schema-dts";
import { Breadcrumbs } from "@/components/site/breadcrumbs";
import { DoodleCluster } from "@/components/site/doodles";
import { IllustratorBrowser } from "@/components/site/illustrator-browser";
import { JsonLd } from "@/components/site/json-ld";
import { SiteLinks } from "@/components/site/site-links";
import { illustratorsIndexText } from "@/lib/database-page";
import { fill, formatInt } from "@/lib/format";
import { readLocale } from "@/lib/i18n";
import { illustratorPath, illustratorSummaries } from "@/lib/illustrators";
import { breadcrumbNode, itemListNode, ldGraph, pageNode } from "@/lib/jsonld";
import { localePath } from "@/lib/routing";
import { pageMetadata } from "@/lib/seo";
import { absoluteUrl } from "@/lib/site";

export const revalidate = 86400;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale, m } = await readLocale(params);
  const text = illustratorsIndexText(locale, m);
  return pageMetadata(locale, "/illustrators", text.title, text.description);
}

export default async function IllustratorsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale, m } = await readLocale(params);
  const text = illustratorsIndexText(locale, m);
  const people = illustratorSummaries();
  const crumbs = [
    { name: m.nav.home, href: localePath(locale, "/") },
    { name: m.illustratorsPage.crumb, href: localePath(locale, "/illustrators") },
  ];
  const list = itemListNode(
    localePath(locale, "/illustrators"),
    text.title,
    people.map((person) => ({
      name: person.name,
      url: absoluteUrl(localePath(locale, illustratorPath(person.slug))),
    })),
  );
  const page = pageNode({
    kind: "CollectionPage",
    locale,
    path: "/illustrators",
    name: text.title,
    description: text.description,
  }) as CollectionPage;
  Object.assign(page, { mainEntity: { "@id": String(list["@id"]) } });
  const graph = ldGraph([page, list, breadcrumbNode(crumbs)]);

  return (
    <>
      <JsonLd graph={graph} />
      <section className="page-head">
        <DoodleCluster />
        <Breadcrumbs label={m.nav.breadcrumbs} items={crumbs} />
        <p className="kicker">{m.illustratorsPage.kicker}</p>
        <h1>{text.title}</h1>
      </section>
      <p className="lede">{text.paragraph}</p>
      <p>
        <a href={localePath(locale, "/cards")}>{m.nav.cards}</a>
      </p>
      <IllustratorBrowser
        locale={locale}
        entries={people.map((person) => ({
          name: person.name,
          href: localePath(locale, illustratorPath(person.slug)),
          countLabel: fill(person.count === 1 ? m.illustratorsPage.countOne : m.illustratorsPage.countMany, {
            count: formatInt(person.count, locale),
          }),
        }))}
        labels={{
          search: m.illustratorsPage.search,
          placeholder: m.illustratorsPage.placeholder,
          empty: m.illustratorsPage.empty,
          letters: m.illustratorsPage.letters,
        }}
      />
      <SiteLinks locale={locale} m={m} current="/illustrators" />
    </>
  );
}
