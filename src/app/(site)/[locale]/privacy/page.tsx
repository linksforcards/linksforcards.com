import type { Metadata } from "next";
import { EmailText } from "@/components/site/email-text";
import { readLocale } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo";

export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale, m } = await readLocale(params);
  return pageMetadata(locale, "/privacy", m.meta.privacyTitle, m.meta.privacyDescription);
}

export default async function PrivacyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { m } = await readLocale(params);
  const paragraphs = [m.privacy.p1, m.privacy.p2, m.privacy.p3, m.privacy.p4, m.privacy.p5, m.privacy.p6];
  return (
    <>
      <h1>{m.privacy.h1}</h1>
      {paragraphs.map((paragraph) => (
        <p key={paragraph.slice(0, 24)}>
          <EmailText text={paragraph} />
        </p>
      ))}
      <p className="disclaimer">{m.footer.disclaimer}</p>
    </>
  );
}
