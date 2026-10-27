import { keep, quoted, type CardFaq, type CardStory } from "./card-story-types";

function list(items: string[]): string {
  if (items.length <= 1) return items[0] ?? "";
  if (items.length === 2) return `${items[0]} og ${items[1]}`;
  return `${items.slice(0, -1).join(", ")} og ${items.at(-1)}`;
}

function size(s: CardStory): string {
  if (s.printed == null) return `Denne listen har ${s.countLabel} kort.`;
  if (s.printed === s.count) return `Trykt størrelse er ${s.printed}, og listen er like lang.`;
  return `Trykt størrelse er ${s.printed}. Listen er lengre, med ${s.countLabel} kort.`;
}

function neighbors(s: CardStory): string {
  if (s.prev && s.next) return `Kortet foran er ${s.prev.number} ${s.prev.name}, og kortet bak er ${s.next.number} ${s.next.name}.`;
  if (s.prev) return `Kortet foran er ${s.prev.number} ${s.prev.name}.`;
  if (s.next) return `Neste kort er ${s.next.number} ${s.next.name}.`;
  return "";
}

function setParagraph(s: CardStory): string {
  const dated = s.release ? `Settet kom ${s.release}.` : "";
  const rarity = s.rarity ? `Sjeldenheten på kortet er ${s.rarity}.` : "";
  const secret = s.secret && s.printed ? `Samlernummeret ligger over den trykte settstørrelsen på ${s.printed}.` : "";
  if (s.variant === 0) {
    return keep([
      `Samlernummeret til ${s.name} er ${s.fraction}.`,
      `På denne listen er plassen ${s.placeLabel} av ${s.countLabel}.`,
      neighbors(s),
      `${s.setName} hører til serien ${s.series}.`,
      dated,
      size(s),
      secret,
      rarity,
    ]);
  }
  return keep([
    `${s.setName} i serien ${s.series} har ${s.name} som ${s.fraction}.`,
    dated,
    size(s),
    `Plassen i listen er ${s.placeLabel} av ${s.countLabel}.`,
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
        ? `Kortet sier at det utvikler seg fra ${s.evolvesFrom}. I katalogen er det navnet ${s.evolvesFromSpecies.name} (${s.evolvesFromSpecies.dexLabel}).`
        : `Kortet sier at det utvikler seg fra ${s.evolvesFrom}.`,
    );
  }
  if (s.evolvesTo.length) {
    const names = s.evolvesTo.map((item) => (item.name && item.dexLabel ? `${item.printed}, ${item.name} (${item.dexLabel})` : item.printed));
    bits.push(`Under utvikler seg til står ${list(names)}.`);
  }
  return bits.join(" ");
}

function kindParagraph(s: CardStory): string {
  if (s.kind === "t") {
    const sub = s.subtypes.length ? `Undertypene som er oppgitt er ${list(s.subtypes)}.` : "";
    return keep([`${s.name} er et trenerkort.`, sub]);
  }
  if (s.kind === "e") {
    const sub = s.subtypes.length ? `Det står oppført som ${list(s.subtypes)}.` : "";
    return keep([`${s.name} er et energikort.`, sub]);
  }
  if (s.kind !== "p") return `${s.name} står i denne settlisten.`;
  const traits = [...s.subtypes, ...s.types].join(" ");
  const core =
    traits && s.hp
      ? `${s.name} er en ${traits}-Pokémon med ${s.hp} HP.`
      : traits
        ? `${s.name} er en ${traits}-Pokémon.`
        : s.hp
          ? `${s.name} er en Pokémon med ${s.hp} HP.`
          : `${s.name} er en Pokémon.`;
  const level = s.level ? `Nivået på kortet er ${s.level}.` : "";
  const species = s.species.length
    ? `I Pokédex er det ${list(s.species.map((item) => `${item.name} (${item.dexLabel}), generasjon ${item.generation} (${item.region})`))}.`
    : "";
  return keep([core, level, species, evolution(s)]);
}

function artistParagraph(s: CardStory): string {
  if (!s.artist || s.artistOthersLabel == null) return "";
  if (s.artistOthers === 0) return `${s.artist} tegnet ${s.name}, og ingen andre kort i katalogen bruker det navnet.`;
  if (s.variant === 0) return `${s.artist} tegnet dette kortet. Samme navn står på ${s.artistOthersLabel} andre kort i katalogen.`;
  return `Illustratørlinjen sier ${s.artist}. Jeg teller ${s.artistOthersLabel} andre kort med den illustratøren.`;
}

function printParagraph(s: CardStory): string {
  const primary = s.species[0];
  if (!primary) return "";
  const extra = s.species
    .slice(1)
    .map((item) => `${item.name} (${item.dexLabel}) har ${item.totalLabel} kort i katalogen.`)
    .join(" ");
  if (primary.others === 0) return keep([`${primary.name} (${primary.dexLabel}) har bare dette ene kortet i katalogen.`, extra]);
  const span =
    s.yearFrom && s.yearTo && s.yearFrom !== s.yearTo
      ? `De andre trykkene med dato går fra ${s.yearFrom} til ${s.yearTo}.`
      : s.yearFrom
        ? `De andre daterte trykkene er fra ${s.yearFrom}.`
        : "";
  const bits = [
    `Katalogen har ${primary.othersLabel} andre kort med ${primary.name} (${primary.dexLabel}).`,
    `De ligger i ${s.otherSets} ${s.otherSets === 1 ? "sett" : "sett"}.`,
    span,
  ];
  if (s.earliest) {
    const when = s.earliest.year ? ` (${s.earliest.year})` : "";
    bits.push(`Det tidligste andre kortet er ${s.earliest.name} ${s.earliest.fraction} i ${s.earliest.setName}${when}.`);
    if (s.earliest.name !== s.name) bits.push(`Det kortet heter ${s.earliest.name}, mens dette heter ${s.name}.`);
    if (s.hpCompare === "diff") bits.push(`Der står ${s.earliest.hp} HP, og her står ${s.hp} HP.`);
    else if (s.hpCompare === "same") bits.push(`Begge oppgir ${s.hp} HP.`);
    if (s.rarityCompare === "diff") bits.push(`Sjeldenheten der er ${s.earliest.rarity}, og her er den ${s.rarity}.`);
    else if (s.rarityCompare === "same") bits.push(`Begge oppgir sjeldenheten ${s.rarity}.`);
    if (s.artistCompare === "diff") bits.push(`${s.earliest.artist} tegnet det kortet, og ${s.artist} tegnet dette.`);
    if (s.regulationCompare === "diff") bits.push(`Reguleringsmerket der er ${s.earliest.regulation}, og her er det ${s.regulation}.`);
    if (s.retreatCompare === "diff") bits.push(`Retrettkostnaden der er ${s.earliest.retreat}, og her er den ${s.retreat}.`);
  }
  if (s.differentHp != null && s.differentHp > 0 && s.differentHpLabel) {
    bits.push(`${s.differentHpLabel} andre kort med ${primary.name} oppgir andre HP.`);
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
    const lead = index === 0 ? `Angrepet ${attack.name}` : `${attack.name} er et annet angrep og`;
    const damage = attack.damage ? `oppgir ${attack.damage} skade` : "oppgir ikke et skadetall";
    const cost = attack.cost ? ` Kostnaden er ${attack.cost}.` : "";
    const text = attack.text ? ` ${attack.text}` : "";
    bits.push(`${lead} ${damage}.${cost}${text}`);
  });
  if (s.weaknesses.length) bits.push(`Svakheten er ${list(s.weaknesses)}.`);
  if (s.resistances.length) bits.push(`Motstanden er ${list(s.resistances)}.`);
  if (s.retreat != null) bits.push(`Retrettkostnaden er ${s.retreat}.`);
  for (const rule of s.rules) bits.push(`Kortteksten sier: ${rule}`);
  if (s.ancient) bits.push(`${s.ancient.name} er ancient trait på dette kortet. ${s.ancient.text}`);
  if (s.flavor) bits.push(`Flavorteksten lyder ${quoted("no", s.flavor)}`);
  if (s.regulation) bits.push(`Reguleringsmerket er ${s.regulation}.`);
  return keep(bits);
}

function binderParagraph(s: CardStory): string {
  const setLine =
    s.variant === 0
      ? `En settperm trenger hvert kort i settet. ${s.name} fyller én plass i ${s.setBinder}.`
      : `${s.setBinder} er permen for et helt ${s.setName}. Dette kortet er én plass der.`;
  const gen =
    s.genBinders.length && s.species.length
      ? `En generasjonsperm trenger ett kort av hver art. ${list(s.species.map((item) => item.name))} kan fylle plassen i ${list(s.genBinders)}.`
      : "";
  const themes = s.themes.length ? `Temalister som inneholder akkurat dette kortet er ${list(s.themes)}.` : "";
  return keep([setLine, gen, themes, s.statusLine]);
}

export function norwegianStory(s: CardStory): string[] {
  const set = setParagraph(s);
  const kind = kindParagraph(s);
  const artist = artistParagraph(s);
  const print = printParagraph(s);
  const play = playParagraph(s);
  const binders = binderParagraph(s);
  const order = s.variant === 0 ? [kind, set, artist, play, print, binders] : [set, print, kind, artist, play, binders];
  return order.filter(Boolean);
}

export function norwegianFaq(s: CardStory): CardFaq[] {
  const faqs: CardFaq[] = [
    {
      q: `Hvilket sett er ${s.name} fra?`,
      a: keep([
        `${s.setName}, i serien ${s.series}.`,
        s.release ? `Utgitt ${s.release}.` : "",
        s.printed != null ? `Trykt størrelse er ${s.printed}.` : `Listen har ${s.countLabel} kort.`,
      ]),
    },
    {
      q: "Hva er samlernummeret?",
      a: `${s.fraction}. Det er plass ${s.placeLabel} av ${s.countLabel} i denne listen.`,
    },
  ];
  if (s.artist && s.artistOthersLabel != null) {
    faqs.push({
      q: "Hvem illustrerte kortet?",
      a:
        s.artistOthers === 0
          ? `${s.artist}. Ingen andre kort i katalogen bruker det navnet.`
          : `${s.artist}. Katalogen har ${s.artistOthersLabel} andre kort med den illustratøren.`,
    });
  }
  if (s.rarity) faqs.push({ q: "Hvilken sjeldenhet står oppført?", a: `${s.rarity}.` });
  if (s.species.length) {
    faqs.push({
      q: "Hvilket Pokédex-nummer bruker kortet?",
      a: `${list(s.species.map((item) => `${item.name} ${item.dexLabel}, generasjon ${item.generation} (${item.region})`))}.`,
    });
  }
  if (s.regulation) faqs.push({ q: "Hvilket reguleringsmerke er trykt?", a: `${s.regulation}.` });
  if (s.attacks.length) {
    faqs.push({
      q: "Hvilke angrep er trykt?",
      a: `${list(s.attacks.map((attack) => (attack.damage ? `${attack.name} (${attack.damage})` : attack.name)))}.`,
    });
  }
  return faqs;
}
