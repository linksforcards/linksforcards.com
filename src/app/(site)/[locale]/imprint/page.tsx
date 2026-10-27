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
import { site } from "@/lib/site";

export const revalidate = 60;
export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale, m } = await readLocale(params);
  return pageMetadata(locale, "/imprint", m.meta.imprintTitle, m.meta.imprintDescription);
}

export default async function ImprintPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale, m } = await readLocale(params);
  const crumbs = [
    { name: m.nav.home, href: localePath(locale, "/") },
    { name: m.nav.imprint, href: localePath(locale, "/imprint") },
  ];
  const graph = ldGraph([
    pageNode({
      kind: "ContactPage",
      locale,
      path: "/imprint",
      name: m.meta.imprintTitle,
      description: m.meta.imprintDescription,
    }),
    breadcrumbNode(crumbs),
  ]);
  return (
    <>
      <JsonLd graph={graph} />
      <section className="page-head">
        <DoodleCluster />
        <Breadcrumbs label={m.nav.breadcrumbs} items={crumbs} />
        <h1>{m.imprint.h1}</h1>
      </section>
      <p>
        <EmailText text={m.imprint.p1} />
      </p>
      <dl className="imprint">
        <div>
          <dt>{m.imprint.responsible}</dt>
          <dd>{site.sender}</dd>
        </div>
        <div>
          <dt>{m.imprint.emailLabel}</dt>
          <dd>
            <a href={`mailto:${site.email}`}>{site.email}</a>
          </dd>
        </div>
        <div>
          <dt>{m.imprint.addressLabel}</dt>
          <dd>{site.postalAddress}</dd>
        </div>
      </dl>
      <p>{m.imprint.p2}</p>
      <p className="disclaimer">{m.footer.disclaimer}</p>
      <SiteLinks locale={locale} m={m} current="/imprint" />
    </>
  );
}
