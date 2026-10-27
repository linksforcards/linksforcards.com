import { keep, quoted, type CardFaq, type CardStory } from "./card-story-types";

function list(items: string[]): string {
  if (items.length <= 1) return items[0] ?? "";
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(", ")}, and ${items.at(-1)}`;
}

function size(s: CardStory): string {
  if (s.printed == null) return `This checklist has ${s.countLabel} cards.`;
  if (s.printed === s.count) return `The printed size is ${s.printed}, and the checklist is the same length.`;
  return `The printed size is ${s.printed}. This checklist is longer, at ${s.countLabel} cards.`;
}

function neighbors(s: CardStory): string {
  if (s.prev && s.next) return `Before it is ${s.prev.number} ${s.prev.name}, and after it is ${s.next.number} ${s.next.name}.`;
  if (s.prev) return `The card before it is ${s.prev.number} ${s.prev.name}.`;
  if (s.next) return `The next card is ${s.next.number} ${s.next.name}.`;
  return "";
}

function secret(s: CardStory): string {
  return s.secret && s.printed ? `The collector number is above the printed set size of ${s.printed}.` : "";
}

function setParagraph(s: CardStory): string {
  const dated = s.release ? `It was released on ${s.release}.` : "";
  const rarity = s.rarity ? `The listed rarity is ${s.rarity}.` : "";
  if (s.variant === 0) {
    return keep([
      `${s.setName} is a set in the ${s.series} series.`,
      dated,
      size(s),
      `${s.name} is ${s.fraction}, in position ${s.placeLabel} of ${s.countLabel} on this checklist.`,
      neighbors(s),
      secret(s),
      rarity,
    ]);
  }
  return keep([
    `${s.name} sits at ${s.fraction} in ${s.setName}, position ${s.placeLabel} of ${s.countLabel}.`,
    neighbors(s),
    `The set belongs to the ${s.series} series.`,
    dated,
    size(s),
    secret(s),
    rarity,
  ]);
}

function kindParagraph(s: CardStory): string {
  if (s.kind === "t") {
    const sub = s.subtypes.length ? `The listed subtypes are ${list(s.subtypes)}.` : "";
    return keep([`${s.name} is a Trainer card.`, sub]);
  }
  if (s.kind === "e") {
    const sub = s.subtypes.length ? `It is listed as ${list(s.subtypes)}.` : "";
    return keep([`${s.name} is an Energy card.`, sub]);
  }
  if (s.kind !== "p") return `${s.name} is in this set list.`;
  const traits = [...s.subtypes, ...s.types].join(" ");
  const core =
    traits && s.hp
      ? `${s.name} is a ${traits} Pokémon with ${s.hp} HP.`
      : traits
        ? `${s.name} is a ${traits} Pokémon.`
        : s.hp
          ? `${s.name} is a Pokémon with ${s.hp} HP.`
          : `${s.name} is a Pokémon.`;
  const level = s.level ? `The card lists level ${s.level}.` : "";
  const species =
    s.species.length > 0
      ? `In the Pokédex this is ${list(s.species.map((item) => `${item.name} (${item.dexLabel}), generation ${item.generation} (${item.region})`))}.`
      : "";
  let evo = "";
  if (s.evolvesFrom) {
    evo = s.evolvesFromSpecies
      ? `The card says it evolves from ${s.evolvesFrom}. In this catalog that name is ${s.evolvesFromSpecies.name} (${s.evolvesFromSpecies.dexLabel}).`
      : `The card says it evolves from ${s.evolvesFrom}.`;
  }
  if (s.evolvesTo.length) {
    const names = s.evolvesTo.map((item) => (item.name && item.dexLabel ? `${item.printed}, ${item.name} (${item.dexLabel})` : item.printed));
    evo = `${evo} The card lists ${list(names)} under evolves to.`.trim();
  }
  if (s.variant === 1 && s.species[0]) {
    const lead = `${s.species[0].name} is Pokédex ${s.species[0].dexLabel}, generation ${s.species[0].generation} (${s.species[0].region}).`;
    const rest = s.species.slice(1);
    const more = rest.length
      ? `The card also lists ${list(rest.map((item) => `${item.name} (${item.dexLabel})`))}.`
      : "";
    return keep([lead, more, core, level, evo]);
  }
  return keep([core, level, species, evo]);
}

function artistParagraph(s: CardStory): string {
  if (!s.artist || s.artistOthersLabel == null) return "";
  if (s.artistOthers === 0) return `${s.artist} illustrated ${s.name}, and no other card in this catalog uses that name.`;
  if (s.variant === 0) return `${s.artist} illustrated this card. The same name is on ${s.artistOthersLabel} other cards in the catalog.`;
  return `The illustrator line reads ${s.artist}. I count ${s.artistOthersLabel} other cards in the catalog with that illustrator.`;
}

function printParagraph(s: CardStory): string {
  const primary = s.species[0];
  if (!primary) return "";
  const extra = s.species
    .slice(1)
    .map((item) => `${item.name} (${item.dexLabel}) has ${item.totalLabel} cards in the catalog.`)
    .join(" ");
  if (primary.others === 0) {
    return keep([`${primary.name} (${primary.dexLabel}) has this one card in the catalog.`, extra]);
  }
  const span =
    s.yearFrom && s.yearTo && s.yearFrom !== s.yearTo
      ? `The other printings with a release date run from ${s.yearFrom} to ${s.yearTo}.`
      : s.yearFrom
        ? `The other dated printings are from ${s.yearFrom}.`
        : "";
  const sets = `Those other cards are in ${s.otherSets} ${s.otherSets === 1 ? "set" : "sets"}.`;
  const bits = [
    `${primary.name} (${primary.dexLabel}) has ${primary.othersLabel} other cards in the catalog.`,
    sets,
    span,
  ];
  if (s.earliest) {
    const when = s.earliest.year ? ` (${s.earliest.year})` : "";
    bits.push(`The earliest other card is ${s.earliest.name} ${s.earliest.fraction} in ${s.earliest.setName}${when}.`);
    if (s.earliest.name !== s.name) bits.push(`That card is named ${s.earliest.name}, while this one is ${s.name}.`);
    if (s.hpCompare === "diff") bits.push(`That card lists ${s.earliest.hp} HP, and this one lists ${s.hp} HP.`);
    else if (s.hpCompare === "same") bits.push(`Both list ${s.hp} HP.`);
    if (s.rarityCompare === "diff") bits.push(`The rarity there is ${s.earliest.rarity}, and here it is ${s.rarity}.`);
    else if (s.rarityCompare === "same") bits.push(`Both list the rarity ${s.rarity}.`);
    if (s.artistCompare === "diff") bits.push(`${s.earliest.artist} illustrated that card, and ${s.artist} illustrated this one.`);
    if (s.regulationCompare === "diff") bits.push(`The regulation mark there is ${s.earliest.regulation}, and here it is ${s.regulation}.`);
    if (s.retreatCompare === "diff") bits.push(`Retreat cost there is ${s.earliest.retreat}, and here it is ${s.retreat}.`);
  }
  if (s.differentHp != null && s.differentHp > 0 && s.differentHpLabel) {
    bits.push(`${s.differentHpLabel} other cards of ${primary.name} list a different HP.`);
  }
  bits.push(extra);
  return keep(bits);
}

function playParagraph(s: CardStory): string {
  const bits: string[] = [];
  for (const ability of s.abilities) {
    const kind = ability.type ? ` listed as ${ability.type}` : "";
    bits.push(ability.text ? `${ability.name} is${kind}. ${ability.text}` : `${ability.name} is${kind}.`);
  }
  s.attacks.forEach((attack, index) => {
    const lead = index === 0 ? `The attack ${attack.name}` : `${attack.name} is another attack`;
    const damage = attack.damage ? `lists ${attack.damage} damage` : "lists no damage number";
    const cost = attack.cost ? ` The cost is ${attack.cost}.` : "";
    const text = attack.text ? ` ${attack.text}` : "";
    bits.push(`${lead} ${damage}.${cost}${text}`);
  });
  if (s.weaknesses.length) bits.push(`Weakness is ${list(s.weaknesses)}.`);
  if (s.resistances.length) bits.push(`Resistance is ${list(s.resistances)}.`);
  if (s.retreat != null) bits.push(`Retreat cost is ${s.retreat}.`);
  for (const rule of s.rules) bits.push(`The card text says: ${rule}`);
  if (s.ancient) bits.push(`${s.ancient.name} is the ancient trait on this card. ${s.ancient.text}`);
  if (s.flavor) bits.push(`The flavor text reads ${quoted("en", s.flavor)}`);
  if (s.regulation) bits.push(`The regulation mark is ${s.regulation}.`);
  return keep(bits);
}

function binderParagraph(s: CardStory): string {
  const setLine =
    s.variant === 0
      ? `I keep a set binder for ${s.setName}, meant to hold every card of that set. This card is one slot in the ${s.setBinder}.`
      : `${s.setBinder} is where a full ${s.setName} set goes. This card fills one slot there.`;
  const gen =
    s.genBinders.length && s.species.length
      ? `A generation binder holds one card of each species. ${list(s.species.map((item) => item.name))} can fill a slot in ${list(s.genBinders)}.`
      : "";
  const themes = s.themes.length ? `Themed lists that include this exact card are ${list(s.themes)}.` : "";
  return keep([setLine, gen, themes, s.statusLine]);
}

export function englishStory(s: CardStory): string[] {
  const parts = [setParagraph(s), kindParagraph(s), artistParagraph(s), printParagraph(s), playParagraph(s), binderParagraph(s)];
  if (s.variant === 1) return [kindParagraph(s), setParagraph(s), playParagraph(s), printParagraph(s), artistParagraph(s), binderParagraph(s)].filter(Boolean);
  return parts.filter(Boolean);
}

export function englishFaq(s: CardStory): CardFaq[] {
  const faqs: CardFaq[] = [
    {
      q: s.variant === 0 ? `Which set is ${s.name} from?` : `What set does ${s.name} belong to?`,
      a: keep([
        `${s.setName}, in the ${s.series} series.`,
        s.release ? `It was released on ${s.release}.` : "",
        s.printed != null ? `The printed size is ${s.printed}.` : `The checklist has ${s.countLabel} cards.`,
      ]),
    },
    {
      q: s.variant === 0 ? "What is the collector number?" : "Which number is printed on this card?",
      a: `${s.fraction}. It is entry ${s.placeLabel} of ${s.countLabel} in this checklist.`,
    },
  ];
  if (s.artist && s.artistOthersLabel != null) {
    faqs.push({
      q: "Who illustrated it?",
      a:
        s.artistOthers === 0
          ? `${s.artist}. No other card in the catalog uses that illustrator name.`
          : `${s.artist}. The catalog lists ${s.artistOthersLabel} other cards with that illustrator.`,
    });
  }
  if (s.rarity) faqs.push({ q: "What rarity is listed?", a: `${s.rarity}.` });
  if (s.species.length) {
    faqs.push({
      q: "What Pokédex number does the card use?",
      a: `${list(s.species.map((item) => `${item.name} ${item.dexLabel}, generation ${item.generation} (${item.region})`))}.`,
    });
  }
  if (s.regulation) faqs.push({ q: "What regulation mark is printed?", a: `${s.regulation}.` });
  if (s.attacks.length) {
    faqs.push({
      q: "Which attacks are printed?",
      a: `${list(s.attacks.map((attack) => (attack.damage ? `${attack.name} (${attack.damage})` : attack.name)))}.`,
    });
  }
  return faqs;
}
