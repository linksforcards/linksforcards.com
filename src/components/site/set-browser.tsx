"use client";

import { useMemo, useState } from "react";
import { fill, formatInt } from "@/lib/format";
import type { Locale } from "@/lib/locales";
import { localePath } from "@/lib/routing";
import { ProgressBar } from "./progress-bar";

type Group = {
  series: string;
  slug: string;
  sets: { id: string; name: string; collected: number; count: number }[];
};

export function SetBrowser({
  groups,
  locale,
  labels,
}: {
  groups: Group[];
  locale: Locale;
  labels: { search: string; placeholder: string; empty: string; progress: string };
}) {
  const [query, setQuery] = useState("");
  const needle = query.trim().toLowerCase();
  const visible = useMemo(
    () =>
      groups
        .map((group) => ({
          ...group,
          sets: group.sets.filter((set) => !needle || `${set.name} ${group.series}`.toLowerCase().includes(needle)),
        }))
        .filter((group) => group.sets.length > 0),
    [groups, needle],
  );

  return (
    <div>
      <label className="search">
        <span>{labels.search}</span>
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={labels.placeholder} />
      </label>
      {visible.length === 0 ? <p>{labels.empty}</p> : null}
      {visible.map((group) => (
        <section key={group.series} className="series">
          <h3>
            <a href={localePath(locale, `/collections/series/${group.slug}`)}>{group.series}</a>
          </h3>
          <ul className="set-list">
            {group.sets.map((set) => {
              const label = fill(labels.progress, {
                collected: formatInt(set.collected, locale),
                total: formatInt(set.count, locale),
              });
              return (
                <li key={set.id}>
                  <a href={localePath(locale, `/collections/set/${set.id}`)}>{set.name}</a>
                  <ProgressBar value={set.collected} max={set.count} label={`${set.name}: ${label}`} />
                  <span className="count">{label}</span>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}
