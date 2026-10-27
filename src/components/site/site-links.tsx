import type { Messages } from "@/lib/i18n";
import type { Locale } from "@/lib/locales";
import { localePath } from "@/lib/routing";

export function SiteLinks({ locale, m, current }: { locale: Locale; m: Messages; current: string }) {
  const items = [
    ["/", m.nav.home],
    ["/collections", m.nav.collections],
    ["/cards", m.nav.cards],
    ["/illustrators", m.nav.illustrators],
    ["/guides", m.nav.guides],
    ["/partners", m.nav.partners],
    ["/updates", m.nav.updates],
    ["/donations", m.nav.donations],
  ] as const;
  return (
    <nav className="related" aria-label={m.nav.primary}>
      <ul>
        {items
          .filter(([href]) => href !== current)
          .map(([href, label]) => (
            <li key={href}>
              <a href={localePath(locale, href)}>{label}</a>
            </li>
          ))}
      </ul>
    </nav>
  );
}
