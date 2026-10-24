"use client";

import { useMemo, useState } from "react";
import { formatDexNumber } from "@/lib/generations";
import { intlLocale, type Locale } from "@/lib/locales";
import { localePath } from "@/lib/routing";

type Entry = { dex: number; name: string };

function letterOf(name: string, locale: Locale): string {
  const char = Array.from(name)[0] ?? "#";
  return char.toLocaleUpperCase(intlLocale(locale));
}

export function PokedexBrowser({
  entries,
  locale,
  initialLetter,
  labels,
}: {
  entries: Entry[];
  locale: Locale;
  initialLetter: string;
  labels: { search: string; placeholder: string; empty: string; letters: string };
}) {
  const [letter, setLetter] = useState(initialLetter);
  const [query, setQuery] = useState("");
  const needle = query.trim().toLowerCase();
  const letters = useMemo(() => {
    const seen = new Set<string>();
    for (const entry of entries) seen.add(letterOf(entry.name, locale));
    return [...seen];
  }, [entries, locale]);
  const visible = useMemo(() => {
    if (!needle) return entries.filter((entry) => letterOf(entry.name, locale) === letter);
    const digits = needle.replace(/^#/, "").replace(/^0+/, "");
    const asDex = /^\d+$/.test(digits) ? Number(digits) : null;
    return entries.filter((entry) => entry.name.toLowerCase().includes(needle) || (asDex !== null && entry.dex === asDex));
  }, [entries, letter, locale, needle]);

  return (
    <div>
      <label className="search">
        <span>{labels.search}</span>
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={labels.placeholder} />
      </label>
      <div className="letters" role="group" aria-label={labels.letters}>
        {letters.map((item) => (
          <button key={item} type="button" aria-pressed={!needle && item === letter} onClick={() => setLetter(item)}>
            {item}
          </button>
        ))}
      </div>
      {visible.length === 0 ? <p>{labels.empty}</p> : null}
      <ul className="dex-list">
        {visible.map((entry) => (
          <li key={entry.dex}>
            <a href={localePath(locale, `/pokedex/${entry.dex}`)}>
              <span className="count">{formatDexNumber(entry.dex)}</span> {entry.name}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
