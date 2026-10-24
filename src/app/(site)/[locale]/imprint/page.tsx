import type { Metadata } from "next";
import { DoodleCluster } from "@/components/site/doodles";
import { EmailText } from "@/components/site/email-text";
import { readLocale } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo";
import { site } from "@/lib/site";

export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale, m } = await readLocale(params);
  return pageMetadata(locale, "/imprint", m.meta.imprintTitle, m.meta.imprintDescription);
}

export default async function ImprintPage({ params }: { params: Promise<{ locale: string }> }) {
  const { m } = await readLocale(params);
  return (
    <>
      <section className="page-head">
        <DoodleCluster />
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
          <dd>{m.imprint.address}</dd>
        </div>
      </dl>
      <p>{m.imprint.p2}</p>
      <p className="disclaimer">{m.footer.disclaimer}</p>
    </>
  );
}
