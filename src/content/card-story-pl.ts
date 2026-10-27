import { keep, quoted, type CardFaq, type CardStory } from "./card-story-types";

function list(items: string[]): string {
  if (items.length <= 1) return items[0] ?? "";
  if (items.length === 2) return `${items[0]} i ${items[1]}`;
  return `${items.slice(0, -1).join(", ")} i ${items.at(-1)}`;
}

function size(s: CardStory): string {
  if (s.printed == null) return `Ta lista ma ${s.countLabel} kart.`;
  if (s.printed === s.count) return `Drukowany rozmiar to ${s.printed} i lista ma tę samą długość.`;
  return `Drukowany rozmiar to ${s.printed}. Lista jest dłuższa i liczy ${s.countLabel} kart.`;
}

function neighbors(s: CardStory): string {
  if (s.prev && s.next) return `Przed nią jest ${s.prev.number} ${s.prev.name}, a po niej ${s.next.number} ${s.next.name}.`;
  if (s.prev) return `Poprzednia karta to ${s.prev.number} ${s.prev.name}.`;
  if (s.next) return `Następna karta to ${s.next.number} ${s.next.name}.`;
  return "";
}

function setParagraph(s: CardStory): string {
  const dated = s.release ? `Set wyszedł ${s.release}.` : "";
  const rarity = s.rarity ? `Podana rzadkość to ${s.rarity}.` : "";
  const secret = s.secret && s.printed ? `Numer kolekcjonerski jest wyższy od drukowanego rozmiaru setu, czyli ${s.printed}.` : "";
  if (s.variant === 0) {
    return keep([
      `Set ${s.setName} należy do serii ${s.series}.`,
      dated,
      size(s),
      `${s.name} ma numer ${s.fraction} i zajmuje pozycję ${s.placeLabel} z ${s.countLabel} na tej liście.`,
      neighbors(s),
      secret,
      rarity,
    ]);
  }
  return keep([
    `Na liście setu ${s.setName} karta ${s.name} jest pod numerem ${s.fraction}.`,
    `Pozycja to ${s.placeLabel} z ${s.countLabel}.`,
    neighbors(s),
    `Seria to ${s.series}.`,
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
        ? `Karta podaje, że ewoluuje z ${s.evolvesFrom}. W tym katalogu ta nazwa to ${s.evolvesFromSpecies.name} (${s.evolvesFromSpecies.dexLabel}).`
        : `Karta podaje, że ewoluuje z ${s.evolvesFrom}.`,
    );
  }
  if (s.evolvesTo.length) {
    const names = s.evolvesTo.map((item) => (item.name && item.dexLabel ? `${item.printed}, ${item.name} (${item.dexLabel})` : item.printed));
    bits.push(`Przy ewoluuje w są ${list(names)}.`);
  }
  return bits.join(" ");
}

function kindParagraph(s: CardStory): string {
  if (s.kind === "t") {
    const sub = s.subtypes.length ? `Podane podtypy to ${list(s.subtypes)}.` : "";
    return keep([`${s.name} to karta trenera.`, sub]);
  }
  if (s.kind === "e") {
    const sub = s.subtypes.length ? `Jest zapisana jako ${list(s.subtypes)}.` : "";
    return keep([`${s.name} to karta energii.`, sub]);
  }
  if (s.kind !== "p") return `${s.name} jest na liście tego setu.`;
  const traits = [...s.subtypes, ...s.types].join(" ");
  const core =
    traits && s.hp
      ? `${s.name} to Pokémon ${traits} z ${s.hp} HP.`
      : traits
        ? `${s.name} to Pokémon ${traits}.`
        : s.hp
          ? `${s.name} to Pokémon z ${s.hp} HP.`
          : `${s.name} to Pokémon.`;
  const level = s.level ? `Wydrukowany poziom to ${s.level}.` : "";
  const species = s.species.length
    ? `W Pokédexie to ${list(s.species.map((item) => `${item.name} (${item.dexLabel}), generacja ${item.generation} (${item.region})`))}.`
    : "";
  if (s.variant === 1 && s.species[0]) {
    return keep([
      evolution(s),
      `${s.species[0].name} to numer ${s.species[0].dexLabel} w Pokédexie, generacja ${s.species[0].generation} (${s.species[0].region}).`,
      core,
      level,
    ]);
  }
  return keep([core, level, species, evolution(s)]);
}

function artistParagraph(s: CardStory): string {
  if (!s.artist || s.artistOthersLabel == null) return "";
  if (s.artistOthers === 0) return `Jako ilustrator widnieje ${s.artist}. Żadna inna karta w katalogu nie ma tej nazwy.`;
  if (s.variant === 0) return `Jako ilustrator widnieje ${s.artist}. Ta sama nazwa jest na ${s.artistOthersLabel} innych kartach w katalogu.`;
  return `Przy ilustratorze jest ${s.artist}. Liczę ${s.artistOthersLabel} innych kart z tym ilustratorem.`;
}

function printParagraph(s: CardStory): string {
  const primary = s.species[0];
  if (!primary) return "";
  const extra = s.species
    .slice(1)
    .map((item) => `${item.name} (${item.dexLabel}) ma ${item.totalLabel} kart w katalogu.`)
    .join(" ");
  if (primary.others === 0) return keep([`${primary.name} (${primary.dexLabel}) ma w katalogu tylko tę jedną kartę.`, extra]);
  const span =
    s.yearFrom && s.yearTo && s.yearFrom !== s.yearTo
      ? `Pozostałe druki z datą obejmują lata ${s.yearFrom}–${s.yearTo}.`
      : s.yearFrom
        ? `Pozostałe datowane druki są z ${s.yearFrom}.`
        : "";
  const bits = [
    `W katalogu jest ${primary.othersLabel} innych kart ${primary.name} (${primary.dexLabel}).`,
    `Są w ${s.otherSets} ${s.otherSets === 1 ? "secie" : "setach"}.`,
    span,
  ];
  if (s.earliest) {
    const when = s.earliest.year ? ` (${s.earliest.year})` : "";
    bits.push(`Najwcześniejsza inna karta to ${s.earliest.name} ${s.earliest.fraction} w secie ${s.earliest.setName}${when}.`);
    if (s.earliest.name !== s.name) bits.push(`Tamta nazywa się ${s.earliest.name}, a ta nazywa się ${s.name}.`);
    if (s.hpCompare === "diff") bits.push(`Tam jest ${s.earliest.hp} HP, a tu ${s.hp} HP.`);
    else if (s.hpCompare === "same") bits.push(`Obie podają ${s.hp} HP.`);
    if (s.rarityCompare === "diff") bits.push(`Rzadkość tam jest ${s.earliest.rarity}, a tu ${s.rarity}.`);
    else if (s.rarityCompare === "same") bits.push(`Obie podają rzadkość ${s.rarity}.`);
    if (s.artistCompare === "diff") bits.push(`Przy tamtej karcie widnieje ${s.earliest.artist}, a przy tej ${s.artist}.`);
    if (s.regulationCompare === "diff") bits.push(`Znacznik regulacji tam jest ${s.earliest.regulation}, a tu ${s.regulation}.`);
    if (s.retreatCompare === "diff") bits.push(`Koszt odwrotu tam wynosi ${s.earliest.retreat}, a tu ${s.retreat}.`);
  }
  if (s.differentHp != null && s.differentHp > 0 && s.differentHpLabel) {
    bits.push(`${s.differentHpLabel} innych kart ${primary.name} podaje inne HP.`);
  }
  bits.push(extra);
  return keep(bits);
}

function playParagraph(s: CardStory): string {
  const bits: string[] = [];
  for (const ability of s.abilities) {
    const kind = ability.type ? ` jako ${ability.type}` : "";
    bits.push(ability.text ? `${ability.name} jest na karcie${kind}. ${ability.text}` : `${ability.name} jest na karcie${kind}.`);
  }
  s.attacks.forEach((attack, index) => {
    const lead = index === 0 ? `Atak ${attack.name}` : `${attack.name} to kolejny atak i`;
    const damage = attack.damage ? `podaje ${attack.damage} obrażeń` : "nie podaje liczby obrażeń";
    const cost = attack.cost ? ` Koszt to ${attack.cost}.` : "";
    const text = attack.text ? ` ${attack.text}` : "";
    bits.push(`${lead} ${damage}.${cost}${text}`);
  });
  if (s.weaknesses.length) bits.push(`Słabość to ${list(s.weaknesses)}.`);
  if (s.resistances.length) bits.push(`Odporność to ${list(s.resistances)}.`);
  if (s.retreat != null) bits.push(`Koszt odwrotu wynosi ${s.retreat}.`);
  for (const rule of s.rules) bits.push(`Tekst karty brzmi: ${rule}`);
  if (s.ancient) bits.push(`${s.ancient.name} to starożytna cecha tej karty. ${s.ancient.text}`);
  if (s.flavor) bits.push(`Tekst fabularny brzmi ${quoted("pl", s.flavor)}`);
  if (s.regulation) bits.push(`Znacznik regulacji to ${s.regulation}.`);
  return keep(bits);
}

function binderParagraph(s: CardStory): string {
  const setLine =
    s.variant === 0
      ? `Segregator setu potrzebuje każdej karty z tego setu. ${s.name} zajmuje jedno miejsce w ${s.setBinder}.`
      : `${s.setBinder} jest miejscem na kompletny set ${s.setName}. Ta karta wypełnia tam jedno miejsce.`;
  const gen =
    s.genBinders.length && s.species.length
      ? `Segregator generacji potrzebuje jednej karty każdego gatunku. ${list(s.species.map((item) => item.name))} może wypełnić miejsce w ${list(s.genBinders)}.`
      : "";
  const themes = s.themes.length ? `Listy tematyczne, które zawierają dokładnie tę kartę, to ${list(s.themes)}.` : "";
  return keep([setLine, gen, themes, s.statusLine]);
}

export function polishStory(s: CardStory): string[] {
  const set = setParagraph(s);
  const kind = kindParagraph(s);
  const artist = artistParagraph(s);
  const print = printParagraph(s);
  const play = playParagraph(s);
  const binders = binderParagraph(s);
  const order = s.variant === 0 ? [kind, play, set, artist, print, binders] : [set, artist, kind, print, play, binders];
  return order.filter(Boolean);
}

export function polishFaq(s: CardStory): CardFaq[] {
  const faqs: CardFaq[] = [
    {
      q: `Z jakiego setu jest ${s.name}?`,
      a: keep([
        `${s.setName}, z serii ${s.series}.`,
        s.release ? `Wydany ${s.release}.` : "",
        s.printed != null ? `Drukowany rozmiar to ${s.printed}.` : `Lista ma ${s.countLabel} kart.`,
      ]),
    },
    {
      q: "Jaki jest numer kolekcjonerski?",
      a: `${s.fraction}. To pozycja ${s.placeLabel} z ${s.countLabel} na tej liście.`,
    },
  ];
  if (s.artist && s.artistOthersLabel != null) {
    faqs.push({
      q: "Kto zilustrował kartę?",
      a:
        s.artistOthers === 0
          ? `${s.artist}. Żadna inna karta w katalogu nie ma tego imienia.`
          : `${s.artist}. Katalog ma ${s.artistOthersLabel} innych kart z tym ilustratorem.`,
    });
  }
  if (s.rarity) faqs.push({ q: "Jaka rzadkość jest podana?", a: `${s.rarity}.` });
  if (s.species.length) {
    faqs.push({
      q: "Jakiego numeru Pokédexu używa karta?",
      a: `${list(s.species.map((item) => `${item.name} ${item.dexLabel}, generacja ${item.generation} (${item.region})`))}.`,
    });
  }
  if (s.regulation) faqs.push({ q: "Jaki znacznik regulacji jest wydrukowany?", a: `${s.regulation}.` });
  if (s.attacks.length) {
    faqs.push({
      q: "Jakie ataki są wydrukowane?",
      a: `${list(s.attacks.map((attack) => (attack.damage ? `${attack.name} (${attack.damage})` : attack.name)))}.`,
    });
  }
  return faqs;
}
