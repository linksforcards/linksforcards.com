import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { CollectionPage } from "schema-dts";
import { Breadcrumbs } from "@/components/site/breadcrumbs";
import { Checklist } from "@/components/site/checklist";
import { DoodleCluster } from "@/components/site/doodles";
import { JsonLd } from "@/components/site/json-ld";
import { ProgressBar } from "@/components/site/progress-bar";
import { SiteLinks } from "@/components/site/site-links";
import { numbersMatch } from "@/lib/cards";
import { cardImageSrc, getSet, getSetCards, speciesName, type CardKind } from "@/lib/catalog";
import { fill, formatDay, formatInt } from "@/lib/format";
import { formatDexNumber } from "@/lib/generations";
import { readLocale, type Messages } from "@/lib/i18n";
import { breadcrumbNode, itemListNode, ldGraph, pageNode } from "@/lib/jsonld";
import { localePath } from "@/lib/routing";
import { pageMetadata } from "@/lib/seo";
import { loadPublic, markFor } from "@/lib/stats";

export const revalidate = 60;
export const dynamicParams = true;

function kindLabel(kind: CardKind, m: Messages): string {
  if (kind === "p") return m.checklist.supertypeP;
  if (kind === "t") return m.checklist.supertypeT;
  if (kind === "e") return m.checklist.supertypeE;
  return m.checklist.supertypeO;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; setId: string }>;
}): Promise<Metadata> {
  const { locale, m } = await readLocale(params);
  const { setId } = await params;
  const set = getSet(setId);
  const cards = set ? getSetCards(set.id) : null;
  if (!set || !cards) return {};
  const snapshot = await loadPublic();
  return pageMetadata(
    locale,
    `/binders/set/${set.id}`,
    fill(m.meta.setTitle, { name: set.name }),
    fill(m.meta.setDescription, {
      name: set.name,
      collected: snapshot.setCounts[set.id] ?? 0,
      total: cards.length,
    }),
  );
}

export default async function SetPage({ params }: { params: Promise<{ locale: string; setId: string }> }) {
  const { locale, m } = await readLocale(params);
  const { setId } = await params;
  const set = getSet(setId);
  const cards = set ? getSetCards(set.id) : null;
  if (!set || !cards) notFound();
  const snapshot = await loadPublic();
  const held = snapshot.held[set.id] ?? [];
  const collected = snapshot.setCounts[set.id] ?? 0;
  const mark = markFor(snapshot, "set", set.id);
  const progressLabel = fill(m.checklist.progress, {
    collected: formatInt(collected, locale),
    total: formatInt(cards.length, locale),
  });
  const path = `/binders/set/${set.id}`;
  const rows = cards.map((card) => {
    const pokemon = (card.dex ?? []).map((dex) => speciesName(dex, locale)).filter(Boolean);
    const name = card.k === "p" && pokemon.length ? pokemon.join(", ") : card.name;
    return {
      key: card.n,
      title: `${card.n} ${card.name}`,
      detail: [
        kindLabel(card.k, m),
        ...(card.dex ?? []).map((dex) => `${formatDexNumber(dex)} ${speciesName(dex, locale)}`),
      ].join(" · "),
      have: held.some((number) => numbersMatch(card.n, number)),
      image: cardImageSrc(set.id, card.n),
      alt: fill(m.checklist.cardAlt, { name, set: set.name, number: card.n }),
    };
  });
  const crumbs = [
    { name: m.nav.home, href: localePath(locale, "/") },
    { name: m.nav.binders, href: localePath(locale, "/binders") },
    { name: set.name, href: localePath(locale, path) },
  ];
  const list = itemListNode(
    localePath(locale, path),
    set.name,
    rows.map((row) => ({ name: row.alt })),
  );
  const page = pageNode({
    kind: "CollectionPage",
    locale,
    path,
    name: set.name,
    description: fill(m.meta.setDescription, { name: set.name, collected, total: cards.length }),
  }) as CollectionPage;
  Object.assign(page, { mainEntity: { "@id": String(list["@id"]) } });
  const graph = ldGraph([page, list, breadcrumbNode(crumbs)]);

  return (
    <>
      <JsonLd graph={graph} />
      <section className="page-head">
        <DoodleCluster />
        <Breadcrumbs label={m.nav.breadcrumbs} items={crumbs} />
        <p className="kicker">
          <a href={localePath(locale, "/binders")}>{m.checklist.back}</a>
        </p>
        <h1>{set.name}</h1>
      </section>
      <p>
        {set.series} · {formatDay(set.releaseDate, locale)}
      </p>
      <p>{fill(m.meta.setDescription, { name: set.name, collected: formatInt(collected, locale), total: formatInt(cards.length, locale) })}</p>
      <p>{m.bindersPage.anyLanguage}</p>
      <ProgressBar value={collected} max={cards.length} label={`${set.name}: ${progressLabel}`} />
      <p className="count">{progressLabel}</p>
      {collected === cards.length && cards.length > 0 ? <p className="banner">{m.checklist.checklistFull}</p> : null}
      {mark?.status === "given_away" ? <p className="banner">{m.checklist.markedGiven}</p> : null}
      {mark?.status === "completed" ? <p className="banner">{m.checklist.markedComplete}</p> : null}
      <Checklist rows={rows} labels={m.checklist} />
      <SiteLinks locale={locale} m={m} current={path} />
    </>
  );
}
