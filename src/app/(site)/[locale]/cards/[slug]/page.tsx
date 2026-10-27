import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { Breadcrumbs } from "@/components/site/breadcrumbs";
import { CardCopy, CardFaq, CardGameplay } from "@/components/site/card-body";
import { BinderChips, NeighborLinks, PrintingGrid } from "@/components/site/card-links";
import { DoodleCluster } from "@/components/site/doodles";
import { JsonLd } from "@/components/site/json-ld";
import { SiteLinks } from "@/components/site/site-links";
import {
  buildCardView,
  cardPageGraph,
  cardStatus,
  resolveCardSlug,
  cardIsHeld,
} from "@/lib/card-page";
import { fill, formatInt } from "@/lib/format";
import { readLocale } from "@/lib/i18n";
import { CARD_INDEX_LOCALES, cardPageIndexed } from "@/lib/locales";
import { localePath } from "@/lib/routing";
import { pageMetadata } from "@/lib/seo";
import { loadPublic } from "@/lib/stats";

/**
 * About 20,000 cards in every locale. Pre-rendering all of them would
 * multiply the Vercel build. Pages are rendered
 * on the first request and then cached for a day (ISR). Card facts come from
 * the catalog files. Whether a card is logged comes from the shipment table and
 * can lag by up to this window.
 */
export const revalidate = 86400;
export const dynamicParams = true;

export function generateStaticParams(): { slug: string }[] {
  return [];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, m } = await readLocale(params);
  const { slug } = await params;
  const resolved = resolveCardSlug(slug);
  if (!resolved) return {};
  const snapshot = await loadPublic();
  const status = cardStatus(snapshot.state, cardIsHeld(snapshot.held, resolved.set.id, resolved.card.n));
  const view = buildCardView(locale, m, resolved.set, resolved.card, status);
  const indexed = cardPageIndexed(locale);
  return pageMetadata(locale, view.path, view.title, view.description, {
    index: indexed,
    hreflang: indexed,
    locales: CARD_INDEX_LOCALES,
    fitTitle: true,
  });
}

export default async function CardPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, m } = await readLocale(params);
  const { slug } = await params;
  const resolved = resolveCardSlug(slug);
  if (!resolved) notFound();
  if (resolved.canonical !== slug) permanentRedirect(localePath(locale, `/cards/${resolved.canonical}`));
  const snapshot = await loadPublic();
  const status = cardStatus(snapshot.state, cardIsHeld(snapshot.held, resolved.set.id, resolved.card.n));
  const view = buildCardView(locale, m, resolved.set, resolved.card, status);
  const graph = cardPageGraph(locale, view);
  const neighbors = [view.prev, view.next].filter((link): link is NonNullable<typeof link> => Boolean(link));

  return (
    <>
      <JsonLd graph={graph} />
      <section className="page-head">
        <DoodleCluster />
        <Breadcrumbs label={m.nav.breadcrumbs} items={view.crumbs} />
        <p className="kicker">
          <a href={localePath(locale, `/collections/set/${resolved.set.id}`)}>{resolved.set.name}</a>
        </p>
        <h1>{view.title}</h1>
      </section>
      <CardCopy paragraphs={view.paragraphs} />
      <h2>{m.cardPage.facts}</h2>
      <dl className="facts">
        {view.facts.map((fact) => (
          <div key={fact.label}>
            <dt>{fact.label}</dt>
            <dd>
              {fact.links ? (
                fact.links.map((link, index) => (
                  <span key={link.href}>
                    {index > 0 ? ", " : null}
                    <a href={link.href}>{link.name}</a>
                  </span>
                ))
              ) : fact.href ? (
                <a href={fact.href}>{fact.value}</a>
              ) : (
                fact.value
              )}
            </dd>
          </div>
        ))}
      </dl>
      <CardGameplay m={m} card={resolved.card} />
      <h2 id="card-binders">{m.cardPage.bindersHeading}</h2>
      <BinderChips labelledBy="card-binders" links={view.binders} />
      {view.others.length > 0 ? (
        <>
          <h2 id="card-printings">{m.cardPage.otherPrintings}</h2>
          <PrintingGrid
            labelledBy="card-printings"
            cards={view.others}
            more={
              view.morePrintings
                ? {
                    href: view.morePrintings.href,
                    label: fill(m.cardPage.seeAllPrintings, { count: formatInt(view.morePrintings.count, locale) }),
                  }
                : null
            }
          />
        </>
      ) : null}
      {neighbors.length > 0 ? (
        <>
          <h2 id="card-neighbors">{m.cardPage.neighbors}</h2>
          <NeighborLinks labelledBy="card-neighbors" links={neighbors} />
        </>
      ) : null}
      <CardFaq m={m} faqs={view.faqs} />
      <SiteLinks locale={locale} m={m} current={view.path} />
    </>
  );
}
