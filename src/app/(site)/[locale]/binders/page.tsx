import type { Metadata } from "next";
import { DoodleCluster } from "@/components/site/doodles";
import { ProgressBar } from "@/components/site/progress-bar";
import { SetBrowser } from "@/components/site/set-browser";
import { getMeta, getSetCards, setsBySeries, speciesNamesAreTranslated } from "@/lib/catalog";
import { fill, formatDay, formatInt } from "@/lib/format";
import { GENERATIONS } from "@/lib/generations";
import { readLocale } from "@/lib/i18n";
import { localePath } from "@/lib/routing";
import { pageMetadata } from "@/lib/seo";
import { loadPublic, speciesInRange } from "@/lib/stats";

export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale, m } = await readLocale(params);
  return pageMetadata(locale, "/binders", m.meta.bindersTitle, m.meta.bindersDescription);
}

export default async function BindersPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale, m } = await readLocale(params);
  const snapshot = await loadPublic();
  const meta = getMeta();
  const groups = setsBySeries().map((group) => ({
    series: group.series,
    sets: group.sets.map((set) => ({
      id: set.id,
      name: set.name,
      collected: snapshot.setCounts[set.id] ?? 0,
      count: getSetCards(set.id)?.length ?? set.count,
    })),
  }));

  return (
    <>
      <section className="page-head">
        <DoodleCluster />
        <p className="kicker">{m.bindersPage.kicker}</p>
        <h1>{m.bindersPage.h1}</h1>
        <p className="lede">{m.bindersPage.intro}</p>
      </section>
      <p>{m.bindersPage.anyLanguage}</p>
      <p>
        {speciesNamesAreTranslated(locale)
          ? fill(m.bindersPage.speciesLocal, { language: m.langName })
          : m.bindersPage.speciesEnglish}
      </p>
      <p>{fill(m.bindersPage.checklistSource, { date: formatDay(meta.builtAt, locale) })}</p>
      {meta.maxDexSeen > 1025 ? <p>{m.bindersPage.aboveDex}</p> : null}
      <h2>{m.bindersPage.generations}</h2>
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
              <a href={localePath(locale, `/binders/generation/${generation.id}`)}>{label}</a>
              <ProgressBar value={collected} max={total} label={`${label}: ${progressLabel}`} />
              <span className="count">{progressLabel}</span>
            </li>
          );
        })}
      </ul>
      <h2>{m.bindersPage.sets}</h2>
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
    </>
  );
}
