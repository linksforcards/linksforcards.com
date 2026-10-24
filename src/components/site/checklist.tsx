"use client";

import { useMemo, useState } from "react";

type Row = { key: string; title: string; detail: string; have: boolean; image?: string | null };

export function Checklist({
  rows,
  labels,
}: {
  rows: Row[];
  labels: {
    filter: string;
    all: string;
    missing: string;
    have: string;
    search: string;
    empty: string;
    inBinder: string;
    stillMissing: string;
  };
}) {
  const [mode, setMode] = useState<"all" | "missing" | "have">("all");
  const [query, setQuery] = useState("");
  const needle = query.trim().toLowerCase();
  const visible = useMemo(
    () =>
      rows.filter((row) => {
        if (mode === "missing" && row.have) return false;
        if (mode === "have" && !row.have) return false;
        if (!needle) return true;
        return `${row.title} ${row.detail}`.toLowerCase().includes(needle);
      }),
    [rows, mode, needle],
  );

  return (
    <div>
      <div className="filters">
        <label className="search">
          <span>{labels.search}</span>
          <input value={query} onChange={(event) => setQuery(event.target.value)} />
        </label>
        <fieldset>
          <legend>{labels.filter}</legend>
          {(
            [
              ["all", labels.all],
              ["missing", labels.missing],
              ["have", labels.have],
            ] as const
          ).map(([value, label]) => (
            <label key={value}>
              <input type="radio" name="filter" checked={mode === value} onChange={() => setMode(value)} />
              {label}
            </label>
          ))}
        </fieldset>
      </div>
      {visible.length === 0 ? <p>{labels.empty}</p> : null}
      <ol className="checklist">
        {visible.map((row) => (
          <li key={row.key} className={row.have ? "have" : "miss"}>
            {row.image ? (
              // Reserved for a rights-cleared image. The catalog hook returns null for now.
              <img src={row.image} alt="" width={36} height={50} />
            ) : (
              <span className="slot" aria-hidden="true" />
            )}
            <span>
              <strong>{row.title}</strong>
              {row.detail ? <small>{row.detail}</small> : null}
            </span>
            <span className="state">{row.have ? labels.inBinder : labels.stillMissing}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
