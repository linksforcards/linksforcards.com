import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/site/breadcrumbs";
import { DoodleCluster } from "@/components/site/doodles";
import { EmailText } from "@/components/site/email-text";
import { JsonLd } from "@/components/site/json-ld";
import { SiteLinks } from "@/components/site/site-links";
import { readLocale } from "@/lib/i18n";
import { breadcrumbNode, ldGraph, pageNode } from "@/lib/jsonld";
import { localePath } from "@/lib/routing";
import { pageMetadata } from "@/lib/seo";

export const revalidate = 60;
export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale, m } = await readLocale(params);
  return pageMetadata(locale, "/privacy", m.meta.privacyTitle, m.meta.privacyDescription);
}

export default async function PrivacyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale, m } = await readLocale(params);
  const paragraphs = [m.privacy.p1, m.privacy.p2, m.privacy.p3, m.privacy.p4, m.privacy.p5, m.privacy.p6];
  const crumbs = [
    { name: m.nav.home, href: localePath(locale, "/") },
    { name: m.nav.privacy, href: localePath(locale, "/privacy") },
  ];
  const graph = ldGraph([
    pageNode({
      kind: "WebPage",
      locale,
      path: "/privacy",
      name: m.meta.privacyTitle,
      description: m.meta.privacyDescription,
    }),
    breadcrumbNode(crumbs),
  ]);
  return (
    <>
      <JsonLd graph={graph} />
      <section className="page-head">
        <DoodleCluster />
        <Breadcrumbs label={m.nav.breadcrumbs} items={crumbs} />
        <h1>{m.privacy.h1}</h1>
      </section>
      {paragraphs.map((paragraph) => (
        <p key={paragraph.slice(0, 24)}>
          <EmailText text={paragraph} />
        </p>
      ))}
      <p className="disclaimer">{m.footer.disclaimer}</p>
      <SiteLinks locale={locale} m={m} current="/privacy" />
    </>
  );
}
