import { keep, quoted, type CardFaq, type CardStory } from "./card-story-types";

function list(items: string[]): string {
  if (items.length <= 1) return items[0] ?? "";
  if (items.length === 2) return `${items[0]} e ${items[1]}`;
  return `${items.slice(0, -1).join(", ")} e ${items.at(-1)}`;
}

function size(s: CardStory): string {
  if (s.printed == null) return `Questo elenco ha ${s.countLabel} carte.`;
  if (s.printed === s.count) return `La dimensione stampata è ${s.printed} e l'elenco ha la stessa lunghezza.`;
  return `La dimensione stampata è ${s.printed}. L'elenco è più lungo, con ${s.countLabel} carte.`;
}

function neighbors(s: CardStory): string {
  if (s.prev && s.next) return `Prima c'è ${s.prev.number} ${s.prev.name} e dopo c'è ${s.next.number} ${s.next.name}.`;
  if (s.prev) return `La carta precedente è ${s.prev.number} ${s.prev.name}.`;
  if (s.next) return `La carta successiva è ${s.next.number} ${s.next.name}.`;
  return "";
}

function setParagraph(s: CardStory): string {
  const dated = s.release ? `La data di uscita è il ${s.release}.` : "";
  const rarity = s.rarity ? `La rarità indicata è ${s.rarity}.` : "";
  const secret = s.secret && s.printed ? `Il numero da collezione supera la dimensione stampata di ${s.printed}.` : "";
  if (s.variant === 0) {
    return keep([
      `Il numero di ${s.name} è ${s.fraction}, posto ${s.placeLabel} di ${s.countLabel} in questo elenco.`,
      neighbors(s),
      `${s.setName} fa parte della serie ${s.series}.`,
      dated,
      size(s),
      secret,
      rarity,
    ]);
  }
  return keep([
    `Nel set ${s.setName} della serie ${s.series}, ${s.name} è la carta ${s.fraction}.`,
    dated,
    size(s),
    `Nell'elenco occupa il posto ${s.placeLabel} di ${s.countLabel}.`,
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
        ? `La carta dice che si evolve da ${s.evolvesFrom}. In questo catalogo quel nome è ${s.evolvesFromSpecies.name} (${s.evolvesFromSpecies.dexLabel}).`
        : `La carta dice che si evolve da ${s.evolvesFrom}.`,
    );
  }
  if (s.evolvesTo.length) {
    const names = s.evolvesTo.map((item) => (item.name && item.dexLabel ? `${item.printed}, ${item.name} (${item.dexLabel})` : item.printed));
    bits.push(`Alla voce si evolve in compaiono ${list(names)}.`);
  }
  return bits.join(" ");
}

function kindParagraph(s: CardStory): string {
  if (s.kind === "t") {
    const sub = s.subtypes.length ? `I sottotipi indicati sono ${list(s.subtypes)}.` : "";
    return keep([`${s.name} è una carta Allenatore.`, sub]);
  }
  if (s.kind === "e") {
    const sub = s.subtypes.length ? `È indicata come ${list(s.subtypes)}.` : "";
    return keep([`${s.name} è una carta Energia.`, sub]);
  }
  if (s.kind !== "p") return `${s.name} è in questo elenco del set.`;
  const traits = [...s.subtypes, ...s.types].join(" ");
  const core =
    traits && s.hp
      ? `${s.name} è un Pokémon ${traits} con ${s.hp} HP.`
      : traits
        ? `${s.name} è un Pokémon ${traits}.`
        : s.hp
          ? `${s.name} è un Pokémon con ${s.hp} HP.`
          : `${s.name} è un Pokémon.`;
  const level = s.level ? `Il livello stampato è ${s.level}.` : "";
  const species = s.species.length
    ? `Nel Pokédex è ${list(s.species.map((item) => `${item.name} (${item.dexLabel}), generazione ${item.generation} (${item.region})`))}.`
    : "";
  if (s.variant === 1) return keep([evolution(s), core, level, species]);
  return keep([core, level, species, evolution(s)]);
}

function artistParagraph(s: CardStory): string {
  if (!s.artist || s.artistOthersLabel == null) return "";
  if (s.artistOthers === 0) return `${s.artist} ha illustrato ${s.name} e nessun'altra carta del catalogo porta quel nome.`;
  if (s.variant === 0) return `L'illustrazione è di ${s.artist}. Lo stesso nome compare su ${s.artistOthersLabel} altre carte del catalogo.`;
  return `Sulla riga dell'illustratore c'è ${s.artist}. Conto ${s.artistOthersLabel} altre carte con quell'illustratore.`;
}

function printParagraph(s: CardStory): string {
  const primary = s.species[0];
  if (!primary) return "";
  const extra = s.species
    .slice(1)
    .map((item) => `${item.name} (${item.dexLabel}) ha ${item.totalLabel} carte nel catalogo.`)
    .join(" ");
  if (primary.others === 0) return keep([`Di ${primary.name} (${primary.dexLabel}) c'è solo questa carta nel catalogo.`, extra]);
  const span =
    s.yearFrom && s.yearTo && s.yearFrom !== s.yearTo
      ? `Le altre stampe con una data vanno dal ${s.yearFrom} al ${s.yearTo}.`
      : s.yearFrom
        ? `Le altre stampe datate sono del ${s.yearFrom}.`
        : "";
  const bits = [
    `Nel catalogo ci sono ${primary.othersLabel} altre carte di ${primary.name} (${primary.dexLabel}).`,
    `Stanno in ${s.otherSets} ${s.otherSets === 1 ? "set" : "set"}.`,
    span,
  ];
  if (s.earliest) {
    const when = s.earliest.year ? ` (${s.earliest.year})` : "";
    bits.push(`La stampa più vecchia tra le altre è ${s.earliest.name} ${s.earliest.fraction} in ${s.earliest.setName}${when}.`);
    if (s.earliest.name !== s.name) bits.push(`Quella carta si chiama ${s.earliest.name}, questa si chiama ${s.name}.`);
    if (s.hpCompare === "diff") bits.push(`Lì sono indicati ${s.earliest.hp} HP e qui ${s.hp} HP.`);
    else if (s.hpCompare === "same") bits.push(`Entrambe indicano ${s.hp} HP.`);
    if (s.rarityCompare === "diff") bits.push(`La rarità lì è ${s.earliest.rarity} e qui è ${s.rarity}.`);
    else if (s.rarityCompare === "same") bits.push(`Entrambe indicano la rarità ${s.rarity}.`);
    if (s.artistCompare === "diff") bits.push(`${s.earliest.artist} ha illustrato quella carta e ${s.artist} ha illustrato questa.`);
    if (s.regulationCompare === "diff") bits.push(`Il marchio di regolamento lì è ${s.earliest.regulation} e qui è ${s.regulation}.`);
    if (s.retreatCompare === "diff") bits.push(`Il costo di ritirata lì è ${s.earliest.retreat} e qui è ${s.retreat}.`);
  }
  if (s.differentHp != null && s.differentHp > 0 && s.differentHpLabel) {
    bits.push(`${s.differentHpLabel} altre carte di ${primary.name} indicano HP diversi.`);
  }
  bits.push(extra);
  return keep(bits);
}

function playParagraph(s: CardStory): string {
  const bits: string[] = [];
  for (const ability of s.abilities) {
    const kind = ability.type ? `, indicata come ${ability.type}` : "";
    bits.push(ability.text ? `${ability.name} è sulla carta${kind}. ${ability.text}` : `${ability.name} è sulla carta${kind}.`);
  }
  s.attacks.forEach((attack, index) => {
    const lead = index === 0 ? `L'attacco ${attack.name}` : `${attack.name} è un altro attacco e`;
    const damage = attack.damage ? `indica ${attack.damage} danni` : "non indica un numero di danni";
    const cost = attack.cost ? ` Il costo è ${attack.cost}.` : "";
    const text = attack.text ? ` ${attack.text}` : "";
    bits.push(`${lead} ${damage}.${cost}${text}`);
  });
  if (s.weaknesses.length) bits.push(`La debolezza è ${list(s.weaknesses)}.`);
  if (s.resistances.length) bits.push(`La resistenza è ${list(s.resistances)}.`);
  if (s.retreat != null) bits.push(`Il costo di ritirata è ${s.retreat}.`);
  for (const rule of s.rules) bits.push(`Il testo della carta dice: ${rule}`);
  if (s.ancient) bits.push(`${s.ancient.name} è il tratto antico di questa carta. ${s.ancient.text}`);
  if (s.flavor) bits.push(`Il testo di colore dice ${quoted("it", s.flavor)}`);
  if (s.regulation) bits.push(`Il marchio di regolamento è ${s.regulation}.`);
  return keep(bits);
}

function binderParagraph(s: CardStory): string {
  const setLine =
    s.variant === 0
      ? `Un raccoglitore di set vuole ogni carta di quel set. ${s.name} occupa uno spazio nel ${s.setBinder}.`
      : `Nel ${s.setBinder} va un ${s.setName} completo. Questa carta riempie uno spazio.`;
  const gen =
    s.genBinders.length && s.species.length
      ? `Un raccoglitore di generazione vuole una carta di ogni specie. ${list(s.species.map((item) => item.name))} può riempire lo spazio in ${list(s.genBinders)}.`
      : "";
  const themes = s.themes.length ? `Le liste a tema che contengono proprio questa carta sono ${list(s.themes)}.` : "";
  return keep([setLine, gen, themes, s.statusLine]);
}

export function italianStory(s: CardStory): string[] {
  const set = setParagraph(s);
  const kind = kindParagraph(s);
  const artist = artistParagraph(s);
  const print = printParagraph(s);
  const play = playParagraph(s);
  const binders = binderParagraph(s);
  const order = s.variant === 0 ? [set, artist, kind, print, play, binders] : [kind, play, set, print, artist, binders];
  return order.filter(Boolean);
}

export function italianFaq(s: CardStory): CardFaq[] {
  const faqs: CardFaq[] = [
    {
      q: `Di quale set è ${s.name}?`,
      a: keep([
        `${s.setName}, nella serie ${s.series}.`,
        s.release ? `È uscito il ${s.release}.` : "",
        s.printed != null ? `La dimensione stampata è ${s.printed}.` : `L'elenco ha ${s.countLabel} carte.`,
      ]),
    },
    {
      q: "Qual è il numero da collezione?",
      a: `${s.fraction}. È la voce ${s.placeLabel} di ${s.countLabel} in questo elenco.`,
    },
  ];
  if (s.artist && s.artistOthersLabel != null) {
    faqs.push({
      q: "Chi l'ha illustrata?",
      a:
        s.artistOthers === 0
          ? `${s.artist}. Nessun'altra carta del catalogo porta quel nome.`
          : `${s.artist}. Il catalogo ha ${s.artistOthersLabel} altre carte con quell'illustratore.`,
    });
  }
  if (s.rarity) faqs.push({ q: "Quale rarità è indicata?", a: `${s.rarity}.` });
  if (s.species.length) {
    faqs.push({
      q: "Quale numero di Pokédex usa la carta?",
      a: `${list(s.species.map((item) => `${item.name} ${item.dexLabel}, generazione ${item.generation} (${item.region})`))}.`,
    });
  }
  if (s.regulation) faqs.push({ q: "Quale marchio di regolamento è stampato?", a: `${s.regulation}.` });
  if (s.attacks.length) {
    faqs.push({
      q: "Quali attacchi sono stampati?",
      a: `${list(s.attacks.map((attack) => (attack.damage ? `${attack.name} (${attack.damage})` : attack.name)))}.`,
    });
  }
  return faqs;
}
