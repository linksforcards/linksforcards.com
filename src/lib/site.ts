import { safeHttpUrl } from "./urls";

function publicEnv(name: string, fallback: string): string {
  const value = (process.env[name] || fallback).trim().replace(/\/$/, "");
  return value || fallback;
}

export const postalAddress = {
  line: "Magnus Schmidt, Kongensgade 13B, 1., 5000 Odense C, Denmark",
  streetAddress: "Kongensgade 13B, 1.",
  postalCode: "5000",
  addressLocality: "Odense C",
  addressCountry: "Denmark",
};

export const site = {
  name: "LinksForCards",
  sender: "Magnus Schmidt",
  email: "magnus@linksforcards.com",
  postalAddress: postalAddress.line,
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
