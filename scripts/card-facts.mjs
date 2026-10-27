/**
 * Card fields kept from PokemonTCG/pokemon-tcg-data.
 * Prices, images, and legality are never copied.
 */

function cleanText(value, max) {
  if (typeof value !== "string") return "";
  const text = value.replace(/\s+/g, " ").trim();
  if (!text || text.length > max) return "";
  return text;
}

function cleanList(value, max = 40) {
  if (!Array.isArray(value)) return undefined;
  const items = [];
  for (const item of value) {
    const text = cleanText(item, max);
    if (text) items.push(text);
  }
  return items.length ? items : undefined;
}

function namedTextList(value, typeKey) {
  if (!Array.isArray(value)) return undefined;
  const items = [];
  for (const entry of value) {
    if (!entry || typeof entry !== "object") continue;
    const name = cleanText(entry.name, 80);
    if (!name) continue;
    const item = { n: name };
    if (typeKey) {
      const kind = cleanText(entry[typeKey], 40);
      if (kind) item.y = kind;
    }
    const text = cleanText(entry.text, 2000);
    if (text) item.x = text;
    if (Array.isArray(entry.cost)) {
      const cost = cleanList(entry.cost, 24);
      if (cost) item.c = cost;
    }
    const damage = cleanText(entry.damage, 16);
    if (damage) item.d = damage;
    items.push(item);
  }
  return items.length ? items : undefined;
}

function pairList(value) {
  if (!Array.isArray(value)) return undefined;
  const items = [];
  for (const entry of value) {
    if (!entry || typeof entry !== "object") continue;
    const type = cleanText(entry.type, 24);
    if (!type) continue;
    const item = { t: type };
    const amount = cleanText(entry.value, 12);
    if (amount) item.v = amount;
    items.push(item);
  }
  return items.length ? items : undefined;
}

/** Fields the card pages render. Prices and images never land here. */
export function cardFacts(card) {
  const facts = {};
  const rarity = cleanText(card.rarity, 80);
  const artist = cleanText(card.artist, 120);
  const hp = cleanText(card.hp, 4);
  const subtypes = cleanList(card.subtypes);
  const types = cleanList(card.types);
  if (rarity) facts.r = rarity;
  if (subtypes) facts.st = subtypes;
  if (hp && /^\d{1,4}$/.test(hp)) facts.hp = hp;
  if (types) facts.ty = types;
  if (artist) facts.a = artist;

  const level = cleanText(card.level, 8);
  if (level && /^[0-9A-Za-z.+-]{1,8}$/.test(level)) facts.lv = level;
  const evolvesFrom = cleanText(card.evolvesFrom, 80);
  if (evolvesFrom) facts.ef = evolvesFrom;
  const evolvesTo = cleanList(card.evolvesTo, 80);
  if (evolvesTo) facts.et = evolvesTo;

  const attacks = namedTextList(card.attacks);
  if (attacks) facts.atk = attacks;
  const abilities = namedTextList(card.abilities, "type");
  if (abilities) facts.ab = abilities;
  const weaknesses = pairList(card.weaknesses);
  if (weaknesses) facts.w = weaknesses;
  const resistances = pairList(card.resistances);
  if (resistances) facts.rs = resistances;

  if (Number.isInteger(card.convertedRetreatCost) && card.convertedRetreatCost >= 0 && card.convertedRetreatCost <= 5) {
    facts.rc = card.convertedRetreatCost;
  } else if (Array.isArray(card.retreatCost) && card.retreatCost.length <= 5) {
    facts.rc = card.retreatCost.length;
  }

  const flavor = cleanText(card.flavorText, 2000);
  if (flavor) facts.fl = flavor;
  const mark = cleanText(card.regulationMark, 4);
  if (mark && /^[A-Za-z0-9]{1,4}$/.test(mark)) facts.rm = mark;
  const rules = cleanList(card.rules, 2000);
  if (rules) facts.ru = rules;
  if (card.ancientTrait && typeof card.ancientTrait === "object") {
    const name = cleanText(card.ancientTrait.name, 80);
    const text = cleanText(card.ancientTrait.text, 2000);
    if (name && text) facts.ag = { n: name, x: text };
  }
  return facts;
}

export const CATALOG_CONTENTS =
  "Collector numbers, English card names, supertypes, subtypes, level, HP, types, evolves-from, evolves-to, attacks, abilities, weakness, resistance, retreat cost, flavor text, regulation mark, card text, ancient traits, rarity, illustrator, and national dex numbers. Prices and images are not stored.";
