import type { Metadata } from "next";
import type { CollectionPage } from "schema-dts";
import { Breadcrumbs } from "@/components/site/breadcrumbs";
import { DoodleCluster } from "@/components/site/doodles";
import { JsonLd } from "@/components/site/json-ld";
import { PokedexBrowser } from "@/components/site/pokedex-browser";
import { ProgressBar } from "@/components/site/progress-bar";
import { RelatedLinks } from "@/components/site/related-links";
import { SetBrowser } from "@/components/site/set-browser";
import { SiteLinks } from "@/components/site/site-links";
import { themeCopy } from "@/content/theme-copy";
import { getArticles } from "@/lib/articles";
import { getMeta, getSetCards, setsBySeries, speciesName, speciesNamesAreTranslated } from "@/lib/catalog";
import { fill, formatDay, formatInt } from "@/lib/format";
import { GENERATIONS, SPECIES_TOTAL } from "@/lib/generations";
import { readLocale } from "@/lib/i18n";
import { intlLocale } from "@/lib/locales";
import { breadcrumbNode, itemListNode, ldGraph, pageNode } from "@/lib/jsonld";
import { localePath } from "@/lib/routing";
import { pageMetadata } from "@/lib/seo";
import { seriesSlug } from "@/lib/series";
import { absoluteUrl } from "@/lib/site";
import { loadPublic, speciesInRange } from "@/lib/stats";
import { getThemes, themeCollected } from "@/lib/themes";

export const revalidate = 3600;
export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale, m } = await readLocale(params);
  return pageMetadata(locale, "/collections", m.meta.collectionsTitle, m.meta.collectionsDescription);
}

export default async function CollectionsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale, m } = await readLocale(params);
  const snapshot = await loadPublic();
  const meta = getMeta();
  const groups = setsBySeries().map((group) => ({
    series: group.series,
    slug: seriesSlug(group.series),
    sets: group.sets.map((set) => ({
      id: set.id,
      name: set.name,
      collected: snapshot.setCounts[set.id] ?? 0,
      count: getSetCards(set.id)?.length ?? set.count,
    })),
  }));
  const dexEntries = [];
  for (let dex = 1; dex <= SPECIES_TOTAL; dex += 1) dexEntries.push({ dex, name: speciesName(dex, locale) });
  dexEntries.sort((a, b) => a.name.localeCompare(b.name, intlLocale(locale), { sensitivity: "base" }) || a.dex - b.dex);
  const guides = getArticles(locale).map((article) => [article.slug, article.h1] as const);
  const crumbs = [
    { name: m.nav.home, href: localePath(locale, "/") },
    { name: m.nav.collections, href: localePath(locale, "/collections") },
  ];
  const themes = getThemes().flatMap((theme) => {
    const copy = themeCopy(locale, theme.slug);
    return copy ? [{ theme, copy }] : [];
  });
  const list = itemListNode(localePath(locale, "/collections"), m.meta.collectionsTitle, [
    ...themes.map(({ theme, copy }) => ({
      name: copy.h1,
      url: absoluteUrl(localePath(locale, `/collections/themes/${theme.slug}`)),
    })),
    ...GENERATIONS.map((generation) => ({
      name: `${fill(m.home.genLink, { gen: generation.id })} · ${m.regions[generation.id - 1]}`,
      url: absoluteUrl(localePath(locale, `/collections/generation/${generation.id}`)),
    })),
    ...groups.flatMap((group) =>
      group.sets.map((set) => ({
        name: set.name,
        url: absoluteUrl(localePath(locale, `/collections/set/${set.id}`)),
      })),
    ),
    ...guides.map(([slug, title]) => ({
      name: title,
      url: absoluteUrl(localePath(locale, `/guides/${slug}`)),
    })),
  ]);
  const page = pageNode({
    kind: "CollectionPage",
    locale,
    path: "/collections",
    name: m.meta.collectionsTitle,
    description: m.meta.collectionsDescription,
  }) as CollectionPage;
  Object.assign(page, { mainEntity: { "@id": String(list["@id"]) } });
  const graph = ldGraph([page, list, breadcrumbNode(crumbs)]);

  return (
    <>
      <JsonLd graph={graph} />
      <section className="page-head">
        <DoodleCluster />
        <Breadcrumbs label={m.nav.breadcrumbs} items={crumbs} />
        <p className="kicker">{m.collectionsPage.kicker}</p>
        <h1>{m.meta.collectionsTitle}</h1>
        <p className="lede">{m.collectionsPage.intro}</p>
      </section>
      <p>{m.bindersPage.anyLanguage}</p>
      <p>
        {speciesNamesAreTranslated(locale)
          ? fill(m.bindersPage.speciesLocal, { language: m.langName })
          : m.bindersPage.speciesEnglish}
      </p>
      <p>{fill(m.bindersPage.checklistSource, { date: formatDay(meta.builtAt, locale) })}</p>
      {meta.maxDexSeen > 1025 ? <p>{m.bindersPage.aboveDex}</p> : null}
      <h2>{m.collectionsPage.generations}</h2>
      <ul className="gen-list">
        {GENERATIONS.map((generation) => {
          const collected = speciesInRange(snapshot.species, generation.start, generation.end);
          const total = generation.end - generation.start + 1;
          const label = `${fill(m.home.genLink, { gen: generation.id })} · ${m.regions[generation.id - 1]}`;
          const progressLabel = fill(m.checklist.progress, {
            collected: formatInt(collected, locale),
            total: formatInt(total, locale),
          });
          return (
            <li key={generation.id}>
              <a href={localePath(locale, `/collections/generation/${generation.id}`)}>{label}</a>
              <ProgressBar value={collected} max={total} label={`${label}: ${progressLabel}`} />
              <span className="count">{progressLabel}</span>
            </li>
          );
        })}
      </ul>
      <h2>{m.collectionsPage.themes}</h2>
      <p>
        {m.collectionsPage.themesIntro} <a href={localePath(locale, "/collections/themes")}>{m.home.themeHub}</a>
      </p>
      <ul className="gen-list">
        {themes.map(({ theme, copy }) => {
          const collected = themeCollected(theme, snapshot.held);
          const progressLabel = fill(m.checklist.progress, {
            collected: formatInt(collected, locale),
            total: formatInt(theme.total, locale),
          });
          return (
            <li key={theme.slug}>
              <a href={localePath(locale, `/collections/themes/${theme.slug}`)}>{copy.h1}</a>
              <ProgressBar value={collected} max={theme.total} label={`${copy.h1}: ${progressLabel}`} />
              <span className="count">{progressLabel}</span>
            </li>
          );
        })}
      </ul>
      <h2>{m.collectionsPage.sets}</h2>
      <SetBrowser
        groups={groups}
        locale={locale}
        labels={{
          search: m.bindersPage.searchSets,
          placeholder: m.bindersPage.searchPlaceholder,
          empty: m.bindersPage.noSets,
          progress: m.checklist.progress,
        }}
      />
      <h2>{m.collectionsPage.pokedex}</h2>
      <p>{m.collectionsPage.pokedexIntro}</p>
      <PokedexBrowser
        entries={dexEntries}
        locale={locale}
        labels={{
          search: m.collectionsPage.searchPokedex,
          placeholder: m.collectionsPage.searchPlaceholder,
          empty: m.collectionsPage.noPokemon,
          letters: m.collectionsPage.letters,
        }}
      />
      <h2>{m.collectionsPage.guides}</h2>
      <RelatedLinks
        label={m.nav.related}
        links={guides.map(([slug, title]) => ({
          href: localePath(locale, `/guides/${slug}`),
          name: title,
        }))}
      />
      <SiteLinks locale={locale} m={m} current="/collections" />
    </>
  );
}
