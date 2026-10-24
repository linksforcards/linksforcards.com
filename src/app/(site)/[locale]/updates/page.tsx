import type { Metadata } from "next";
import { PlainText } from "@/components/site/plain-text";
import { formatWhen } from "@/lib/format";
import { readLocale } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo";
import { site, substackHref } from "@/lib/site";
import { loadPublic } from "@/lib/stats";

export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale, m } = await readLocale(params);
  return pageMetadata(locale, "/updates", m.meta.updatesTitle, m.meta.updatesDescription);
}

export default async function UpdatesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale, m } = await readLocale(params);
  const snapshot = await loadPublic();
  const substack = substackHref();

  return (
    <>
      <p className="kicker">{m.updates.kicker}</p>
      <h1>{m.updates.h1}</h1>
      <p className="lede">{m.updates.intro}</p>
      <p>{m.updates.asWritten}</p>
      {substack ? (
        <p>
          {m.updates.substack}{" "}
          <a href={substack} rel="noopener noreferrer" target="_blank">
            {m.updates.substackLink}
          </a>
        </p>
      ) : null}
      {snapshot.updates.length === 0 ? (
        <p>{m.updates.empty}</p>
      ) : (
        <ul className="plain-list">
          {snapshot.updates.map((update) => (
            <li key={update.id} className="note">
              <h2>{update.title}</h2>
              <p className="muted">{formatWhen(update.publishedAt, locale)}</p>
              <PlainText text={update.body} />
            </li>
          ))}
        </ul>
      )}
      <p className="muted">{site.sender}</p>
    </>
  );
}
