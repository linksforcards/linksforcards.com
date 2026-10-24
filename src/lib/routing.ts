import { isPrefixLocale, type Locale } from "./locales";

export function stripLocale(pathname: string): string {
  const parts = pathname.split("/").filter(Boolean);
  if (parts[0] === "en" || (parts[0] && isPrefixLocale(parts[0]))) parts.shift();
  const bare = `/${parts.join("/")}`;
  return bare === "/" ? "/" : bare.replace(/\/$/, "");
}

export function localePath(locale: Locale, pathname: string): string {
  const bare = stripLocale(pathname.startsWith("/") ? pathname : `/${pathname}`);
  if (locale === "en") return bare;
  return bare === "/" ? `/${locale}` : `/${locale}${bare}`;
}

const PASS_THROUGH = new Set(["/robots.txt", "/sitemap.xml", "/icon.svg", "/favicon.ico"]);

export type LocaleDecision =
  | { action: "next"; noindex: boolean }
  | { action: "redirect"; pathname: string }
  | { action: "rewrite"; pathname: string };

export function resolveLocaleRequest(pathname: string): LocaleDecision {
  if (pathname.startsWith("/admin")) return { action: "next", noindex: true };
  if (
    pathname.startsWith("/og/") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    PASS_THROUGH.has(pathname) ||
    pathname.includes(".")
  ) {
    return { action: "next", noindex: false };
  }
  if (pathname === "/en" || pathname.startsWith("/en/")) {
    const stripped = pathname.replace(/^\/en/, "") || "/";
    return { action: "redirect", pathname: stripped === "" ? "/" : stripped };
  }
  const first = pathname.split("/").filter(Boolean)[0] ?? "";
  if (isPrefixLocale(first)) return { action: "next", noindex: false };
  return { action: "rewrite", pathname: pathname === "/" ? "/en" : `/en${pathname}` };
}
