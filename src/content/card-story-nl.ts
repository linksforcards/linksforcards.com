import { keep, quoted, type CardFaq, type CardStory } from "./card-story-types";

function list(items: string[]): string {
  if (items.length <= 1) return items[0] ?? "";
  if (items.length === 2) return `${items[0]} en ${items[1]}`;
  return `${items.slice(0, -1).join(", ")} en ${items.at(-1)}`;
}

function size(s: CardStory): string {
  if (s.printed == null) return `Deze lijst telt ${s.countLabel} kaarten.`;
  if (s.printed === s.count) return `De gedrukte grootte is ${s.printed} en de lijst is even lang.`;
  return `De gedrukte grootte is ${s.printed}. De lijst is langer, met ${s.countLabel} kaarten.`;
}

function neighbors(s: CardStory): string {
  if (s.prev && s.next) return `Erop volgt ${s.next.number} ${s.next.name}. Ervoor staat ${s.prev.number} ${s.prev.name}.`;
  if (s.prev) return `De kaart ervoor is ${s.prev.number} ${s.prev.name}.`;
  if (s.next) return `De volgende kaart is ${s.next.number} ${s.next.name}.`;
  return "";
}

function setParagraph(s: CardStory): string {
  const dated = s.release ? `De set verscheen op ${s.release}.` : "";
  const rarity = s.rarity ? `De vermelde zeldzaamheid is ${s.rarity}.` : "";
  const secret = s.secret && s.printed ? `Het verzamelnummer ligt boven de gedrukte setgrootte van ${s.printed}.` : "";
  if (s.variant === 0) {
    return keep([
      `${s.fraction} is het nummer van ${s.name} in ${s.setName}.`,
      `Op deze lijst is dat plaats ${s.placeLabel} van ${s.countLabel}.`,
      neighbors(s),
      `De set hoort bij de serie ${s.series}.`,
      dated,
      size(s),
      secret,
      rarity,
    ]);
  }
  return keep([
    `${s.setName} hoort bij de serie ${s.series}.`,
    dated,
    size(s),
    `${s.name} staat erin als ${s.fraction}, op plaats ${s.placeLabel} van ${s.countLabel}.`,
    neighbors(s),
    secret,
    rarity,
  ]);
}

function evolution(s: CardStory): string {
  const bits: string[] = [];
  if (s.evolvesFrom) {
    bits.push(
      s.evolvesFromSpecies
        ? `Op de kaart staat dat deze evolueert uit ${s.evolvesFrom}. In deze catalogus is die naam ${s.evolvesFromSpecies.name} (${s.evolvesFromSpecies.dexLabel}).`
        : `Op de kaart staat dat deze evolueert uit ${s.evolvesFrom}.`,
    );
  }
  if (s.evolvesTo.length) {
    const names = s.evolvesTo.map((item) => (item.name && item.dexLabel ? `${item.printed}, ${item.name} (${item.dexLabel})` : item.printed));
    bits.push(`Bij evolueert naar staan ${list(names)}.`);
  }
  return bits.join(" ");
}

function kindParagraph(s: CardStory): string {
  if (s.kind === "t") {
    const sub = s.subtypes.length ? `De subtypen zijn ${list(s.subtypes)}.` : "";
    return keep([`${s.name} is een Trainerkaart.`, sub]);
  }
  if (s.kind === "e") {
    const sub = s.subtypes.length ? `De kaart staat vermeld als ${list(s.subtypes)}.` : "";
    return keep([`${s.name} is een Energiekaart.`, sub]);
  }
  if (s.kind !== "p") return `${s.name} staat in deze setlijst.`;
  const traits = [...s.subtypes, ...s.types].join(" ");
  const core =
    traits && s.hp
      ? `${s.name} is een ${traits}-Pokémon met ${s.hp} HP.`
      : traits
        ? `${s.name} is een ${traits}-Pokémon.`
        : s.hp
          ? `${s.name} is een Pokémon met ${s.hp} HP.`
          : `${s.name} is een Pokémon.`;
  const level = s.level ? `Het gedrukte level is ${s.level}.` : "";
  const species = s.species.length
    ? `In de Pokédex is dat ${list(s.species.map((item) => `${item.name} (${item.dexLabel}), generatie ${item.generation} (${item.region})`))}.`
    : "";
  return keep([s.variant === 1 ? species : "", core, level, s.variant === 0 ? species : "", evolution(s)]);
}

function artistParagraph(s: CardStory): string {
  if (!s.artist || s.artistOthersLabel == null) return "";
  if (s.artistOthers === 0) return `${s.artist} tekende ${s.name}. Geen andere kaart in de catalogus gebruikt die naam.`;
  if (s.variant === 0) return `${s.artist} tekende deze kaart. Dezelfde naam staat op ${s.artistOthersLabel} andere kaarten in de catalogus.`;
  return `Bij de illustrator staat ${s.artist}. Ik tel ${s.artistOthersLabel} andere kaarten met die illustrator.`;
}

function printParagraph(s: CardStory): string {
  const primary = s.species[0];
  if (!primary) return "";
  const extra = s.species
    .slice(1)
    .map((item) => `${item.name} (${item.dexLabel}) heeft ${item.totalLabel} kaarten in de catalogus.`)
    .join(" ");
  if (primary.others === 0) return keep([`Van ${primary.name} (${primary.dexLabel}) staat alleen deze kaart in de catalogus.`, extra]);
  const span =
    s.yearFrom && s.yearTo && s.yearFrom !== s.yearTo
      ? `De andere drukken met een datum lopen van ${s.yearFrom} tot ${s.yearTo}.`
      : s.yearFrom
        ? `De andere gedateerde drukken zijn uit ${s.yearFrom}.`
        : "";
  const bits = [
    `De catalogus heeft ${primary.othersLabel} andere kaarten van ${primary.name} (${primary.dexLabel}).`,
    `Die zitten in ${s.otherSets} ${s.otherSets === 1 ? "set" : "sets"}.`,
    span,
  ];
  if (s.earliest) {
    const when = s.earliest.year ? ` (${s.earliest.year})` : "";
    bits.push(`De vroegste andere kaart is ${s.earliest.name} ${s.earliest.fraction} in ${s.earliest.setName}${when}.`);
    if (s.earliest.name !== s.name) bits.push(`Die kaart heet ${s.earliest.name} en deze heet ${s.name}.`);
    if (s.hpCompare === "diff") bits.push(`Daar staan ${s.earliest.hp} HP en hier ${s.hp} HP.`);
    else if (s.hpCompare === "same") bits.push(`Beide vermelden ${s.hp} HP.`);
    if (s.rarityCompare === "diff") bits.push(`De zeldzaamheid daar is ${s.earliest.rarity} en hier is die ${s.rarity}.`);
    else if (s.rarityCompare === "same") bits.push(`Beide vermelden de zeldzaamheid ${s.rarity}.`);
    if (s.artistCompare === "diff") bits.push(`${s.earliest.artist} tekende die kaart en ${s.artist} tekende deze.`);
    if (s.regulationCompare === "diff") bits.push(`Het regulatieteken daar is ${s.earliest.regulation} en hier is het ${s.regulation}.`);
    if (s.retreatCompare === "diff") bits.push(`De terugtocht daar is ${s.earliest.retreat} en hier is die ${s.retreat}.`);
  }
  if (s.differentHp != null && s.differentHp > 0 && s.differentHpLabel) {
    bits.push(`${s.differentHpLabel} andere kaarten van ${primary.name} vermelden andere HP.`);
  }
  bits.push(extra);
  return keep(bits);
}

function playParagraph(s: CardStory): string {
  const bits: string[] = [];
  for (const ability of s.abilities) {
    const kind = ability.type ? ` als ${ability.type}` : "";
    bits.push(ability.text ? `${ability.name} staat op de kaart${kind}. ${ability.text}` : `${ability.name} staat op de kaart${kind}.`);
  }
  s.attacks.forEach((attack, index) => {
    const lead = index === 0 ? `De aanval ${attack.name}` : `${attack.name} is nog een aanval en`;
    const damage = attack.damage ? `noemt ${attack.damage} schade` : "noemt geen schadecijfer";
    const cost = attack.cost ? ` De kosten zijn ${attack.cost}.` : "";
    const text = attack.text ? ` ${attack.text}` : "";
    bits.push(`${lead} ${damage}.${cost}${text}`);
  });
  if (s.weaknesses.length) bits.push(`De zwakte is ${list(s.weaknesses)}.`);
  if (s.resistances.length) bits.push(`De weerstand is ${list(s.resistances)}.`);
  if (s.retreat != null) bits.push(`De terugtocht kost ${s.retreat}.`);
  for (const rule of s.rules) bits.push(`De kaarttekst luidt: ${rule}`);
  if (s.ancient) bits.push(`${s.ancient.name} is de oude eigenschap op deze kaart. ${s.ancient.text}`);
  if (s.flavor) bits.push(`De flavortekst luidt ${quoted("nl", s.flavor)}`);
  if (s.regulation) bits.push(`Het regulatieteken is ${s.regulation}.`);
  return keep(bits);
}

function binderParagraph(s: CardStory): string {
  const setLine =
    s.variant === 0
      ? `Een setbinder heeft elke kaart uit die set nodig. ${s.name} vult één plek in de ${s.setBinder}.`
      : `In de ${s.setBinder} hoort een volledige ${s.setName}. Deze kaart is daar één plek.`;
  const gen =
    s.genBinders.length && s.species.length
      ? `Een generatiebinder heeft één kaart van elke soort nodig. ${list(s.species.map((item) => item.name))} kan de plek in ${list(s.genBinders)} vullen.`
      : "";
  const themes = s.themes.length ? `Themalijsten die precies deze kaart bevatten zijn ${list(s.themes)}.` : "";
  return keep([setLine, gen, themes, s.statusLine]);
}

export function dutchStory(s: CardStory): string[] {
  const set = setParagraph(s);
  const kind = kindParagraph(s);
  const artist = artistParagraph(s);
  const print = printParagraph(s);
  const play = playParagraph(s);
  const binders = binderParagraph(s);
  const order = s.variant === 0 ? [artist, set, kind, print, play, binders] : [play, kind, set, print, artist, binders];
  return order.filter(Boolean);
}

export function dutchFaq(s: CardStory): CardFaq[] {
  const faqs: CardFaq[] = [
    {
      q: `Uit welke set komt ${s.name}?`,
      a: keep([
        `${s.setName}, uit de serie ${s.series}.`,
        s.release ? `Verschenen op ${s.release}.` : "",
        s.printed != null ? `De gedrukte grootte is ${s.printed}.` : `De lijst telt ${s.countLabel} kaarten.`,
      ]),
    },
    {
      q: "Wat is het verzamelnummer?",
      a: `${s.fraction}. Dat is plek ${s.placeLabel} van ${s.countLabel} in deze lijst.`,
    },
  ];
  if (s.artist && s.artistOthersLabel != null) {
    faqs.push({
      q: "Wie heeft de kaart geïllustreerd?",
      a:
        s.artistOthers === 0
          ? `${s.artist}. Geen andere kaart in de catalogus gebruikt die naam.`
          : `${s.artist}. De catalogus telt ${s.artistOthersLabel} andere kaarten met die illustrator.`,
    });
  }
  if (s.rarity) faqs.push({ q: "Welke zeldzaamheid staat vermeld?", a: `${s.rarity}.` });
  if (s.species.length) {
    faqs.push({
      q: "Welk Pokédexnummer gebruikt de kaart?",
      a: `${list(s.species.map((item) => `${item.name} ${item.dexLabel}, generatie ${item.generation} (${item.region})`))}.`,
    });
  }
  if (s.regulation) faqs.push({ q: "Welk regulatieteken is gedrukt?", a: `${s.regulation}.` });
  if (s.attacks.length) {
    faqs.push({
      q: "Welke aanvallen zijn gedrukt?",
      a: `${list(s.attacks.map((attack) => (attack.damage ? `${attack.name} (${attack.damage})` : attack.name)))}.`,
    });
  }
  return faqs;
}
