"use client";

import { usePathname } from "next/navigation";
import { BinderMark } from "@/components/site/doodles";
import { getMessages } from "@/lib/i18n";
import { LOCALES, type Locale } from "@/lib/locales";
import { localePath, stripLocale } from "@/lib/routing";
import { site } from "@/lib/site";

export function SiteHeader({ locale }: { locale: Locale }) {
  const m = getMessages(locale);
  const bare = stripLocale(usePathname() || "/");
  const items = [
    { href: "/binders", label: m.nav.binders },
    { href: "/partners", label: m.nav.partners },
    { href: "/updates", label: m.nav.updates },
    { href: "/donations", label: m.nav.donations },
  ];
  return (
    <header className="top">
      <a className="skip" href="#content">
        {m.nav.skip}
      </a>
      <div className="wrap top-bar">
        <a className="brand" href={localePath(locale, "/")}>
          <BinderMark className="brand-mark" />
          <span>
            <span className="brand-name">LinksForCards</span>
            <span className="brand-by">{site.sender}</span>
          </span>
        </a>
        <nav className="nav" aria-label={m.nav.primary}>
          {items.map((item) => {
            const on = bare === item.href || bare.startsWith(`${item.href}/`);
            return (
              <a key={item.href} href={localePath(locale, item.href)} aria-current={on ? "page" : undefined}>
                {item.label}
              </a>
            );
          })}
        </nav>
        <nav className="langs" aria-label={m.nav.language}>
          {LOCALES.map((item) => (
            <a
              key={item}
              href={localePath(item, bare)}
              hrefLang={item}
              lang={item === "no" ? "nb" : item}
              aria-current={item === locale ? "true" : undefined}
            >
              {getMessages(item).langName}
            </a>
          ))}
        </nav>
      </div>
    </header>
  );
}
