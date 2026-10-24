import type { Metadata } from "next";
import type { CollectionPage } from "schema-dts";
import { Breadcrumbs } from "@/components/site/breadcrumbs";
import { DoodleCluster } from "@/components/site/doodles";
import { JsonLd } from "@/components/site/json-ld";
import { ShopLink } from "@/components/site/shop-link";
import { SiteLinks } from "@/components/site/site-links";
import { getSet } from "@/lib/catalog";
import { fill, formatDay } from "@/lib/format";
import { readLocale } from "@/lib/i18n";
import { breadcrumbNode, itemListNode, ldGraph, pageNode } from "@/lib/jsonld";
import { localePath } from "@/lib/routing";
import { pageMetadata } from "@/lib/seo";
import { shopsForLocale } from "@/lib/shop-locales";
import { loadPublic } from "@/lib/stats";
import { safeHttpUrl } from "@/lib/urls";

export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale, m } = await readLocale(params);
  return pageMetadata(locale, "/partners", m.meta.partnersTitle, m.meta.partnersDescription);
}

export default async function PartnersPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale, m } = await readLocale(params);
  const snapshot = await loadPublic();
  const shops = shopsForLocale(snapshot.shops, locale);
  const crumbs = [
    { name: m.nav.home, href: localePath(locale, "/") },
    { name: m.nav.partners, href: localePath(locale, "/partners") },
  ];
  const list = itemListNode(
    localePath(locale, "/partners"),
    m.partners.h1,
    shops.map((shop) => ({ name: shop.name, url: safeHttpUrl(shop.website) ?? undefined })),
  );
  const page = pageNode({
    kind: "CollectionPage",
    locale,
    path: "/partners",
    name: m.meta.partnersTitle,
    description: m.meta.partnersDescription,
  }) as CollectionPage;
  Object.assign(page, { mainEntity: { "@id": String(list["@id"]) } });
  const graph = ldGraph([page, list, breadcrumbNode(crumbs)]);

  return (
    <>
      <JsonLd graph={graph} />
      <section className="page-head">
        <DoodleCluster />
        <Breadcrumbs label={m.nav.breadcrumbs} items={crumbs} />
        <p className="kicker">{m.partners.kicker}</p>
        <h1>{m.partners.h1}</h1>
        <p className="lede">{m.partners.intro}</p>
      </section>
      {shops.length === 0 ? (
        <p>{m.partners.empty}</p>
      ) : (
        <ul className="thanks">
          {shops.map((shop) => {
            const labels = [
              ...[...shop.generations].sort((a, b) => a - b).map((gen) => fill(m.donations.genBinder, { gen, region: m.regions[gen - 1] })),
              ...shop.setIds.map((setId) => fill(m.donations.setBinder, { name: getSet(setId)?.name ?? setId })),
            ];
            return (
              <li key={shop.id}>
                <ShopLink name={shop.name} website={shop.website} />
                <span className="country">{shop.country}</span>
                <p className="muted">{fill(m.partners.latest, { date: formatDay(shop.latest, locale) })}</p>
                {labels.length ? (
                  <p>
                    <span className="muted">{m.partners.toward} </span>
                    {labels.join(", ")}
                  </p>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
      <SiteLinks locale={locale} m={m} current="/partners" />
    </>
  );
}
