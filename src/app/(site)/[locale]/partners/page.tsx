import type { Metadata } from "next";
import { DoodleCluster } from "@/components/site/doodles";
import { ShopLink } from "@/components/site/shop-link";
import { getSet } from "@/lib/catalog";
import { fill, formatDay } from "@/lib/format";
import { readLocale } from "@/lib/i18n";
import { localePath } from "@/lib/routing";
import { pageMetadata } from "@/lib/seo";
import { loadPublic } from "@/lib/stats";

export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale, m } = await readLocale(params);
  return pageMetadata(locale, "/partners", m.meta.partnersTitle, m.meta.partnersDescription);
}

export default async function PartnersPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale, m } = await readLocale(params);
  const snapshot = await loadPublic();

  return (
    <>
      <section className="page-head">
        <DoodleCluster />
        <p className="kicker">{m.partners.kicker}</p>
        <h1>{m.partners.h1}</h1>
        <p className="lede">{m.partners.intro}</p>
      </section>
      {snapshot.shops.length === 0 ? (
        <p>{m.partners.empty}</p>
      ) : (
        <ul className="thanks">
          {snapshot.shops.map((shop) => {
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
      <p>
        <a href={localePath(locale, "/")}>{m.nav.home}</a>
      </p>
    </>
  );
}
