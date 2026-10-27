import type { Metadata } from "next";
import type { CollectionPage } from "schema-dts";
import { Breadcrumbs } from "@/components/site/breadcrumbs";
import { DoodleCluster } from "@/components/site/doodles";
import { JsonLd } from "@/components/site/json-ld";
import { SiteLinks } from "@/components/site/site-links";
import { getSet } from "@/lib/catalog";
import { fill, formatDay } from "@/lib/format";
import { generationById } from "@/lib/generations";
import { readLocale } from "@/lib/i18n";
import { breadcrumbNode, itemListNode, ldGraph, pageNode } from "@/lib/jsonld";
import { localePath } from "@/lib/routing";
import { pageMetadata } from "@/lib/seo";
import { loadPublic } from "@/lib/stats";

export const revalidate = 60;
export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale, m } = await readLocale(params);
  return pageMetadata(locale, "/donations", m.meta.donationsTitle, m.meta.donationsDescription);
}

export default async function DonationsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale, m } = await readLocale(params);
  const snapshot = await loadPublic();
  const given = snapshot.marks.filter((mark) => mark.status === "given_away");
  const titles = given.map((mark) =>
    mark.kind === "set"
      ? fill(m.donations.setBinder, { name: getSet(mark.key)?.name ?? mark.key })
      : fill(m.donations.genBinder, {
          gen: mark.key,
          region: m.regions[(generationById(Number(mark.key))?.id ?? 1) - 1] ?? "",
        }),
  );
  const crumbs = [
    { name: m.nav.home, href: localePath(locale, "/") },
    { name: m.nav.donations, href: localePath(locale, "/donations") },
  ];
  const list = itemListNode(
    localePath(locale, "/donations"),
    m.donations.h1,
    titles.map((name) => ({ name })),
  );
  const page = pageNode({
    kind: "CollectionPage",
    locale,
    path: "/donations",
    name: m.meta.donationsTitle,
    description: m.meta.donationsDescription,
  }) as CollectionPage;
  Object.assign(page, { mainEntity: { "@id": String(list["@id"]) } });
  const graph = ldGraph([page, list, breadcrumbNode(crumbs)]);

  return (
    <>
      <JsonLd graph={graph} />
      <section className="page-head">
        <DoodleCluster />
        <Breadcrumbs label={m.nav.breadcrumbs} items={crumbs} />
        <p className="kicker">{m.donations.kicker}</p>
        <h1>{m.donations.h1}</h1>
        <p className="lede">{m.donations.intro}</p>
      </section>
      {given.length === 0 ? (
        <p>{m.donations.empty}</p>
      ) : (
        <ul className="thanks">
          {given.map((mark, index) => {
            const title = titles[index];
            return (
              <li key={`${mark.kind}:${mark.key}`}>
                <h2>{title}</h2>
                {mark.recipient ? <p>{fill(m.donations.recipient, { name: mark.recipient })}</p> : null}
                {mark.givenOn ? <p>{formatDay(mark.givenOn, locale)}</p> : null}
                {mark.completedOn ? <p className="muted">{fill(m.donations.completedOn, { date: formatDay(mark.completedOn, locale) })}</p> : null}
                {mark.notes ? <p>{mark.notes}</p> : null}
              </li>
            );
          })}
        </ul>
      )}
      <SiteLinks locale={locale} m={m} current="/donations" />
    </>
  );
}
