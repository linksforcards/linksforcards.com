import type { Metadata } from "next";
import type { Blog } from "schema-dts";
import { Breadcrumbs } from "@/components/site/breadcrumbs";
import { DoodleCluster } from "@/components/site/doodles";
import { JsonLd } from "@/components/site/json-ld";
import { PlainText } from "@/components/site/plain-text";
import { SiteLinks } from "@/components/site/site-links";
import { formatWhen } from "@/lib/format";
import { readLocale } from "@/lib/i18n";
import { blogPostNodes, breadcrumbNode, ldGraph, pageNode } from "@/lib/jsonld";
import { localePath } from "@/lib/routing";
import { pageMetadata } from "@/lib/seo";
import { site, substackHref } from "@/lib/site";
import { loadPublic } from "@/lib/stats";

export const revalidate = 86400;
export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale, m } = await readLocale(params);
  return pageMetadata(locale, "/updates", m.meta.updatesTitle, m.meta.updatesDescription);
}

export default async function UpdatesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale, m } = await readLocale(params);
  const snapshot = await loadPublic();
  const substack = substackHref();
  const crumbs = [
    { name: m.nav.home, href: localePath(locale, "/") },
    { name: m.nav.updates, href: localePath(locale, "/updates") },
  ];
  const posts = blogPostNodes(localePath(locale, "/updates"), locale, snapshot.updates);
  const blog = pageNode({
    kind: "Blog",
    locale,
    path: "/updates",
    name: m.meta.updatesTitle,
    description: m.meta.updatesDescription,
  }) as Blog;
  if (posts.length) blog.blogPost = posts.map((post) => ({ "@id": String(post["@id"]) }));
  const graph = ldGraph([blog, ...posts, breadcrumbNode(crumbs)]);

  return (
    <>
      <JsonLd graph={graph} />
      <section className="page-head">
        <DoodleCluster />
        <Breadcrumbs label={m.nav.breadcrumbs} items={crumbs} />
        <p className="kicker">{m.updates.kicker}</p>
        <h1>{m.updates.h1}</h1>
        <p className="lede">{m.updates.intro}</p>
      </section>
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
            <li key={update.id} id={`update-${update.id}`} className="note">
              <h2>{update.title}</h2>
              <p className="muted">{formatWhen(update.publishedAt, locale)}</p>
              <PlainText text={update.body} />
            </li>
          ))}
        </ul>
      )}
      <p className="muted">{site.sender}</p>
      <SiteLinks locale={locale} m={m} current="/updates" />
    </>
  );
}
