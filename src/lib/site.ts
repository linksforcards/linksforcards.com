import { safeHttpUrl } from "./urls";

function publicEnv(name: string, fallback: string): string {
  const value = (process.env[name] || fallback).trim().replace(/\/$/, "");
  return value || fallback;
}

export const site = {
  name: "LinksForCards",
  sender: "Magnus Schmidt",
  email: "magnus@linksforcards.com",
  url: publicEnv("NEXT_PUBLIC_SITE_URL", "https://linksforcards.com"),
  substackUrl: publicEnv("NEXT_PUBLIC_SUBSTACK_URL", "https://linksforcards.substack.com"),
};

export function absoluteUrl(pathname: string): string {
  if (pathname === "/" || pathname === "") return site.url;
  return `${site.url}${pathname}`;
}

export function substackHref(): string | null {
  return safeHttpUrl(site.substackUrl);
}
