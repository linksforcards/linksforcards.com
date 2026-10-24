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

function letterId(letter: string): string {
  return `dex-letter-${encodeURIComponent(letter)}`;
}

export function PokedexBrowser({
  entries,
  locale,
  labels,
}: {
  entries: Entry[];
  locale: Locale;
  labels: { search: string; placeholder: string; empty: string; letters: string };
}) {
  const [query, setQuery] = useState("");
  const needle = query.trim().toLowerCase();
  const groups = useMemo(() => {
    const grouped = new Map<string, Entry[]>();
    for (const entry of entries) {
      const letter = letterOf(entry.name, locale);
      const list = grouped.get(letter);
      if (list) list.push(entry);
      else grouped.set(letter, [entry]);
    }
    return [...grouped.entries()].map(([letter, items]) => ({ letter, items }));
  }, [entries, locale]);
  const matches = useMemo(() => {
    if (!needle) return [];
    const digits = needle.replace(/^#/, "").replace(/^0+/, "");
    const asDex = /^\d+$/.test(digits) ? Number(digits) : null;
    return entries.filter((entry) => entry.name.toLowerCase().includes(needle) || (asDex !== null && entry.dex === asDex));
  }, [entries, needle]);

  return (
    <div>
      <label className="search">
        <span>{labels.search}</span>
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={labels.placeholder} />
      </label>
      {needle ? (
        matches.length === 0 ? (
          <p>{labels.empty}</p>
        ) : (
          <ul className="dex-list">
            {matches.map((entry) => (
              <li key={entry.dex}>
                <a href={localePath(locale, `/pokedex/${entry.dex}`)}>
                  <span className="count">{formatDexNumber(entry.dex)}</span> {entry.name}
                </a>
              </li>
            ))}
          </ul>
        )
      ) : (
        <>
          <nav className="letters" aria-label={labels.letters}>
            {groups.map((group) => (
              <a key={group.letter} href={`#${letterId(group.letter)}`}>
                {group.letter}
              </a>
            ))}
          </nav>
          {groups.map((group) => (
            <section key={group.letter} id={letterId(group.letter)}>
              <h3>{group.letter}</h3>
              <ul className="dex-list">
                {group.items.map((entry) => (
                  <li key={entry.dex}>
                    <a href={localePath(locale, `/pokedex/${entry.dex}`)}>
                      <span className="count">{formatDexNumber(entry.dex)}</span> {entry.name}
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </>
      )}
    </div>
  );
}
