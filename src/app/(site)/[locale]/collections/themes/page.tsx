import type { Metadata } from "next";
import type { CollectionPage } from "schema-dts";
import { Breadcrumbs } from "@/components/site/breadcrumbs";
import { DoodleCluster } from "@/components/site/doodles";
import { JsonLd } from "@/components/site/json-ld";
import { ProgressBar } from "@/components/site/progress-bar";
import { SiteLinks } from "@/components/site/site-links";
import { themeCopy } from "@/content/theme-copy";
import { fill, formatInt } from "@/lib/format";
import { readLocale } from "@/lib/i18n";
import { breadcrumbNode, itemListNode, ldGraph, pageNode } from "@/lib/jsonld";
import { localePath } from "@/lib/routing";
import { pageMetadata } from "@/lib/seo";
import { absoluteUrl } from "@/lib/site";
import { loadPublic } from "@/lib/stats";
import { getThemes, themeCollected } from "@/lib/themes";

export const revalidate = 3600;
export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale, m } = await readLocale(params);
  return pageMetadata(locale, "/collections/themes", m.meta.themesTitle, m.meta.themesDescription);
}

export default async function ThemesHubPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale, m } = await readLocale(params);
  const snapshot = await loadPublic();
  const themes = getThemes().flatMap((theme) => {
    const copy = themeCopy(locale, theme.slug);
    return copy ? [{ theme, copy }] : [];
  });
  const crumbs = [
    { name: m.nav.home, href: localePath(locale, "/") },
    { name: m.nav.collections, href: localePath(locale, "/collections") },
    { name: m.themesPage.crumb, href: localePath(locale, "/collections/themes") },
  ];
  const list = itemListNode(
    localePath(locale, "/collections/themes"),
    m.meta.themesTitle,
    themes.map(({ theme, copy }) => ({
      name: copy.h1,
      url: absoluteUrl(localePath(locale, `/collections/themes/${theme.slug}`)),
    })),
  );
  const page = pageNode({
    kind: "CollectionPage",
    locale,
    path: "/collections/themes",
    name: m.meta.themesTitle,
    description: m.meta.themesDescription,
  }) as CollectionPage;
  Object.assign(page, { mainEntity: { "@id": String(list["@id"]) } });
  const graph = ldGraph([page, list, breadcrumbNode(crumbs)]);

  return (
    <>
      <JsonLd graph={graph} />
      <section className="page-head">
        <DoodleCluster />
        <Breadcrumbs label={m.nav.breadcrumbs} items={crumbs} />
        <p className="kicker">{m.themesPage.kicker}</p>
        <h1>{m.meta.themesTitle}</h1>
        <p className="lede">{m.collectionsPage.themesIntro}</p>
      </section>
      <p>{m.themesPage.disclaimer}</p>
      <p>
        {m.printChecklist.hubLead} <a href={localePath(locale, "/checklists")}>{m.printChecklist.hubLink}</a>.
      </p>
      <ul className="gen-list">
        {themes.map(({ theme, copy }) => {
          const collected = themeCollected(theme, snapshot.held);
          const progressLabel = fill(m.checklist.progress, {
            collected: formatInt(collected, locale),
            total: formatInt(theme.total, locale),
          });
          const line = fill(m.themesPage.hubLine, {
            total: formatInt(theme.total, locale),
            sets: formatInt(theme.setCount, locale),
          });
          return (
            <li key={theme.slug}>
              <a href={localePath(locale, `/collections/themes/${theme.slug}`)}>{copy.h1}</a>
              <ProgressBar value={collected} max={theme.total} label={`${copy.h1}: ${progressLabel}`} />
              <span className="count">
                {progressLabel}
                {" · "}
                {line}
              </span>
            </li>
          );
        })}
      </ul>
      <SiteLinks locale={locale} m={m} current="/collections/themes" />
    </>
  );
}
