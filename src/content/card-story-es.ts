import { keep, quoted, type CardFaq, type CardStory } from "./card-story-types";

function list(items: string[]): string {
  const join = (left: string, right: string) => `${left} ${/^i|^hi/i.test(right) ? "e" : "y"} ${right}`;
  if (items.length <= 1) return items[0] ?? "";
  if (items.length === 2) return join(items[0] ?? "", items[1] ?? "");
  return join(items.slice(0, -1).join(", "), items.at(-1) ?? "");
}

function size(s: CardStory): string {
  if (s.printed == null) return `Esta lista tiene ${s.countLabel} cartas.`;
  if (s.printed === s.count) return `El tamaño impreso es ${s.printed} y la lista mide lo mismo.`;
  return `El tamaño impreso es ${s.printed}. La lista es más larga: ${s.countLabel} cartas.`;
}

function neighbors(s: CardStory): string {
  if (s.prev && s.next) return `En el set, delante va ${s.prev.number} ${s.prev.name} y detrás ${s.next.number} ${s.next.name}.`;
  if (s.prev) return `La carta anterior es ${s.prev.number} ${s.prev.name}.`;
  if (s.next) return `La carta siguiente es ${s.next.number} ${s.next.name}.`;
  return "";
}

function setParagraph(s: CardStory): string {
  const dated = s.release ? `Salió el ${s.release}.` : "";
  const rarity = s.rarity ? `La rareza que figura es ${s.rarity}.` : "";
  const secret = s.secret && s.printed ? `El número de coleccionista supera el tamaño impreso de ${s.printed}.` : "";
  if (s.variant === 0) {
    return keep([
      dated ? `${s.setName} salió el ${s.release} dentro de la serie ${s.series}.` : `${s.setName} pertenece a la serie ${s.series}.`,
      size(s),
      `${s.name} es la carta ${s.fraction} y ocupa el puesto ${s.placeLabel} de ${s.countLabel} en esta lista.`,
      neighbors(s),
      secret,
      rarity,
    ]);
  }
  return keep([
    `El puesto ${s.placeLabel} de ${s.countLabel} en la lista de ${s.setName} es ${s.name}, número ${s.fraction}.`,
    neighbors(s),
    `La serie es ${s.series}.`,
    dated,
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
        ? `La carta dice que evoluciona de ${s.evolvesFrom}. En este catálogo ese nombre es ${s.evolvesFromSpecies.name} (${s.evolvesFromSpecies.dexLabel}).`
        : `La carta dice que evoluciona de ${s.evolvesFrom}.`,
    );
  }
  if (s.evolvesTo.length) {
    const names = s.evolvesTo.map((item) => (item.name && item.dexLabel ? `${item.printed}, ${item.name} (${item.dexLabel})` : item.printed));
    bits.push(`En evoluciona a aparecen ${list(names)}.`);
  }
  return bits.join(" ");
}

function kindParagraph(s: CardStory): string {
  if (s.kind === "t") {
    const sub = s.subtypes.length ? `Los subtipos son ${list(s.subtypes)}.` : "";
    return keep([`${s.name} es una carta de Entrenador.`, sub]);
  }
  if (s.kind === "e") {
    const sub = s.subtypes.length ? `Figura como ${list(s.subtypes)}.` : "";
    return keep([`${s.name} es una carta de Energía.`, sub]);
  }
  if (s.kind !== "p") return `${s.name} está en la lista de este set.`;
  const traits = [...s.subtypes, ...s.types].join(" ");
  const core =
    traits && s.hp
      ? `${s.name} es un Pokémon ${traits} con ${s.hp} HP.`
      : traits
        ? `${s.name} es un Pokémon ${traits}.`
        : s.hp
          ? `${s.name} es un Pokémon con ${s.hp} HP.`
          : `${s.name} es un Pokémon.`;
  const level = s.level ? `El nivel impreso es ${s.level}.` : "";
  const species = s.species.length
    ? `En la Pokédex es ${list(s.species.map((item) => `${item.name} (${item.dexLabel}), generación ${item.generation} (${item.region})`))}.`
    : "";
  if (s.variant === 1 && s.species[0]) {
    return keep([
      `${s.species[0].name} es el número ${s.species[0].dexLabel} de la Pokédex, generación ${s.species[0].generation} (${s.species[0].region}).`,
      s.species.length > 1 ? `También figuran ${list(s.species.slice(1).map((item) => `${item.name} (${item.dexLabel})`))}.` : "",
      core,
      level,
      evolution(s),
    ]);
  }
  return keep([core, level, species, evolution(s)]);
}

function artistParagraph(s: CardStory): string {
  if (!s.artist || s.artistOthersLabel == null) return "";
  if (s.artistOthers === 0) return `${s.artist} ilustró ${s.name} y ninguna otra carta del catálogo usa ese nombre.`;
  if (s.variant === 0) return `La ilustración es de ${s.artist}. Ese nombre aparece en ${s.artistOthersLabel} cartas más del catálogo.`;
  return `Ilustró esta carta ${s.artist}. Cuento ${s.artistOthersLabel} cartas más con ese ilustrador.`;
}

function printParagraph(s: CardStory): string {
  const primary = s.species[0];
  if (!primary) return "";
  const extra = s.species
    .slice(1)
    .map((item) => `${item.name} (${item.dexLabel}) tiene ${item.totalLabel} cartas en el catálogo.`)
    .join(" ");
  if (primary.others === 0) return keep([`De ${primary.name} (${primary.dexLabel}) solo está esta carta en el catálogo.`, extra]);
  const span =
    s.yearFrom && s.yearTo && s.yearFrom !== s.yearTo
      ? `Las otras impresiones con fecha van de ${s.yearFrom} a ${s.yearTo}.`
      : s.yearFrom
        ? `Las otras impresiones fechadas son de ${s.yearFrom}.`
        : "";
  const bits = [
    `Hay ${primary.othersLabel} cartas más de ${primary.name} (${primary.dexLabel}) en el catálogo.`,
    `Están en ${s.otherSets} ${s.otherSets === 1 ? "set" : "sets"}.`,
    span,
  ];
  if (s.earliest) {
    const when = s.earliest.year ? ` (${s.earliest.year})` : "";
    bits.push(`La otra carta más antigua es ${s.earliest.name} ${s.earliest.fraction} de ${s.earliest.setName}${when}.`);
    if (s.earliest.name !== s.name) bits.push(`Aquella se llama ${s.earliest.name} y esta se llama ${s.name}.`);
    if (s.hpCompare === "diff") bits.push(`Allí figuran ${s.earliest.hp} HP y aquí ${s.hp} HP.`);
    else if (s.hpCompare === "same") bits.push(`Las dos indican ${s.hp} HP.`);
    if (s.rarityCompare === "diff") bits.push(`La rareza de aquella es ${s.earliest.rarity} y la de esta es ${s.rarity}.`);
    else if (s.rarityCompare === "same") bits.push(`Las dos indican la rareza ${s.rarity}.`);
    if (s.artistCompare === "diff") bits.push(`${s.earliest.artist} ilustró aquella carta y ${s.artist} ilustró esta.`);
    if (s.regulationCompare === "diff") bits.push(`La marca de regulación allí es ${s.earliest.regulation} y aquí es ${s.regulation}.`);
    if (s.retreatCompare === "diff") bits.push(`El coste de retirada allí es ${s.earliest.retreat} y aquí es ${s.retreat}.`);
  }
  if (s.differentHp != null && s.differentHp > 0 && s.differentHpLabel) {
    bits.push(`${s.differentHpLabel} cartas más de ${primary.name} indican otros HP.`);
  }
  bits.push(extra);
  return keep(bits);
}

function playParagraph(s: CardStory): string {
  const bits: string[] = [];
  for (const ability of s.abilities) {
    const kind = ability.type ? ` como ${ability.type}` : "";
    bits.push(ability.text ? `${ability.name} aparece${kind}. ${ability.text}` : `${ability.name} aparece${kind}.`);
  }
  s.attacks.forEach((attack, index) => {
    const lead = index === 0 ? `El ataque ${attack.name}` : `${attack.name}, el otro ataque,`;
    const damage = attack.damage ? `marca ${attack.damage} de daño` : "no marca una cifra de daño";
    const cost = attack.cost ? ` El coste es ${attack.cost}.` : "";
    const text = attack.text ? ` ${attack.text}` : "";
    bits.push(`${lead} ${damage}.${cost}${text}`);
  });
  if (s.weaknesses.length) bits.push(`La debilidad es ${list(s.weaknesses)}.`);
  if (s.resistances.length) bits.push(`La resistencia es ${list(s.resistances)}.`);
  if (s.retreat != null) bits.push(`El coste de retirada es ${s.retreat}.`);
  for (const rule of s.rules) bits.push(`El texto de la carta dice: ${rule}`);
  if (s.ancient) bits.push(`${s.ancient.name} es el rasgo antiguo de esta carta. ${s.ancient.text}`);
  if (s.flavor) bits.push(`El texto de ambientación dice ${quoted("es", s.flavor)}`);
  if (s.regulation) bits.push(`La marca de regulación es ${s.regulation}.`);
  return keep(bits);
}

function binderParagraph(s: CardStory): string {
  const setLine =
    s.variant === 0
      ? `Una carpeta de expansión necesita cada carta de esa expansión. ${s.name} ocupa un hueco en la ${s.setBinder}.`
      : `La ${s.setBinder} es donde va el set ${s.setName} completo. Esta carta llena un hueco ahí.`;
  const gen =
    s.genBinders.length && s.species.length
      ? `Una carpeta de generación necesita una carta de cada especie. ${list(s.species.map((item) => item.name))} puede cubrir ese hueco en ${list(s.genBinders)}.`
      : "";
  const themes = s.themes.length ? `Las listas temáticas que incluyen exactamente esta carta son ${list(s.themes)}.` : "";
  return keep([setLine, gen, themes, s.statusLine]);
}

export function spanishStory(s: CardStory): string[] {
  const set = setParagraph(s);
  const kind = kindParagraph(s);
  const artist = artistParagraph(s);
  const print = printParagraph(s);
  const play = playParagraph(s);
  const binders = binderParagraph(s);
  const order = s.variant === 0 ? [kind, set, print, play, artist, binders] : [set, play, kind, artist, print, binders];
  return order.filter(Boolean);
}

export function spanishFaq(s: CardStory): CardFaq[] {
  const faqs: CardFaq[] = [
    {
      q: `¿De qué set es ${s.name}?`,
      a: keep([
        `${s.setName}, de la serie ${s.series}.`,
        s.release ? `Salió el ${s.release}.` : "",
        s.printed != null ? `El tamaño impreso es ${s.printed}.` : `La lista tiene ${s.countLabel} cartas.`,
      ]),
    },
    {
      q: "¿Cuál es el número de coleccionista?",
      a: `${s.fraction}. Es la entrada ${s.placeLabel} de ${s.countLabel} en esta lista.`,
    },
  ];
  if (s.artist && s.artistOthersLabel != null) {
    faqs.push({
      q: "¿Quién la ilustró?",
      a:
        s.artistOthers === 0
          ? `${s.artist}. Ninguna otra carta del catálogo usa ese nombre.`
          : `${s.artist}. El catálogo tiene ${s.artistOthersLabel} cartas más con ese ilustrador.`,
    });
  }
  if (s.rarity) faqs.push({ q: "¿Qué rareza figura?", a: `${s.rarity}.` });
  if (s.species.length) {
    faqs.push({
      q: "¿Qué número de Pokédex usa la carta?",
      a: `${list(s.species.map((item) => `${item.name} ${item.dexLabel}, generación ${item.generation} (${item.region})`))}.`,
    });
  }
  if (s.regulation) faqs.push({ q: "¿Qué marca de regulación está impresa?", a: `${s.regulation}.` });
  if (s.attacks.length) {
    faqs.push({
      q: "¿Qué ataques están impresos?",
      a: `${list(s.attacks.map((attack) => (attack.damage ? `${attack.name} (${attack.damage})` : attack.name)))}.`,
    });
  }
  return faqs;
}
