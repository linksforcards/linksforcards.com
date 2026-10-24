import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/site/breadcrumbs";
import { DoodleCluster } from "@/components/site/doodles";
import { EmailText } from "@/components/site/email-text";
import { JsonLd } from "@/components/site/json-ld";
import { RelatedLinks } from "@/components/site/related-links";
import { SiteLinks } from "@/components/site/site-links";
import { fill, formatDay } from "@/lib/format";
import { GUIDE_SLUGS, GUIDE_UPDATED, isGuideSlug } from "@/lib/guides";
import { readLocale, type Messages } from "@/lib/i18n";
import { breadcrumbNode, faqNode, ldGraph, pageNode, type FaqPair } from "@/lib/jsonld";
import { localePath } from "@/lib/routing";
import { pageMetadata } from "@/lib/seo";

export const revalidate = 3600;
export const dynamicParams = false;

type GuideCopy = Messages["guides"]["organize"];

function copyFor(m: Messages, slug: string): GuideCopy | null {
  if (slug === "organize-binder") return m.guides.organize;
  if (slug === "bulk-cards") return m.guides.bulk;
  if (slug === "donating-cards") return m.guides.donating;
  return null;
}

export function generateStaticParams() {
  return GUIDE_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, m } = await readLocale(params);
  const { slug } = await params;
  const copy = copyFor(m, slug);
  if (!copy || !isGuideSlug(slug)) return {};
  return pageMetadata(locale, `/guides/${slug}`, copy.title, copy.description);
}

export default async function GuidePage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, m } = await readLocale(params);
  const { slug } = await params;
  const copy = copyFor(m, slug);
  if (!copy || !isGuideSlug(slug)) notFound();
  const path = `/guides/${slug}`;
  const faqs: FaqPair[] = [
    { q: copy.faq1q, a: copy.faq1a },
    { q: copy.faq2q, a: copy.faq2a },
  ];
  const sections = [
    [copy.s1h, copy.s1],
    [copy.s2h, copy.s2],
    [copy.s3h, copy.s3],
  ] as const;
  const crumbs = [
    { name: m.nav.home, href: localePath(locale, "/") },
    { name: m.nav.guides, href: localePath(locale, "/guides") },
    { name: copy.h1, href: localePath(locale, path) },
  ];
  const page = pageNode({
    kind: "Article",
    locale,
    path,
    name: copy.h1,
    description: copy.description,
    datePublished: GUIDE_UPDATED,
    dateModified: GUIDE_UPDATED,
  });
  const graph = ldGraph([page, faqNode(localePath(locale, path), faqs), breadcrumbNode(crumbs)]);

  return (
    <>
      <JsonLd graph={graph} />
      <section className="page-head">
        <DoodleCluster />
        <Breadcrumbs label={m.nav.breadcrumbs} items={crumbs} />
        <p className="kicker">{m.guides.kicker}</p>
        <h1>{copy.h1}</h1>
        <p className="lede">
          <EmailText text={copy.lede} />
        </p>
      </section>
      <p>{fill(m.guides.updated, { date: formatDay(GUIDE_UPDATED, locale) })}</p>
      {sections.map(([heading, body]) => (
        <section key={heading}>
          <h2>{heading}</h2>
          <p>
            <EmailText text={body} />
          </p>
        </section>
      ))}
      <section className="faq">
        <h2>{m.home.faqTitle}</h2>
        {faqs.map((item) => (
          <div key={item.q}>
            <h3>{item.q}</h3>
            <p>
              <EmailText text={item.a} />
            </p>
          </div>
        ))}
      </section>
      <RelatedLinks
        label={m.nav.related}
        links={GUIDE_SLUGS.filter((item) => item !== slug).map((item) => ({
          href: localePath(locale, `/guides/${item}`),
          name: copyFor(m, item)?.title ?? item,
        }))}
      />
      <SiteLinks locale={locale} m={m} current={path} />
    </>
  );
}
