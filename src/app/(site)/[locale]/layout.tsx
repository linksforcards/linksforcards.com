import type { Metadata } from "next";
import type { ReactNode } from "react";
import { SiteFooter } from "@/components/site/footer";
import { SiteHeader } from "@/components/site/header";
import { display, sans } from "@/lib/fonts";
import { readLocale } from "@/lib/i18n";
import { htmlLang, LOCALES } from "@/lib/locales";
import { site } from "@/lib/site";
import "@/styles/globals.css";

export const revalidate = 60;
export const dynamicParams = false;

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: site.name, template: `%s · ${site.name}` },
  applicationName: site.name,
  authors: [{ name: site.sender }],
  icons: { icon: "/icon.svg" },
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await readLocale(params);
  return (
    <html lang={htmlLang(locale)} className={`${display.variable} ${sans.variable}`}>
      <body>
        <SiteHeader locale={locale} />
        <main id="content" className="wrap">
          {children}
        </main>
        <SiteFooter locale={locale} />
      </body>
    </html>
  );
}
