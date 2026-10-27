import type { CardLink, PrintingCard } from "@/lib/card-page";

function SetIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M7 3.5h11.5a2 2 0 0 1 2 2V19a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5.5a2 2 0 0 1 2-2z"
        fill="#fffdf8"
        stroke="#1b2430"
        strokeWidth="1.8"
      />
      <path d="M6.2 6.2v12.2" stroke="#6d8cff" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M10 8.2h7M10 12h5.5M10 15.8h7" stroke="#1b2430" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function GenerationIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="8" fill="#ffe08a" stroke="#1b2430" strokeWidth="1.8" />
      <path d="M12 8v8M8 12h8" stroke="#1b2430" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

function ThemeIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M12 3.2l1.8 5.6 5.8.4-4.5 3.8 1.5 5.7L12 15.6 7.4 18.7l1.5-5.7L4.4 9.2l5.8-.4z"
        fill="#ff8b6a"
        stroke="#1b2430"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function binderKind(href: string): "set" | "generation" | "theme" {
  if (href.includes("/collections/generation/")) return "generation";
  if (href.includes("/collections/themes/")) return "theme";
  return "set";
}

export function BinderChips({ labelledBy, links }: { labelledBy: string; links: CardLink[] }) {
  if (links.length === 0) return null;
  return (
    <nav aria-labelledby={labelledBy}>
      <ul className="binder-chips">
        {links.map((link) => {
          const kind = binderKind(link.href);
          return (
            <li key={link.href}>
              <a className={`chip-${kind}`} href={link.href}>
                {kind === "generation" ? <GenerationIcon /> : kind === "theme" ? <ThemeIcon /> : <SetIcon />}
                <span>{link.name}</span>
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export function PrintingGrid({
  labelledBy,
  cards,
  more,
}: {
  labelledBy: string;
  cards: PrintingCard[];
  more: { href: string; label: string } | null;
}) {
  if (cards.length === 0) return null;
  return (
    <nav aria-labelledby={labelledBy}>
      <ul className="printing-grid">
        {cards.map((card) => (
          <li key={card.href}>
            <a href={card.href}>
              <span className="printing-name">{card.name}</span>
              <span className="printing-number">{card.fraction}</span>
              <span className="printing-meta">{card.year ? `${card.setName} · ${card.year}` : card.setName}</span>
            </a>
          </li>
        ))}
      </ul>
      {more ? (
        <p className="printing-more">
          <a className="button quiet" href={more.href}>
            {more.label}
          </a>
        </p>
      ) : null}
    </nav>
  );
}

export function NeighborLinks({ labelledBy, links }: { labelledBy: string; links: CardLink[] }) {
  if (links.length === 0) return null;
  return (
    <nav aria-labelledby={labelledBy}>
      <ul className="neighbor-row">
        {links.map((link) => (
          <li key={link.href}>
            <a href={link.href}>{link.name}</a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
