import { getMessages } from "@/lib/i18n";
import { htmlLang, LOCALES, primaryHreflang, type Locale } from "@/lib/locales";
import { localePath } from "@/lib/routing";

export function LanguageSwitcher({ locale, label, bare }: { locale: Locale; label: string; bare: string }) {
  const currentName = getMessages(locale).langName;

  return (
    <details className="lang-switch">
      <summary>
        <span className="visually-hidden">{label}: </span>
        {currentName}
        <svg className="caret" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
          <path d="M3 6l5 5 5-5" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </summary>
      <ul aria-label={label}>
        {LOCALES.map((item) => (
          <li key={item}>
            <a
              href={localePath(item, bare)}
              hrefLang={primaryHreflang(item)}
              lang={htmlLang(item)}
              aria-current={item === locale ? "true" : undefined}
            >
              {getMessages(item).langName}
            </a>
          </li>
        ))}
      </ul>
    </details>
  );
}
