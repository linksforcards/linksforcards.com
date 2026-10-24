import type { Metadata } from "next";
import { DoodleCluster } from "@/components/site/doodles";
import { EmailText } from "@/components/site/email-text";
import { ProgressBar } from "@/components/site/progress-bar";
import { ShopLink } from "@/components/site/shop-link";
import { getSet } from "@/lib/catalog";
import { fill, formatInt } from "@/lib/format";
import { GENERATIONS, SPECIES_TOTAL } from "@/lib/generations";
import { readLocale } from "@/lib/i18n";
import { LOCALES } from "@/lib/locales";
import { localePath } from "@/lib/routing";
import { pageMetadata } from "@/lib/seo";
import { absoluteUrl, site } from "@/lib/site";
import { shopsForLocale } from "@/lib/shop-locales";
import { loadPublic, speciesInRange, type PublicShop } from "@/lib/stats";

export const revalidate = 60;

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale, m } = await readLocale(params);
  return {
    ...pageMetadata(locale, "/", m.meta.homeTitle, m.meta.homeDescription),
    title: { absolute: m.meta.homeTitle },
  };
}

function shopLabels(shop: PublicShop, genLink: string): string[] {
  const labels = [...shop.generations]
    .sort((a, b) => a - b)
    .map((gen) => fill(genLink, { gen }));
  for (const setId of shop.setIds) labels.push(getSet(setId)?.name ?? setId);
  return labels;
}

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale, m } = await readLocale(params);
  const snapshot = await loadPublic();
  const zero = snapshot.differentCards === 0 && snapshot.copies === 0;
  const progress =
    snapshot.state === "error" ? m.home.progressError : zero ? m.home.progressZero : m.home.progressLive;
  const completed = snapshot.marks.filter((mark) => mark.status === "completed" || mark.status === "given_away").length;
  const given = snapshot.marks.filter((mark) => mark.status === "given_away").length;
  const recent = shopsForLocale(snapshot.shops, locale).slice(0, 4);
  const json = JSON.stringify({
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        name: site.name,
        url: absoluteUrl("/"),
        description: m.meta.homeDescription,
        inLanguage: [...LOCALES],
      },
      { "@type": "Person", name: site.sender, email: site.email, url: absoluteUrl("/") },
    ],
  }).replace(/</g, "\\u003c");

  const stats = [
    { key: "cards", label: m.home.statCards, value: formatInt(snapshot.differentCards, locale) },
    { key: "copies", label: m.home.statCopies, value: formatInt(snapshot.copies, locale) },
    {
      key: "species",
      label: m.home.statSpecies,
      value: `${formatInt(snapshot.species.length, locale)} / ${formatInt(SPECIES_TOTAL, locale)}`,
    },
    { key: "completed", label: m.home.statCompleted, value: formatInt(completed, locale) },
    { key: "given", label: m.home.statGiven, value: formatInt(given, locale) },
  ];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />
      <section className="hero">
        <DoodleCluster />
        <p className="kicker">{m.home.kicker}</p>
        <h1>{m.home.h1}</h1>
        <p className="lede">{m.home.p1}</p>
        <p>{m.home.p2}</p>
      </section>
      <div className="split">
        <section>
          <h2>{m.home.setTitle}</h2>
          <p>{m.home.setBody}</p>
        </section>
        <section>
          <h2>{m.home.genTitle}</h2>
          <p>{m.home.genBody}</p>
        </section>
      </div>
      <section className="note">
        <h2>{m.home.bulkTitle}</h2>
        <p>{m.home.bulkBody}</p>
      </section>
      <section>
        <h2>{m.home.progressTitle}</h2>
        <p>{progress}</p>
        <dl className="stats">
          {stats.map((stat) => (
            <div key={stat.key}>
              <dt>{stat.label}</dt>
              <dd>{stat.value}</dd>
            </div>
          ))}
        </dl>
        <h3>{m.home.genProgress}</h3>
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
      </section>
      <section>
        <h2>{m.home.thanksTitle}</h2>
        {recent.length === 0 ? (
          <p>{m.home.thanksEmpty}</p>
        ) : (
          <ul className="thanks">
            {recent.map((shop) => {
              const labels = shopLabels(shop, m.home.genLink);
              const shown = labels.slice(0, 6);
              const rest = labels.length - shown.length;
              return (
                <li key={shop.id}>
                  <ShopLink name={shop.name} website={shop.website} />
                  <span className="country">{shop.country}</span>
                  {shown.length ? (
                    <p>
                      <span className="muted">{m.home.helped} </span>
                      {shown.join(", ")}
                      {rest > 0 ? ` ${fill(m.home.andMore, { count: formatInt(rest, locale) })}` : ""}
                    </p>
                  ) : null}
                </li>
              );
            })}
          </ul>
        )}
        <p>
          <a href={localePath(locale, "/partners")}>{m.home.thanksAll}</a>
        </p>
      </section>
      <section className="shops">
        <h2>{m.home.shopsTitle}</h2>
        <p>
          <EmailText text={m.home.shopsP1} />
        </p>
        <p>{m.home.shopsP2}</p>
        <p>{m.home.shopsP3}</p>
        <p>
          <a className="button" href={`mailto:${site.email}`}>
            {m.home.email}
          </a>
        </p>
      </section>
    </>
  );
}
