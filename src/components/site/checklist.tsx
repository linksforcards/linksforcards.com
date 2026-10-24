"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { fill } from "@/lib/format";

const PAGE_SIZE = 48;

type Row = { key: string; title: string; detail: string; have: boolean; image?: string | null; alt?: string; href?: string };

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
    prev: string;
    next: string;
    page: string;
    pages: string;
    print: string;
  };
}) {
  const [mode, setMode] = useState<"all" | "missing" | "have">("all");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(0);
  const [printing, setPrinting] = useState(false);
  const hashApplied = useRef(false);
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
  const pageCount = Math.max(1, Math.ceil(visible.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount - 1);
  const slice = visible.slice(safePage * PAGE_SIZE, safePage * PAGE_SIZE + PAGE_SIZE);
  const shown = printing ? visible : slice;

  useEffect(() => {
    setPage(0);
  }, [mode, needle]);

  useEffect(() => {
    if (hashApplied.current) return;
    hashApplied.current = true;
    const hash = decodeURIComponent(window.location.hash.slice(1));
    if (!hash) return;
    const index = rows.findIndex((row) => `line-${row.key}` === hash);
    if (index < 0) return;
    setPage(Math.floor(index / PAGE_SIZE));
    const timer = window.setTimeout(() => document.getElementById(hash)?.scrollIntoView({ block: "center" }), 0);
    return () => window.clearTimeout(timer);
  }, [rows]);

  useEffect(() => {
    if (!printing) return;
    const done = () => setPrinting(false);
    window.addEventListener("afterprint", done);
    window.print();
    return () => window.removeEventListener("afterprint", done);
  }, [printing]);

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
        <button type="button" className="quiet" onClick={() => setPrinting(true)}>
          {labels.print}
        </button>
      </div>
      {visible.length === 0 ? <p>{labels.empty}</p> : null}
      <ol className="checklist" start={printing ? 1 : safePage * PAGE_SIZE + 1}>
        {shown.map((row) => (
          <li key={row.key} id={`line-${row.key}`} className={row.have ? "have" : "miss"}>
            {row.image ? (
              <Image src={row.image} alt={row.alt ?? ""} width={36} height={50} sizes="36px" />
            ) : (
              <span className="slot" aria-hidden="true" />
            )}
            <span>
              <strong>{row.href ? <a href={row.href}>{row.title}</a> : row.title}</strong>
              {row.detail ? <small>{row.detail}</small> : null}
            </span>
            <span className="state">{row.have ? labels.inBinder : labels.stillMissing}</span>
          </li>
        ))}
      </ol>
      {pageCount > 1 ? (
        <nav className="pager" aria-label={labels.pages}>
          <button type="button" onClick={() => setPage(safePage - 1)} disabled={safePage === 0}>
            {labels.prev}
          </button>
          <span>{fill(labels.page, { page: safePage + 1, pages: pageCount })}</span>
          <button type="button" onClick={() => setPage(safePage + 1)} disabled={safePage >= pageCount - 1}>
            {labels.next}
          </button>
        </nav>
      ) : null}
    </div>
  );
}
