"use client";

import { useEffect, useId, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from "react";
import { usePathname } from "next/navigation";
import { getMessages } from "@/lib/i18n";
import { htmlLang, LOCALES, primaryHreflang, type Locale } from "@/lib/locales";
import { localePath, stripLocale } from "@/lib/routing";

export function LanguageSwitcher({ locale, label }: { locale: Locale; label: string }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname() || "/";
  const bare = stripLocale(pathname);
  const menuId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLUListElement>(null);
  const currentName = getMessages(locale).langName;

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const menu = menuRef.current;
    const current = menu?.querySelector<HTMLAnchorElement>("[aria-current='true']") ?? menu?.querySelector("a");
    current?.focus();

    function onPointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      event.preventDefault();
      setOpen(false);
      buttonRef.current?.focus();
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  function onMenuKeyDown(event: ReactKeyboardEvent<HTMLUListElement>) {
    const links = [...event.currentTarget.querySelectorAll("a")];
    const index = links.findIndex((link) => link === document.activeElement);
    if (event.key === "ArrowDown") {
      event.preventDefault();
      links[(index + 1) % links.length]?.focus();
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      links[(index - 1 + links.length) % links.length]?.focus();
    } else if (event.key === "Home") {
      event.preventDefault();
      links[0]?.focus();
    } else if (event.key === "End") {
      event.preventDefault();
      links[links.length - 1]?.focus();
    } else if (event.key === "Tab") {
      setOpen(false);
    }
  }

  return (
    <div className="lang-switch" ref={rootRef}>
      <button
        ref={buttonRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((value) => !value)}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown" || event.key === "ArrowUp") {
            event.preventDefault();
            setOpen(true);
          }
        }}
      >
        <span className="visually-hidden">{label}: </span>
        {currentName}
        <svg className="caret" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
          <path d="M3 6l5 5 5-5" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      <ul
        ref={menuRef}
        id={menuId}
        role="menu"
        aria-label={label}
        hidden={!open}
        onKeyDown={onMenuKeyDown}
      >
        {LOCALES.map((item) => (
          <li key={item} role="none">
            <a
              role="menuitem"
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
      <noscript>
        <ul className="lang-fallback">
          {LOCALES.map((item) => (
            <li key={item}>
              <a href={localePath(item, bare)} hrefLang={primaryHreflang(item)} lang={htmlLang(item)}>
                {getMessages(item).langName}
              </a>
            </li>
          ))}
        </ul>
      </noscript>
    </div>
  );
}
