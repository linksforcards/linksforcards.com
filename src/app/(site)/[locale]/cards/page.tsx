import type { Metadata } from "next";
import type { CollectionPage } from "schema-dts";
import { CardSearch } from "@/components/site/card-search";
import { Breadcrumbs } from "@/components/site/breadcrumbs";
import { DoodleCluster } from "@/components/site/doodles";
import { JsonLd } from "@/components/site/json-ld";
import { SiteLinks } from "@/components/site/site-links";
import { getCardIndexPayload, heldBitsFor, preparedCardIndex, speciesNames } from "@/lib/card-index";
import { decodeHeldBits, parseCardQuery, queryIsFiltered, searchCards, type CardQuery } from "@/lib/card-query";
import { cardsDatabaseText } from "@/lib/database-page";
import { readLocale } from "@/lib/i18n";
import { breadcrumbNode, ldGraph, pageNode } from "@/lib/jsonld";
import { localePath } from "@/lib/routing";
import { pageMetadata } from "@/lib/seo";
import { loadPublic } from "@/lib/stats";

export const revalidate = 86400;

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}): Promise<Metadata> {
  const { locale, m } = await readLocale(params);
  const query = parseCardQuery(await searchParams);
  const text = cardsDatabaseText(locale, m);
  return pageMetadata(locale, "/cards", text.title, text.description, { index: !queryIsFiltered(query) });
}

export default async function CardsDatabasePage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { locale, m } = await readLocale(params);
  const query = parseCardQuery(await searchParams);
  const text = cardsDatabaseText(locale, m);
  const snapshot = await loadPublic();
  const needEnabled = snapshot.state !== "error";
  const held = needEnabled ? heldBitsFor(snapshot.held) : "";
  const result = searchCards(preparedCardIndex(locale), query, {
    locale,
    held: held ? decodeHeldBits(held) : null,
    needEnabled,
  });
  const payload = getCardIndexPayload();
  const crumbs = [
    { name: m.nav.home, href: localePath(locale, "/") },
    { name: m.nav.cards, href: localePath(locale, "/cards") },
  ];
  const page = pageNode({
    kind: "CollectionPage",
    locale,
    path: "/cards",
    name: text.title,
    description: text.description,
  }) as CollectionPage;
  const graph = ldGraph([page, breadcrumbNode(crumbs)]);
  const groups = new Map<number, { series: string; options: { value: string; label: string }[] }>();
  const sets: { series: string; options: { value: string; label: string }[] }[] = [];
  for (const set of payload.sets) {
    const series = payload.series[set.series];
    if (!series) continue;
    let group = groups.get(set.series);
    if (!group) {
      group = { series: series.name, options: [] };
      groups.set(set.series, group);
      sets.push(group);
    }
    group.options.push({ value: set.id, label: set.name });
  }
  const labels = {
    search: m.cardSearch.search,
    placeholder: m.cardSearch.placeholder,
    set: m.cardSearch.set,
    series: m.cardSearch.series,
    year: m.cardSearch.year,
    rarity: m.cardSearch.rarity,
    type: m.cardSearch.type,
    supertype: m.cardSearch.supertype,
    illustrator: m.cardSearch.illustrator,
    any: m.cardSearch.any,
    need: m.cardSearch.need,
    needUnavailable: m.cardSearch.needUnavailable,
    submit: m.cardSearch.submit,
    countOne: m.cardSearch.countOne,
    countMany: m.cardSearch.countMany,
    empty: m.cardSearch.empty,
    page: m.cardSearch.page,
    previous: m.cardSearch.previous,
    next: m.cardSearch.next,
    results: m.cardSearch.results,
    filters: m.cardSearch.filters,
    fallback: m.cardSearch.fallback,
    supertypes: {
      p: m.checklist.supertypeP,
      t: m.checklist.supertypeT,
      e: m.checklist.supertypeE,
      o: m.checklist.supertypeO,
    },
  };

  return (
    <>
      <JsonLd graph={graph} />
      <section className="page-head">
        <DoodleCluster />
        <Breadcrumbs label={m.nav.breadcrumbs} items={crumbs} />
        <p className="kicker">{m.cardSearch.kicker}</p>
        <h1>{text.title}</h1>
      </section>
      <p className="lede">{text.paragraph}</p>
      <p>{text.note}</p>
      <p>
        <a href={localePath(locale, "/illustrators")}>{m.cardSearch.illustratorsLink}</a>
      </p>
      <CardSearch
        locale={locale}
        labels={labels}
        initialQuery={query satisfies CardQuery}
        initialHits={result.hits}
        initialTotal={result.total}
        initialPages={result.pages}
        species={speciesNames(locale)}
        held={held}
        needEnabled={needEnabled}
        sets={sets}
        series={payload.series.map((item) => ({ value: item.slug, label: item.name }))}
        years={payload.years.map(String)}
        rarities={[...payload.rarities]
          .sort((a, b) => a.name.localeCompare(b.name, "en"))
          .map((item) => ({ value: item.slug, label: item.name }))}
        types={payload.types}
        illustrators={payload.artists.map((item) => ({ value: item.slug, label: item.name }))}
      />
      <SiteLinks locale={locale} m={m} current="/cards" />
    </>
  );
}
