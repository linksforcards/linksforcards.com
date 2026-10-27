export type DeltaReignCopy = {
  title: string;
  description: string;
  h1: string;
  lede: string;
  sections: { id: string; heading: string; paragraphs: string[] }[];
  checklistHeading: string;
  checklistWaiting: string;
  checklistReady: string;
  catalogLink: string;
  sourcesHeading: string;
  sourceLabels: {
    setPage: string;
    news: string;
    press: string;
    products: string;
    prerelease: string;
  };
};

export const DELTA_REIGN_SOURCES = [
  {
    key: "setPage" as const,
    href: "https://www.pokemon.com/us/pokemon-tcg/mega-evolution-delta-reign",
  },
  {
    key: "news" as const,
    href: "https://www.pokemon.com/us/news/the-pokemon-tcg-mega-evolution-delta-reign-expansion-arrives-november-6-2026",
  },
  {
    key: "press" as const,
    href: "https://press.pokemon.com/en/MEDIA-ALERT-New-Pokemon-Trading-Card-Game-Mega-EvolutionDelta-Reign-Ex",
  },
  {
    key: "products" as const,
    href: "https://www.pokemon.com/us/news/pokemon-tcg-mega-evolution-delta-reign-product-showcase",
  },
  {
    key: "prerelease" as const,
    href: "https://www.pokemon.com/us/news/play-at-a-pokemon-tcg-mega-evolution-delta-reign-prerelease-event",
  },
];
