import { cupLabel, flagFor, type CupEntry } from "@/lib/country-cup";
import { formatInt } from "@/lib/format";
import type { Locale } from "@/lib/locales";

export type CupCopy = {
  title: string;
  rules: string;
  empty: string;
  error: string;
  points: string;
  cards: string;
  binders: string;
};

export function CountryCup({
  locale,
  copy,
  rows,
  failed,
}: {
  locale: Locale;
  copy: CupCopy;
  rows: CupEntry[];
  failed: boolean;
}) {
  const visible = rows.filter((row) => cupLabel(row, locale));
  return (
    <section className="cup" aria-labelledby="country-cup-title">
      <h2 id="country-cup-title">{copy.title}</h2>
      <p>{copy.rules}</p>
      {failed ? (
        <p>{copy.error}</p>
      ) : visible.length === 0 ? (
        <p className="cup-empty">{copy.empty}</p>
      ) : (
        <ol className="cup-list">
          {visible.map((row, index) => {
            const name = cupLabel(row, locale);
            const flag = flagFor(row.code);
            return (
              <li key={row.key}>
                <span className="cup-rank">{formatInt(index + 1, locale)}</span>
                <span className="cup-flag" aria-hidden="true">
                  {flag}
                </span>
                <span className="cup-name">{name}</span>
                <span className="cup-points">
                  <span className="cup-points-value">{formatInt(row.points, locale)}</span>
                  <span className="cup-points-label">{copy.points}</span>
                </span>
                <span className="cup-meta">
                  <span>
                    {formatInt(row.cards, locale)} {copy.cards}
                  </span>
                  <span>
                    {formatInt(row.binders, locale)} {copy.binders}
                  </span>
                </span>
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}
