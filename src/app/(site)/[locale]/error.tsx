"use client";

import { usePathname } from "next/navigation";
import { getMessages } from "@/lib/i18n";
import { isLocale, isPrefixLocale, type Locale } from "@/lib/locales";
import { localePath } from "@/lib/routing";

function localeFromPath(pathname: string): Locale {
  const first = pathname.split("/").filter(Boolean)[0] ?? "";
  if (first === "en") return "en";
  if (isPrefixLocale(first) && isLocale(first)) return first;
  return "en";
}

export default function LocaleError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const locale = localeFromPath(usePathname() || "/");
  const m = getMessages(locale);
  return (
    <>
      <h1>{m.home.progressError}</h1>
      <p>{m.notFound.body}</p>
      <p>
        <button type="button" onClick={() => reset()}>
          {m.notFound.home}
        </button>{" "}
        <a href={localePath(locale, "/")}>{m.nav.home}</a>
      </p>
    </>
  );
}
