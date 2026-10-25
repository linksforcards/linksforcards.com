"use client";

import { usePathname } from "next/navigation";
import { getMessages } from "@/lib/i18n";
import { isLocale, isPrefixLocale, type Locale } from "@/lib/locales";
import { localePath } from "@/lib/routing";

function localeFromPath(pathname: string): Locale {
  const first = pathname.split("/").filter(Boolean)[0] ?? "";
  if (isPrefixLocale(first) && isLocale(first)) return first;
  return "us";
}

export default function LocaleNotFound() {
  const locale = localeFromPath(usePathname() || "/");
  const m = getMessages(locale);
  return (
    <>
      <h1>{m.notFound.h1}</h1>
      <p>{m.notFound.body}</p>
      <p>
        <a href={localePath(locale, "/")}>{m.notFound.home}</a>
      </p>
    </>
  );
}
