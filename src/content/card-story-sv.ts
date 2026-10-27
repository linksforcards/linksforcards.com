import { keep, quoted, type CardFaq, type CardStory } from "./card-story-types";

function list(items: string[]): string {
  if (items.length <= 1) return items[0] ?? "";
  if (items.length === 2) return `${items[0]} och ${items[1]}`;
  return `${items.slice(0, -1).join(", ")} och ${items.at(-1)}`;
}

function size(s: CardStory): string {
  if (s.printed == null) return `Den här listan har ${s.countLabel} kort.`;
  if (s.printed === s.count) return `Den tryckta storleken är ${s.printed} och listan är lika lång.`;
  return `Den tryckta storleken är ${s.printed}. Listan är längre, med ${s.countLabel} kort.`;
}

function neighbors(s: CardStory): string {
  if (s.prev && s.next) return `Kortet före är ${s.prev.number} ${s.prev.name}. Kortet efter är ${s.next.number} ${s.next.name}.`;
  if (s.prev) return `Kortet före är ${s.prev.number} ${s.prev.name}.`;
  if (s.next) return `Nästa kort är ${s.next.number} ${s.next.name}.`;
  return "";
}

function setParagraph(s: CardStory): string {
  const dated = s.release ? `${s.setName} kom ${s.release}.` : "";
  const rarity = s.rarity ? `Sällsyntheten som står på kortet är ${s.rarity}.` : "";
  const secret = s.secret && s.printed ? `Samlingsnumret ligger över den tryckta setstorleken ${s.printed}.` : "";
  if (s.variant === 0) {
    return keep([
      dated || `${s.setName} ingår i serien ${s.series}.`,
      dated ? `Serien är ${s.series}.` : "",
      size(s),
      `${s.name} har numret ${s.fraction} och står på plats ${s.placeLabel} av ${s.countLabel} i den här listan.`,
      neighbors(s),
      secret,
      rarity,
    ]);
  }
  return keep([
    `Plats ${s.placeLabel} av ${s.countLabel} i ${s.setName} är ${s.name}, ${s.fraction}.`,
    neighbors(s),
    `Setet hör till serien ${s.series}.`,
    s.release ? `Utgivningsdagen är ${s.release}.` : "",
    size(s),
    secret,
    rarity,
  ]);
}

function evolution(s: CardStory): string {
  const bits: string[] = [];
  if (s.evolvesFrom) {
    bits.push(
      s.evolvesFromSpecies
        ? `Kortet säger att det utvecklas från ${s.evolvesFrom}. I katalogen är det namnet ${s.evolvesFromSpecies.name} (${s.evolvesFromSpecies.dexLabel}).`
        : `Kortet säger att det utvecklas från ${s.evolvesFrom}.`,
    );
  }
  if (s.evolvesTo.length) {
    const names = s.evolvesTo.map((item) => (item.name && item.dexLabel ? `${item.printed}, ${item.name} (${item.dexLabel})` : item.printed));
    bits.push(`Under utvecklas till står ${list(names)}.`);
  }
  return bits.join(" ");
}

function kindParagraph(s: CardStory): string {
  if (s.kind === "t") {
    const sub = s.subtypes.length ? `Undertypen som anges är ${list(s.subtypes)}.` : "";
    return keep([`${s.name} är ett tränarkort.`, sub]);
  }
  if (s.kind === "e") {
    const sub = s.subtypes.length ? `Det är listat som ${list(s.subtypes)}.` : "";
    return keep([`${s.name} är ett energikort.`, sub]);
  }
  if (s.kind !== "p") return `${s.name} finns i den här setlistan.`;
  const traits = [...s.subtypes, ...s.types].join(" ");
  const core =
    traits && s.hp
      ? `${s.name} är en ${traits}-Pokémon med ${s.hp} HP.`
      : traits
        ? `${s.name} är en ${traits}-Pokémon.`
        : s.hp
          ? `${s.name} är en Pokémon med ${s.hp} HP.`
          : `${s.name} är en Pokémon.`;
  const level = s.level ? `Nivån på kortet är ${s.level}.` : "";
  const species = s.species.length
    ? `I Pokédex är det ${list(s.species.map((item) => `${item.name} (${item.dexLabel}), generation ${item.generation} (${item.region})`))}.`
    : "";
  if (s.variant === 1 && s.species[0]) {
    return keep([
      `${s.species[0].name} är Pokédex ${s.species[0].dexLabel}, generation ${s.species[0].generation} (${s.species[0].region}).`,
      s.species.length > 1 ? `Kortet listar också ${list(s.species.slice(1).map((item) => `${item.name} (${item.dexLabel})`))}.` : "",
      core,
      level,
      evolution(s),
    ]);
  }
  return keep([core, level, species, evolution(s)]);
}

function artistParagraph(s: CardStory): string {
  if (!s.artist || s.artistOthersLabel == null) return "";
  if (s.artistOthers === 0) return `${s.artist} ritade ${s.name}, och inget annat kort i katalogen använder det namnet.`;
  if (s.variant === 0) return `${s.artist} ritade det här kortet. Samma namn står på ${s.artistOthersLabel} andra kort i katalogen.`;
  return `Illustratörsraden säger ${s.artist}. Jag räknar ${s.artistOthersLabel} andra kort med den illustratören.`;
}

function printParagraph(s: CardStory): string {
  const primary = s.species[0];
  if (!primary) return "";
  const extra = s.species
    .slice(1)
    .map((item) => `${item.name} (${item.dexLabel}) har ${item.totalLabel} kort i katalogen.`)
    .join(" ");
  if (primary.others === 0) return keep([`${primary.name} (${primary.dexLabel}) har bara det här kortet i katalogen.`, extra]);
  const span =
    s.yearFrom && s.yearTo && s.yearFrom !== s.yearTo
      ? `De andra trycken med datum går från ${s.yearFrom} till ${s.yearTo}.`
      : s.yearFrom
        ? `De andra daterade trycken är från ${s.yearFrom}.`
        : "";
  const bits = [
    `Katalogen har ${primary.othersLabel} andra kort med ${primary.name} (${primary.dexLabel}).`,
    `De ligger i ${s.otherSets} ${s.otherSets === 1 ? "set" : "set"}.`,
    span,
  ];
  if (s.earliest) {
    const when = s.earliest.year ? ` (${s.earliest.year})` : "";
    bits.push(`Det tidigaste andra kortet är ${s.earliest.name} ${s.earliest.fraction} i ${s.earliest.setName}${when}.`);
    if (s.earliest.name !== s.name) bits.push(`Det kortet heter ${s.earliest.name} och det här heter ${s.name}.`);
    if (s.hpCompare === "diff") bits.push(`Där står ${s.earliest.hp} HP och här står ${s.hp} HP.`);
    else if (s.hpCompare === "same") bits.push(`Båda anger ${s.hp} HP.`);
    if (s.rarityCompare === "diff") bits.push(`Sällsyntheten där är ${s.earliest.rarity} och här är den ${s.rarity}.`);
    else if (s.rarityCompare === "same") bits.push(`Båda anger sällsyntheten ${s.rarity}.`);
    if (s.artistCompare === "diff") bits.push(`${s.earliest.artist} ritade det kortet och ${s.artist} ritade det här.`);
    if (s.regulationCompare === "diff") bits.push(`Regleringsmärket där är ${s.earliest.regulation} och här är det ${s.regulation}.`);
    if (s.retreatCompare === "diff") bits.push(`Reträttkostnaden där är ${s.earliest.retreat} och här är den ${s.retreat}.`);
  }
  if (s.differentHp != null && s.differentHp > 0 && s.differentHpLabel) {
    bits.push(`${s.differentHpLabel} andra kort med ${primary.name} anger andra HP.`);
  }
  bits.push(extra);
  return keep(bits);
}

function playParagraph(s: CardStory): string {
  const bits: string[] = [];
  for (const ability of s.abilities) {
    const kind = ability.type ? ` som ${ability.type}` : "";
    bits.push(ability.text ? `${ability.name} står på kortet${kind}. ${ability.text}` : `${ability.name} står på kortet${kind}.`);
  }
  s.attacks.forEach((attack, index) => {
    const lead = index === 0 ? `Attacken ${attack.name}` : `${attack.name} är en annan attack och`;
    const damage = attack.damage ? `anger ${attack.damage} skada` : "anger ingen skadesiffra";
    const cost = attack.cost ? ` Kostnaden är ${attack.cost}.` : "";
    const text = attack.text ? ` ${attack.text}` : "";
    bits.push(`${lead} ${damage}.${cost}${text}`);
  });
  if (s.weaknesses.length) bits.push(`Svagheten är ${list(s.weaknesses)}.`);
  if (s.resistances.length) bits.push(`Motståndet är ${list(s.resistances)}.`);
  if (s.retreat != null) bits.push(`Reträttkostnaden är ${s.retreat}.`);
  for (const rule of s.rules) bits.push(`Korttexten säger: ${rule}`);
  if (s.ancient) bits.push(`${s.ancient.name} är ancient trait på det här kortet. ${s.ancient.text}`);
  if (s.flavor) bits.push(`Flavortexten lyder ${quoted("sv", s.flavor)}`);
  if (s.regulation) bits.push(`Regleringsmärket är ${s.regulation}.`);
  return keep(bits);
}

function binderParagraph(s: CardStory): string {
  const setLine =
    s.variant === 0
      ? `En setpärm behöver varje kort i setet. ${s.name} är en plats i ${s.setBinder}.`
      : `${s.setBinder} är pärmen för ett helt ${s.setName}. Det här kortet fyller en plats där.`;
  const gen =
    s.genBinders.length && s.species.length
      ? `En generationspärm behöver ett kort av varje art. ${list(s.species.map((item) => item.name))} kan fylla platsen i ${list(s.genBinders)}.`
      : "";
  const themes = s.themes.length ? `Temalistor som innehåller just det här kortet är ${list(s.themes)}.` : "";
  return keep([setLine, gen, themes, s.statusLine]);
}

export function swedishStory(s: CardStory): string[] {
  const set = setParagraph(s);
  const kind = kindParagraph(s);
  const artist = artistParagraph(s);
  const print = printParagraph(s);
  const play = playParagraph(s);
  const binders = binderParagraph(s);
  const order = s.variant === 0 ? [set, play, kind, print, artist, binders] : [kind, print, set, play, artist, binders];
  return order.filter(Boolean);
}

export function swedishFaq(s: CardStory): CardFaq[] {
  const faqs: CardFaq[] = [
    {
      q: `Vilket set kommer ${s.name} från?`,
      a: keep([
        `${s.setName}, i serien ${s.series}.`,
        s.release ? `Utgivet ${s.release}.` : "",
        s.printed != null ? `Den tryckta storleken är ${s.printed}.` : `Listan har ${s.countLabel} kort.`,
      ]),
    },
    {
      q: "Vilket är samlingsnumret?",
      a: `${s.fraction}. Det är post ${s.placeLabel} av ${s.countLabel} i den här listan.`,
    },
  ];
  if (s.artist && s.artistOthersLabel != null) {
    faqs.push({
      q: "Vem illustrerade kortet?",
      a:
        s.artistOthers === 0
          ? `${s.artist}. Inget annat kort i katalogen använder det namnet.`
          : `${s.artist}. Katalogen har ${s.artistOthersLabel} andra kort med den illustratören.`,
    });
  }
  if (s.rarity) faqs.push({ q: "Vilken sällsynthet anges?", a: `${s.rarity}.` });
  if (s.species.length) {
    faqs.push({
      q: "Vilket Pokédexnummer använder kortet?",
      a: `${list(s.species.map((item) => `${item.name} ${item.dexLabel}, generation ${item.generation} (${item.region})`))}.`,
    });
  }
  if (s.regulation) faqs.push({ q: "Vilket regleringsmärke är tryckt?", a: `${s.regulation}.` });
  if (s.attacks.length) {
    faqs.push({
      q: "Vilka attacker är tryckta?",
      a: `${list(s.attacks.map((attack) => (attack.damage ? `${attack.name} (${attack.damage})` : attack.name)))}.`,
    });
  }
  return faqs;
}
