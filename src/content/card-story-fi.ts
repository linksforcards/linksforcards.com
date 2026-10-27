import { keep, quoted, type CardFaq, type CardStory } from "./card-story-types";

function list(items: string[]): string {
  if (items.length <= 1) return items[0] ?? "";
  if (items.length === 2) return `${items[0]} ja ${items[1]}`;
  return `${items.slice(0, -1).join(", ")} ja ${items.at(-1)}`;
}

function size(s: CardStory): string {
  if (s.printed == null) return `Tässä listassa on ${s.countLabel} korttia.`;
  if (s.printed === s.count) return `Painettu koko on ${s.printed}, ja lista on saman pituinen.`;
  return `Painettu koko on ${s.printed}. Lista on pidempi: ${s.countLabel} korttia.`;
}

function neighbors(s: CardStory): string {
  if (s.prev && s.next) return `Edellinen kortti on ${s.prev.number} ${s.prev.name}. Seuraava on ${s.next.number} ${s.next.name}.`;
  if (s.prev) return `Edellinen kortti on ${s.prev.number} ${s.prev.name}.`;
  if (s.next) return `Seuraava kortti on ${s.next.number} ${s.next.name}.`;
  return "";
}

function setParagraph(s: CardStory): string {
  const dated = s.release ? `Setti ilmestyi ${s.release}.` : "";
  const rarity = s.rarity ? `Korttiin merkitty harvinaisuus on ${s.rarity}.` : "";
  const secret = s.secret && s.printed ? `Keräilynumero on painettua settikokoa ${s.printed} suurempi.` : "";
  if (s.variant === 0) {
    return keep([
      `${s.setName} kuuluu sarjaan ${s.series}.`,
      dated,
      size(s),
      `${s.name} on kortti ${s.fraction}. Tällä listalla se on paikalla ${s.placeLabel} / ${s.countLabel}.`,
      neighbors(s),
      secret,
      rarity,
    ]);
  }
  return keep([
    `Paikka ${s.placeLabel} / ${s.countLabel} setin ${s.setName} listalla on ${s.name}, numero ${s.fraction}.`,
    neighbors(s),
    `Sarja on ${s.series}.`,
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
        ? `Kortti kertoo kehittyvänsä lajista ${s.evolvesFrom}. Tässä katalogissa tuo nimi on ${s.evolvesFromSpecies.name} (${s.evolvesFromSpecies.dexLabel}).`
        : `Kortti kertoo kehittyvänsä lajista ${s.evolvesFrom}.`,
    );
  }
  if (s.evolvesTo.length) {
    const names = s.evolvesTo.map((item) => (item.name && item.dexLabel ? `${item.printed}, ${item.name} (${item.dexLabel})` : item.printed));
    bits.push(`Kehittyy lajiksi -kohdassa ovat ${list(names)}.`);
  }
  return bits.join(" ");
}

function kindParagraph(s: CardStory): string {
  if (s.kind === "t") {
    const sub = s.subtypes.length ? `Merkityt alatyypit ovat ${list(s.subtypes)}.` : "";
    return keep([`${s.name} on kouluttajakortti.`, sub]);
  }
  if (s.kind === "e") {
    const sub = s.subtypes.length ? `Se on merkitty tyypiksi ${list(s.subtypes)}.` : "";
    return keep([`${s.name} on energiakortti.`, sub]);
  }
  if (s.kind !== "p") return `${s.name} on tämän setin listalla.`;
  const traits = [...s.subtypes, ...s.types].join(" ");
  const core =
    traits && s.hp
      ? `${s.name} on ${traits}-Pokémon, jolla on ${s.hp} HP.`
      : traits
        ? `${s.name} on ${traits}-Pokémon.`
        : s.hp
          ? `${s.name} on Pokémon, jolla on ${s.hp} HP.`
          : `${s.name} on Pokémon.`;
  const level = s.level ? `Kortin taso on ${s.level}.` : "";
  const species = s.species.length
    ? `Pokédexissä tämä on ${list(s.species.map((item) => `${item.name} (${item.dexLabel}), sukupolvi ${item.generation} (${item.region})`))}.`
    : "";
  return keep([core, level, species, evolution(s)]);
}

function artistParagraph(s: CardStory): string {
  if (!s.artist || s.artistOthersLabel == null) return "";
  if (s.artistOthers === 0) return `${s.artist} kuvitti kortin ${s.name}, eikä katalogin muissa korteissa ole samaa nimeä.`;
  if (s.variant === 0) return `${s.artist} kuvitti tämän kortin. Sama nimi on ${s.artistOthersLabel} muussa katalogin kortissa.`;
  return `Kuvittajarivillä lukee ${s.artist}. Lasken ${s.artistOthersLabel} muuta korttia samalla kuvittajalla.`;
}

function printParagraph(s: CardStory): string {
  const primary = s.species[0];
  if (!primary) return "";
  const extra = s.species
    .slice(1)
    .map((item) => `${item.name} (${item.dexLabel}) esiintyy katalogissa ${item.totalLabel} kortissa.`)
    .join(" ");
  if (primary.others === 0) return keep([`${primary.name} (${primary.dexLabel}) on katalogissa vain tällä yhdellä kortilla.`, extra]);
  const span =
    s.yearFrom && s.yearTo && s.yearFrom !== s.yearTo
      ? `Muut päivätyt painokset sijoittuvat vuosiin ${s.yearFrom}–${s.yearTo}.`
      : s.yearFrom
        ? `Muut päivätyt painokset ovat vuodelta ${s.yearFrom}.`
        : "";
  const bits = [
    `Katalogissa on ${primary.othersLabel} muuta korttia lajista ${primary.name} (${primary.dexLabel}).`,
    `Ne ovat ${s.otherSets} ${s.otherSets === 1 ? "setissä" : "setissä"}.`,
    span,
  ];
  if (s.earliest) {
    const when = s.earliest.year ? ` (${s.earliest.year})` : "";
    bits.push(`Varhaisin muu kortti on ${s.earliest.name} ${s.earliest.fraction} setissä ${s.earliest.setName}${when}.`);
    if (s.earliest.name !== s.name) bits.push(`Sen nimi on ${s.earliest.name}. Tämän nimi on ${s.name}.`);
    if (s.hpCompare === "diff") bits.push(`Siinä on ${s.earliest.hp} HP ja tässä ${s.hp} HP.`);
    else if (s.hpCompare === "same") bits.push(`Molemmissa on ${s.hp} HP.`);
    if (s.rarityCompare === "diff") bits.push(`Harvinaisuus siinä on ${s.earliest.rarity} ja tässä ${s.rarity}.`);
    else if (s.rarityCompare === "same") bits.push(`Molemmissa harvinaisuus on ${s.rarity}.`);
    if (s.artistCompare === "diff") bits.push(`${s.earliest.artist} kuvitti sen kortin ja ${s.artist} kuvitti tämän.`);
    if (s.regulationCompare === "diff") bits.push(`Sääntömerkki siinä on ${s.earliest.regulation} ja tässä ${s.regulation}.`);
    if (s.retreatCompare === "diff") bits.push(`Perääntymisen kustannus siinä on ${s.earliest.retreat} ja tässä ${s.retreat}.`);
  }
  if (s.differentHp != null && s.differentHp > 0 && s.differentHpLabel) {
    bits.push(`${s.differentHpLabel} muussa ${primary.name}-kortissa HP on eri.`);
  }
  bits.push(extra);
  return keep(bits);
}

function playParagraph(s: CardStory): string {
  const bits: string[] = [];
  for (const ability of s.abilities) {
    const kind = ability.type ? `, tyyppinä ${ability.type}` : "";
    bits.push(ability.text ? `${ability.name} on kortissa${kind}. ${ability.text}` : `${ability.name} on kortissa${kind}.`);
  }
  s.attacks.forEach((attack, index) => {
    const lead = index === 0 ? `Hyökkäys ${attack.name}` : `${attack.name} on toinen hyökkäys ja`;
    const damage = attack.damage ? `ilmoittaa vahingoksi ${attack.damage}` : "ei ilmoita vahinkolukua";
    const cost = attack.cost ? ` Kustannus on ${attack.cost}.` : "";
    const text = attack.text ? ` ${attack.text}` : "";
    bits.push(`${lead} ${damage}.${cost}${text}`);
  });
  if (s.weaknesses.length) bits.push(`Heikkous on ${list(s.weaknesses)}.`);
  if (s.resistances.length) bits.push(`Vastustus on ${list(s.resistances)}.`);
  if (s.retreat != null) bits.push(`Perääntymisen kustannus on ${s.retreat}.`);
  for (const rule of s.rules) bits.push(`Kortin teksti sanoo: ${rule}`);
  if (s.ancient) bits.push(`${s.ancient.name} on tämän kortin muinainen ominaisuus. ${s.ancient.text}`);
  if (s.flavor) bits.push(`Flavorteksti kuuluu ${quoted("fi", s.flavor)}`);
  if (s.regulation) bits.push(`Sääntömerkki on ${s.regulation}.`);
  return keep(bits);
}

function binderParagraph(s: CardStory): string {
  const setLine =
    s.variant === 0
      ? `Settikansio tarvitsee jokaisen kortin siitä setistä. ${s.name} täyttää yhden paikan kansiossa ${s.setBinder}.`
      : `${s.setBinder} on kokonaisen ${s.setName}-setin paikka. Tämä kortti täyttää siitä yhden.`;
  const gen =
    s.genBinders.length && s.species.length
      ? `Sukupolvikansio tarvitsee yhden kortin jokaisesta lajista. ${list(s.species.map((item) => item.name))} voi täyttää paikan kansiossa ${list(s.genBinders)}.`
      : "";
  const themes = s.themes.length ? `Teemalistat, joissa on juuri tämä kortti, ovat ${list(s.themes)}.` : "";
  return keep([setLine, gen, themes, s.statusLine]);
}

export function finnishStory(s: CardStory): string[] {
  const set = setParagraph(s);
  const kind = kindParagraph(s);
  const artist = artistParagraph(s);
  const print = printParagraph(s);
  const play = playParagraph(s);
  const binders = binderParagraph(s);
  const order = s.variant === 0 ? [set, kind, print, artist, play, binders] : [play, set, kind, print, artist, binders];
  return order.filter(Boolean);
}

export function finnishFaq(s: CardStory): CardFaq[] {
  const faqs: CardFaq[] = [
    {
      q: `Mistä setistä ${s.name} on?`,
      a: keep([
        `${s.setName}, sarjasta ${s.series}.`,
        s.release ? `Ilmestynyt ${s.release}.` : "",
        s.printed != null ? `Painettu koko on ${s.printed}.` : `Listassa on ${s.countLabel} korttia.`,
      ]),
    },
    {
      q: "Mikä on keräilynumero?",
      a: `${s.fraction}. Se on kohta ${s.placeLabel} / ${s.countLabel} tällä listalla.`,
    },
  ];
  if (s.artist && s.artistOthersLabel != null) {
    faqs.push({
      q: "Kuka kuvitti kortin?",
      a:
        s.artistOthers === 0
          ? `${s.artist}. Katalogin muissa korteissa ei ole samaa nimeä.`
          : `${s.artist}. Katalogissa on ${s.artistOthersLabel} muuta korttia samalla kuvittajalla.`,
    });
  }
  if (s.rarity) faqs.push({ q: "Mikä harvinaisuus on merkitty?", a: `${s.rarity}.` });
  if (s.species.length) {
    faqs.push({
      q: "Mitä Pokédex-numeroa kortti käyttää?",
      a: `${list(s.species.map((item) => `${item.name} ${item.dexLabel}, sukupolvi ${item.generation} (${item.region})`))}.`,
    });
  }
  if (s.regulation) faqs.push({ q: "Mikä sääntömerkki on painettu?", a: `${s.regulation}.` });
  if (s.attacks.length) {
    faqs.push({
      q: "Mitkä hyökkäykset on painettu?",
      a: `${list(s.attacks.map((attack) => (attack.damage ? `${attack.name} (${attack.damage})` : attack.name)))}.`,
    });
  }
  return faqs;
}
