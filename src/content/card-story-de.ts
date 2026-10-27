import { keep, quoted, type CardFaq, type CardStory } from "./card-story-types";

function list(items: string[]): string {
  if (items.length <= 1) return items[0] ?? "";
  if (items.length === 2) return `${items[0]} und ${items[1]}`;
  return `${items.slice(0, -1).join(", ")} und ${items.at(-1)}`;
}

function size(s: CardStory): string {
  if (s.printed == null) return `Diese Checkliste führt ${s.countLabel} Karten.`;
  if (s.printed === s.count) return `Gedruckt sind ${s.printed} Karten, und die Checkliste hat dieselbe Länge.`;
  return `Die gedruckte Größe ist ${s.printed}. Die Checkliste ist länger und umfasst ${s.countLabel} Karten.`;
}

function neighbors(s: CardStory): string {
  if (s.prev && s.next) {
    return s.variant === 0
      ? `Direkt davor liegt ${s.prev.number} ${s.prev.name}, direkt danach ${s.next.number} ${s.next.name}.`
      : `Die Nachbarn in der Set-Reihenfolge sind ${s.prev.number} ${s.prev.name} und ${s.next.number} ${s.next.name}.`;
  }
  if (s.prev) return `Die Karte davor ist ${s.prev.number} ${s.prev.name}.`;
  if (s.next) return `Danach folgt ${s.next.number} ${s.next.name}.`;
  return "";
}

function setParagraph(s: CardStory): string {
  const dated = s.release ? `Erschienen ist das Set am ${s.release}.` : "";
  const rarity = s.rarity ? `Als Seltenheit steht ${s.rarity} auf der Karte.` : "";
  const secret = s.secret && s.printed ? `Die Sammelnummer liegt über der gedruckten Setgröße von ${s.printed}.` : "";
  if (s.variant === 0) {
    return keep([
      `Die Sammelnummer von ${s.name} lautet ${s.fraction}.`,
      `In dieser Checkliste steht die Karte an Stelle ${s.placeLabel} von ${s.countLabel}.`,
      neighbors(s),
      `${s.setName} gehört zur Serie ${s.series}.`,
      dated,
      size(s),
      secret,
      rarity,
    ]);
  }
  return keep([
    `${s.setName} aus der Serie ${s.series} enthält ${s.name} als ${s.fraction}.`,
    dated,
    size(s),
    `Der Platz in der Checkliste ist ${s.placeLabel} von ${s.countLabel}.`,
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
        ? `Auf der Karte steht, dass sie sich aus ${s.evolvesFrom} entwickelt. Im Katalog gehört dieser gedruckte Name zu ${s.evolvesFromSpecies.name} (${s.evolvesFromSpecies.dexLabel}).`
        : `Auf der Karte steht, dass sie sich aus ${s.evolvesFrom} entwickelt.`,
    );
  }
  if (s.evolvesTo.length) {
    const names = s.evolvesTo.map((item) => (item.name && item.dexLabel ? `${item.printed}, ${item.name} (${item.dexLabel})` : item.printed));
    bits.push(`Unter der Entwicklung nennt die Karte ${list(names)}.`);
  }
  return bits.join(" ");
}

function kindParagraph(s: CardStory): string {
  if (s.kind === "t") {
    const sub = s.subtypes.length ? `Als Untertypen sind ${list(s.subtypes)} angegeben.` : "";
    return keep([`${s.name} ist eine Trainerkarte.`, sub]);
  }
  if (s.kind === "e") {
    const sub = s.subtypes.length ? `Eingetragen ist sie als ${list(s.subtypes)}.` : "";
    return keep([`${s.name} ist eine Energiekarte.`, sub]);
  }
  if (s.kind !== "p") return `${s.name} steht in dieser Set-Liste.`;
  const traits = [...s.subtypes, ...s.types].join(" ");
  const core =
    traits && s.hp
      ? `${s.name} ist ein ${traits}-Pokémon mit ${s.hp} HP.`
      : traits
        ? `${s.name} ist ein ${traits}-Pokémon.`
        : s.hp
          ? `${s.name} ist ein Pokémon mit ${s.hp} HP.`
          : `${s.name} ist ein Pokémon.`;
  const level = s.level ? `Das aufgedruckte Level ist ${s.level}.` : "";
  if (s.variant === 1 && s.species[0]) {
    const lead = `${s.species[0].name} trägt im Pokédex die Nummer ${s.species[0].dexLabel} und gehört zu Generation ${s.species[0].generation} (${s.species[0].region}).`;
    const rest = s.species.slice(1);
    const more = rest.length ? `Die Karte nennt außerdem ${list(rest.map((item) => `${item.name} (${item.dexLabel})`))}.` : "";
    return keep([lead, more, core, level, evolution(s)]);
  }
  const species = s.species.length
    ? `Im Pokédex ist das ${list(s.species.map((item) => `${item.name} (${item.dexLabel}), Generation ${item.generation} (${item.region})`))}.`
    : "";
  return keep([core, level, species, evolution(s)]);
}

function artistParagraph(s: CardStory): string {
  if (!s.artist || s.artistOthersLabel == null) return "";
  if (s.artistOthers === 0) return `${s.artist} hat ${s.name} gezeichnet. Keine weitere Karte im Katalog trägt diesen Namen.`;
  if (s.variant === 0) return `${s.artist} hat diese Karte gezeichnet. Derselbe Name steht auf ${s.artistOthersLabel} weiteren Karten im Katalog.`;
  return `Als Illustrator ist ${s.artist} genannt. Ich zähle ${s.artistOthersLabel} weitere Karten mit diesem Illustrator.`;
}

function printParagraph(s: CardStory): string {
  const primary = s.species[0];
  if (!primary) return "";
  const extra = s.species
    .slice(1)
    .map((item) => `${item.name} (${item.dexLabel}) hat ${item.totalLabel} Karten im Katalog.`)
    .join(" ");
  if (primary.others === 0) return keep([`Von ${primary.name} (${primary.dexLabel}) liegt nur diese eine Karte im Katalog.`, extra]);
  const span =
    s.yearFrom && s.yearTo && s.yearFrom !== s.yearTo
      ? `Die übrigen Drucke mit Erscheinungsdatum reichen von ${s.yearFrom} bis ${s.yearTo}.`
      : s.yearFrom
        ? `Die übrigen datierten Drucke stammen aus ${s.yearFrom}.`
        : "";
  const bits = [
    `Neben dieser Karte führt der Katalog ${primary.othersLabel} weitere Karten von ${primary.name} (${primary.dexLabel}).`,
    `Sie verteilen sich auf ${s.otherSets} ${s.otherSets === 1 ? "Set" : "Sets"}.`,
    span,
  ];
  if (s.earliest) {
    const when = s.earliest.year ? ` (${s.earliest.year})` : "";
    bits.push(`Der früheste andere Druck ist ${s.earliest.name} ${s.earliest.fraction} aus ${s.earliest.setName}${when}.`);
    if (s.earliest.name !== s.name) bits.push(`Dort heißt die Karte ${s.earliest.name}, hier ${s.name}.`);
    if (s.hpCompare === "diff") bits.push(`Dort stehen ${s.earliest.hp} HP, hier ${s.hp} HP.`);
    else if (s.hpCompare === "same") bits.push(`Beide nennen ${s.hp} HP.`);
    if (s.rarityCompare === "diff") bits.push(`Die Seltenheit dort ist ${s.earliest.rarity}, hier ist sie ${s.rarity}.`);
    else if (s.rarityCompare === "same") bits.push(`Beide nennen die Seltenheit ${s.rarity}.`);
    if (s.artistCompare === "diff") bits.push(`${s.earliest.artist} hat jene Karte gezeichnet, ${s.artist} diese.`);
    if (s.regulationCompare === "diff") bits.push(`Die Regulationsmarke dort ist ${s.earliest.regulation}, hier ist sie ${s.regulation}.`);
    if (s.retreatCompare === "diff") bits.push(`Die Rückzugskosten dort betragen ${s.earliest.retreat}, hier betragen sie ${s.retreat}.`);
  }
  if (s.differentHp != null && s.differentHp > 0 && s.differentHpLabel) {
    bits.push(`${s.differentHpLabel} weitere Karten von ${primary.name} nennen andere HP.`);
  }
  bits.push(extra);
  return keep(bits);
}

function playParagraph(s: CardStory): string {
  const bits: string[] = [];
  for (const ability of s.abilities) {
    const kind = ability.type ? `, bezeichnet als ${ability.type}` : "";
    bits.push(ability.text ? `${ability.name} steht auf der Karte${kind}. ${ability.text}` : `${ability.name} steht auf der Karte${kind}.`);
  }
  s.attacks.forEach((attack, index) => {
    const lead = index === 0 ? `Der Angriff ${attack.name}` : `${attack.name} ist ein weiterer Angriff und`;
    const damage = attack.damage ? `nennt ${attack.damage} Schaden` : "nennt keine Schadenszahl";
    const cost = attack.cost ? ` Die Kosten sind ${attack.cost}.` : "";
    const text = attack.text ? ` ${attack.text}` : "";
    bits.push(`${lead} ${damage}.${cost}${text}`);
  });
  if (s.weaknesses.length) bits.push(`Die Schwäche ist ${list(s.weaknesses)}.`);
  if (s.resistances.length) bits.push(`Die Resistenz ist ${list(s.resistances)}.`);
  if (s.retreat != null) bits.push(`Die Rückzugskosten betragen ${s.retreat}.`);
  for (const rule of s.rules) bits.push(`Der Kartentext lautet: ${rule}`);
  if (s.ancient) bits.push(`${s.ancient.name} ist die uralte Eigenschaft auf dieser Karte. ${s.ancient.text}`);
  if (s.flavor) bits.push(`Der Flavortext lautet ${quoted("de", s.flavor)}`);
  if (s.regulation) bits.push(`Die Regulationsmarke ist ${s.regulation}.`);
  return keep(bits);
}

function binderParagraph(s: CardStory): string {
  const setLine =
    s.variant === 0
      ? `Ein Set-Binder braucht jede Karte des Sets. Für ${s.setName} führe ich den ${s.setBinder}, und diese Karte ist dort ein Platz.`
      : `${s.setBinder} ist der Ordner für ein vollständiges ${s.setName}. Diese Karte füllt darin einen Platz, weil ein Set-Binder jede Karte des Sets braucht.`;
  const gen =
    s.genBinders.length && s.species.length
      ? `Ein Generationsbinder braucht eine Karte jeder Art. ${list(s.species.map((item) => item.name))} kann den Platz in ${list(s.genBinders)} füllen.`
      : "";
  const themes = s.themes.length ? `Themenlisten, die genau diese Karte führen, sind ${list(s.themes)}.` : "";
  return keep([setLine, gen, themes, s.statusLine]);
}

export function germanStory(s: CardStory): string[] {
  const set = setParagraph(s);
  const kind = kindParagraph(s);
  const artist = artistParagraph(s);
  const print = printParagraph(s);
  const play = playParagraph(s);
  const binders = binderParagraph(s);
  const order = s.variant === 0 ? [set, kind, play, print, artist, binders] : [kind, artist, set, print, play, binders];
  return order.filter(Boolean);
}

export function germanFaq(s: CardStory): CardFaq[] {
  const faqs: CardFaq[] = [
    {
      q: s.variant === 0 ? `Aus welchem Set stammt ${s.name}?` : `Zu welchem Set gehört ${s.name}?`,
      a: keep([
        `${s.setName}, aus der Serie ${s.series}.`,
        s.release ? `Erschienen am ${s.release}.` : "",
        s.printed != null ? `Die gedruckte Größe ist ${s.printed}.` : `Die Checkliste hat ${s.countLabel} Karten.`,
      ]),
    },
    {
      q: s.variant === 0 ? "Wie lautet die Sammelnummer?" : "Welche Nummer steht auf dieser Karte?",
      a: `${s.fraction}. In der Checkliste ist das Eintrag ${s.placeLabel} von ${s.countLabel}.`,
    },
  ];
  if (s.artist && s.artistOthersLabel != null) {
    faqs.push({
      q: "Wer hat die Karte illustriert?",
      a:
        s.artistOthers === 0
          ? `${s.artist}. Keine weitere Karte im Katalog trägt diesen Namen.`
          : `${s.artist}. Im Katalog stehen ${s.artistOthersLabel} weitere Karten mit diesem Illustrator.`,
    });
  }
  if (s.rarity) faqs.push({ q: "Welche Seltenheit ist angegeben?", a: `${s.rarity}.` });
  if (s.species.length) {
    faqs.push({
      q: "Welche Pokédex-Nummer nutzt die Karte?",
      a: `${list(s.species.map((item) => `${item.name} ${item.dexLabel}, Generation ${item.generation} (${item.region})`))}.`,
    });
  }
  if (s.regulation) faqs.push({ q: "Welche Regulationsmarke ist aufgedruckt?", a: `${s.regulation}.` });
  if (s.attacks.length) {
    faqs.push({
      q: "Welche Angriffe sind aufgedruckt?",
      a: `${list(s.attacks.map((attack) => (attack.damage ? `${attack.name} (${attack.damage})` : attack.name)))}.`,
    });
  }
  return faqs;
}
