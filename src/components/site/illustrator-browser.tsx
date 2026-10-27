"use client";

import { useMemo, useState } from "react";
import { intlLocale, type Locale } from "@/lib/locales";

type Entry = { name: string; href: string; countLabel: string };

function letterOf(name: string, locale: Locale): string {
  const char = Array.from(name)[0] ?? "#";
  if (!/\p{L}/u.test(char)) return "#";
  return char.toLocaleUpperCase(intlLocale(locale));
}

function letterId(letter: string): string {
  return `illustrator-letter-${encodeURIComponent(letter)}`;
}

export function IllustratorBrowser({
  entries,
  locale,
  labels,
}: {
  entries: Entry[];
  locale: Locale;
  labels: { search: string; placeholder: string; empty: string; letters: string };
}) {
  const [query, setQuery] = useState("");
  const needle = query.trim().toLocaleLowerCase(intlLocale(locale));
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
    return entries.filter((entry) => entry.name.toLocaleLowerCase(intlLocale(locale)).includes(needle));
  }, [entries, locale, needle]);

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
              <li key={entry.href}>
                <a href={entry.href}>
                  {entry.name} <span className="count">{entry.countLabel}</span>
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
              <h2>{group.letter}</h2>
              <ul className="dex-list">
                {group.items.map((entry) => (
                  <li key={entry.href}>
                    <a href={entry.href}>
                      {entry.name} <span className="count">{entry.countLabel}</span>
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
