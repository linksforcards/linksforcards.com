import type { ReactNode } from "react";
import { localePath } from "@/lib/routing";
import type { Locale } from "@/lib/locales";

const TOKEN = /\[\[([^\]|]+)\|([^\]]+)\]\]/g;

export function RichText({ text, locale }: { text: string; locale: Locale }) {
  const nodes: ReactNode[] = [];
  let last = 0;
  for (const match of text.matchAll(TOKEN)) {
    const index = match.index ?? 0;
    if (index > last) nodes.push(text.slice(last, index));
    const label = match[1] ?? "";
    const target = match[2] ?? "";
    const href = target.startsWith("mailto:") || target.startsWith("#") ? target : localePath(locale, target);
    nodes.push(
      <a key={`${index}-${target}`} href={href}>
        {label}
      </a>,
    );
    last = index + match[0].length;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return <>{nodes}</>;
}
