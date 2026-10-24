import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { CollectionPage } from "schema-dts";
import { Breadcrumbs } from "@/components/site/breadcrumbs";
import { Checklist } from "@/components/site/checklist";
import { DoodleCluster } from "@/components/site/doodles";
import { JsonLd } from "@/components/site/json-ld";
import { ProgressBar } from "@/components/site/progress-bar";
import { SiteLinks } from "@/components/site/site-links";
import { speciesName, speciesNamesAreTranslated } from "@/lib/catalog";
import { fill, formatInt } from "@/lib/format";
import { formatDexNumber, GENERATIONS, generationById } from "@/lib/generations";
import { readLocale } from "@/lib/i18n";
import { breadcrumbNode, itemListNode, ldGraph, pageNode } from "@/lib/jsonld";
import { localePath } from "@/lib/routing";
import { pageMetadata } from "@/lib/seo";
import { loadPublic, markFor, speciesInRange } from "@/lib/stats";

export const revalidate = 60;
export const dynamicParams = false;

export function generateStaticParams() {
  return GENERATIONS.map((generation) => ({ gen: String(generation.id) }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; gen: string }>;
}): Promise<Metadata> {
  const { locale, m } = await readLocale(params);
  const { gen } = await params;
  const generation = generationById(Number(gen));
  if (!generation) return {};
  const region = m.regions[generation.id - 1];
  const snapshot = await loadPublic();
  const collected = speciesInRange(snapshot.species, generation.start, generation.end);
  const total = generation.end - generation.start + 1;
  return pageMetadata(
    locale,
    `/binders/generation/${generation.id}`,
    fill(m.meta.generationTitle, { gen: generation.id, region }),
    fill(m.meta.generationDescription, { gen: generation.id, region, collected, total }),
  );
}

export default async function GenerationPage({ params }: { params: Promise<{ locale: string; gen: string }> }) {
  const { locale, m } = await readLocale(params);
  const { gen } = await params;
  const generation = generationById(Number(gen));
  if (!generation) notFound();
  const snapshot = await loadPublic();
  const region = m.regions[generation.id - 1];
  const total = generation.end - generation.start + 1;
  const collected = speciesInRange(snapshot.species, generation.start, generation.end);
  const have = new Set(snapshot.species);
  const mark = markFor(snapshot, "generation", String(generation.id));
  const progressLabel = fill(m.checklist.progress, {
    collected: formatInt(collected, locale),
    total: formatInt(total, locale),
  });
  const title = fill(m.meta.generationTitle, { gen: generation.id, region });
  const path = `/binders/generation/${generation.id}`;
  const rows = [];
  for (let dex = generation.start; dex <= generation.end; dex += 1) {
    rows.push({
      key: String(dex),
      title: `${formatDexNumber(dex)} ${speciesName(dex, locale)}`,
      detail: "",
      have: have.has(dex),
    });
  }
  const crumbs = [
    { name: m.nav.home, href: localePath(locale, "/") },
    { name: m.nav.binders, href: localePath(locale, "/binders") },
    { name: title, href: localePath(locale, path) },
  ];
  const list = itemListNode(
    localePath(locale, path),
    title,
    rows.map((row) => ({ name: row.title })),
  );
  const page = pageNode({
    kind: "CollectionPage",
    locale,
    path,
    name: title,
    description: fill(m.meta.generationDescription, { gen: generation.id, region, collected, total }),
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
        <h1>{title}</h1>
      </section>
      <p>
        {fill(m.meta.generationDescription, {
          gen: generation.id,
          region,
          collected: formatInt(collected, locale),
          total: formatInt(total, locale),
        })}
      </p>
      <p>
        {speciesNamesAreTranslated(locale)
          ? fill(m.bindersPage.speciesLocal, { language: m.langName })
          : m.bindersPage.speciesEnglish}
      </p>
      <p>{m.checklist.combo}</p>
      <p>{m.bindersPage.anyLanguage}</p>
      <ProgressBar value={collected} max={total} label={`${title}: ${progressLabel}`} />
      <p className="count">{progressLabel}</p>
      {collected === total ? <p className="banner">{m.checklist.checklistFull}</p> : null}
      {mark?.status === "given_away" ? <p className="banner">{m.checklist.markedGiven}</p> : null}
      {mark?.status === "completed" ? <p className="banner">{m.checklist.markedComplete}</p> : null}
      <Checklist rows={rows} labels={m.checklist} />
      <SiteLinks locale={locale} m={m} current={path} />
    </>
  );
}
