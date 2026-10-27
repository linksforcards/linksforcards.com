"use client";

import { usePathname } from "next/navigation";
import { BinderMark } from "@/components/site/doodles";
import { LanguageSwitcher } from "@/components/site/language-switcher";
import { getMessages } from "@/lib/i18n";
import type { Locale } from "@/lib/locales";
import { localePath, stripLocale } from "@/lib/routing";

export function SiteHeader({ locale }: { locale: Locale }) {
  const m = getMessages(locale);
  const bare = stripLocale(usePathname() || "/");
  const items = [
    { href: "/collections", label: m.nav.collections },
    { href: "/cards", label: m.nav.cards },
    { href: "/illustrators", label: m.nav.illustrators },
    { href: "/guides", label: m.nav.guides },
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
          <span className="brand-name">LinksForCards</span>
        </a>
        <nav className="nav" aria-label={m.nav.primary}>
          {items.map((item) => {
            const onPokedex = item.href === "/collections" && (bare === "/pokedex" || bare.startsWith("/pokedex/"));
            const on = onPokedex || bare === item.href || bare.startsWith(`${item.href}/`);
            return (
              <a key={item.href} href={localePath(locale, item.href)} aria-current={on ? "page" : undefined}>
                {item.label}
              </a>
            );
          })}
        </nav>
        <LanguageSwitcher locale={locale} label={m.nav.language} bare={bare} />
      </div>
    </header>
  );
}
