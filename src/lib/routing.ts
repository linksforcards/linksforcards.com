import { isLocale } from "./locales";

export function stripLocale(pathname: string): string {
  const parts = pathname.split("/").filter(Boolean);
  if (parts[0] && isLocale(parts[0])) parts.shift();
  const bare = `/${parts.join("/")}`;
  return bare === "/" ? "/" : bare.replace(/\/$/, "");
}

export function localePath(locale: string, pathname: string): string {
  const bare = stripLocale(pathname.startsWith("/") ? pathname : `/${pathname}`);
  return bare === "/" ? `/${locale}` : `/${locale}${bare}`;
}

const PASS_THROUGH = new Set(["/robots.txt", "/sitemap.xml", "/icon.svg", "/favicon.ico"]);

const LEGACY_EXACT = new Set(["/partners", "/updates", "/donations", "/privacy", "/imprint"]);

export type LocaleDecision =
  | { action: "next"; noindex: boolean }
  | { action: "redirect"; pathname: string }
  | { action: "rewrite"; pathname: string };

function collectionFromBinders(pathname: string): string | null {
  if (pathname === "/binders") return "/collections";
  const generation = pathname.match(/^\/binders\/generation\/([1-9])$/);
  if (generation) return `/collections/generation/${generation[1]}`;
  const set = pathname.match(/^\/binders\/set\/([a-z0-9]+)$/);
  if (set) return `/collections/set/${set[1]}`;
  return null;
}

function isContentPath(pathname: string): boolean {
  if (pathname === "/collections" || pathname === "/guides") return true;
  if (/^\/collections\/(?:generation\/[1-9]|set\/[a-z0-9]+|series\/[a-z0-9-]+)$/.test(pathname)) return true;
  if (/^\/pokedex\/[1-9]\d*$/.test(pathname)) return true;
  if (/^\/guides\/[a-z0-9-]+$/.test(pathname)) return true;
  return false;
}

function legacyEnglish(pathname: string): string | null {
  const moved = collectionFromBinders(pathname);
  if (moved) return `/uk${moved}`;
  if (LEGACY_EXACT.has(pathname) || isContentPath(pathname)) return `/uk${pathname}`;
  return null;
}

function resolveCore(pathname: string): LocaleDecision {
  if (pathname.startsWith("/admin")) return { action: "next", noindex: true };
  if (
    pathname.startsWith("/og/") ||
    pathname.startsWith("/sitemap/") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    PASS_THROUGH.has(pathname) ||
    pathname.includes(".")
  ) {
    return { action: "next", noindex: false };
  }
  if (pathname === "/en") return { action: "redirect", pathname: "/" };
  if (pathname.startsWith("/en/")) {
    const rest = pathname.replace(/^\/en/, "") || "/";
    return { action: "redirect", pathname: legacyEnglish(rest) ?? `/uk${rest}` };
  }
  const parts = pathname.split("/").filter(Boolean);
  const first = parts[0] ?? "";
  if (isLocale(first)) {
    const rest = `/${parts.slice(1).join("/")}` || "/";
    const moved = collectionFromBinders(rest);
    if (moved) return { action: "redirect", pathname: `/${first}${moved}` };
    return { action: "next", noindex: false };
  }
  const legacy = legacyEnglish(pathname);
  if (legacy) return { action: "redirect", pathname: legacy };
  return { action: "next", noindex: false };
}

export function resolveLocaleRequest(pathname: string): LocaleDecision {
  const trimmed = pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;
  const decision = resolveCore(trimmed);
  if (decision.action === "redirect") return decision;
  if (trimmed !== pathname) return { action: "redirect", pathname: trimmed };
  return decision;
}
