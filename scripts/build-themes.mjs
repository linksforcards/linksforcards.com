/**
 * Builds data/catalog/themes.json from the catalog pinned to PokemonTCG/pokemon-tcg-data.
 * Card type, subtype, and era rules read the local catalog: types (`ty`), subtypes (`st`),
 * and set `series`. Era filters use series, not release date, because Crown Zenith
 * (Sword & Shield) came out after the first Scarlet & Violet promos.
 * Attack names and Pokédex flavor text are read from the same catalog (`atk`, `fl`).
 * Species traits that are not in the catalog (Ghost, Ice, Bug, pink, mythical, birds, dogs, cats, height) are
 * hard-coded dex lists, checked against PokeAPI on 29 Oct 2026:
 * type/ghost, type/ice, and type/bug default forms (national id 1–1025) are 65, 48, and 92;
 * pokemon-color/pink is 60 species; pokemon_species.csv is_mythical is 23 species.
 * Prices and image URLs are never written. Curated card-id lists live in
 * data/themes/curated and are merged at read time, not here.
 */
import { readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

const ROOT = path.resolve(import.meta.dirname, "..");
const OUT = path.join(ROOT, "data", "catalog", "themes.json");

export const BULK_RARITIES = ["Common", "Uncommon", "Rare"];
const BULK = new Set(BULK_RARITIES);
const CHASE = new Set([
  "Illustration Rare",
  "Special Illustration Rare",
  "Ultra Rare",
  "Rare Ultra",
  "Double Rare",
  "Rare Secret",
  "Rare Rainbow",
  "Hyper Rare",
  "Rare Holo EX",
  "Rare Holo V",
  "Rare Holo GX",
  "Rare Holo VMAX",
  "Rare Holo VSTAR",
  "Rare Shiny GX",
  "Shiny Ultra Rare",
  "Mega Hyper Rare",
  "Trainer Gallery Rare Holo",
  "Rare Holo LV.X",
  "Rare Prism Star",
  "Rare Holo Star",
  "Radiant Rare",
  "Amazing Rare",
  "ACE SPEC Rare",
  "Rare Shining",
  "Rare BREAK",
  "Rare Prime",
  "LEGEND",
  "Rare ACE",
  "Black White Rare",
  "Futuristic Rare",
  "MEGA_ATTACK_RARE",
]);

const BABIES = [172, 173, 174, 175, 236, 238, 239, 240, 298, 360, 406, 433, 438, 439, 440, 446, 447, 458, 848];
const EEVEELUTIONS = [133, 134, 135, 136, 196, 197, 470, 471, 700];

/** PokeAPI type/ghost, default national dex only. 65 species. */
const GHOST = [92, 93, 94, 200, 292, 302, 353, 354, 355, 356, 425, 426, 429, 442, 477, 478, 479, 487, 562, 563, 592, 593, 607, 608, 609, 622, 623, 679, 680, 681, 708, 709, 710, 711, 720, 724, 769, 770, 778, 781, 792, 802, 806, 854, 855, 864, 867, 885, 886, 887, 897, 902, 911, 937, 946, 947, 971, 972, 979, 987, 999, 1000, 1012, 1013, 1025];
/** PokeAPI type/ice, default national dex only. 48 species. */
const ICE = [87, 91, 124, 131, 144, 215, 220, 221, 225, 238, 361, 362, 363, 364, 365, 378, 459, 460, 461, 471, 473, 478, 582, 583, 584, 613, 614, 615, 646, 698, 699, 712, 713, 740, 866, 872, 873, 875, 881, 883, 896, 974, 975, 991, 996, 997, 998, 1002];
/** PokeAPI type/bug, default national dex only. 92 species. */
const BUG = [10, 11, 12, 13, 14, 15, 46, 47, 48, 49, 123, 127, 165, 166, 167, 168, 193, 204, 205, 212, 213, 214, 265, 266, 267, 268, 269, 283, 284, 290, 291, 292, 313, 314, 347, 348, 401, 402, 412, 413, 414, 415, 416, 451, 469, 540, 541, 542, 543, 544, 545, 557, 558, 588, 589, 595, 596, 616, 617, 632, 636, 637, 649, 664, 665, 666, 736, 737, 738, 742, 743, 751, 752, 767, 768, 794, 795, 824, 825, 826, 850, 851, 872, 873, 900, 917, 918, 919, 920, 953, 954, 988];
/** PokeAPI pokemon-color/pink. 60 species. */
const PINK = [35, 36, 39, 40, 79, 80, 102, 108, 113, 122, 137, 151, 173, 174, 180, 187, 199, 209, 222, 238, 241, 242, 293, 300, 350, 368, 370, 420, 439, 440, 463, 481, 517, 518, 531, 585, 594, 682, 683, 700, 719, 753, 754, 759, 760, 779, 786, 856, 857, 858, 859, 860, 905, 957, 958, 959, 968, 973, 978, 985];
/** PokeAPI pokemon_species.csv is_mythical. 23 species. */
const MYTHICAL = [151, 251, 385, 386, 489, 490, 491, 492, 493, 494, 647, 648, 649, 719, 720, 721, 801, 802, 807, 808, 809, 893, 1025];

const SV_ME = ["Scarlet & Violet", "Mega Evolution"];
const SWSH_ONWARD = ["Sword & Shield", "Scarlet & Violet", "Mega Evolution"];
const NISHIDA_EARLY = ["Base", "Gym", "Neo", "E-Card", "NP", "EX", "POP", "Diamond & Pearl", "Platinum", "HeartGold & SoulSilver"];

const PIKACHU_FRIENDS = [26, 172, 311, 312, 417, 587, 702, 777, 877, 921, 922, 923];
const PARADOX = [984, 985, 986, 987, 988, 989, 990, 991, 992, 993, 994, 995, 1005, 1006, 1007, 1008, 1009, 1010, 1020, 1021, 1022, 1023];
const KANTO_STARTERS = [1, 2, 3, 4, 5, 7, 8, 9];
const FOSSILS = [138, 139, 140, 141, 142, 345, 346, 347, 348, 408, 409, 410, 411, 564, 565, 566, 567, 696, 697, 698, 699, 880, 881, 882, 883];
const SWEETS = [420, 421, 582, 583, 584, 684, 685, 761, 762, 763, 840, 841, 842, 854, 855, 868, 869, 926, 927, 1011, 1012, 1013, 1019];
const HOLIDAY = [225, 234, 459, 460, 613, 614, 899];
const ULTRA_BEASTS = [793, 794, 795, 796, 797, 798, 799, 803, 804, 805, 806];

function range(start, end) {
  const numbers = [];
  for (let number = start; number <= end; number += 1) numbers.push(number);
  return numbers;
}

function hasDex(card, dex) {
  return card.pokemon && card.dex.some((number) => dex.has(number));
}

function inSeries(card, series) {
  return series.has(card.series);
}

function spec(slug, index, dex, rule) {
  const wanted = new Set(dex);
  return {
    slug,
    index,
    dex: [...dex],
    rule,
    test: (card) => hasDex(card, wanted),
  };
}

function artist(slug, names) {
  const wanted = new Set(names.map((name) => name.trim().toLowerCase()));
  return {
    slug,
    index: "all",
    dex: [],
    rule: `artist is ${names.join(" or ")}`,
    test: (card) => wanted.has(card.artist),
  };
}

function dexInSeries(slug, index, dex, series, rule) {
  const wanted = new Set(dex);
  const eras = new Set(series);
  return {
    slug,
    index,
    dex: [...dex],
    rule,
    test: (card) => hasDex(card, wanted) && inSeries(card, eras),
  };
}

const svMe = new Set(SV_ME);
const ghost = new Set(GHOST);
const pumpkaboo = new Set([710, 711]);
const nishidaEarly = new Set(NISHIDA_EARLY);
const swshOnward = new Set(SWSH_ONWARD);

function comparePick(a, b) {
  const byDate = a.releaseDate.localeCompare(b.releaseDate);
  if (byDate !== 0) return byDate;
  const bySet = a.setId.localeCompare(b.setId);
  if (bySet !== 0) return bySet;
  return a.number.localeCompare(b.number, "en", { numeric: true });
}

function compareCards(a, b) {
  const byDate = a.releaseDate.localeCompare(b.releaseDate);
  if (byDate !== 0) return byDate;
  const bySet = a.setId.localeCompare(b.setId);
  if (bySet !== 0) return bySet;
  return a.number.localeCompare(b.number, "en");
}

function namedFor(card, name) {
  return card.name === name || card.name.startsWith(`${name}'s `) || card.name.startsWith(`${name} & `);
}

function flavorHas(card, words) {
  const wanted = words instanceof Set ? words : new Set(words);
  const tokens = card.flavor.toLowerCase().replace(/['’]s\b/g, "").match(/[a-z]+/g) || [];
  return tokens.some((token) => wanted.has(token));
}

function attackHas(card, words) {
  const wanted = words instanceof Set ? words : new Set(words);
  return card.attacks.some((name) => {
    const tokens = name.toLowerCase().match(/[a-z]+/g) || [];
    return tokens.some((token) => wanted.has(token));
  });
}

function firstOfEachDex(dexNumbers, series) {
  const wanted = new Set(dexNumbers);
  const eras = series ? new Set(series) : null;
  return (cards) => {
    const best = new Map();
    for (const card of cards) {
      if (!card.pokemon || card.dex.length !== 1) continue;
      const dex = card.dex[0];
      if (!wanted.has(dex)) continue;
      if (eras && !eras.has(card.series)) continue;
      const prev = best.get(dex);
      if (!prev || comparePick(card, prev) < 0) best.set(dex, card);
    }
    return [...best.values()];
  };
}

const GYM_LEADERS = ["Brock", "Misty", "Lt. Surge", "Erika", "Koga", "Sabrina", "Blaine", "Giovanni", "Janine"];
const DOGS = [58, 59, 209, 210, 228, 229, 261, 262, 309, 310, 506, 507, 508, 676, 744, 745, 835, 836, 888, 889, 926, 927, 942, 943, 971, 972];
const CATS = [52, 53, 300, 301, 403, 404, 405, 431, 432, 509, 510, 667, 668, 677, 678, 725, 726, 727, 807, 863];
/** Flying type and shape wings, minus bats, the Ledyba line, Gligar, Mantine, Lugia, Ho-Oh, and Yveltal. 59 species; the notes said 58. */
const BIRDS = [16, 17, 18, 21, 22, 83, 142, 144, 145, 146, 163, 164, 177, 178, 198, 225, 227, 276, 277, 278, 279, 333, 334, 396, 397, 398, 430, 441, 468, 519, 520, 521, 561, 566, 567, 580, 581, 627, 628, 629, 630, 661, 662, 663, 722, 723, 731, 732, 733, 741, 821, 822, 823, 845, 931, 940, 941, 962, 973];
/** Default-form height ≤ 0.2 m. 36 species. */
const TINY = [50, 177, 298, 406, 412, 433, 492, 590, 595, 602, 669, 670, 682, 702, 707, 742, 743, 746, 755, 764, 778, 789, 790, 808, 821, 840, 854, 855, 868, 919, 944, 953, 955, 1012, 1013, 1024];
/** Default-form height ≥ 5.0 m. 16 species. */
const GIANT = [95, 130, 208, 249, 321, 350, 384, 483, 717, 718, 797, 799, 805, 890, 977, 1021];
const BOX_LEGENDARIES = [249, 250, 382, 383, 384, 483, 484, 487, 643, 644, 646, 716, 717, 718, 791, 792, 800, 888, 889, 890, 1007, 1008];
const PSEUDO = [...range(246, 248), ...range(371, 373), ...range(374, 376), ...range(443, 445), ...range(633, 635), ...range(704, 706), ...range(782, 784), ...range(885, 887), ...range(996, 998)];
const NIGHT_WORDS = new Set(["night", "nights", "nocturnal", "moon", "moons", "moonlight", "moonlit"]);
const BEACH_WORDS = new Set(["beach", "beaches", "shore", "shores", "shoreline", "shorelines", "coast", "coasts", "coastal", "coastline", "sandy", "onshore", "ashore"]);
const FLOWER_WORDS = new Set(["flower", "flowers", "blossom", "blossoms", "petal", "petals", "bloom", "blooms", "blooming", "pollen", "nectar"]);
const BERRY_WORDS = new Set(["berry", "berries", "fruit", "fruits", "apple", "apples", "honey"]);
const NAP_WORDS = new Set(["nap", "snore", "yawn", "sleep", "sleepy", "doze", "dozing", "slumber", "lullaby"]);
const VILLAIN_NAME = /Team Galactic|Team Flare|Team Skull|Team Yell|Team Star|\bCyrus\b|\bLysandre\b|\bGuzma\b/;

export const THEMES = [
  spec("pikachu", "species", [25], "Pokémon whose nationalPokedexNumbers include 25"),
  spec("eeveelutions", "species", EEVEELUTIONS, "Pokémon whose nationalPokedexNumbers include Eevee or an Eeveelution"),
  spec("eevee", "species", [133], "Pokémon whose nationalPokedexNumbers include 133"),
  spec("gastly-line", "species", [92, 93, 94], "Pokémon whose nationalPokedexNumbers include 92, 93, or 94"),
  spec("snorlax", "species", [143, 446], "Pokémon whose nationalPokedexNumbers include 143 or 446"),
  spec("charizard", "species", [6], "Pokémon whose nationalPokedexNumbers include 6"),
  artist("yuka-morii", ["Yuka Morii"]),
  artist("mitsuhiro-arita", ["Mitsuhiro Arita"]),
  {
    slug: "trainers-pokemon",
    index: "all",
    dex: [],
    rule: "Pokémon whose English name contains \"'s \"",
    test: (card) => card.pokemon && /'s /.test(card.name),
  },
  {
    slug: "team-rocket",
    index: "all",
    dex: [],
    rule: "Name contains Rocket, or a Pokémon whose name starts with \"Dark \"",
    test: (card) => card.name.includes("Rocket") || (card.name.startsWith("Dark ") && card.pokemon),
  },
  {
    slug: "delta-species",
    index: "all",
    dex: [],
    rule: "English name contains δ",
    test: (card) => card.name.includes("δ"),
  },
  spec("baby-pokemon", "all", BABIES, "Pokémon whose nationalPokedexNumbers include a baby species"),
  spec("paldea-starters", "species", range(906, 914), "Pokémon whose nationalPokedexNumbers include 906–914"),
  {
    slug: "halloween-ghosts",
    index: "all",
    dex: [...GHOST],
    rule: "Ghost-type species in Scarlet & Violet or Mega Evolution with rarity Common, Uncommon, or Rare, plus every Pumpkaboo and Gourgeist printing",
    test: (card) => {
      if (!card.pokemon) return false;
      if (card.dex.some((number) => pumpkaboo.has(number))) return true;
      return card.dex.some((number) => ghost.has(number)) && svMe.has(card.series) && BULK.has(card.rarity);
    },
  },
  spec("pikachu-friends", "all", PIKACHU_FRIENDS, "Pokémon whose nationalPokedexNumbers include an electric rodent other than Pikachu"),
  spec("paradox-pokemon", "all", PARADOX, "Pokémon whose nationalPokedexNumbers include a Paradox species"),
  spec("kanto-starters", "species", KANTO_STARTERS, "Pokémon whose nationalPokedexNumbers include 1–5 or 7–9"),
  spec("fossil-pokemon", "all", FOSSILS, "Pokémon whose nationalPokedexNumbers include a fossil species"),
  spec("legendary-birds", "species", [144, 145, 146], "Pokémon whose nationalPokedexNumbers include 144, 145, or 146"),
  spec("sweets-and-snacks", "all", SWEETS, "Pokémon whose nationalPokedexNumbers include a sweets or snacks species"),
  {
    slug: "dragons",
    index: "all",
    dex: [],
    rule: "Card type Dragon and set series Scarlet & Violet or Mega Evolution",
    test: (card) => card.types.includes("Dragon") && svMe.has(card.series),
  },
  dexInSeries("winter-ice", "all", ICE, SV_ME, "Ice-type species and set series Scarlet & Violet or Mega Evolution"),
  spec("legendary-beasts", "species", [243, 244, 245], "Pokémon whose nationalPokedexNumbers include 243, 244, or 245"),
  spec("mew-mewtwo", "species", [150, 151], "Pokémon whose nationalPokedexNumbers include 150 or 151"),
  dexInSeries("mythical-modern", "all", MYTHICAL, SWSH_ONWARD, "Mythical species and set series Sword & Shield, Scarlet & Violet, or Mega Evolution"),
  {
    slug: "galarian-forms",
    index: "all",
    dex: [],
    rule: "English name contains Galarian",
    test: (card) => card.name.includes("Galarian"),
  },
  {
    slug: "alolan-forms",
    index: "all",
    dex: [],
    rule: "English name contains Alolan",
    test: (card) => card.name.includes("Alolan"),
  },
  {
    slug: "hisuian-paldean-forms",
    index: "all",
    dex: [],
    rule: "English name contains Hisuian or Paldean",
    test: (card) => card.name.includes("Hisuian") || card.name.includes("Paldean"),
  },
  {
    slug: "mega-evolution",
    index: "all",
    dex: [],
    rule: "Subtype MEGA or English name starts with \"Mega \", and set series Scarlet & Violet or Mega Evolution",
    test: (card) => (card.subtypes.includes("MEGA") || card.name.startsWith("Mega ")) && svMe.has(card.series),
  },
  spec("johto-starters", "species", range(152, 160), "Pokémon whose nationalPokedexNumbers include 152–160"),
  spec("hoenn-starters", "species", range(252, 260), "Pokémon whose nationalPokedexNumbers include 252–260"),
  spec("sinnoh-starters", "species", range(387, 395), "Pokémon whose nationalPokedexNumbers include 387–395"),
  spec("unova-starters", "species", range(495, 503), "Pokémon whose nationalPokedexNumbers include 495–503"),
  spec("kalos-starters", "species", range(650, 658), "Pokémon whose nationalPokedexNumbers include 650–658"),
  spec("alola-starters", "species", range(722, 730), "Pokémon whose nationalPokedexNumbers include 722–730"),
  spec("galar-starters", "species", range(810, 818), "Pokémon whose nationalPokedexNumbers include 810–818"),
  spec("dratini-line", "species", range(147, 149), "Pokémon whose nationalPokedexNumbers include 147, 148, or 149"),
  spec("magikarp-gyarados", "species", [129, 130], "Pokémon whose nationalPokedexNumbers include 129 or 130"),
  spec("lucario-riolu", "species", [447, 448], "Pokémon whose nationalPokedexNumbers include 447 or 448"),
  spec("gardevoir-line", "species", [280, 281, 282, 475], "Pokémon whose nationalPokedexNumbers include 280, 281, 282, or 475"),
  spec("greninja-line", "species", range(656, 658), "Pokémon whose nationalPokedexNumbers include 656, 657, or 658"),
  spec("jigglypuff-line", "species", [39, 40, 174], "Pokémon whose nationalPokedexNumbers include 39, 40, or 174"),
  spec("psyduck", "species", [54, 55], "Pokémon whose nationalPokedexNumbers include 54 or 55"),
  spec("unown", "species", [201], "Pokémon whose nationalPokedexNumbers include 201"),
  spec("mimikyu", "species", [778], "Pokémon whose nationalPokedexNumbers include 778"),
  spec("ditto", "species", [132], "Pokémon whose nationalPokedexNumbers include 132"),
  spec("winter-holiday", "all", HOLIDAY, "Pokémon whose nationalPokedexNumbers include Delibird or a festive species"),
  dexInSeries("bug-catcher", "all", BUG, SV_ME, "Bug-type species and set series Scarlet & Violet or Mega Evolution"),
  dexInSeries("pink-pokemon", "all", PINK, SV_ME, "Pink species and set series Scarlet & Violet or Mega Evolution"),
  {
    slug: "fire-basics-modern",
    index: "all",
    dex: [],
    rule: "Card type Fire, subtype Basic, and set series Scarlet & Violet or Mega Evolution",
    test: (card) => card.types.includes("Fire") && card.subtypes.includes("Basic") && svMe.has(card.series),
  },
  {
    slug: "special-illustration-rares",
    index: "all",
    dex: [],
    rule: "Rarity is Special Illustration Rare",
    test: (card) => card.rarity === "Special Illustration Rare",
  },
  {
    slug: "tera-pokemon",
    index: "all",
    dex: [],
    rule: "Subtype Tera",
    test: (card) => card.subtypes.includes("Tera"),
  },
  {
    slug: "trainer-gallery",
    index: "all",
    dex: [],
    rule: "Rarity is Trainer Gallery Rare Holo",
    test: (card) => card.rarity === "Trainer Gallery Rare Holo",
  },
  spec("ultra-beasts", "all", ULTRA_BEASTS, "Pokémon whose nationalPokedexNumbers include an Ultra Beast"),
  artist("tomokazu-komiya", ["Tomokazu Komiya"]),
  artist("saya-tsuruta", ["Saya Tsuruta"]),
  artist("sowsow", ["sowsow"]),
  {
    slug: "atsuko-nishida",
    index: "all",
    dex: [],
    rule: "artist is Atsuko Nishida and set series is Base through HeartGold & SoulSilver",
    test: (card) => card.artist === "atsuko nishida" && nishidaEarly.has(card.series),
  },
  {
    slug: "atsuko-nishida-later",
    index: "all",
    dex: [],
    rule: "artist is Atsuko Nishida and set series is outside Base through HeartGold & SoulSilver",
    test: (card) => card.artist === "atsuko nishida" && !nishidaEarly.has(card.series),
  },
  {
    slug: "kanto-gym-leaders",
    index: "all",
    dex: [],
    rule: "English name is a Kanto Gym Leader, or starts with that leader's name plus \"'s \" or \" & \"",
    test: (card) => GYM_LEADERS.some((name) => namedFor(card, name)),
  },
  { slug: "misty", index: "all", dex: [], rule: "English name is Misty, or starts with \"Misty's \" or \"Misty & \"", test: (card) => namedFor(card, "Misty") },
  { slug: "erika", index: "all", dex: [], rule: "English name is Erika, or starts with \"Erika's \" or \"Erika & \"", test: (card) => namedFor(card, "Erika") },
  { slug: "brock", index: "all", dex: [], rule: "English name is Brock, or starts with \"Brock's \" or \"Brock & \"", test: (card) => namedFor(card, "Brock") },
  { slug: "sabrina", index: "all", dex: [], rule: "English name is Sabrina, or starts with \"Sabrina's \" or \"Sabrina & \"", test: (card) => namedFor(card, "Sabrina") },
  { slug: "blaine", index: "all", dex: [], rule: "English name is Blaine, or starts with \"Blaine's \" or \"Blaine & \"", test: (card) => namedFor(card, "Blaine") },
  { slug: "lt-surge", index: "all", dex: [], rule: "English name is Lt. Surge, or starts with \"Lt. Surge's \" or \"Lt. Surge & \"", test: (card) => namedFor(card, "Lt. Surge") },
  { slug: "giovanni", index: "all", dex: [], rule: "English name is Giovanni, or starts with \"Giovanni's \" or \"Giovanni & \"", test: (card) => namedFor(card, "Giovanni") },
  { slug: "n-pokemon", index: "all", dex: [], rule: "English name is N, or starts with \"N's \" or \"N & \"", test: (card) => namedFor(card, "N") },
  { slug: "cynthia", index: "all", dex: [], rule: "English name is Cynthia, or starts with \"Cynthia's \" or \"Cynthia & \"", test: (card) => namedFor(card, "Cynthia") },
  { slug: "hop", index: "all", dex: [], rule: "English name is Hop, or starts with \"Hop's \" or \"Hop & \"", test: (card) => namedFor(card, "Hop") },
  { slug: "lillie", index: "all", dex: [], rule: "English name is Lillie, or starts with \"Lillie's \" or \"Lillie & \"", test: (card) => namedFor(card, "Lillie") },
  { slug: "iono", index: "all", dex: [], rule: "English name is Iono, or starts with \"Iono's \" or \"Iono & \"", test: (card) => namedFor(card, "Iono") },
  { slug: "ethan", index: "all", dex: [], rule: "English name is Ethan, or starts with \"Ethan's \" or \"Ethan & \"", test: (card) => namedFor(card, "Ethan") },
  { slug: "marnie", index: "all", dex: [], rule: "English name is Marnie, or starts with \"Marnie's \" or \"Marnie & \"", test: (card) => namedFor(card, "Marnie") },
  { slug: "steven", index: "all", dex: [], rule: "English name is Steven, or starts with \"Steven's \" or \"Steven & \"", test: (card) => namedFor(card, "Steven") },
  {
    slug: "team-aqua-magma",
    index: "all",
    dex: [],
    rule: "English name contains Team Aqua, Team Magma, Archie, or Maxie",
    test: (card) => /Team Aqua|Team Magma|Archie|Maxie/.test(card.name),
  },
  {
    slug: "team-plasma",
    index: "all",
    dex: [],
    rule: "Subtype Team Plasma, or English name contains Team Plasma, Ghetsis, or Colress",
    test: (card) => card.subtypes.includes("Team Plasma") || /Team Plasma|Ghetsis|Colress/.test(card.name),
  },
  {
    slug: "modern-villains",
    index: "all",
    dex: [],
    rule: "English name contains Team Galactic, Team Flare, Team Skull, Team Yell, Team Star, Cyrus, Lysandre, or Guzma",
    test: (card) => VILLAIN_NAME.test(card.name),
  },
  {
    slug: "stadiums",
    index: "all",
    dex: [],
    rule: "Subtype Stadium",
    test: (card) => card.subtypes.includes("Stadium"),
  },
  {
    slug: "poke-balls",
    index: "all",
    dex: [],
    rule: "Trainer card whose English name contains the word Ball",
    test: (card) => card.trainer && /\bBall\b/.test(card.name),
  },
  {
    slug: "professors",
    index: "all",
    dex: [],
    rule: "Trainer card whose English name contains Professor or starts with Prof.",
    test: (card) => card.trainer && (card.name.includes("Professor") || card.name.startsWith("Prof.")),
  },
  {
    slug: "mcdonalds-promos",
    index: "all",
    dex: [],
    rule: "Set id starts with mcd",
    test: (card) => card.setId.startsWith("mcd"),
  },
  {
    slug: "pop-series",
    index: "all",
    dex: [],
    rule: "Set id is pop1 through pop9",
    test: (card) => /^pop[1-9]$/.test(card.setId),
  },
  {
    slug: "card-number-one",
    index: "all",
    dex: [],
    rule: "Collector number is 1",
    test: (card) => card.number === "1",
  },
  {
    slug: "first-151",
    index: "all",
    dex: range(1, 151),
    rule: "Earliest single-dex English Pokémon card for each national dex number 1–151",
    select: firstOfEachDex(range(1, 151)),
  },
  {
    slug: "living-dex-151",
    index: "all",
    dex: range(1, 151),
    rule: "Earliest single-dex Scarlet & Violet or Mega Evolution Pokémon card for each national dex number 1–151",
    select: firstOfEachDex(range(1, 151), SV_ME),
  },
  {
    slug: "living-dex-paldea",
    index: "all",
    dex: range(906, 1025),
    rule: "Earliest single-dex Scarlet & Violet or Mega Evolution Pokémon card for each national dex number 906–1025",
    select: firstOfEachDex(range(906, 1025), SV_ME),
  },
  dexInSeries("box-legendaries", "species", BOX_LEGENDARIES, SV_ME, "Box-art legendary species and set series Scarlet & Violet or Mega Evolution"),
  dexInSeries("pseudo-legendaries", "species", PSEUDO, SV_ME, "Pseudo-legendary lines other than Dratini, and set series Scarlet & Violet or Mega Evolution"),
  spec("latias-latios", "species", [380, 381], "Pokémon whose nationalPokedexNumbers include 380 or 381"),
  spec("weather-trio", "species", [382, 383, 384], "Pokémon whose nationalPokedexNumbers include 382, 383, or 384"),
  spec("creation-trio", "species", [483, 484, 487], "Pokémon whose nationalPokedexNumbers include 483, 484, or 487"),
  spec("swords-of-justice", "species", [638, 639, 640, 647], "Pokémon whose nationalPokedexNumbers include 638, 639, 640, or 647"),
  spec("tapus", "species", [785, 786, 787, 788], "Pokémon whose nationalPokedexNumbers include 785, 786, 787, or 788"),
  spec("lake-guardians", "species", [480, 481, 482], "Pokémon whose nationalPokedexNumbers include 480, 481, or 482"),
  dexInSeries("dog-pokemon", "species", DOGS, SV_ME, "Canine species and set series Scarlet & Violet or Mega Evolution"),
  dexInSeries("cat-pokemon", "species", CATS, SV_ME, "Feline species, without the Sprigatito line, and set series Scarlet & Violet or Mega Evolution"),
  {
    slug: "bird-pokemon",
    index: "species",
    dex: [...BIRDS],
    rule: "Flying wing-shaped species, without bats, Ledyba, gliders, Mantine, Lugia, Ho-Oh, or Yveltal; Scarlet & Violet or Mega Evolution; rarity Common, Uncommon, or Rare",
    test: (card) => hasDex(card, new Set(BIRDS)) && svMe.has(card.series) && BULK.has(card.rarity),
  },
  dexInSeries("tiny-pokemon", "species", TINY, SV_ME, "Species at most 0.2 m tall and set series Scarlet & Violet or Mega Evolution"),
  dexInSeries("giant-pokemon", "species", GIANT, SWSH_ONWARD, "Species at least 5 m tall and set series Sword & Shield, Scarlet & Violet, or Mega Evolution"),
  {
    slug: "nap-time",
    index: "all",
    dex: [],
    rule: "Pokémon attack name contains a whole word Nap, Snore, Yawn, Sleep, Sleepy, Doze, Dozing, Slumber, or Lullaby",
    test: (card) => card.pokemon && attackHas(card, NAP_WORDS),
  },
  {
    slug: "night-pokemon",
    index: "all",
    dex: [],
    rule: "Pokédex flavor text has night, nights, nocturnal, moon, moons, moonlight, or moonlit, and set series is Sword & Shield, Scarlet & Violet, or Mega Evolution",
    test: (card) => swshOnward.has(card.series) && flavorHas(card, NIGHT_WORDS),
  },
  {
    slug: "beach-pokemon",
    index: "all",
    dex: [],
    rule: "Pokédex flavor text has beach, shore, shoreline, coast, coastal, sandy, onshore, or ashore as a whole word",
    test: (card) => flavorHas(card, BEACH_WORDS),
  },
  {
    slug: "flower-pokemon",
    index: "all",
    dex: [],
    rule: "Pokédex flavor text has flower, blossom, petal, bloom, pollen, or nectar as a whole word",
    test: (card) => flavorHas(card, FLOWER_WORDS),
  },
  {
    slug: "berry-lovers",
    index: "all",
    dex: [],
    rule: "Pokédex flavor text has berry, berries, fruit, apple, or honey as a whole word",
    test: (card) => flavorHas(card, BERRY_WORDS),
  },
  { slug: "vmax", index: "all", dex: [], rule: "Subtype VMAX", test: (card) => card.subtypes.includes("VMAX") },
  { slug: "rapid-strike", index: "all", dex: [], rule: "Subtype Rapid Strike", test: (card) => card.subtypes.includes("Rapid Strike") },
  { slug: "single-strike", index: "all", dex: [], rule: "Subtype Single Strike", test: (card) => card.subtypes.includes("Single Strike") },
  { slug: "level-x", index: "all", dex: [], rule: "Subtype Level-Up", test: (card) => card.subtypes.includes("Level-Up") },
  {
    slug: "prism-star",
    index: "all",
    dex: [],
    rule: "Subtype Prism Star or Star",
    test: (card) => card.subtypes.includes("Prism Star") || card.subtypes.includes("Star"),
  },
  { slug: "break", index: "all", dex: [], rule: "Subtype BREAK", test: (card) => card.subtypes.includes("BREAK") },
  { slug: "pokemon-legend", index: "all", dex: [], rule: "Subtype LEGEND", test: (card) => card.subtypes.includes("LEGEND") },
  spec("meowth", "species", [52, 53, 863], "Pokémon whose nationalPokedexNumbers include 52, 53, or 863"),
  spec("magnemite-line", "species", [81, 82, 462], "Pokémon whose nationalPokedexNumbers include 81, 82, or 462"),
  spec("vulpix-line", "species", [37, 38], "Pokémon whose nationalPokedexNumbers include 37 or 38"),
  spec("slowpoke-line", "species", [79, 80, 199], "Pokémon whose nationalPokedexNumbers include 79, 80, or 199"),
  spec("clefairy-line", "species", [35, 36, 173], "Pokémon whose nationalPokedexNumbers include 35, 36, or 173"),
  spec("dedenne-morpeko", "species", [702, 877], "Pokémon whose nationalPokedexNumbers include 702 or 877"),
  spec("rayquaza", "species", [384], "Pokémon whose nationalPokedexNumbers include 384"),
  spec("togepi-line", "species", [175, 176, 468], "Pokémon whose nationalPokedexNumbers include 175, 176, or 468"),
  spec("lapras", "species", [131], "Pokémon whose nationalPokedexNumbers include 131"),
  spec("rotom", "species", [479], "Pokémon whose nationalPokedexNumbers include 479"),
  spec("lugia", "species", [249], "Pokémon whose nationalPokedexNumbers include 249"),
];

export function themeRule(slug) {
  return THEMES.find((theme) => theme.slug === slug) ?? null;
}

export async function loadCatalogCards() {
  const sets = JSON.parse(await readFile(path.join(ROOT, "data", "catalog", "sets.json"), "utf8"));
  const setById = new Map(sets.map((set) => [set.id, set]));
  const files = (await readdir(path.join(ROOT, "data", "catalog", "cards"))).filter((name) => name.endsWith(".json"));
  const cards = [];
  for (const file of files) {
    const setId = file.slice(0, -".json".length);
    const set = setById.get(setId);
    if (!set) continue;
    const rawCards = JSON.parse(await readFile(path.join(ROOT, "data", "catalog", "cards", file), "utf8"));
    for (const card of rawCards) {
      const number = String(card.n ?? "").trim();
      const name = String(card.name ?? "").trim();
      if (!number || !name) continue;
      if (number.includes(":")) throw new Error(`Collector number contains a colon: ${setId}:${number}`);
      const dex = Array.isArray(card.dex) ? [...new Set(card.dex.filter((n) => Number.isInteger(n) && n > 0))] : [];
      cards.push({
        setId,
        number,
        name,
        pokemon: card.k === "p",
        trainer: card.k === "t",
        dex,
        artist: String(card.a ?? "").trim().toLowerCase(),
        rarity: String(card.r ?? ""),
        releaseDate: String(set.releaseDate ?? ""),
        types: Array.isArray(card.ty) ? card.ty : [],
        subtypes: Array.isArray(card.st) ? card.st : [],
        series: String(set.series ?? ""),
        attacks: Array.isArray(card.atk) ? card.atk.map((move) => String(move?.n ?? "")) : [],
        flavor: String(card.fl ?? ""),
      });
    }
  }
  return cards;
}

function assertNoForbiddenKeys(value, label) {
  if (!value || typeof value !== "object") return;
  for (const key of Object.keys(value)) {
    const lowered = key.toLowerCase();
    if (["tcgplayer", "cardmarket", "prices", "images", "image", "low", "mid", "high", "market"].includes(lowered)) {
      throw new Error(`Refusing to write forbidden key "${key}" in ${label}`);
    }
    assertNoForbiddenKeys(value[key], label);
  }
}

export function buildThemeRecords(cards) {
  return THEMES.map((theme) => {
    const selected = (theme.select ? theme.select(cards) : cards.filter((card) => theme.test(card))).sort(compareCards);
    let bulk = 0;
    let chase = 0;
    const sets = new Set();
    for (const card of selected) {
      sets.add(card.setId);
      if (BULK.has(card.rarity)) bulk += 1;
      if (CHASE.has(card.rarity)) chase += 1;
    }
    return {
      slug: theme.slug,
      kind: "auto",
      rule: theme.rule,
      index: theme.index,
      dex: theme.dex,
      total: selected.length,
      setCount: sets.size,
      bulk,
      chase,
      first: selected[0]?.releaseDate ?? "",
      last: selected.at(-1)?.releaseDate ?? "",
      cards: selected.map((card) => `${card.setId}:${card.number}`),
    };
  });
}

async function main() {
  const meta = JSON.parse(await readFile(path.join(ROOT, "data", "catalog", "meta.json"), "utf8"));
  const commit = String(meta.sourceCommit ?? "");
  if (!/^[a-f0-9]{40}$/.test(commit)) throw new Error(`Catalog sourceCommit is not pinned: ${commit}`);
  console.log(`themes from catalog ${commit}`);
  const cards = await loadCatalogCards();
  const themes = buildThemeRecords(cards);
  const payload = {
    source: "https://github.com/PokemonTCG/pokemon-tcg-data",
    sourceCommit: commit,
    builtAt: new Date().toISOString().slice(0, 10),
    note: "English cards from the open dataset. Reverse holos, stamps, and Japanese-only cards are not included. Curated lists can be added later as data/themes/curated/{slug}.json.",
    themes,
  };
  assertNoForbiddenKeys(payload, "themes");
  await writeFile(OUT, `${JSON.stringify(payload)}\n`);
  for (const theme of themes) {
    const share = theme.total ? (theme.bulk / theme.total).toFixed(3) : "0";
    console.log(`${theme.slug.padEnd(28)} ${String(theme.total).padStart(4)} sets=${String(theme.setCount).padStart(3)} bulk=${share}`);
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
