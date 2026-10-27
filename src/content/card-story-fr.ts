import { keep, quoted, type CardFaq, type CardStory } from "./card-story-types";

function list(items: string[]): string {
  if (items.length <= 1) return items[0] ?? "";
  if (items.length === 2) return `${items[0]} et ${items[1]}`;
  return `${items.slice(0, -1).join(", ")} et ${items.at(-1)}`;
}

function size(s: CardStory): string {
  if (s.printed == null) return `Cette liste compte ${s.countLabel} cartes.`;
  if (s.printed === s.count) return `La taille imprimée est ${s.printed}, et la liste a la même longueur.`;
  return `La taille imprimée est ${s.printed}. La liste va plus loin, jusqu'à ${s.countLabel} cartes.`;
}

function neighbors(s: CardStory): string {
  if (s.prev && s.next) return `La carte qui précède est ${s.prev.number} ${s.prev.name}. Celle qui suit est ${s.next.number} ${s.next.name}.`;
  if (s.prev) return `La carte précédente est ${s.prev.number} ${s.prev.name}.`;
  if (s.next) return `La carte suivante est ${s.next.number} ${s.next.name}.`;
  return "";
}

function setParagraph(s: CardStory): string {
  const dated = s.release ? `La sortie est datée du ${s.release}.` : "";
  const rarity = s.rarity ? `La rareté indiquée est ${s.rarity}.` : "";
  const secret = s.secret && s.printed ? `Le numéro de collection dépasse la taille imprimée de ${s.printed}.` : "";
  if (s.variant === 0) {
    return keep([
      `La série ${s.series} comprend le set ${s.setName}.`,
      dated,
      size(s),
      `${s.name} y porte le numéro ${s.fraction}, à la place ${s.placeLabel} sur ${s.countLabel} de cette liste.`,
      neighbors(s),
      secret,
      rarity,
    ]);
  }
  return keep([
    `${s.fraction} est le numéro de ${s.name} dans ${s.setName}.`,
    `Sur la liste, la place est ${s.placeLabel} sur ${s.countLabel}.`,
    neighbors(s),
    `Ce set relève de la série ${s.series}.`,
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
        ? `La carte indique une évolution depuis ${s.evolvesFrom}. Dans ce catalogue, ce nom correspond à ${s.evolvesFromSpecies.name} (${s.evolvesFromSpecies.dexLabel}).`
        : `La carte indique une évolution depuis ${s.evolvesFrom}.`,
    );
  }
  if (s.evolvesTo.length) {
    const names = s.evolvesTo.map((item) => (item.name && item.dexLabel ? `${item.printed}, ${item.name} (${item.dexLabel})` : item.printed));
    bits.push(`La mention d'évolution suivante donne ${list(names)}.`);
  }
  return bits.join(" ");
}

function kindParagraph(s: CardStory): string {
  if (s.kind === "t") {
    const sub = s.subtypes.length ? `Les sous-types indiqués sont ${list(s.subtypes)}.` : "";
    return keep([`${s.name} est une carte Dresseur.`, sub]);
  }
  if (s.kind === "e") {
    const sub = s.subtypes.length ? `Elle est classée comme ${list(s.subtypes)}.` : "";
    return keep([`${s.name} est une carte Énergie.`, sub]);
  }
  if (s.kind !== "p") return `${s.name} figure dans la liste de ce set.`;
  const traits = [...s.subtypes, ...s.types].join(" ");
  const core =
    traits && s.hp
      ? `${s.name} est un Pokémon ${traits} avec ${s.hp} HP.`
      : traits
        ? `${s.name} est un Pokémon ${traits}.`
        : s.hp
          ? `${s.name} est un Pokémon avec ${s.hp} HP.`
          : `${s.name} est un Pokémon.`;
  const level = s.level ? `Le niveau imprimé est ${s.level}.` : "";
  if (s.variant === 0 && s.species[0]) {
    const lead = `Côté Pokédex, ${s.species[0].name} est le numéro ${s.species[0].dexLabel}, génération ${s.species[0].generation} (${s.species[0].region}).`;
    const rest = s.species.slice(1);
    const more = rest.length ? `La carte cite aussi ${list(rest.map((item) => `${item.name} (${item.dexLabel})`))}.` : "";
    return keep([lead, core, level, more, evolution(s)]);
  }
  const species = s.species.length
    ? `Le Pokédex rattache cette carte à ${list(s.species.map((item) => `${item.name} (${item.dexLabel}), génération ${item.generation} (${item.region})`))}.`
    : "";
  return keep([core, level, species, evolution(s)]);
}

function artistParagraph(s: CardStory): string {
  if (!s.artist || s.artistOthersLabel == null) return "";
  if (s.artistOthers === 0) return `${s.artist} a illustré ${s.name}. Aucune autre carte du catalogue ne porte ce nom.`;
  if (s.variant === 0) return `L'illustration est signée ${s.artist}. Je retrouve ce nom sur ${s.artistOthersLabel} autres cartes du catalogue.`;
  return `${s.artist} a dessiné cette carte. Le catalogue en compte ${s.artistOthersLabel} autres avec le même illustrateur.`;
}

function printParagraph(s: CardStory): string {
  const primary = s.species[0];
  if (!primary) return "";
  const extra = s.species
    .slice(1)
    .map((item) => `${item.name} (${item.dexLabel}) compte ${item.totalLabel} cartes dans le catalogue.`)
    .join(" ");
  if (primary.others === 0) return keep([`${primary.name} (${primary.dexLabel}) n'a que cette carte dans le catalogue.`, extra]);
  const span =
    s.yearFrom && s.yearTo && s.yearFrom !== s.yearTo
      ? `Les autres tirages datés vont de ${s.yearFrom} à ${s.yearTo}.`
      : s.yearFrom
        ? `Les autres tirages datés sont de ${s.yearFrom}.`
        : "";
  const bits = [
    `Le catalogue compte ${primary.othersLabel} autres cartes de ${primary.name} (${primary.dexLabel}).`,
    `Elles se répartissent dans ${s.otherSets} ${s.otherSets === 1 ? "set" : "sets"}.`,
    span,
  ];
  if (s.earliest) {
    const when = s.earliest.year ? ` (${s.earliest.year})` : "";
    bits.push(`Le plus ancien autre tirage est ${s.earliest.name} ${s.earliest.fraction} dans ${s.earliest.setName}${when}.`);
    if (s.earliest.name !== s.name) bits.push(`Cette autre carte s'appelle ${s.earliest.name}, alors que celle-ci s'appelle ${s.name}.`);
    if (s.hpCompare === "diff") bits.push(`Là, les PV indiqués sont ${s.earliest.hp} HP. Ici, c'est ${s.hp} HP.`);
    else if (s.hpCompare === "same") bits.push(`Les deux indiquent ${s.hp} HP.`);
    if (s.rarityCompare === "diff") bits.push(`La rareté là-bas est ${s.earliest.rarity}, et ici ${s.rarity}.`);
    else if (s.rarityCompare === "same") bits.push(`Les deux indiquent la rareté ${s.rarity}.`);
    if (s.artistCompare === "diff") bits.push(`${s.earliest.artist} a illustré cette autre carte, et ${s.artist} a illustré celle-ci.`);
    if (s.regulationCompare === "diff") bits.push(`La marque de régulation là-bas est ${s.earliest.regulation}, et ici ${s.regulation}.`);
    if (s.retreatCompare === "diff") bits.push(`Le coût de retraite là-bas est ${s.earliest.retreat}, et ici ${s.retreat}.`);
  }
  if (s.differentHp != null && s.differentHp > 0 && s.differentHpLabel) {
    bits.push(`${s.differentHpLabel} autres cartes de ${primary.name} indiquent des HP différents.`);
  }
  bits.push(extra);
  return keep(bits);
}

function playParagraph(s: CardStory): string {
  const bits: string[] = [];
  for (const ability of s.abilities) {
    const kind = ability.type ? ` (${ability.type})` : "";
    bits.push(ability.text ? `${ability.name}${kind} figure sur la carte. ${ability.text}` : `${ability.name}${kind} figure sur la carte.`);
  }
  s.attacks.forEach((attack, index) => {
    const lead = index === 0 ? `L'attaque ${attack.name}` : `Une autre attaque, ${attack.name},`;
    const damage = attack.damage ? `indique ${attack.damage} dégâts` : "n'indique pas de chiffre de dégâts";
    const cost = attack.cost ? ` Le coût est ${attack.cost}.` : "";
    const text = attack.text ? ` ${attack.text}` : "";
    bits.push(`${lead} ${damage}.${cost}${text}`);
  });
  if (s.weaknesses.length) bits.push(`La faiblesse est ${list(s.weaknesses)}.`);
  if (s.resistances.length) bits.push(`La résistance est ${list(s.resistances)}.`);
  if (s.retreat != null) bits.push(`Le coût de retraite est ${s.retreat}.`);
  for (const rule of s.rules) bits.push(`Le texte de la carte dit : ${rule}`);
  if (s.ancient) bits.push(`${s.ancient.name} est le trait ancien de cette carte. ${s.ancient.text}`);
  if (s.flavor) bits.push(`Le texte d'ambiance est ${quoted("fr", s.flavor)}`);
  if (s.regulation) bits.push(`La marque de régulation est ${s.regulation}.`);
  return keep(bits);
}

function binderParagraph(s: CardStory): string {
  const setLine =
    s.variant === 0
      ? `Un classeur de set demande chaque carte du set. ${s.name} occupe une case dans le ${s.setBinder}.`
      : `Je range un set ${s.setName} complet dans le ${s.setBinder}. Cette carte y prend une case.`;
  const gen =
    s.genBinders.length && s.species.length
      ? `Un classeur de génération demande une carte de chaque espèce. ${list(s.species.map((item) => item.name))} peut remplir une case dans ${list(s.genBinders)}.`
      : "";
  const themes = s.themes.length ? `Les listes thématiques qui contiennent exactement cette carte sont ${list(s.themes)}.` : "";
  return keep([setLine, gen, themes, s.statusLine]);
}

export function frenchStory(s: CardStory): string[] {
  const set = setParagraph(s);
  const kind = kindParagraph(s);
  const artist = artistParagraph(s);
  const print = printParagraph(s);
  const play = playParagraph(s);
  const binders = binderParagraph(s);
  const order = s.variant === 0 ? [set, kind, play, artist, print, binders] : [artist, play, kind, set, print, binders];
  return order.filter(Boolean);
}

export function frenchFaq(s: CardStory): CardFaq[] {
  const faqs: CardFaq[] = [
    {
      q: s.variant === 0 ? `De quel set vient ${s.name} ?` : `${s.name} appartient à quel set ?`,
      a: keep([
        `${s.setName}, dans la série ${s.series}.`,
        s.release ? `Sortie le ${s.release}.` : "",
        s.printed != null ? `La taille imprimée est ${s.printed}.` : `La liste compte ${s.countLabel} cartes.`,
      ]),
    },
    {
      q: "Quel est le numéro de collection ?",
      a: `${s.fraction}. C'est l'entrée ${s.placeLabel} sur ${s.countLabel} de cette liste.`,
    },
  ];
  if (s.artist && s.artistOthersLabel != null) {
    faqs.push({
      q: "Qui a illustré cette carte ?",
      a:
        s.artistOthers === 0
          ? `${s.artist}. Aucune autre carte du catalogue ne porte ce nom.`
          : `${s.artist}. Le catalogue compte ${s.artistOthersLabel} autres cartes avec cet illustrateur.`,
    });
  }
  if (s.rarity) faqs.push({ q: "Quelle rareté est indiquée ?", a: `${s.rarity}.` });
  if (s.species.length) {
    faqs.push({
      q: "Quel numéro de Pokédex la carte utilise-t-elle ?",
      a: `${list(s.species.map((item) => `${item.name} ${item.dexLabel}, génération ${item.generation} (${item.region})`))}.`,
    });
  }
  if (s.regulation) faqs.push({ q: "Quelle marque de régulation est imprimée ?", a: `${s.regulation}.` });
  if (s.attacks.length) {
    faqs.push({
      q: "Quelles attaques sont imprimées ?",
      a: `${list(s.attacks.map((attack) => (attack.damage ? `${attack.name} (${attack.damage})` : attack.name)))}.`,
    });
  }
  return faqs;
}
