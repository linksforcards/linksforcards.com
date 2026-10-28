import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { CollectionPage } from "schema-dts";
import { Breadcrumbs } from "@/components/site/breadcrumbs";
import { DoodleCluster } from "@/components/site/doodles";
import { JsonLd } from "@/components/site/json-ld";
import { PrintableSheet } from "@/components/site/printable-sheet";
import { getChecklist } from "@/lib/checklists";
import { readLocale } from "@/lib/i18n";
import { CARD_INDEX_LOCALES } from "@/lib/locales";
import { breadcrumbNode, itemListNode, ldGraph, pageNode } from "@/lib/jsonld";
import { localePath } from "@/lib/routing";
import { pageMetadata } from "@/lib/seo";

/** One list per set, theme, and generation. The CDN caches it. The build does not prerender them. */
export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; kind: string; id: string }>;
}): Promise<Metadata> {
  const { locale } = await readLocale(params);
  const { kind, id } = await params;
  const model = getChecklist(locale, kind, id);
  if (!model) return {};
  return pageMetadata(locale, model.path, model.title, model.description, {
    index: model.indexed,
    hreflang: model.indexed,
    locales: CARD_INDEX_LOCALES,
  });
}

export default async function ChecklistPage({
  params,
}: {
  params: Promise<{ locale: string; kind: string; id: string }>;
}) {
  const { locale, m } = await readLocale(params);
  const { kind, id } = await params;
  const model = getChecklist(locale, kind, id);
  if (!model) notFound();
  const crumbs = [
    { name: m.nav.home, href: localePath(locale, "/") },
    { name: m.printChecklist.indexH1, href: localePath(locale, "/checklists") },
    { name: model.title, href: localePath(locale, model.path) },
  ];
  const lines = model.blocks.flatMap((block) => block.lines.map((line) => ({ name: `${line.number} ${line.name}` })));
  const list = itemListNode(localePath(locale, model.path), model.title, lines);
  const page = pageNode({
    kind: "CollectionPage",
    locale,
    path: model.path,
    name: model.title,
    description: model.description,
  }) as CollectionPage;
  Object.assign(page, { mainEntity: { "@id": String(list["@id"]) } });
  const graph = ldGraph([page, list, breadcrumbNode(crumbs)]);

  return (
    <>
      <JsonLd graph={graph} />
      <section className="page-head print-hide">
        <DoodleCluster />
        <Breadcrumbs label={m.nav.breadcrumbs} items={crumbs} />
        <p className="kicker">
          <a href={localePath(locale, "/checklists")}>{m.printChecklist.kicker}</a>
        </p>
        <h1>{model.title}</h1>
        <p className="lede">{model.detail}</p>
      </section>
      <p className="print-hide">
        <a href={localePath(locale, model.sourcePath)}>{model.sourceLabel}</a>
        {" · "}
        <a href={localePath(locale, "/checklists")}>{model.labels.back}</a>
      </p>
      <PrintableSheet locale={locale} model={model} />
    </>
  );
}
