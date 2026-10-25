export function ArticleDiagram({
  kind,
  title,
  description,
  caption,
}: {
  kind: "binders" | "pockets" | "card";
  title: string;
  description: string;
  caption: string;
}) {
  if (kind === "binders") return <BinderDiagram title={title} description={description} caption={caption} />;
  if (kind === "pockets") return <PocketDiagram title={title} description={description} caption={caption} />;
  return <CardDiagram title={title} description={description} caption={caption} />;
}

function BinderDiagram({ title, description, caption }: { title: string; description: string; caption: string }) {
  return (
    <figure className="diagram">
      <svg viewBox="0 0 640 220" role="img" aria-labelledby="binder-diagram-title binder-diagram-desc">
        <title id="binder-diagram-title">{title}</title>
        <desc id="binder-diagram-desc">{description}</desc>
        <rect x="16" y="24" width="280" height="176" rx="18" fill="#fffdf8" stroke="#1b2430" strokeWidth="4" />
        <rect x="344" y="24" width="280" height="176" rx="18" fill="#fffdf8" stroke="#1b2430" strokeWidth="4" />
        <text x="36" y="58" fill="#1b2430" fontSize="18" fontFamily="Quicksand, sans-serif">
          1, 2, 3…
        </text>
        {Array.from({ length: 6 }, (_, index) => (
          <rect key={`set-${index}`} x={36 + (index % 3) * 78} y={78 + Math.floor(index / 3) * 52} width="68" height="40" rx="6" fill="#d7f0ff" stroke="#1b2430" strokeWidth="3" />
        ))}
        <text x="364" y="58" fill="#1b2430" fontSize="18" fontFamily="Quicksand, sans-serif">
          #001, #002…
        </text>
        {Array.from({ length: 6 }, (_, index) => (
          <rect key={`dex-${index}`} x={364 + (index % 3) * 78} y={78 + Math.floor(index / 3) * 52} width="68" height="40" rx="6" fill="#ffe08a" stroke="#1b2430" strokeWidth="3" />
        ))}
      </svg>
      <figcaption>{caption}</figcaption>
    </figure>
  );
}

function PocketDiagram({ title, description, caption }: { title: string; description: string; caption: string }) {
  return (
    <figure className="diagram">
      <svg viewBox="0 0 640 240" role="img" aria-labelledby="pocket-diagram-title pocket-diagram-desc">
        <title id="pocket-diagram-title">{title}</title>
        <desc id="pocket-diagram-desc">{description}</desc>
        <rect x="24" y="20" width="250" height="200" rx="16" fill="#fffdf8" stroke="#1b2430" strokeWidth="4" />
        <rect x="366" y="20" width="250" height="200" rx="16" fill="#fffdf8" stroke="#1b2430" strokeWidth="4" />
        {Array.from({ length: 9 }, (_, index) => (
          <rect key={`nine-${index}`} x={44 + (index % 3) * 72} y={40 + Math.floor(index / 3) * 56} width="60" height="46" rx="4" fill="#b7f0d8" stroke="#1b2430" strokeWidth="3" />
        ))}
        {Array.from({ length: 4 }, (_, index) => (
          <rect key={`four-${index}`} x={390 + (index % 2) * 108} y={40 + Math.floor(index / 2) * 86} width="92" height="72" rx="6" fill="#ffd0c2" stroke="#1b2430" strokeWidth="3" />
        ))}
      </svg>
      <figcaption>{caption}</figcaption>
    </figure>
  );
}

function CardDiagram({ title, description, caption }: { title: string; description: string; caption: string }) {
  return (
    <figure className="diagram">
      <svg viewBox="0 0 640 280" role="img" aria-labelledby="card-diagram-title card-diagram-desc">
        <title id="card-diagram-title">{title}</title>
        <desc id="card-diagram-desc">{description}</desc>
        <rect x="210" y="16" width="220" height="248" rx="16" fill="#fffdf8" stroke="#1b2430" strokeWidth="4" />
        <rect x="228" y="28" width="120" height="10" rx="4" fill="#1b2430" />
        <rect x="228" y="48" width="184" height="96" rx="8" fill="#d7f0ff" stroke="#1b2430" strokeWidth="3" />
        <circle cx="390" cy="128" r="10" fill="#ffe08a" stroke="#1b2430" strokeWidth="3" />
        <text x="228" y="176" fill="#1b2430" fontSize="16" fontFamily="Nunito, sans-serif">
          4/102
        </text>
        <polygon points="248,214 254,230 272,230 258,242 264,260 248,248 232,260 238,242 224,230 242,230" fill="#ffe08a" stroke="#1b2430" strokeWidth="3" />
      </svg>
      <figcaption>{caption}</figcaption>
    </figure>
  );
}
