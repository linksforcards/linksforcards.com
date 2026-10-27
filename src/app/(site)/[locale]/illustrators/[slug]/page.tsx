import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/site/breadcrumbs";
import { DoodleCluster } from "@/components/site/doodles";
import { JsonLd } from "@/components/site/json-ld";
import { SiteLinks } from "@/components/site/site-links";
import { numbersMatch } from "@/lib/cards";
import { readLocale } from "@/lib/i18n";
import { buildIllustratorView, illustratorPageGraph } from "@/lib/illustrator-page";
import { getIllustrator, type Illustrator } from "@/lib/illustrators";
import { localePath } from "@/lib/routing";
import { pageMetadata } from "@/lib/seo";
import { loadPublic, type PublicSnapshot } from "@/lib/stats";

/**
 * One page per illustrator, in every locale. Rendering them during `next build`
 * would multiply the Vercel build the same way the card pages would, so the
 * first request renders the page and then it is cached for a day.
 */
export const revalidate = 86400;
export const dynamicParams = true;

export function generateStaticParams(): { slug: string }[] {
  return [];
}

function loggedCount(artist: Illustrator, snapshot: PublicSnapshot): number | null {
  if (snapshot.state === "error") return null;
  let count = 0;
  for (const group of artist.groups) {
    const held = snapshot.held[group.setId] ?? [];
    for (const card of group.cards) {
      if (held.some((value) => numbersMatch(card.number, value))) count += 1;
    }
  }
  return count;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, m } = await readLocale(params);
  const { slug } = await params;
  const artist = getIllustrator(slug);
  if (!artist) return {};
  const snapshot = await loadPublic();
  const view = buildIllustratorView(locale, m, artist, loggedCount(artist, snapshot));
  return pageMetadata(locale, view.path, view.title, view.description, { index: view.indexed });
}

export default async function IllustratorPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, m } = await readLocale(params);
  const { slug } = await params;
  const artist = getIllustrator(slug);
  if (!artist) notFound();
  const snapshot = await loadPublic();
  const view = buildIllustratorView(locale, m, artist, loggedCount(artist, snapshot));

  return (
    <>
      <JsonLd graph={illustratorPageGraph(locale, view)} />
      <section className="page-head">
        <DoodleCluster />
        <Breadcrumbs label={m.nav.breadcrumbs} items={view.crumbs} />
        <p className="kicker">
          <a href={localePath(locale, "/illustrators")}>{m.illustratorsPage.kicker}</a>
        </p>
        <h1>{view.title}</h1>
      </section>
      <p className="lede">{view.paragraph}</p>
      <h2>{m.illustratorsPage.setsHeading}</h2>
      <nav aria-label={m.illustratorsPage.setsHeading}>
        <ul className="dex-list">
          {view.sets.map((set) => (
            <li key={set.href}>
              <a href={set.href}>{set.name}</a>
            </li>
          ))}
        </ul>
      </nav>
      <h2>{m.illustratorsPage.cardsHeading}</h2>
      {view.groups.map((group) => (
        <section key={group.id} id={group.id}>
          <h3>
            <a href={group.href}>{group.heading}</a>
          </h3>
          <ul className="dex-list">
            {group.cards.map((card) => (
              <li key={card.href}>
                <a href={card.href}>{card.name}</a>
              </li>
            ))}
          </ul>
        </section>
      ))}
      <SiteLinks locale={locale} m={m} current={view.path} />
    </>
  );
}
