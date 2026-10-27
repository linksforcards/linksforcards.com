import type { DeltaReignCopy } from "./types";

function spellUK(text: string): string {
  return text
    .replace(/\borganize\b/g, "organise")
    .replace(/\borganizing\b/g, "organising")
    .replace(/\borganized\b/g, "organised")
    .replace(/\btoward\b/g, "towards")
    .replace(/\blabeled\b/g, "labelled")
    .replace(/\bfavorite\b/g, "favourite");
}

function toUK(text: string): string {
  return text
    .split(/(\[\[[^\]|]+\|[^\]]+\]\])/)
    .map((part) => {
      const link = part.match(/^\[\[([^\]|]+)\|([^\]]+)\]\]$/);
      if (!link) return spellUK(part);
      return `[[${spellUK(link[1])}|${link[2]}]]`;
    })
    .join("");
}

const us: DeltaReignCopy = {
  title: "Mega Evolution—Delta Reign binder",
  description:
    "What Pokémon has published about Mega Evolution—Delta Reign, and the empty binder checklist I will fill when the card list exists.",
  h1: "Mega Evolution—Delta Reign",
  lede: "I am getting a binder ready for Mega Evolution—Delta Reign before the cards are in the public list I check against. My daughter is four, and she is the reason I came back to this table. She would point at the sky dragon. A binder for a child still needs the quiet cards around that one. This page is only what The Pokémon Company has published, plus the checklist I refuse to invent.",
  sections: [
    {
      id: "dates",
      heading: "The dates I can actually point at",
      paragraphs: [
        "The Pokémon Company International announced this expansion on {announced}. The press alert says it will be at participating retailers around the world beginning {retail}. That is the English retail date I am using. I am not splitting it into a separate US day and a UK day, because the alert gives one beginning.",
        "Pokémon TCG Live comes first, on {live}, for iOS, Android, macOS, and Windows. The same alert says players can battle with the new Mega Evolution Pokémon ex there, and that logging in comes with in-game bonuses. It does not say what the bonuses are, so I am not listing any.",
        "Prerelease events in the Play! Pokémon program begin {prerelease} at participating independent retailers. Pokémon.com's prerelease note, dated {prereleaseNote}, says select Play! Pokémon stores start selling the Build & Battle Box that day. I have not seen an official last day on the pages I used, so I am not writing one in. A shop listing an end date is that shop's event, not a date I will treat as the set's.",
      ],
    },
    {
      id: "cards",
      heading: "What the expansion is said to contain",
      paragraphs: [
        "Pokémon.com's set page says Mega Evolution—Delta Reign has over 135 cards, sits in the Mega Evolution series, and is legal in the Standard format. The set page and the news post from {announced} both say there are more than 20 Trainer cards and more than 35 Pokémon and Trainer cards with special illustrations. Over 135 is not a collector number I can check a binder against. Until a numbered list exists, I will keep saying over 135 and nothing sharper.",
        "The featured Pokémon ex are Mega Rayquaza ex, Mega Golurk ex, Mega Malamar ex, and Mega Golisopod ex. The press alert says Mega Rayquaza returns to the card game for the first time since [[XY—Ancient Origins|/collections/set/xy7]], and it calls Mega Rayquaza ex the Sky High Pokémon. The alert's own count of noteworthy cards is four Mega Evolution Pokémon ex, six Pokémon ex, six Stadium cards that make three Legendary Stadiums, 14 illustration rare Pokémon, 17 ultra rare Pokémon and Trainer cards, and six special illustration rare Pokémon and Supporter cards.",
        "A Legendary Stadium, as that alert describes it, is two Stadium cards played as a pair. Next to each other they form one extended artwork. A booster pack that contains a Legendary Stadium includes both halves. I have not seen the names of those Stadiums on the official pages, so I am not making names up. The mechanic is the part I can repeat.",
        "The prerelease note names four foil promo cards that can come in the Build & Battle Box: [[Masquerain|/pokedex/284]], [[Magmortar|/pokedex/467]], [[Enamorus|/pokedex/905]], and [[Kommo-o|/pokedex/784]]. Those are promos for that box. I am not claiming I know their numbers in the main set, because the main set has no public number list here yet.",
      ],
    },
    {
      id: "products",
      heading: "Products Pokémon has described",
      paragraphs: [
        "The product showcase on Pokémon.com is dated {showcase}, and it says the products below are available on {retail}. I am writing the contents, not a shop pitch. The press alert also says the expansion will be found in booster packs, Elite Trainer Boxes, and various collections. If a product is not in the showcase, I am not describing the box.",
        "A Booster Display Box holds 36 booster packs. Each pack contains 10 cards and one Basic Energy. A Booster Bundle holds six booster packs.",
        "An Elite Trainer Box holds nine booster packs, a full-art foil promo of [[Kyogre|/pokedex/382]], 65 card sleeves, 40 Energy cards, damage-counter dice, a coin-flip die, a plastic coin, a player's guide, and a box for the lot. The Pokémon Center Elite Trainer Box follows that list with 11 booster packs instead of nine, and two full-art Kyogre promos, one of them with a Pokémon Center logo.",
        "A Build & Battle Box holds a 40-card ready-to-play deck, one of the four foil promos, four booster packs from this expansion, and a code card for Pokémon TCG Live. Stores sell it at prerelease, and the showcase says it is more widely available after launch. In the prerelease format, players use that 40-card deck and four Prize cards, rather than a 60-card deck and six Prize cards.",
      ],
    },
    {
      id: "not-delta-species",
      heading: "This is not the old Delta Species list",
      paragraphs: [
        "The name is easy to tangle with [[Delta Species cards|/collections/themes/delta-species]]. Those are the older cards with a delta in the name, from a short run of sets, and I already keep them as one themed binder. Delta Reign is a Mega Evolution expansion. [[Mega Evolution|/collections/set/me1]] is the first set of this series in the public data. [[The series shelf|/collections/series/mega-evolution]] is where the later sets already sit. This one is not on that shelf yet, and I am not going to pretend a row is there.",
      ],
    },
    {
      id: "wishlist",
      heading: "What I would love for the binders",
      paragraphs: [
        "What I would love is the ordinary pile. Commons, uncommons, trainers, energies, duplicates, any language. [[Bulk|/guides/bulk-cards]] is the same idea I already use: the card that closes a line is the card I wanted, even when the poster is Mega Rayquaza ex. I am not asking for that Mega card in order to start.",
        "A spare from an older set can already do work. [[Rayquaza|/pokedex/384]] and [[Kyogre|/pokedex/382]] fill a slot in [[Generation 3|/collections/generation/3]]. [[Magmortar|/pokedex/467]] belongs in [[Generation 4|/collections/generation/4]]. [[Golurk|/pokedex/623]] belongs in [[Generation 5|/collections/generation/5]]. [[Malamar|/pokedex/687]] belongs in [[Generation 6|/collections/generation/6]]. [[Golisopod|/pokedex/768]] and [[Kommo-o|/pokedex/784]] belong in [[Generation 7|/collections/generation/7]]. [[Enamorus|/pokedex/905]] belongs in [[Generation 8|/collections/generation/8]]. One printing of each species is enough for those binders. The new art can wait.",
        "When the numbered list arrives, the set binder is a different job. [[How I collect in binders|/guides/collecting-binders]] is the rule I will use: every card on the list, in number order, nothing skipped because it looks plain. [[Sitting down with a child|/guides/collecting-with-a-child]] is how I would actually open the pile. She can choose a card. The pocket is still the number. If a shop later has bulk from this set, the note on [[passing a finished binder on|/guides/donating-cards]] is the conversation that already exists. I am not putting a value on any of these cards. The public pages do not say what one would sell for.",
      ],
    },
    {
      id: "unknown",
      heading: "What I am leaving out on purpose",
      paragraphs: [
        "No exact card count. No collector numbers. No drawing of a set symbol I have not held. No Japanese release date, because the pages I used are the English announcement. No last day for prerelease. No prices, and no guess about what a card would sell for. [[Sets in order|/guides/sets-in-order]] grows a row when the public data grows one. I will not insert a guessed count to make the timeline look finished.",
        "Pokémon.com files the product images for this expansion under me06. The open dataset I check against has been numbering this series me1, me2, and onward. When a set named Delta Reign shows up, or one of those ids, this page uses that card list. I am not treating me06 as a collector number, and I am not typing numbers in from memory to get there sooner.",
      ],
    },
  ],
  checklistHeading: "Binder checklist",
  checklistWaiting:
    "The public card list does not include Delta Reign yet, so there is nothing to check off. I would rather show an empty section than a column of invented numbers. When the list is in the data, the same checklist I use for every other set fills in here, in collector-number order, including the trainers and the energy.",
  checklistReady: "The public list now has {total} cards for {name}. I have {collected} of them logged. The lines below are that list.",
  catalogLink: "Open the numbered set page",
  sourcesHeading: "Where these facts come from",
  sourceLabels: {
    setPage: "Pokémon.com set page for Mega Evolution—Delta Reign",
    news: "Pokémon.com news, 20 August 2026",
    press: "The Pokémon Company International press alert, 20 August 2026",
    products: "Pokémon.com product showcase, 23 October 2026",
    prerelease: "Pokémon.com prerelease note, 28 September 2026",
  },
};

function localize(copy: DeltaReignCopy, fn: (text: string) => string): DeltaReignCopy {
  return {
    ...copy,
    title: fn(copy.title),
    description: fn(copy.description),
    h1: fn(copy.h1),
    lede: fn(copy.lede),
    sections: copy.sections.map((section) => ({
      ...section,
      heading: fn(section.heading),
      paragraphs: section.paragraphs.map(fn),
    })),
    checklistHeading: fn(copy.checklistHeading),
    checklistWaiting: fn(copy.checklistWaiting),
    checklistReady: fn(copy.checklistReady),
    catalogLink: fn(copy.catalogLink),
    sourcesHeading: fn(copy.sourcesHeading),
    sourceLabels: {
      setPage: fn(copy.sourceLabels.setPage),
      news: fn(copy.sourceLabels.news),
      press: fn(copy.sourceLabels.press),
      products: fn(copy.sourceLabels.products),
      prerelease: fn(copy.sourceLabels.prerelease),
    },
  };
}

export function englishDeltaReign(kind: "us" | "uk"): DeltaReignCopy {
  if (kind === "us") return us;
  return localize(us, toUK);
}
