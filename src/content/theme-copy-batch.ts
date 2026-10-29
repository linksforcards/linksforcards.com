import type { Locale } from "@/lib/locales";

type Bits = { title: string; h1: string; lede: string };

const us: Record<string, Bits> = {
  "paldea-starters": {
    title: "All Paldea starter cards: Sprigatito, Fuecoco, and Quaxly checklist",
    h1: "Paldea starters",
    lede: "Sprigatito, Fuecoco, Quaxly, and their evolutions share this binder. Every printing is from the Scarlet & Violet series or the Mega Evolution series.",
  },
  "halloween-ghosts": {
    title: "Halloween Ghost Pokémon cards checklist",
    h1: "Halloween: Ghost Pokémon",
    lede: "Ghost-type species from Scarlet & Violet and Mega Evolution are here when the rarity is Common, Uncommon, or Rare. Every Pumpkaboo and Gourgeist printing is folded in, including older sets, because that pair is too short for a binder of its own.",
  },
  "pikachu-friends": {
    title: "Pikachu's friends cards checklist",
    h1: "Pikachu's friends",
    lede: "Raichu, Pichu, Plusle, Minun, and the other small electric rodents share this binder. Pikachu stays in the Pikachu checklist.",
  },
  "paradox-pokemon": {
    title: "Paradox Pokémon cards checklist",
    h1: "Paradox Pokémon",
    lede: "Ancient and future Paradox Pokémon share this binder. Every printing is from the Scarlet & Violet series or the Mega Evolution series.",
  },
  "kanto-starters": {
    title: "Kanto starter cards checklist, without Charizard",
    h1: "Kanto starters, without Charizard",
    lede: "Bulbasaur, Charmander, Squirtle, and their evolutions share this binder. Charizard is left out, because that face already has a checklist of its own.",
  },
  "fossil-pokemon": {
    title: "Fossil Pokémon cards checklist",
    h1: "Fossil Pokémon",
    lede: "Omanyte, Aerodactyl, Lileep, Cranidos, Tirtouga, Tyrunt, Dracozolt, and the other species revived from fossils are the cards here. Fossil trainer cards are not in this list.",
  },
  "legendary-birds": {
    title: "All Articuno, Zapdos, and Moltres cards: checklist",
    h1: "Legendary birds",
    lede: "Articuno, Zapdos, and Moltres share this checklist, including the Galarian forms, which use the same dex numbers. A common is the exception here.",
  },
  "sweets-and-snacks": {
    title: "Sweets and snacks Pokémon cards checklist",
    h1: "Sweets and snacks Pokémon",
    lede: "Cherubi, Swirlix, Bounsweet, Applin, Sinistea, Milcery, Fidough, Poltchageist, and the food-like species around them share this binder. Most of the cards are Common, Uncommon, or Rare.",
  },
  dragons: {
    title: "Dragon-type cards from Scarlet & Violet and Mega Evolution",
    h1: "Dragon-type cards",
    lede: "A card is here when the printed type is Dragon and the set series is Scarlet & Violet or Mega Evolution. Older Dragon cards stay out.",
  },
  "winter-ice": {
    title: "Winter Ice Pokémon cards checklist",
    h1: "Winter: Ice Pokémon",
    lede: "Ice-type species from the Scarlet & Violet and Mega Evolution series fill this binder. Glaceon cards from those series are also in the Eeveelution list.",
  },
  "legendary-beasts": {
    title: "All Raikou, Entei, and Suicune cards: checklist",
    h1: "Legendary beasts",
    lede: "Raikou, Entei, and Suicune share this checklist. Most of the printings are older than the Scarlet & Violet series.",
  },
  "mew-mewtwo": {
    title: "All Mew and Mewtwo cards: master set list and checklist",
    h1: "Mew and Mewtwo",
    lede: "Mew and Mewtwo share this binder. A common is the exception, so this is not a list I finish from bulk.",
  },
  "mythical-modern": {
    title: "Mythical Pokémon cards from Sword & Shield onward",
    h1: "Mythical Pokémon, from Sword & Shield on",
    lede: "Mew, Celebi, Jirachi, and the other mythical species are here when the set series is Sword & Shield, Scarlet & Violet, or Mega Evolution. Older mythical printings stay out.",
  },
  "galarian-forms": {
    title: "Galarian form cards checklist",
    h1: "Galarian forms",
    lede: "An English card name with Galarian in it lands in this binder. Most of the printings are from the Sword & Shield series.",
  },
  "alolan-forms": {
    title: "Alolan form cards checklist",
    h1: "Alolan forms",
    lede: "An English card name with Alolan in it lands in this binder. Most of the printings are from the Sun & Moon series.",
  },
  "hisuian-paldean-forms": {
    title: "Hisuian and Paldean form cards checklist",
    h1: "Hisuian and Paldean forms",
    lede: "Hisuian or Paldean in the English name is enough for a slot here. Paldean on its own would be a short list, so the two regional forms stay together.",
  },
  "mega-evolution": {
    title: "Mega Evolution cards checklist",
    h1: "Mega Evolution cards",
    lede: "A card from Scarlet & Violet or Mega Evolution is here when it has the MEGA subtype or the English name starts with Mega. XY-era M-EX cards stay out.",
  },
  "johto-starters": {
    title: "All Johto starter cards: Chikorita, Cyndaquil, and Totodile checklist",
    h1: "Johto starters",
    lede: "Chikorita, Cyndaquil, Totodile, and their evolutions share this binder.",
  },
  "hoenn-starters": {
    title: "All Hoenn starter cards: Treecko, Torchic, and Mudkip checklist",
    h1: "Hoenn starters",
    lede: "Treecko, Torchic, Mudkip, and their evolutions share this binder.",
  },
  "sinnoh-starters": {
    title: "All Sinnoh starter cards: Turtwig, Chimchar, and Piplup checklist",
    h1: "Sinnoh starters",
    lede: "Turtwig, Chimchar, Piplup, and their evolutions share this binder.",
  },
  "unova-starters": {
    title: "All Unova starter cards: Snivy, Tepig, and Oshawott checklist",
    h1: "Unova starters",
    lede: "Snivy, Tepig, Oshawott, and their evolutions share this binder.",
  },
  "kalos-starters": {
    title: "All Kalos starter cards: Chespin, Fennekin, and Froakie checklist",
    h1: "Kalos starters",
    lede: "Chespin, Fennekin, Froakie, and their evolutions share this binder. Froakie, Frogadier, and Greninja also have a shorter list of their own.",
  },
  "alola-starters": {
    title: "All Alola starter cards: Rowlet, Litten, and Popplio checklist",
    h1: "Alola starters",
    lede: "Rowlet, Litten, Popplio, and their evolutions share this binder.",
  },
  "galar-starters": {
    title: "All Galar starter cards: Grookey, Scorbunny, and Sobble checklist",
    h1: "Galar starters",
    lede: "Grookey, Scorbunny, Sobble, and their evolutions share this binder.",
  },
  "dratini-line": {
    title: "All Dragonite cards: Dratini line master set list and checklist",
    h1: "Dratini, Dragonair, and Dragonite",
    lede: "Dratini, Dragonair, and Dragonite share this binder. A line is easier to finish than one stage pulled out on its own.",
  },
  "magikarp-gyarados": {
    title: "All Magikarp and Gyarados cards: master set list and checklist",
    h1: "Magikarp and Gyarados",
    lede: "Magikarp and Gyarados share this checklist. The small card belongs with the big one.",
  },
  "lucario-riolu": {
    title: "All Lucario and Riolu cards: master set list and checklist",
    h1: "Riolu and Lucario",
    lede: "Riolu and Lucario share this binder. Riolu is also in the Baby Pokémon list, because one card can fill two themed lists.",
  },
  "gardevoir-line": {
    title: "All Gardevoir cards: Ralts line master set list and checklist",
    h1: "Ralts, Kirlia, Gardevoir, and Gallade",
    lede: "Ralts, Kirlia, Gardevoir, and Gallade share this binder.",
  },
  "greninja-line": {
    title: "All Greninja cards: Froakie line master set list and checklist",
    h1: "Froakie, Frogadier, and Greninja",
    lede: "Froakie, Frogadier, and Greninja share this checklist. Every card here is also in the Kalos starters binder.",
  },
  "jigglypuff-line": {
    title: "All Jigglypuff cards: master set list and checklist",
    h1: "Igglybuff, Jigglypuff, and Wigglytuff",
    lede: "Igglybuff, Jigglypuff, and Wigglytuff share this binder. Igglybuff is also in the Baby Pokémon list.",
  },
  psyduck: {
    title: "All Psyduck and Golduck cards: master set list and checklist",
    h1: "Psyduck and Golduck",
    lede: "Psyduck and Golduck share this checklist. Most of the cards are Common, Uncommon, or Rare.",
  },
  unown: {
    title: "All Unown cards: master set list and checklist",
    h1: "Unown",
    lede: "Every Unown letter in the open list sits in this binder. Almost all of the printings are Common, Uncommon, or Rare, and almost all of them are older than Scarlet & Violet.",
  },
  mimikyu: {
    title: "All Mimikyu cards: master set list and checklist",
    h1: "All Mimikyu cards",
    lede: "Mimikyu has a short checklist, and it is still more than one page. I keep every English printing in the order the sets came out.",
  },
  ditto: {
    title: "All Ditto cards: master set list and checklist",
    h1: "All Ditto cards",
    lede: "Ditto has a short checklist. Every English printing in the open list is here, in the order the sets came out.",
  },
  "winter-holiday": {
    title: "Holiday Pokémon cards: Delibird and festive friends checklist",
    h1: "Holiday: Delibird and festive friends",
    lede: "Delibird, Stantler, Snover, Abomasnow, Cubchoo, Beartic, and Wyrdeer share this binder. Most of the cards are Common, Uncommon, or Rare.",
  },
  "bug-catcher": {
    title: "Bug Pokémon cards from Scarlet & Violet and Mega Evolution",
    h1: "Bug Pokémon",
    lede: "Bug-type species from the Scarlet & Violet and Mega Evolution series fill this binder. Older Bug cards stay out.",
  },
  "pink-pokemon": {
    title: "Pink Pokémon cards from Scarlet & Violet and Mega Evolution",
    h1: "Pink Pokémon",
    lede: "Species whose Pokédex color is pink, printed in the Scarlet & Violet or Mega Evolution series, share this binder.",
  },
  "fire-basics-modern": {
    title: "Fire Basic Pokémon cards from Scarlet & Violet and Mega Evolution",
    h1: "Fire Basic Pokémon",
    lede: "A card is here when the printed type is Fire, the subtype is Basic, and the set series is Scarlet & Violet or Mega Evolution. A Stage 1 stays out.",
  },
  "special-illustration-rares": {
    title: "Special Illustration Rare cards checklist",
    h1: "Special Illustration Rares",
    lede: "Every English card with the rarity Special Illustration Rare is in this binder. None of them are Common, Uncommon, or Rare, so a common is not the way through this list.",
  },
  "tera-pokemon": {
    title: "Tera Pokémon cards checklist",
    h1: "Tera Pokémon",
    lede: "A card with the Tera subtype is in this binder. These are the Tera Pokémon ex printings, and a common is not among them.",
  },
  "trainer-gallery": {
    title: "Trainer Gallery cards checklist",
    h1: "Trainer Gallery",
    lede: "Trainer Gallery Rare Holo is the rarity on every card here. The stretch is the Sword & Shield Trainer Gallery subsets, and it is a short binder.",
  },
  "ultra-beasts": {
    title: "Ultra Beast cards checklist",
    h1: "Ultra Beasts",
    lede: "Nihilego, Buzzwole, Pheromosa, Xurkitree, Celesteela, Kartana, Guzzlord, Poipole, Naganadel, Stakataka, and Blacephalon share this binder. Almost all of the printings are older than Scarlet & Violet.",
  },
  "tomokazu-komiya": {
    title: "Tomokazu Komiya cards checklist",
    h1: "Tomokazu Komiya cards",
    lede: "Tomokazu Komiya's English cards fill this binder. Most of them are Common, Uncommon, or Rare. Bulk is gold, and this list is full of it.",
  },
  "saya-tsuruta": {
    title: "Saya Tsuruta cards checklist",
    h1: "Saya Tsuruta cards",
    lede: "Saya Tsuruta's English cards fill this binder. Most of them are Common, Uncommon, or Rare.",
  },
  sowsow: {
    title: "sowsow cards checklist",
    h1: "sowsow cards",
    lede: "Cards illustrated by sowsow fill this binder. The credit is printed in lowercase, and most of the cards are Common, Uncommon, or Rare.",
  },
  "atsuko-nishida": {
    title: "Atsuko Nishida cards through HeartGold & SoulSilver",
    h1: "Atsuko Nishida cards, early series",
    lede: "Atsuko Nishida has drawn English cards since the first sets. The full list is too long for one binder, so this one stops at HeartGold & SoulSilver. Black & White and later have a binder of their own.",
  },
  "atsuko-nishida-later": {
    title: "Atsuko Nishida cards from Black & White onward",
    h1: "Atsuko Nishida cards, later series",
    lede: "This is the rest of the Atsuko Nishida checklist: Black & White through Mega Evolution, plus the McDonald's promos the catalog files outside a main series. The earlier series sit in the other Nishida binder.",
  },
};

const de: Record<string, Bits> = {
  "paldea-starters": {
    title: "Alle Felori-, Krokel- und Kwaks-Karten",
    h1: "Felori, Krokel und Kwaks",
    lede: "Felori, Krokel, Kwaks und ihre Entwicklungen teilen sich diesen Binder. Jede Karte stammt aus Scarlet & Violet oder der Mega-Entwicklung.",
  },
  "halloween-ghosts": {
    title: "Halloween: Geist-Pokémon Kartenliste",
    h1: "Halloween: Geist-Pokémon",
    lede: "Geist-Pokémon aus Scarlet & Violet und der Mega-Entwicklung stehen hier, wenn die Seltenheit Common, Uncommon oder Rare ist. Jeder Irrbis und jeder Pumpdjinn ist dabei, auch aus älteren Sets.",
  },
  "pikachu-friends": {
    title: "Pikachus Freunde: Kartenliste",
    h1: "Pikachus Freunde",
    lede: "Raichu, Pichu, Plusle, Minun und die anderen kleinen Elektro-Nager teilen sich diesen Binder. Pikachu bleibt in der eigenen Liste.",
  },
  "paradox-pokemon": {
    title: "Paradox-Pokémon Kartenliste",
    h1: "Paradox-Pokémon",
    lede: "Paradox-Pokémon aus Vergangenheit und Zukunft teilen sich diesen Binder. Jede Karte stammt aus Scarlet & Violet oder der Mega-Entwicklung.",
  },
  "kanto-starters": {
    title: "Kanto-Starter ohne Glurak",
    h1: "Kanto-Starter ohne Glurak",
    lede: "Bisasam, Glumanda, Schiggy und ihre Entwicklungen teilen sich diesen Binder. Glurak bleibt draußen, weil diese Karten schon eine eigene Liste haben.",
  },
  "fossil-pokemon": {
    title: "Fossil-Pokémon Kartenliste",
    h1: "Fossil-Pokémon",
    lede: "Amonitas, Aerodactyl, Liliep, Koknodon, Galapaflos, Balgoras, Lectragon und die anderen aus Fossilien erweckten Arten stehen hier. Fossil-Trainerkarten sind nicht in der Liste.",
  },
  "legendary-birds": {
    title: "Alle Arktos-, Zapdos- und Lavados-Karten",
    h1: "Legendäre Vögel",
    lede: "Arktos, Zapdos und Lavados teilen sich diese Liste, einschließlich der Galar-Formen, die dieselbe Dex-Nummer tragen. Eine häufige Karte ist hier die Ausnahme.",
  },
  "sweets-and-snacks": {
    title: "Süßigkeiten-Pokémon Kartenliste",
    h1: "Süßigkeiten-Pokémon",
    lede: "Kikugi, Flauschling, Frubberl, Knapfel, Fatalitee, Hokumil, Hefel, Mortcha und die essen-ähnlichen Arten darum teilen sich diesen Binder. Die meisten Karten sind Common, Uncommon oder Rare.",
  },
  dragons: {
    title: "Drachen-Karten aus Scarlet & Violet und Mega-Entwicklung",
    h1: "Drachen-Karten",
    lede: "Eine Karte steht hier, wenn der gedruckte Typ Drache ist und die Serie Scarlet & Violet oder Mega-Entwicklung heißt. Ältere Drachen-Karten bleiben draußen.",
  },
  "winter-ice": {
    title: "Winter: Eis-Pokémon Kartenliste",
    h1: "Winter: Eis-Pokémon",
    lede: "Eis-Pokémon aus Scarlet & Violet und der Mega-Entwicklung füllen diesen Binder. Glaziola aus diesen Serien steht auch in der Evoli-Liste.",
  },
  "legendary-beasts": {
    title: "Alle Raikou-, Entei- und Suicune-Karten",
    h1: "Raikou, Entei und Suicune",
    lede: "Raikou, Entei und Suicune teilen sich diese Liste. Die meisten Drucke sind älter als Scarlet & Violet.",
  },
  "mew-mewtwo": {
    title: "Alle Mew- und Mewtu-Karten",
    h1: "Mewtu und Mew",
    lede: "Mewtu und Mew teilen sich diesen Binder. Eine häufige Karte ist die Ausnahme, und aus Bulk schließe ich diese Liste nicht.",
  },
  "mythical-modern": {
    title: "Mysteriöse Pokémon ab Sword & Shield",
    h1: "Mysteriöse Pokémon ab Sword & Shield",
    lede: "Mew, Celebi, Jirachi und die anderen mysteriösen Arten stehen hier, wenn die Serie Sword & Shield, Scarlet & Violet oder Mega-Entwicklung ist. Ältere Drucke bleiben draußen.",
  },
  "galarian-forms": {
    title: "Galar-Form Kartenliste",
    h1: "Galar-Formen",
    lede: "Steht Galarian im englischen Kartennamen, hat die Karte hier ein Fach. Die meisten Drucke stammen aus Sword & Shield.",
  },
  "alolan-forms": {
    title: "Alola-Form Kartenliste",
    h1: "Alola-Formen",
    lede: "Steht Alolan im englischen Kartennamen, hat die Karte hier ein Fach. Die meisten Drucke stammen aus Sonne und Mond.",
  },
  "hisuian-paldean-forms": {
    title: "Hisui-Form und Paldea-Form Kartenliste",
    h1: "Hisui-Form und Paldea-Form",
    lede: "Hisuian oder Paldean im englischen Namen reicht für ein Fach. Paldea allein wäre eine kurze Liste, deshalb bleiben die beiden Formen zusammen.",
  },
  "mega-evolution": {
    title: "Mega-Entwicklung Kartenliste",
    h1: "Mega-Entwicklung",
    lede: "Eine Karte aus Scarlet & Violet oder der Mega-Entwicklung steht hier, wenn sie den Subtyp MEGA hat oder der englische Name mit Mega beginnt. M-EX aus der XY-Zeit bleiben draußen.",
  },
  "johto-starters": {
    title: "Alle Endivie-, Feurigel- und Karnimani-Karten",
    h1: "Johto-Starter",
    lede: "Endivie, Feurigel, Karnimani und ihre Entwicklungen teilen sich diesen Binder.",
  },
  "hoenn-starters": {
    title: "Alle Geckarbor-, Flemmli- und Hydropi-Karten",
    h1: "Hoenn-Starter",
    lede: "Geckarbor, Flemmli, Hydropi und ihre Entwicklungen teilen sich diesen Binder.",
  },
  "sinnoh-starters": {
    title: "Alle Chelast-, Panflam- und Plinfa-Karten",
    h1: "Sinnoh-Starter",
    lede: "Chelast, Panflam, Plinfa und ihre Entwicklungen teilen sich diesen Binder.",
  },
  "unova-starters": {
    title: "Alle Serpifeu-, Floink- und Ottaro-Karten",
    h1: "Einall-Starter",
    lede: "Serpifeu, Floink, Ottaro und ihre Entwicklungen teilen sich diesen Binder.",
  },
  "kalos-starters": {
    title: "Alle Igamaro-, Fynx- und Froxy-Karten",
    h1: "Kalos-Starter",
    lede: "Igamaro, Fynx, Froxy und ihre Entwicklungen teilen sich diesen Binder. Froxy, Amphizel und Quajutsu haben dazu eine kürzere eigene Liste.",
  },
  "alola-starters": {
    title: "Alle Bauz-, Flamiau- und Robball-Karten",
    h1: "Alola-Starter",
    lede: "Bauz, Flamiau, Robball und ihre Entwicklungen teilen sich diesen Binder.",
  },
  "galar-starters": {
    title: "Alle Chimpep-, Hopplo- und Memmeon-Karten",
    h1: "Galar-Starter",
    lede: "Chimpep, Hopplo, Memmeon und ihre Entwicklungen teilen sich diesen Binder.",
  },
  "dratini-line": {
    title: "Alle Dragoran-Karten: Dratini und Dragonir",
    h1: "Dratini, Dragonir und Dragoran",
    lede: "Dratini, Dragonir und Dragoran teilen sich diesen Binder. Eine Linie ist leichter zu schließen als eine Stufe allein.",
  },
  "magikarp-gyarados": {
    title: "Alle Karpador- und Garados-Karten",
    h1: "Karpador und Garados",
    lede: "Karpador und Garados teilen sich diese Liste. Die kleine Karte gehört zur großen.",
  },
  "lucario-riolu": {
    title: "Alle Lucario- und Riolu-Karten",
    h1: "Riolu und Lucario",
    lede: "Riolu und Lucario teilen sich diesen Binder. Riolu steht auch in der Baby-Pokémon-Liste.",
  },
  "gardevoir-line": {
    title: "Alle Guardevoir-Karten: Trasla und Galagladi",
    h1: "Trasla, Kirlia, Guardevoir und Galagladi",
    lede: "Trasla, Kirlia, Guardevoir und Galagladi teilen sich diesen Binder.",
  },
  "greninja-line": {
    title: "Alle Quajutsu-Karten: Froxy und Amphizel",
    h1: "Froxy, Amphizel und Quajutsu",
    lede: "Froxy, Amphizel und Quajutsu teilen sich diese Liste. Jede Karte davon steht auch im Kalos-Starter-Binder.",
  },
  "jigglypuff-line": {
    title: "Alle Pummeluff-Karten: Fluffeluff und Knuddeluff",
    h1: "Fluffeluff, Pummeluff und Knuddeluff",
    lede: "Fluffeluff, Pummeluff und Knuddeluff teilen sich diesen Binder. Fluffeluff steht auch in der Baby-Pokémon-Liste.",
  },
  psyduck: {
    title: "Alle Enton- und Entoron-Karten",
    h1: "Enton und Entoron",
    lede: "Enton und Entoron teilen sich diese Liste. Die meisten Karten sind Common, Uncommon oder Rare.",
  },
  unown: {
    title: "Alle Icognito-Karten",
    h1: "Icognito",
    lede: "Jeder Icognito-Buchstabe aus der offenen Liste liegt in diesem Binder. Fast alles ist Common, Uncommon oder Rare, und fast alles ist älter als Scarlet & Violet.",
  },
  mimikyu: {
    title: "Alle Mimigma-Karten",
    h1: "Alle Mimigma-Karten",
    lede: "Mimigma hat eine kurze Liste, und sie ist trotzdem länger als eine Seite. Ich halte jeden englischen Druck in der Reihenfolge der Sets.",
  },
  ditto: {
    title: "Alle Ditto-Karten",
    h1: "Alle Ditto-Karten",
    lede: "Ditto hat eine kurze Liste. Jeder englische Druck aus dem offenen Datensatz liegt hier, in der Reihenfolge der Sets.",
  },
  "winter-holiday": {
    title: "Festtags-Pokémon: Botogel und die anderen",
    h1: "Festtag: Botogel und die anderen",
    lede: "Botogel, Damhirplex, Shnebedeck, Rexblisar, Petznief, Siberio und Damythir teilen sich diesen Binder. Die meisten Karten sind Common, Uncommon oder Rare.",
  },
  "bug-catcher": {
    title: "Käfer-Pokémon aus Scarlet & Violet und Mega-Entwicklung",
    h1: "Käfer-Pokémon",
    lede: "Käfer-Pokémon aus Scarlet & Violet und der Mega-Entwicklung füllen diesen Binder. Ältere Käfer-Karten bleiben draußen.",
  },
  "pink-pokemon": {
    title: "Rosa Pokémon aus Scarlet & Violet und Mega-Entwicklung",
    h1: "Rosa Pokémon",
    lede: "Arten, deren Pokédex-Farbe Rosa ist, aus Scarlet & Violet oder der Mega-Entwicklung, teilen sich diesen Binder.",
  },
  "fire-basics-modern": {
    title: "Feuer-Basis-Pokémon aus Scarlet & Violet und Mega-Entwicklung",
    h1: "Feuer-Basis-Pokémon",
    lede: "Eine Karte steht hier, wenn der gedruckte Typ Feuer ist, der Subtyp Basic ist und die Serie Scarlet & Violet oder Mega-Entwicklung heißt. Ein Stage 1 bleibt draußen.",
  },
  "special-illustration-rares": {
    title: "Special Illustration Rare Kartenliste",
    h1: "Special Illustration Rare",
    lede: "Jede englische Karte mit der Seltenheit Special Illustration Rare liegt in diesem Binder. Keine davon ist Common, Uncommon oder Rare.",
  },
  "tera-pokemon": {
    title: "Tera-Pokémon Kartenliste",
    h1: "Tera-Pokémon",
    lede: "Eine Karte mit dem Subtyp Tera liegt in diesem Binder. Das sind die Tera-Pokémon-ex, und eine häufige Karte ist nicht dabei.",
  },
  "trainer-gallery": {
    title: "Trainer Gallery Kartenliste",
    h1: "Trainer Gallery",
    lede: "Trainer Gallery Rare Holo ist die Seltenheit auf jeder Karte hier. Der Abschnitt ist die Trainer Gallery aus Sword & Shield, und der Binder ist kurz.",
  },
  "ultra-beasts": {
    title: "Ultrabestien Kartenliste",
    h1: "Ultrabestien",
    lede: "Anego, Masskito, Schabelle, Voltriant, Kaguron, Katagami, Schlingking, Venicro, Agoyon, Muramura und Kopplosio teilen sich diesen Binder. Fast alle Drucke sind älter als Scarlet & Violet.",
  },
  "tomokazu-komiya": {
    title: "Tomokazu Komiya Kartenliste",
    h1: "Tomokazu Komiya Karten",
    lede: "Die englischen Karten von Tomokazu Komiya füllen diesen Binder. Die meisten sind Common, Uncommon oder Rare. Bulk ist Gold, und diese Liste ist voll davon.",
  },
  "saya-tsuruta": {
    title: "Saya Tsuruta Kartenliste",
    h1: "Saya Tsuruta Karten",
    lede: "Die englischen Karten von Saya Tsuruta füllen diesen Binder. Die meisten sind Common, Uncommon oder Rare.",
  },
  sowsow: {
    title: "sowsow Kartenliste",
    h1: "sowsow Karten",
    lede: "Karten von sowsow füllen diesen Binder. Der Credit steht in Kleinbuchstaben, und die meisten Karten sind Common, Uncommon oder Rare.",
  },
  "atsuko-nishida": {
    title: "Atsuko Nishida Karten bis HeartGold & SoulSilver",
    h1: "Atsuko Nishida, frühe Serien",
    lede: "Atsuko Nishida zeichnet englische Karten seit den ersten Sets. Die ganze Liste ist zu lang für einen Binder, deshalb endet dieser bei HeartGold & SoulSilver. Ab Black & White liegt ein eigener Binder.",
  },
  "atsuko-nishida-later": {
    title: "Atsuko Nishida Karten ab Black & White",
    h1: "Atsuko Nishida, spätere Serien",
    lede: "Das ist der Rest der Nishida-Liste: Black & White bis zur Mega-Entwicklung, plus die McDonald's-Promos, die der Katalog außerhalb einer Hauptserie führt. Die früheren Serien liegen im anderen Nishida-Binder.",
  },
};

const fr: Record<string, Bits> = {
  "paldea-starters": {
    title: "Cartes Poussacha, Chochodile et Coiffeton",
    h1: "Poussacha, Chochodile et Coiffeton",
    lede: "Poussacha, Chochodile, Coiffeton et leurs évolutions partagent ce classeur. Chaque tirage vient de Scarlet & Violet ou de Méga-Évolution.",
  },
  "halloween-ghosts": {
    title: "Halloween : cartes des Pokémon Spectre",
    h1: "Halloween : Pokémon Spectre",
    lede: "Les espèces Spectre de Scarlet & Violet et de Méga-Évolution sont ici quand la rareté est Common, Uncommon ou Rare. Chaque Pitrouille et chaque Banshitrouye entre, y compris les séries plus anciennes.",
  },
  "pikachu-friends": {
    title: "Les amis de Pikachu : liste",
    h1: "Les amis de Pikachu",
    lede: "Raichu, Pichu, Posipi, Négapi et les autres petits rongeurs électriques partagent ce classeur. Pikachu reste dans sa propre liste.",
  },
  "paradox-pokemon": {
    title: "Liste des Pokémon Paradoxe",
    h1: "Pokémon Paradoxe",
    lede: "Les Pokémon Paradoxe du passé et du futur partagent ce classeur. Chaque tirage vient de Scarlet & Violet ou de Méga-Évolution.",
  },
  "kanto-starters": {
    title: "Starters de Kanto sans Dracaufeu",
    h1: "Starters de Kanto, sans Dracaufeu",
    lede: "Bulbizarre, Salamèche, Carapuce et leurs évolutions partagent ce classeur. Dracaufeu reste dehors, parce que ce visage a déjà sa liste.",
  },
  "fossil-pokemon": {
    title: "Liste des Pokémon fossiles",
    h1: "Pokémon fossiles",
    lede: "Amonita, Ptéra, Lilia, Kranidos, Carapagos, Ptyranidur, Galvagon et les autres espèces réveillées d'un fossile sont ici. Les cartes Dresseur Fossile n'y sont pas.",
  },
  "legendary-birds": {
    title: "Toutes les cartes Artikodin, Électhor et Sulfura",
    h1: "Oiseaux légendaires",
    lede: "Artikodin, Électhor et Sulfura partagent cette liste, formes de Galar comprises, car elles gardent le même numéro de dex. Une commune est l'exception.",
  },
  "sweets-and-snacks": {
    title: "Pokémon sucrés et snacks : liste",
    h1: "Pokémon sucrés et snacks",
    lede: "Ceribou, Sucroquin, Croquine, Verpom, Théffroi, Crèmy, Pâtachiot, Poltchageist et les espèces qui leur ressemblent partagent ce classeur. La plupart des cartes sont Common, Uncommon ou Rare.",
  },
  dragons: {
    title: "Cartes Dragon de Scarlet & Violet et Méga-Évolution",
    h1: "Cartes de type Dragon",
    lede: "Une carte est ici quand le type imprimé est Dragon et que la série est Scarlet & Violet ou Méga-Évolution. Les cartes Dragon plus anciennes restent dehors.",
  },
  "winter-ice": {
    title: "Hiver : cartes des Pokémon Glace",
    h1: "Hiver : Pokémon Glace",
    lede: "Les espèces Glace de Scarlet & Violet et de Méga-Évolution remplissent ce classeur. Les Givrali de ces séries sont aussi dans la liste des évolutions d'Évoli.",
  },
  "legendary-beasts": {
    title: "Toutes les cartes Raikou, Entei et Suicune",
    h1: "Raikou, Entei et Suicune",
    lede: "Raikou, Entei et Suicune partagent cette liste. La plupart des tirages sont plus anciens que Scarlet & Violet.",
  },
  "mew-mewtwo": {
    title: "Toutes les cartes Mew et Mewtwo",
    h1: "Mewtwo et Mew",
    lede: "Mewtwo et Mew partagent ce classeur. Une commune est l'exception, et je ne ferme pas cette liste avec du vrac.",
  },
  "mythical-modern": {
    title: "Pokémon fabuleux depuis Sword & Shield",
    h1: "Pokémon fabuleux, depuis Sword & Shield",
    lede: "Mew, Celebi, Jirachi et les autres espèces fabuleuses sont ici quand la série est Sword & Shield, Scarlet & Violet ou Méga-Évolution. Les tirages plus anciens restent dehors.",
  },
  "galarian-forms": {
    title: "Liste des formes de Galar",
    h1: "Formes de Galar",
    lede: "Si le nom anglais contient Galarian, la carte a une case ici. La plupart des tirages viennent de Sword & Shield.",
  },
  "alolan-forms": {
    title: "Liste des formes d'Alola",
    h1: "Formes d'Alola",
    lede: "Si le nom anglais contient Alolan, la carte a une case ici. La plupart des tirages viennent de Soleil et Lune.",
  },
  "hisuian-paldean-forms": {
    title: "Formes de Hisui et de Paldea",
    h1: "Formes de Hisui et de Paldea",
    lede: "Hisuian ou Paldean dans le nom anglais suffit pour une case. Paldea seul ferait une liste courte, alors les deux formes restent ensemble.",
  },
  "mega-evolution": {
    title: "Liste des cartes Méga-Évolution",
    h1: "Cartes Méga-Évolution",
    lede: "Une carte de Scarlet & Violet ou de Méga-Évolution est ici quand elle a le sous-type MEGA ou que le nom anglais commence par Mega. Les M-EX de l'ère XY restent dehors.",
  },
  "johto-starters": {
    title: "Cartes Germignon, Héricendre et Kaiminus",
    h1: "Starters de Johto",
    lede: "Germignon, Héricendre, Kaiminus et leurs évolutions partagent ce classeur.",
  },
  "hoenn-starters": {
    title: "Cartes Arcko, Poussifeu et Gobou",
    h1: "Starters de Hoenn",
    lede: "Arcko, Poussifeu, Gobou et leurs évolutions partagent ce classeur.",
  },
  "sinnoh-starters": {
    title: "Cartes Tortipouss, Ouisticram et Tiplouf",
    h1: "Starters de Sinnoh",
    lede: "Tortipouss, Ouisticram, Tiplouf et leurs évolutions partagent ce classeur.",
  },
  "unova-starters": {
    title: "Cartes Vipélierre, Gruikui et Moustillon",
    h1: "Starters d'Unys",
    lede: "Vipélierre, Gruikui, Moustillon et leurs évolutions partagent ce classeur.",
  },
  "kalos-starters": {
    title: "Cartes Marisson, Feunnec et Grenousse",
    h1: "Starters de Kalos",
    lede: "Marisson, Feunnec, Grenousse et leurs évolutions partagent ce classeur. Grenousse, Croâporal et Amphinobi ont aussi une liste plus courte.",
  },
  "alola-starters": {
    title: "Cartes Brindibou, Flamiaou et Otaquin",
    h1: "Starters d'Alola",
    lede: "Brindibou, Flamiaou, Otaquin et leurs évolutions partagent ce classeur.",
  },
  "galar-starters": {
    title: "Cartes Ouistempo, Flambino et Larméléon",
    h1: "Starters de Galar",
    lede: "Ouistempo, Flambino, Larméléon et leurs évolutions partagent ce classeur.",
  },
  "dratini-line": {
    title: "Toutes les cartes Dracolosse : Minidraco et Draco",
    h1: "Minidraco, Draco et Dracolosse",
    lede: "Minidraco, Draco et Dracolosse partagent ce classeur. Une lignée est plus simple à finir qu'un stade isolé.",
  },
  "magikarp-gyarados": {
    title: "Toutes les cartes Magicarpe et Léviator",
    h1: "Magicarpe et Léviator",
    lede: "Magicarpe et Léviator partagent cette liste. La petite carte va avec la grande.",
  },
  "lucario-riolu": {
    title: "Toutes les cartes Lucario et Riolu",
    h1: "Riolu et Lucario",
    lede: "Riolu et Lucario partagent ce classeur. Riolu est aussi dans la liste des bébés Pokémon.",
  },
  "gardevoir-line": {
    title: "Toutes les cartes Gardevoir : Tarsal et Gallame",
    h1: "Tarsal, Kirlia, Gardevoir et Gallame",
    lede: "Tarsal, Kirlia, Gardevoir et Gallame partagent ce classeur.",
  },
  "greninja-line": {
    title: "Toutes les cartes Amphinobi : Grenousse et Croâporal",
    h1: "Grenousse, Croâporal et Amphinobi",
    lede: "Grenousse, Croâporal et Amphinobi partagent cette liste. Chaque carte est aussi dans le classeur des starters de Kalos.",
  },
  "jigglypuff-line": {
    title: "Toutes les cartes Rondoudou : Toudoudou et Grodoudou",
    h1: "Toudoudou, Rondoudou et Grodoudou",
    lede: "Toudoudou, Rondoudou et Grodoudou partagent ce classeur. Toudoudou est aussi dans la liste des bébés Pokémon.",
  },
  psyduck: {
    title: "Toutes les cartes Psykokwak et Akwakwak",
    h1: "Psykokwak et Akwakwak",
    lede: "Psykokwak et Akwakwak partagent cette liste. La plupart des cartes sont Common, Uncommon ou Rare.",
  },
  unown: {
    title: "Toutes les cartes Zarbi",
    h1: "Zarbi",
    lede: "Chaque lettre Zarbi de la liste ouverte est dans ce classeur. Presque tout est Common, Uncommon ou Rare, et presque tout est plus ancien que Scarlet & Violet.",
  },
  mimikyu: {
    title: "Toutes les cartes Mimiqui",
    h1: "Toutes les cartes Mimiqui",
    lede: "Mimiqui a une liste courte, et elle dépasse quand même une page. Je garde chaque tirage anglais dans l'ordre des extensions.",
  },
  ditto: {
    title: "Toutes les cartes Métamorph",
    h1: "Toutes les cartes Métamorph",
    lede: "Métamorph a une liste courte. Chaque tirage anglais de la liste ouverte est ici, dans l'ordre des extensions.",
  },
  "winter-holiday": {
    title: "Fêtes : Cadoizo et les autres",
    h1: "Fêtes : Cadoizo et les autres",
    lede: "Cadoizo, Cerfrousse, Blizzi, Blizzaroi, Polarhume, Polagriffe et Cerbyllin partagent ce classeur. La plupart des cartes sont Common, Uncommon ou Rare.",
  },
  "bug-catcher": {
    title: "Pokémon Insecte de Scarlet & Violet et Méga-Évolution",
    h1: "Pokémon Insecte",
    lede: "Les espèces Insecte de Scarlet & Violet et de Méga-Évolution remplissent ce classeur. Les cartes Insecte plus anciennes restent dehors.",
  },
  "pink-pokemon": {
    title: "Pokémon roses de Scarlet & Violet et Méga-Évolution",
    h1: "Pokémon roses",
    lede: "Les espèces dont la couleur au Pokédex est rose, dans Scarlet & Violet ou Méga-Évolution, partagent ce classeur.",
  },
  "fire-basics-modern": {
    title: "Pokémon de base Feu de Scarlet & Violet et Méga-Évolution",
    h1: "Pokémon de base Feu",
    lede: "Une carte est ici quand le type imprimé est Feu, le sous-type est Basic, et la série est Scarlet & Violet ou Méga-Évolution. Un Stage 1 reste dehors.",
  },
  "special-illustration-rares": {
    title: "Liste des cartes Special Illustration Rare",
    h1: "Special Illustration Rare",
    lede: "Chaque carte anglaise de rareté Special Illustration Rare est dans ce classeur. Aucune n'est Common, Uncommon ou Rare.",
  },
  "tera-pokemon": {
    title: "Liste des Pokémon Tera",
    h1: "Pokémon Tera",
    lede: "Une carte avec le sous-type Tera est dans ce classeur. Ce sont les Pokémon-ex Tera, et une commune n'y figure pas.",
  },
  "trainer-gallery": {
    title: "Liste des cartes Trainer Gallery",
    h1: "Trainer Gallery",
    lede: "Trainer Gallery Rare Holo est la rareté de chaque carte ici. Le tronçon est la Trainer Gallery de Sword & Shield, et le classeur est court.",
  },
  "ultra-beasts": {
    title: "Liste des Ultra-Chimères",
    h1: "Ultra-Chimères",
    lede: "Zéroïd, Mouscoto, Cancrelove, Câblifère, Bamboiselle, Katagami, Engloutyran, Vémini, Mandrillon, Ama-Ama et Pierroteknik partagent ce classeur. Presque tous les tirages sont plus anciens que Scarlet & Violet.",
  },
  "tomokazu-komiya": {
    title: "Liste des cartes de Tomokazu Komiya",
    h1: "Cartes de Tomokazu Komiya",
    lede: "Les cartes anglaises de Tomokazu Komiya remplissent ce classeur. La plupart sont Common, Uncommon ou Rare. Le vrac est de l'or, et cette liste en est pleine.",
  },
  "saya-tsuruta": {
    title: "Liste des cartes de Saya Tsuruta",
    h1: "Cartes de Saya Tsuruta",
    lede: "Les cartes anglaises de Saya Tsuruta remplissent ce classeur. La plupart sont Common, Uncommon ou Rare.",
  },
  sowsow: {
    title: "Liste des cartes de sowsow",
    h1: "Cartes de sowsow",
    lede: "Les cartes illustrées par sowsow remplissent ce classeur. Le crédit est imprimé en minuscules, et la plupart des cartes sont Common, Uncommon ou Rare.",
  },
  "atsuko-nishida": {
    title: "Cartes d'Atsuko Nishida jusqu'à HeartGold & SoulSilver",
    h1: "Atsuko Nishida, séries anciennes",
    lede: "Atsuko Nishida dessine des cartes anglaises depuis les premières extensions. La liste complète est trop longue pour un classeur, alors celui-ci s'arrête à HeartGold & SoulSilver. Black & White et après ont leur classeur.",
  },
  "atsuko-nishida-later": {
    title: "Cartes d'Atsuko Nishida depuis Black & White",
    h1: "Atsuko Nishida, séries récentes",
    lede: "C'est le reste de la liste Nishida : de Black & White à Méga-Évolution, plus les promos McDonald's que le catalogue range hors d'une série principale. Les séries plus anciennes sont dans l'autre classeur Nishida.",
  },
};

const es: Record<string, Bits> = {
  "paldea-starters": {
    title: "Cartas de Sprigatito, Fuecoco y Quaxly",
    h1: "Iniciales de Paldea",
    lede: "Sprigatito, Fuecoco, Quaxly y sus evoluciones comparten esta carpeta. Cada impresión es de Scarlet & Violet o de Megaevolución.",
  },
  "halloween-ghosts": {
    title: "Halloween: cartas de Pokémon Fantasma",
    h1: "Halloween: Pokémon Fantasma",
    lede: "Las especies Fantasma de Scarlet & Violet y Megaevolución están aquí cuando la rareza es Common, Uncommon o Rare. Cada Pumpkaboo y cada Gourgeist entra, también de expansiones anteriores.",
  },
  "pikachu-friends": {
    title: "Los amigos de Pikachu: lista",
    h1: "Los amigos de Pikachu",
    lede: "Raichu, Pichu, Plusle, Minun y los otros roedores eléctricos pequeños comparten esta carpeta. Pikachu se queda en su propia lista.",
  },
  "paradox-pokemon": {
    title: "Lista de Pokémon paradoja",
    h1: "Pokémon paradoja",
    lede: "Los Pokémon paradoja del pasado y del futuro comparten esta carpeta. Cada impresión es de Scarlet & Violet o de Megaevolución.",
  },
  "kanto-starters": {
    title: "Iniciales de Kanto sin Charizard",
    h1: "Iniciales de Kanto, sin Charizard",
    lede: "Bulbasaur, Charmander, Squirtle y sus evoluciones comparten esta carpeta. Charizard queda fuera, porque esa cara ya tiene su lista.",
  },
  "fossil-pokemon": {
    title: "Lista de Pokémon fósil",
    h1: "Pokémon fósil",
    lede: "Omanyte, Aerodactyl, Lileep, Cranidos, Tirtouga, Tyrunt, Dracozolt y las otras especies revividas de un fósil están aquí. Las cartas de Entrenador Fósil no entran.",
  },
  "legendary-birds": {
    title: "Todas las cartas de Articuno, Zapdos y Moltres",
    h1: "Aves legendarias",
    lede: "Articuno, Zapdos y Moltres comparten esta lista, formas de Galar incluidas, porque usan el mismo número de la dex. Una común es la excepción.",
  },
  "sweets-and-snacks": {
    title: "Pokémon dulces y snacks: lista",
    h1: "Pokémon dulces y snacks",
    lede: "Cherubi, Swirlix, Bounsweet, Applin, Sinistea, Milcery, Fidough, Poltchageist y las especies parecidas a comida comparten esta carpeta. La mayoría de las cartas son Common, Uncommon o Rare.",
  },
  dragons: {
    title: "Cartas Dragón de Scarlet & Violet y Megaevolución",
    h1: "Cartas de tipo Dragón",
    lede: "Una carta está aquí cuando el tipo impreso es Dragón y la serie es Scarlet & Violet o Megaevolución. Las cartas Dragón más antiguas se quedan fuera.",
  },
  "winter-ice": {
    title: "Invierno: cartas de Pokémon Hielo",
    h1: "Invierno: Pokémon Hielo",
    lede: "Las especies Hielo de Scarlet & Violet y Megaevolución llenan esta carpeta. Los Glaceon de esas series también están en la lista de evoluciones de Eevee.",
  },
  "legendary-beasts": {
    title: "Todas las cartas de Raikou, Entei y Suicune",
    h1: "Raikou, Entei y Suicune",
    lede: "Raikou, Entei y Suicune comparten esta lista. La mayoría de las impresiones son anteriores a Scarlet & Violet.",
  },
  "mew-mewtwo": {
    title: "Todas las cartas de Mew y Mewtwo",
    h1: "Mewtwo y Mew",
    lede: "Mewtwo y Mew comparten esta carpeta. Una común es la excepción, y no cierro esta lista con bulk.",
  },
  "mythical-modern": {
    title: "Pokémon singulares desde Sword & Shield",
    h1: "Pokémon singulares, desde Sword & Shield",
    lede: "Mew, Celebi, Jirachi y las otras especies singulares están aquí cuando la serie es Sword & Shield, Scarlet & Violet o Megaevolución. Las impresiones anteriores se quedan fuera.",
  },
  "galarian-forms": {
    title: "Lista de formas de Galar",
    h1: "Formas de Galar",
    lede: "Si el nombre inglés contiene Galarian, la carta tiene un hueco aquí. La mayoría de las impresiones son de Sword & Shield.",
  },
  "alolan-forms": {
    title: "Lista de formas de Alola",
    h1: "Formas de Alola",
    lede: "Si el nombre inglés contiene Alolan, la carta tiene un hueco aquí. La mayoría de las impresiones son de Sol y Luna.",
  },
  "hisuian-paldean-forms": {
    title: "Formas de Hisui y de Paldea",
    h1: "Formas de Hisui y de Paldea",
    lede: "Hisuian o Paldean en el nombre inglés basta para un hueco. Paldea sola sería una lista corta, así que las dos formas se quedan juntas.",
  },
  "mega-evolution": {
    title: "Lista de cartas de Megaevolución",
    h1: "Cartas de Megaevolución",
    lede: "Una carta de Scarlet & Violet o Megaevolución está aquí cuando tiene el subtipo MEGA o el nombre inglés empieza por Mega. Las M-EX de la era XY se quedan fuera.",
  },
  "johto-starters": {
    title: "Cartas de Chikorita, Cyndaquil y Totodile",
    h1: "Iniciales de Johto",
    lede: "Chikorita, Cyndaquil, Totodile y sus evoluciones comparten esta carpeta.",
  },
  "hoenn-starters": {
    title: "Cartas de Treecko, Torchic y Mudkip",
    h1: "Iniciales de Hoenn",
    lede: "Treecko, Torchic, Mudkip y sus evoluciones comparten esta carpeta.",
  },
  "sinnoh-starters": {
    title: "Cartas de Turtwig, Chimchar y Piplup",
    h1: "Iniciales de Sinnoh",
    lede: "Turtwig, Chimchar, Piplup y sus evoluciones comparten esta carpeta.",
  },
  "unova-starters": {
    title: "Cartas de Snivy, Tepig y Oshawott",
    h1: "Iniciales de Teselia",
    lede: "Snivy, Tepig, Oshawott y sus evoluciones comparten esta carpeta.",
  },
  "kalos-starters": {
    title: "Cartas de Chespin, Fennekin y Froakie",
    h1: "Iniciales de Kalos",
    lede: "Chespin, Fennekin, Froakie y sus evoluciones comparten esta carpeta. Froakie, Frogadier y Greninja tienen además una lista más corta.",
  },
  "alola-starters": {
    title: "Cartas de Rowlet, Litten y Popplio",
    h1: "Iniciales de Alola",
    lede: "Rowlet, Litten, Popplio y sus evoluciones comparten esta carpeta.",
  },
  "galar-starters": {
    title: "Cartas de Grookey, Scorbunny y Sobble",
    h1: "Iniciales de Galar",
    lede: "Grookey, Scorbunny, Sobble y sus evoluciones comparten esta carpeta.",
  },
  "dratini-line": {
    title: "Todas las cartas de Dragonite: Dratini y Dragonair",
    h1: "Dratini, Dragonair y Dragonite",
    lede: "Dratini, Dragonair y Dragonite comparten esta carpeta. Una línea es más fácil de cerrar que una fase sola.",
  },
  "magikarp-gyarados": {
    title: "Todas las cartas de Magikarp y Gyarados",
    h1: "Magikarp y Gyarados",
    lede: "Magikarp y Gyarados comparten esta lista. La carta pequeña va con la grande.",
  },
  "lucario-riolu": {
    title: "Todas las cartas de Lucario y Riolu",
    h1: "Riolu y Lucario",
    lede: "Riolu y Lucario comparten esta carpeta. Riolu también está en la lista de Pokémon bebé.",
  },
  "gardevoir-line": {
    title: "Todas las cartas de Gardevoir: Ralts y Gallade",
    h1: "Ralts, Kirlia, Gardevoir y Gallade",
    lede: "Ralts, Kirlia, Gardevoir y Gallade comparten esta carpeta.",
  },
  "greninja-line": {
    title: "Todas las cartas de Greninja: Froakie y Frogadier",
    h1: "Froakie, Frogadier y Greninja",
    lede: "Froakie, Frogadier y Greninja comparten esta lista. Cada carta está también en la carpeta de iniciales de Kalos.",
  },
  "jigglypuff-line": {
    title: "Todas las cartas de Jigglypuff: Igglybuff y Wigglytuff",
    h1: "Igglybuff, Jigglypuff y Wigglytuff",
    lede: "Igglybuff, Jigglypuff y Wigglytuff comparten esta carpeta. Igglybuff también está en la lista de Pokémon bebé.",
  },
  psyduck: {
    title: "Todas las cartas de Psyduck y Golduck",
    h1: "Psyduck y Golduck",
    lede: "Psyduck y Golduck comparten esta lista. La mayoría de las cartas son Common, Uncommon o Rare.",
  },
  unown: {
    title: "Todas las cartas de Unown",
    h1: "Unown",
    lede: "Cada letra Unown de la lista abierta está en esta carpeta. Casi todo es Common, Uncommon o Rare, y casi todo es anterior a Scarlet & Violet.",
  },
  mimikyu: {
    title: "Todas las cartas de Mimikyu",
    h1: "Todas las cartas de Mimikyu",
    lede: "Mimikyu tiene una lista corta, y aun así pasa de una página. Guardo cada impresión inglesa en el orden de las expansiones.",
  },
  ditto: {
    title: "Todas las cartas de Ditto",
    h1: "Todas las cartas de Ditto",
    lede: "Ditto tiene una lista corta. Cada impresión inglesa de la lista abierta está aquí, en el orden de las expansiones.",
  },
  "winter-holiday": {
    title: "Fiestas: Delibird y los otros",
    h1: "Fiestas: Delibird y los otros",
    lede: "Delibird, Stantler, Snover, Abomasnow, Cubchoo, Beartic y Wyrdeer comparten esta carpeta. La mayoría de las cartas son Common, Uncommon o Rare.",
  },
  "bug-catcher": {
    title: "Pokémon Bicho de Scarlet & Violet y Megaevolución",
    h1: "Pokémon Bicho",
    lede: "Las especies Bicho de Scarlet & Violet y Megaevolución llenan esta carpeta. Las cartas Bicho más antiguas se quedan fuera.",
  },
  "pink-pokemon": {
    title: "Pokémon rosas de Scarlet & Violet y Megaevolución",
    h1: "Pokémon rosas",
    lede: "Las especies cuyo color en la Pokédex es rosa, de Scarlet & Violet o Megaevolución, comparten esta carpeta.",
  },
  "fire-basics-modern": {
    title: "Pokémon Básicos Fuego de Scarlet & Violet y Megaevolución",
    h1: "Pokémon Básicos de tipo Fuego",
    lede: "Una carta está aquí cuando el tipo impreso es Fuego, el subtipo es Basic y la serie es Scarlet & Violet o Megaevolución. Un Stage 1 se queda fuera.",
  },
  "special-illustration-rares": {
    title: "Lista de cartas Special Illustration Rare",
    h1: "Special Illustration Rare",
    lede: "Cada carta inglesa de rareza Special Illustration Rare está en esta carpeta. Ninguna es Common, Uncommon o Rare.",
  },
  "tera-pokemon": {
    title: "Lista de Pokémon Tera",
    h1: "Pokémon Tera",
    lede: "Una carta con el subtipo Tera está en esta carpeta. Son los Pokémon ex Tera, y una común no está entre ellas.",
  },
  "trainer-gallery": {
    title: "Lista de cartas Trainer Gallery",
    h1: "Trainer Gallery",
    lede: "Trainer Gallery Rare Holo es la rareza de cada carta aquí. El tramo es la Trainer Gallery de Sword & Shield, y la carpeta es corta.",
  },
  "ultra-beasts": {
    title: "Lista de Ultraentes",
    h1: "Ultraentes",
    lede: "Nihilego, Buzzwole, Pheromosa, Xurkitree, Celesteela, Kartana, Guzzlord, Poipole, Naganadel, Stakataka y Blacephalon comparten esta carpeta. Casi todas las impresiones son anteriores a Scarlet & Violet.",
  },
  "tomokazu-komiya": {
    title: "Lista de cartas de Tomokazu Komiya",
    h1: "Cartas de Tomokazu Komiya",
    lede: "Las cartas inglesas de Tomokazu Komiya llenan esta carpeta. La mayoría son Common, Uncommon o Rare. El bulk es oro, y esta lista está llena de él.",
  },
  "saya-tsuruta": {
    title: "Lista de cartas de Saya Tsuruta",
    h1: "Cartas de Saya Tsuruta",
    lede: "Las cartas inglesas de Saya Tsuruta llenan esta carpeta. La mayoría son Common, Uncommon o Rare.",
  },
  sowsow: {
    title: "Lista de cartas de sowsow",
    h1: "Cartas de sowsow",
    lede: "Las cartas ilustradas por sowsow llenan esta carpeta. El crédito va en minúsculas, y la mayoría de las cartas son Common, Uncommon o Rare.",
  },
  "atsuko-nishida": {
    title: "Cartas de Atsuko Nishida hasta HeartGold & SoulSilver",
    h1: "Atsuko Nishida, series antiguas",
    lede: "Atsuko Nishida dibuja cartas inglesas desde las primeras expansiones. La lista completa es demasiado larga para una carpeta, así que esta termina en HeartGold & SoulSilver. Desde Black & White hay otra carpeta.",
  },
  "atsuko-nishida-later": {
    title: "Cartas de Atsuko Nishida desde Black & White",
    h1: "Atsuko Nishida, series posteriores",
    lede: "Este es el resto de la lista de Nishida: de Black & White a Megaevolución, más las promos de McDonald's que el catálogo archiva fuera de una serie principal. Las series anteriores están en la otra carpeta de Nishida.",
  },
};

const it: Record<string, Bits> = {
  "paldea-starters": {
    title: "Carte Sprigatito, Fuecoco e Quaxly",
    h1: "Iniziali di Paldea",
    lede: "Sprigatito, Fuecoco, Quaxly e le evoluzioni condividono questo raccoglitore. Ogni stampa viene da Scarlet & Violet o da Megaevoluzione.",
  },
  "halloween-ghosts": {
    title: "Halloween: carte dei Pokémon Spettro",
    h1: "Halloween: Pokémon Spettro",
    lede: "Le specie Spettro di Scarlet & Violet e Megaevoluzione sono qui quando la rarità è Common, Uncommon o Rare. Ogni Pumpkaboo e ogni Gourgeist entra, anche dalle serie più vecchie.",
  },
  "pikachu-friends": {
    title: "Gli amici di Pikachu: lista",
    h1: "Gli amici di Pikachu",
    lede: "Raichu, Pichu, Plusle, Minun e gli altri piccoli roditori elettrici condividono questo raccoglitore. Pikachu resta nella sua lista.",
  },
  "paradox-pokemon": {
    title: "Lista dei Pokémon Paradosso",
    h1: "Pokémon Paradosso",
    lede: "I Pokémon Paradosso del passato e del futuro condividono questo raccoglitore. Ogni stampa viene da Scarlet & Violet o da Megaevoluzione.",
  },
  "kanto-starters": {
    title: "Iniziali di Kanto senza Charizard",
    h1: "Iniziali di Kanto, senza Charizard",
    lede: "Bulbasaur, Charmander, Squirtle e le evoluzioni condividono questo raccoglitore. Charizard resta fuori, perché quella faccia ha già la sua lista.",
  },
  "fossil-pokemon": {
    title: "Lista dei Pokémon fossile",
    h1: "Pokémon fossile",
    lede: "Omanyte, Aerodactyl, Lileep, Cranidos, Tirtouga, Tyrunt, Dracozolt e le altre specie rinate da un fossile sono qui. Le carte Allenatore Fossile non ci sono.",
  },
  "legendary-birds": {
    title: "Tutte le carte Articuno, Zapdos e Moltres",
    h1: "Uccelli leggendari",
    lede: "Articuno, Zapdos e Moltres condividono questa lista, forme di Galar comprese, perché usano lo stesso numero di dex. Una comune è l'eccezione.",
  },
  "sweets-and-snacks": {
    title: "Pokémon dolci e snack: lista",
    h1: "Pokémon dolci e snack",
    lede: "Cherubi, Swirlix, Bounsweet, Applin, Sinistea, Milcery, Fidough, Poltchageist e le specie simili a cibo condividono questo raccoglitore. La maggior parte delle carte è Common, Uncommon o Rare.",
  },
  dragons: {
    title: "Carte Drago di Scarlet & Violet e Megaevoluzione",
    h1: "Carte di tipo Drago",
    lede: "Una carta è qui quando il tipo stampato è Drago e la serie è Scarlet & Violet o Megaevoluzione. Le carte Drago più vecchie restano fuori.",
  },
  "winter-ice": {
    title: "Inverno: carte dei Pokémon Ghiaccio",
    h1: "Inverno: Pokémon Ghiaccio",
    lede: "Le specie Ghiaccio di Scarlet & Violet e Megaevoluzione riempiono questo raccoglitore. I Glaceon di quelle serie sono anche nella lista delle evoluzioni di Eevee.",
  },
  "legendary-beasts": {
    title: "Tutte le carte Raikou, Entei e Suicune",
    h1: "Raikou, Entei e Suicune",
    lede: "Raikou, Entei e Suicune condividono questa lista. La maggior parte delle stampe è più vecchia di Scarlet & Violet.",
  },
  "mew-mewtwo": {
    title: "Tutte le carte Mew e Mewtwo",
    h1: "Mewtwo e Mew",
    lede: "Mewtwo e Mew condividono questo raccoglitore. Una comune è l'eccezione, e non chiudo questa lista con il bulk.",
  },
  "mythical-modern": {
    title: "Pokémon misteriosi da Sword & Shield in poi",
    h1: "Pokémon misteriosi, da Sword & Shield",
    lede: "Mew, Celebi, Jirachi e le altre specie misteriose sono qui quando la serie è Sword & Shield, Scarlet & Violet o Megaevoluzione. Le stampe più vecchie restano fuori.",
  },
  "galarian-forms": {
    title: "Lista delle forme di Galar",
    h1: "Forme di Galar",
    lede: "Se il nome inglese contiene Galarian, la carta ha un posto qui. La maggior parte delle stampe viene da Sword & Shield.",
  },
  "alolan-forms": {
    title: "Lista delle forme di Alola",
    h1: "Forme di Alola",
    lede: "Se il nome inglese contiene Alolan, la carta ha un posto qui. La maggior parte delle stampe viene da Sole e Luna.",
  },
  "hisuian-paldean-forms": {
    title: "Forme di Hisui e di Paldea",
    h1: "Forme di Hisui e di Paldea",
    lede: "Hisuian o Paldean nel nome inglese basta per un posto. Paldea da sola sarebbe una lista corta, quindi le due forme restano insieme.",
  },
  "mega-evolution": {
    title: "Lista delle carte Megaevoluzione",
    h1: "Carte Megaevoluzione",
    lede: "Una carta di Scarlet & Violet o Megaevoluzione è qui quando ha il sottotipo MEGA o il nome inglese inizia con Mega. Le M-EX dell'era XY restano fuori.",
  },
  "johto-starters": {
    title: "Carte Chikorita, Cyndaquil e Totodile",
    h1: "Iniziali di Johto",
    lede: "Chikorita, Cyndaquil, Totodile e le evoluzioni condividono questo raccoglitore.",
  },
  "hoenn-starters": {
    title: "Carte Treecko, Torchic e Mudkip",
    h1: "Iniziali di Hoenn",
    lede: "Treecko, Torchic, Mudkip e le evoluzioni condividono questo raccoglitore.",
  },
  "sinnoh-starters": {
    title: "Carte Turtwig, Chimchar e Piplup",
    h1: "Iniziali di Sinnoh",
    lede: "Turtwig, Chimchar, Piplup e le evoluzioni condividono questo raccoglitore.",
  },
  "unova-starters": {
    title: "Carte Snivy, Tepig e Oshawott",
    h1: "Iniziali di Unima",
    lede: "Snivy, Tepig, Oshawott e le evoluzioni condividono questo raccoglitore.",
  },
  "kalos-starters": {
    title: "Carte Chespin, Fennekin e Froakie",
    h1: "Iniziali di Kalos",
    lede: "Chespin, Fennekin, Froakie e le evoluzioni condividono questo raccoglitore. Froakie, Frogadier e Greninja hanno anche una lista più corta.",
  },
  "alola-starters": {
    title: "Carte Rowlet, Litten e Popplio",
    h1: "Iniziali di Alola",
    lede: "Rowlet, Litten, Popplio e le evoluzioni condividono questo raccoglitore.",
  },
  "galar-starters": {
    title: "Carte Grookey, Scorbunny e Sobble",
    h1: "Iniziali di Galar",
    lede: "Grookey, Scorbunny, Sobble e le evoluzioni condividono questo raccoglitore.",
  },
  "dratini-line": {
    title: "Tutte le carte Dragonite: Dratini e Dragonair",
    h1: "Dratini, Dragonair e Dragonite",
    lede: "Dratini, Dragonair e Dragonite condividono questo raccoglitore. Una linea è più facile da chiudere di uno stadio da solo.",
  },
  "magikarp-gyarados": {
    title: "Tutte le carte Magikarp e Gyarados",
    h1: "Magikarp e Gyarados",
    lede: "Magikarp e Gyarados condividono questa lista. La carta piccola sta con quella grande.",
  },
  "lucario-riolu": {
    title: "Tutte le carte Lucario e Riolu",
    h1: "Riolu e Lucario",
    lede: "Riolu e Lucario condividono questo raccoglitore. Riolu è anche nella lista dei Pokémon baby.",
  },
  "gardevoir-line": {
    title: "Tutte le carte Gardevoir: Ralts e Gallade",
    h1: "Ralts, Kirlia, Gardevoir e Gallade",
    lede: "Ralts, Kirlia, Gardevoir e Gallade condividono questo raccoglitore.",
  },
  "greninja-line": {
    title: "Tutte le carte Greninja: Froakie e Frogadier",
    h1: "Froakie, Frogadier e Greninja",
    lede: "Froakie, Frogadier e Greninja condividono questa lista. Ogni carta è anche nel raccoglitore degli iniziali di Kalos.",
  },
  "jigglypuff-line": {
    title: "Tutte le carte Jigglypuff: Igglybuff e Wigglytuff",
    h1: "Igglybuff, Jigglypuff e Wigglytuff",
    lede: "Igglybuff, Jigglypuff e Wigglytuff condividono questo raccoglitore. Igglybuff è anche nella lista dei Pokémon baby.",
  },
  psyduck: {
    title: "Tutte le carte Psyduck e Golduck",
    h1: "Psyduck e Golduck",
    lede: "Psyduck e Golduck condividono questa lista. La maggior parte delle carte è Common, Uncommon o Rare.",
  },
  unown: {
    title: "Tutte le carte Unown",
    h1: "Unown",
    lede: "Ogni lettera Unown della lista aperta è in questo raccoglitore. Quasi tutto è Common, Uncommon o Rare, e quasi tutto è più vecchio di Scarlet & Violet.",
  },
  mimikyu: {
    title: "Tutte le carte Mimikyu",
    h1: "Tutte le carte Mimikyu",
    lede: "Mimikyu ha una lista corta, e supera comunque una pagina. Tengo ogni stampa inglese nell'ordine dei set.",
  },
  ditto: {
    title: "Tutte le carte Ditto",
    h1: "Tutte le carte Ditto",
    lede: "Ditto ha una lista corta. Ogni stampa inglese della lista aperta è qui, nell'ordine dei set.",
  },
  "winter-holiday": {
    title: "Feste: Delibird e gli altri",
    h1: "Feste: Delibird e gli altri",
    lede: "Delibird, Stantler, Snover, Abomasnow, Cubchoo, Beartic e Wyrdeer condividono questo raccoglitore. La maggior parte delle carte è Common, Uncommon o Rare.",
  },
  "bug-catcher": {
    title: "Pokémon Coleottero di Scarlet & Violet e Megaevoluzione",
    h1: "Pokémon Coleottero",
    lede: "Le specie Coleottero di Scarlet & Violet e Megaevoluzione riempiono questo raccoglitore. Le carte Coleottero più vecchie restano fuori.",
  },
  "pink-pokemon": {
    title: "Pokémon rosa di Scarlet & Violet e Megaevoluzione",
    h1: "Pokémon rosa",
    lede: "Le specie il cui colore nel Pokédex è rosa, di Scarlet & Violet o Megaevoluzione, condividono questo raccoglitore.",
  },
  "fire-basics-modern": {
    title: "Pokémon Base Fuoco di Scarlet & Violet e Megaevoluzione",
    h1: "Pokémon Base di tipo Fuoco",
    lede: "Una carta è qui quando il tipo stampato è Fuoco, il sottotipo è Basic e la serie è Scarlet & Violet o Megaevoluzione. Uno Stage 1 resta fuori.",
  },
  "special-illustration-rares": {
    title: "Lista delle carte Special Illustration Rare",
    h1: "Special Illustration Rare",
    lede: "Ogni carta inglese di rarità Special Illustration Rare è in questo raccoglitore. Nessuna è Common, Uncommon o Rare.",
  },
  "tera-pokemon": {
    title: "Lista dei Pokémon Tera",
    h1: "Pokémon Tera",
    lede: "Una carta con il sottotipo Tera è in questo raccoglitore. Sono i Pokémon-ex Tera, e una comune non c'è.",
  },
  "trainer-gallery": {
    title: "Lista delle carte Trainer Gallery",
    h1: "Trainer Gallery",
    lede: "Trainer Gallery Rare Holo è la rarità di ogni carta qui. Il tratto è la Trainer Gallery di Sword & Shield, e il raccoglitore è corto.",
  },
  "ultra-beasts": {
    title: "Lista delle Ultracreature",
    h1: "Ultracreature",
    lede: "Nihilego, Buzzwole, Pheromosa, Xurkitree, Celesteela, Kartana, Guzzlord, Poipole, Naganadel, Stakataka e Blacephalon condividono questo raccoglitore. Quasi tutte le stampe sono più vecchie di Scarlet & Violet.",
  },
  "tomokazu-komiya": {
    title: "Lista delle carte di Tomokazu Komiya",
    h1: "Carte di Tomokazu Komiya",
    lede: "Le carte inglesi di Tomokazu Komiya riempiono questo raccoglitore. La maggior parte è Common, Uncommon o Rare. Il bulk è oro, e questa lista ne è piena.",
  },
  "saya-tsuruta": {
    title: "Lista delle carte di Saya Tsuruta",
    h1: "Carte di Saya Tsuruta",
    lede: "Le carte inglesi di Saya Tsuruta riempiono questo raccoglitore. La maggior parte è Common, Uncommon o Rare.",
  },
  sowsow: {
    title: "Lista delle carte di sowsow",
    h1: "Carte di sowsow",
    lede: "Le carte illustrate da sowsow riempiono questo raccoglitore. Il credito è stampato in minuscolo, e la maggior parte delle carte è Common, Uncommon o Rare.",
  },
  "atsuko-nishida": {
    title: "Carte di Atsuko Nishida fino a HeartGold & SoulSilver",
    h1: "Atsuko Nishida, serie iniziali",
    lede: "Atsuko Nishida disegna carte inglesi dai primi set. La lista intera è troppo lunga per un raccoglitore, quindi questo si ferma a HeartGold & SoulSilver. Da Black & White c'è un altro raccoglitore.",
  },
  "atsuko-nishida-later": {
    title: "Carte di Atsuko Nishida da Black & White in poi",
    h1: "Atsuko Nishida, serie successive",
    lede: "Questo è il resto della lista Nishida: da Black & White a Megaevoluzione, più le promo McDonald's che il catalogo archivia fuori da una serie principale. Le serie precedenti stanno nell'altro raccoglitore Nishida.",
  },
};

const nl: Record<string, Bits> = {
  "paldea-starters": {
    title: "Paldea-starters: Sprigatito, Fuecoco en Quaxly",
    h1: "Paldea-starters",
    lede: "Sprigatito, Fuecoco, Quaxly en hun evoluties delen deze binder. Elke druk komt uit Scarlet & Violet of Mega-evolutie.",
  },
  "halloween-ghosts": {
    title: "Halloween: Geest-Pokémon kaartenlijst",
    h1: "Halloween: Geest-Pokémon",
    lede: "Geest-soorten uit Scarlet & Violet en Mega-evolutie staan hier als de zeldzaamheid Common, Uncommon of Rare is. Elke Pumpkaboo en elke Gourgeist komt erbij, ook uit oudere sets.",
  },
  "pikachu-friends": {
    title: "Vrienden van Pikachu: kaartenlijst",
    h1: "Vrienden van Pikachu",
    lede: "Raichu, Pichu, Plusle, Minun en de andere kleine elektrische knaagdieren delen deze binder. Pikachu blijft in de eigen lijst.",
  },
  "paradox-pokemon": {
    title: "Paradox Pokémon kaartenlijst",
    h1: "Paradox Pokémon",
    lede: "Paradox Pokémon uit verleden en toekomst delen deze binder. Elke druk komt uit Scarlet & Violet of Mega-evolutie.",
  },
  "kanto-starters": {
    title: "Kanto-starters zonder Charizard",
    h1: "Kanto-starters, zonder Charizard",
    lede: "Bulbasaur, Charmander, Squirtle en hun evoluties delen deze binder. Charizard blijft erbuiten, want dat gezicht heeft al een eigen lijst.",
  },
  "fossil-pokemon": {
    title: "Fossil Pokémon kaartenlijst",
    h1: "Fossil Pokémon",
    lede: "Omanyte, Aerodactyl, Lileep, Cranidos, Tirtouga, Tyrunt, Dracozolt en de andere soorten die uit een fossiel komen staan hier. Fossil-trainerskaarten staan er niet bij.",
  },
  "legendary-birds": {
    title: "Alle Articuno-, Zapdos- en Moltres-kaarten",
    h1: "Legendarische vogels",
    lede: "Articuno, Zapdos en Moltres delen deze lijst, Galarian-vormen inbegrepen, want die houden hetzelfde dexnummer. Een gewone kaart is hier de uitzondering.",
  },
  "sweets-and-snacks": {
    title: "Snoep- en snack-Pokémon kaartenlijst",
    h1: "Snoep- en snack-Pokémon",
    lede: "Cherubi, Swirlix, Bounsweet, Applin, Sinistea, Milcery, Fidough, Poltchageist en de eten-achtige soorten eromheen delen deze binder. De meeste kaarten zijn Common, Uncommon of Rare.",
  },
  dragons: {
    title: "Draak-kaarten uit Scarlet & Violet en Mega-evolutie",
    h1: "Kaarten van het type Draak",
    lede: "Een kaart staat hier als het gedrukte type Draak is en de serie Scarlet & Violet of Mega-evolutie is. Oudere Draak-kaarten blijven erbuiten.",
  },
  "winter-ice": {
    title: "Winter: IJs-Pokémon kaartenlijst",
    h1: "Winter: IJs-Pokémon",
    lede: "IJs-soorten uit Scarlet & Violet en Mega-evolutie vullen deze binder. Glaceon uit die series staat ook in de Eeveelution-lijst.",
  },
  "legendary-beasts": {
    title: "Alle Raikou-, Entei- en Suicune-kaarten",
    h1: "Raikou, Entei en Suicune",
    lede: "Raikou, Entei en Suicune delen deze lijst. De meeste drukken zijn ouder dan Scarlet & Violet.",
  },
  "mew-mewtwo": {
    title: "Alle Mew- en Mewtwo-kaarten",
    h1: "Mewtwo en Mew",
    lede: "Mewtwo en Mew delen deze binder. Een gewone kaart is de uitzondering, en ik sluit deze lijst niet af met bulk.",
  },
  "mythical-modern": {
    title: "Mythische Pokémon vanaf Sword & Shield",
    h1: "Mythische Pokémon, vanaf Sword & Shield",
    lede: "Mew, Celebi, Jirachi en de andere mythische soorten staan hier als de serie Sword & Shield, Scarlet & Violet of Mega-evolutie is. Oudere drukken blijven erbuiten.",
  },
  "galarian-forms": {
    title: "Galarian-vorm kaartenlijst",
    h1: "Galarian-vormen",
    lede: "Staat Galarian in de Engelse kaartnaam, dan heeft de kaart hier een vak. De meeste drukken komen uit Sword & Shield.",
  },
  "alolan-forms": {
    title: "Alola-vorm kaartenlijst",
    h1: "Alola-vormen",
    lede: "Staat Alolan in de Engelse kaartnaam, dan heeft de kaart hier een vak. De meeste drukken komen uit Sun & Moon.",
  },
  "hisuian-paldean-forms": {
    title: "Hisuian-vorm en Paldean-kaartenlijst",
    h1: "Hisuian-vorm en Paldean",
    lede: "Hisuian of Paldean in de Engelse naam is genoeg voor een vak. Paldean alleen zou een korte lijst zijn, dus de twee vormen blijven bij elkaar.",
  },
  "mega-evolution": {
    title: "Mega-evolutie kaartenlijst",
    h1: "Mega-evolutiekaarten",
    lede: "Een kaart uit Scarlet & Violet of Mega-evolutie staat hier als ze het subtype MEGA heeft of de Engelse naam met Mega begint. M-EX uit het XY-tijdperk blijven erbuiten.",
  },
  "johto-starters": {
    title: "Johto-starters: Chikorita, Cyndaquil en Totodile",
    h1: "Johto-starters",
    lede: "Chikorita, Cyndaquil, Totodile en hun evoluties delen deze binder.",
  },
  "hoenn-starters": {
    title: "Hoenn-starters: Treecko, Torchic en Mudkip",
    h1: "Hoenn-starters",
    lede: "Treecko, Torchic, Mudkip en hun evoluties delen deze binder.",
  },
  "sinnoh-starters": {
    title: "Sinnoh-starters: Turtwig, Chimchar en Piplup",
    h1: "Sinnoh-starters",
    lede: "Turtwig, Chimchar, Piplup en hun evoluties delen deze binder.",
  },
  "unova-starters": {
    title: "Unova-starters: Snivy, Tepig en Oshawott",
    h1: "Unova-starters",
    lede: "Snivy, Tepig, Oshawott en hun evoluties delen deze binder.",
  },
  "kalos-starters": {
    title: "Kalos-starters: Chespin, Fennekin en Froakie",
    h1: "Kalos-starters",
    lede: "Chespin, Fennekin, Froakie en hun evoluties delen deze binder. Froakie, Frogadier en Greninja hebben ook een kortere eigen lijst.",
  },
  "alola-starters": {
    title: "Alola-starters: Rowlet, Litten en Popplio",
    h1: "Alola-starters",
    lede: "Rowlet, Litten, Popplio en hun evoluties delen deze binder.",
  },
  "galar-starters": {
    title: "Galar-starters: Grookey, Scorbunny en Sobble",
    h1: "Galar-starters",
    lede: "Grookey, Scorbunny, Sobble en hun evoluties delen deze binder.",
  },
  "dratini-line": {
    title: "Alle Dragonite-kaarten: Dratini en Dragonair",
    h1: "Dratini, Dragonair en Dragonite",
    lede: "Dratini, Dragonair en Dragonite delen deze binder. Een lijn is makkelijker af te maken dan één stap alleen.",
  },
  "magikarp-gyarados": {
    title: "Alle Magikarp- en Gyarados-kaarten",
    h1: "Magikarp en Gyarados",
    lede: "Magikarp en Gyarados delen deze lijst. De kleine kaart hoort bij de grote.",
  },
  "lucario-riolu": {
    title: "Alle Lucario- en Riolu-kaarten",
    h1: "Riolu en Lucario",
    lede: "Riolu en Lucario delen deze binder. Riolu staat ook in de baby-Pokémon-lijst.",
  },
  "gardevoir-line": {
    title: "Alle Gardevoir-kaarten: Ralts en Gallade",
    h1: "Ralts, Kirlia, Gardevoir en Gallade",
    lede: "Ralts, Kirlia, Gardevoir en Gallade delen deze binder.",
  },
  "greninja-line": {
    title: "Alle Greninja-kaarten: Froakie en Frogadier",
    h1: "Froakie, Frogadier en Greninja",
    lede: "Froakie, Frogadier en Greninja delen deze lijst. Elke kaart staat ook in de Kalos-starterbinder.",
  },
  "jigglypuff-line": {
    title: "Alle Jigglypuff-kaarten: Igglybuff en Wigglytuff",
    h1: "Igglybuff, Jigglypuff en Wigglytuff",
    lede: "Igglybuff, Jigglypuff en Wigglytuff delen deze binder. Igglybuff staat ook in de baby-Pokémon-lijst.",
  },
  psyduck: {
    title: "Alle Psyduck- en Golduck-kaarten",
    h1: "Psyduck en Golduck",
    lede: "Psyduck en Golduck delen deze lijst. De meeste kaarten zijn Common, Uncommon of Rare.",
  },
  unown: {
    title: "Alle Unown-kaarten",
    h1: "Unown",
    lede: "Elke Unown-letter uit de open lijst zit in deze binder. Bijna alles is Common, Uncommon of Rare, en bijna alles is ouder dan Scarlet & Violet.",
  },
  mimikyu: {
    title: "Alle Mimikyu-kaarten",
    h1: "Alle Mimikyu-kaarten",
    lede: "Mimikyu heeft een korte lijst, en die is toch langer dan één pagina. Ik houd elke Engelse druk in de volgorde van de sets.",
  },
  ditto: {
    title: "Alle Ditto-kaarten",
    h1: "Alle Ditto-kaarten",
    lede: "Ditto heeft een korte lijst. Elke Engelse druk uit de open lijst staat hier, in de volgorde van de sets.",
  },
  "winter-holiday": {
    title: "Feestdagen: Delibird en de anderen",
    h1: "Feestdagen: Delibird en de anderen",
    lede: "Delibird, Stantler, Snover, Abomasnow, Cubchoo, Beartic en Wyrdeer delen deze binder. De meeste kaarten zijn Common, Uncommon of Rare.",
  },
  "bug-catcher": {
    title: "Insect-Pokémon uit Scarlet & Violet en Mega-evolutie",
    h1: "Insect-Pokémon",
    lede: "Insect-soorten uit Scarlet & Violet en Mega-evolutie vullen deze binder. Oudere Insect-kaarten blijven erbuiten.",
  },
  "pink-pokemon": {
    title: "Roze Pokémon uit Scarlet & Violet en Mega-evolutie",
    h1: "Roze Pokémon",
    lede: "Soorten waarvan de Pokédex-kleur roze is, uit Scarlet & Violet of Mega-evolutie, delen deze binder.",
  },
  "fire-basics-modern": {
    title: "Vuur Basic-Pokémon uit Scarlet & Violet en Mega-evolutie",
    h1: "Vuur Basic-Pokémon",
    lede: "Een kaart staat hier als het gedrukte type Vuur is, het subtype Basic is en de serie Scarlet & Violet of Mega-evolutie is. Een Stage 1 blijft erbuiten.",
  },
  "special-illustration-rares": {
    title: "Special Illustration Rare kaartenlijst",
    h1: "Special Illustration Rare",
    lede: "Elke Engelse kaart met de zeldzaamheid Special Illustration Rare zit in deze binder. Geen ervan is Common, Uncommon of Rare.",
  },
  "tera-pokemon": {
    title: "Tera-Pokémon kaartenlijst",
    h1: "Tera-Pokémon",
    lede: "Een kaart met het subtype Tera zit in deze binder. Dit zijn de Tera-Pokémon-ex, en een gewone kaart zit er niet bij.",
  },
  "trainer-gallery": {
    title: "Trainer Gallery kaartenlijst",
    h1: "Trainer Gallery",
    lede: "Trainer Gallery Rare Holo is de zeldzaamheid op elke kaart hier. Het stuk is de Trainer Gallery van Sword & Shield, en de binder is kort.",
  },
  "ultra-beasts": {
    title: "Ultra Beast kaartenlijst",
    h1: "Ultra Beasts",
    lede: "Nihilego, Buzzwole, Pheromosa, Xurkitree, Celesteela, Kartana, Guzzlord, Poipole, Naganadel, Stakataka en Blacephalon delen deze binder. Bijna alle drukken zijn ouder dan Scarlet & Violet.",
  },
  "tomokazu-komiya": {
    title: "Tomokazu Komiya kaartenlijst",
    h1: "Tomokazu Komiya-kaarten",
    lede: "De Engelse kaarten van Tomokazu Komiya vullen deze binder. De meeste zijn Common, Uncommon of Rare. Bulk is goud, en deze lijst zit er vol mee.",
  },
  "saya-tsuruta": {
    title: "Saya Tsuruta kaartenlijst",
    h1: "Saya Tsuruta-kaarten",
    lede: "De Engelse kaarten van Saya Tsuruta vullen deze binder. De meeste zijn Common, Uncommon of Rare.",
  },
  sowsow: {
    title: "sowsow kaartenlijst",
    h1: "sowsow-kaarten",
    lede: "Kaarten van sowsow vullen deze binder. De credit staat in kleine letters, en de meeste kaarten zijn Common, Uncommon of Rare.",
  },
  "atsuko-nishida": {
    title: "Atsuko Nishida-kaarten tot en met HeartGold & SoulSilver",
    h1: "Atsuko Nishida, vroege series",
    lede: "Atsuko Nishida tekent Engelse kaarten sinds de eerste sets. De hele lijst is te lang voor één binder, dus deze stopt bij HeartGold & SoulSilver. Vanaf Black & White ligt een eigen binder.",
  },
  "atsuko-nishida-later": {
    title: "Atsuko Nishida-kaarten vanaf Black & White",
    h1: "Atsuko Nishida, latere series",
    lede: "Dit is de rest van de Nishida-lijst: Black & White tot en met Mega-evolutie, plus de McDonald's-promo's die de catalogus buiten een hoofdserie zet. De eerdere series zitten in de andere Nishida-binder.",
  },
};

const sv: Record<string, Bits> = {
  "paldea-starters": {
    title: "Paldea-starters: Sprigatito, Fuecoco och Quaxly",
    h1: "Paldea-starters",
    lede: "Sprigatito, Fuecoco, Quaxly och deras utvecklingar delar den här pärmen. Varje tryck kommer från Scarlet & Violet eller Mega-utveckling.",
  },
  "halloween-ghosts": {
    title: "Halloween: Spöke-Pokémon, kortlista",
    h1: "Halloween: Spöke-Pokémon",
    lede: "Spöke-arter från Scarlet & Violet och Mega-utveckling finns här när sällsyntheten är Common, Uncommon eller Rare. Varje Pumpkaboo och varje Gourgeist följer med, även från äldre set.",
  },
  "pikachu-friends": {
    title: "Pikachus vänner: kortlista",
    h1: "Pikachus vänner",
    lede: "Raichu, Pichu, Plusle, Minun och de andra små elektriska gnagarna delar den här pärmen. Pikachu stannar i den egna listan.",
  },
  "paradox-pokemon": {
    title: "Paradox Pokémon: kortlista",
    h1: "Paradox Pokémon",
    lede: "Paradox Pokémon från dåtid och framtid delar den här pärmen. Varje tryck kommer från Scarlet & Violet eller Mega-utveckling.",
  },
  "kanto-starters": {
    title: "Kanto-starters utan Charizard",
    h1: "Kanto-starters, utan Charizard",
    lede: "Bulbasaur, Charmander, Squirtle och deras utvecklingar delar den här pärmen. Charizard står utanför, för det ansiktet har redan en egen lista.",
  },
  "fossil-pokemon": {
    title: "Fossil Pokémon: kortlista",
    h1: "Fossil Pokémon",
    lede: "Omanyte, Aerodactyl, Lileep, Cranidos, Tirtouga, Tyrunt, Dracozolt och de andra arterna som väckts ur ett fossil finns här. Fossil-tränarkort finns inte med.",
  },
  "legendary-birds": {
    title: "Alla Articuno-, Zapdos- och Moltres-kort",
    h1: "Legendariska fåglar",
    lede: "Articuno, Zapdos och Moltres delar den här listan, Galarian-former inräknade, för de använder samma dexnummer. Ett vanligt kort är undantaget.",
  },
  "sweets-and-snacks": {
    title: "Godis- och snack-Pokémon: kortlista",
    h1: "Godis- och snack-Pokémon",
    lede: "Cherubi, Swirlix, Bounsweet, Applin, Sinistea, Milcery, Fidough, Poltchageist och de matlika arterna runt dem delar den här pärmen. De flesta korten är Common, Uncommon eller Rare.",
  },
  dragons: {
    title: "Drake-kort från Scarlet & Violet och Mega-utveckling",
    h1: "Kort av typen Drake",
    lede: "Ett kort finns här när den tryckta typen är Drake och serien är Scarlet & Violet eller Mega-utveckling. Äldre Drake-kort står utanför.",
  },
  "winter-ice": {
    title: "Vinter: Is-Pokémon, kortlista",
    h1: "Vinter: Is-Pokémon",
    lede: "Is-arter från Scarlet & Violet och Mega-utveckling fyller den här pärmen. Glaceon från de serierna finns också i Eeveelution-listan.",
  },
  "legendary-beasts": {
    title: "Alla Raikou-, Entei- och Suicune-kort",
    h1: "Raikou, Entei och Suicune",
    lede: "Raikou, Entei och Suicune delar den här listan. De flesta trycken är äldre än Scarlet & Violet.",
  },
  "mew-mewtwo": {
    title: "Alla Mew- och Mewtwo-kort",
    h1: "Mewtwo och Mew",
    lede: "Mewtwo och Mew delar den här pärmen. Ett vanligt kort är undantaget, och jag stänger inte den här listan med bulk.",
  },
  "mythical-modern": {
    title: "Mytiska Pokémon från Sword & Shield och framåt",
    h1: "Mytiska Pokémon, från Sword & Shield",
    lede: "Mew, Celebi, Jirachi och de andra mytiska arterna finns här när serien är Sword & Shield, Scarlet & Violet eller Mega-utveckling. Äldre tryck står utanför.",
  },
  "galarian-forms": {
    title: "Galarian-form: kortlista",
    h1: "Galarian-former",
    lede: "Finns Galarian i det engelska kortnamnet har kortet en plats här. De flesta trycken kommer från Sword & Shield.",
  },
  "alolan-forms": {
    title: "Alolan-form: kortlista",
    h1: "Alolan-former",
    lede: "Finns Alolan i det engelska kortnamnet har kortet en plats här. De flesta trycken kommer från Sun & Moon.",
  },
  "hisuian-paldean-forms": {
    title: "Hisuian- och Paldean-form: kortlista",
    h1: "Hisuian- och Paldean-former",
    lede: "Hisuian eller Paldean i det engelska namnet räcker för en plats. Paldean ensamt vore en kort lista, så de två formerna stannar ihop.",
  },
  "mega-evolution": {
    title: "Mega-utveckling: kortlista",
    h1: "Mega-utvecklingskort",
    lede: "Ett kort från Scarlet & Violet eller Mega-utveckling finns här när det har subtypen MEGA eller det engelska namnet börjar med Mega. M-EX från XY-eran står utanför.",
  },
  "johto-starters": {
    title: "Johto-starters: Chikorita, Cyndaquil och Totodile",
    h1: "Johto-starters",
    lede: "Chikorita, Cyndaquil, Totodile och deras utvecklingar delar den här pärmen.",
  },
  "hoenn-starters": {
    title: "Hoenn-starters: Treecko, Torchic och Mudkip",
    h1: "Hoenn-starters",
    lede: "Treecko, Torchic, Mudkip och deras utvecklingar delar den här pärmen.",
  },
  "sinnoh-starters": {
    title: "Sinnoh-starters: Turtwig, Chimchar och Piplup",
    h1: "Sinnoh-starters",
    lede: "Turtwig, Chimchar, Piplup och deras utvecklingar delar den här pärmen.",
  },
  "unova-starters": {
    title: "Unova-starters: Snivy, Tepig och Oshawott",
    h1: "Unova-starters",
    lede: "Snivy, Tepig, Oshawott och deras utvecklingar delar den här pärmen.",
  },
  "kalos-starters": {
    title: "Kalos-starters: Chespin, Fennekin och Froakie",
    h1: "Kalos-starters",
    lede: "Chespin, Fennekin, Froakie och deras utvecklingar delar den här pärmen. Froakie, Frogadier och Greninja har också en kortare egen lista.",
  },
  "alola-starters": {
    title: "Alola-starters: Rowlet, Litten och Popplio",
    h1: "Alola-starters",
    lede: "Rowlet, Litten, Popplio och deras utvecklingar delar den här pärmen.",
  },
  "galar-starters": {
    title: "Galar-starters: Grookey, Scorbunny och Sobble",
    h1: "Galar-starters",
    lede: "Grookey, Scorbunny, Sobble och deras utvecklingar delar den här pärmen.",
  },
  "dratini-line": {
    title: "Alla Dragonite-kort: Dratini och Dragonair",
    h1: "Dratini, Dragonair och Dragonite",
    lede: "Dratini, Dragonair och Dragonite delar den här pärmen. En linje är lättare att bli klar med än ett steg för sig.",
  },
  "magikarp-gyarados": {
    title: "Alla Magikarp- och Gyarados-kort",
    h1: "Magikarp och Gyarados",
    lede: "Magikarp och Gyarados delar den här listan. Det lilla kortet hör ihop med det stora.",
  },
  "lucario-riolu": {
    title: "Alla Lucario- och Riolu-kort",
    h1: "Riolu och Lucario",
    lede: "Riolu och Lucario delar den här pärmen. Riolu finns också i baby-Pokémon-listan.",
  },
  "gardevoir-line": {
    title: "Alla Gardevoir-kort: Ralts och Gallade",
    h1: "Ralts, Kirlia, Gardevoir och Gallade",
    lede: "Ralts, Kirlia, Gardevoir och Gallade delar den här pärmen.",
  },
  "greninja-line": {
    title: "Alla Greninja-kort: Froakie och Frogadier",
    h1: "Froakie, Frogadier och Greninja",
    lede: "Froakie, Frogadier och Greninja delar den här listan. Varje kort finns också i Kalos-starterpärmen.",
  },
  "jigglypuff-line": {
    title: "Alla Jigglypuff-kort: Igglybuff och Wigglytuff",
    h1: "Igglybuff, Jigglypuff och Wigglytuff",
    lede: "Igglybuff, Jigglypuff och Wigglytuff delar den här pärmen. Igglybuff finns också i baby-Pokémon-listan.",
  },
  psyduck: {
    title: "Alla Psyduck- och Golduck-kort",
    h1: "Psyduck och Golduck",
    lede: "Psyduck och Golduck delar den här listan. De flesta korten är Common, Uncommon eller Rare.",
  },
  unown: {
    title: "Alla Unown-kort",
    h1: "Unown",
    lede: "Varje Unown-bokstav i den öppna listan ligger i den här pärmen. Nästan allt är Common, Uncommon eller Rare, och nästan allt är äldre än Scarlet & Violet.",
  },
  mimikyu: {
    title: "Alla Mimikyu-kort",
    h1: "Alla Mimikyu-kort",
    lede: "Mimikyu har en kort lista, och den är ändå längre än en sida. Jag håller varje engelskt tryck i den ordning seten kom.",
  },
  ditto: {
    title: "Alla Ditto-kort",
    h1: "Alla Ditto-kort",
    lede: "Ditto har en kort lista. Varje engelskt tryck i den öppna listan finns här, i den ordning seten kom.",
  },
  "winter-holiday": {
    title: "Högtid: Delibird och de andra",
    h1: "Högtid: Delibird och de andra",
    lede: "Delibird, Stantler, Snover, Abomasnow, Cubchoo, Beartic och Wyrdeer delar den här pärmen. De flesta korten är Common, Uncommon eller Rare.",
  },
  "bug-catcher": {
    title: "Insekt-Pokémon från Scarlet & Violet och Mega-utveckling",
    h1: "Insekt-Pokémon",
    lede: "Insekt-arter från Scarlet & Violet och Mega-utveckling fyller den här pärmen. Äldre Insekt-kort står utanför.",
  },
  "pink-pokemon": {
    title: "Rosa Pokémon från Scarlet & Violet och Mega-utveckling",
    h1: "Rosa Pokémon",
    lede: "Arter vars Pokédex-färg är rosa, från Scarlet & Violet eller Mega-utveckling, delar den här pärmen.",
  },
  "fire-basics-modern": {
    title: "Eld Basic-Pokémon från Scarlet & Violet och Mega-utveckling",
    h1: "Eld Basic-Pokémon",
    lede: "Ett kort finns här när den tryckta typen är Eld, subtypen är Basic och serien är Scarlet & Violet eller Mega-utveckling. En Stage 1 står utanför.",
  },
  "special-illustration-rares": {
    title: "Special Illustration Rare: kortlista",
    h1: "Special Illustration Rare",
    lede: "Varje engelskt kort med sällsyntheten Special Illustration Rare finns i den här pärmen. Inget av dem är Common, Uncommon eller Rare.",
  },
  "tera-pokemon": {
    title: "Tera-Pokémon: kortlista",
    h1: "Tera-Pokémon",
    lede: "Ett kort med subtypen Tera finns i den här pärmen. Det är Tera-Pokémon-ex, och ett vanligt kort finns inte med.",
  },
  "trainer-gallery": {
    title: "Trainer Gallery: kortlista",
    h1: "Trainer Gallery",
    lede: "Trainer Gallery Rare Holo är sällsyntheten på varje kort här. Sträckan är Trainer Gallery i Sword & Shield, och pärmen är kort.",
  },
  "ultra-beasts": {
    title: "Ultra Beast: kortlista",
    h1: "Ultra Beasts",
    lede: "Nihilego, Buzzwole, Pheromosa, Xurkitree, Celesteela, Kartana, Guzzlord, Poipole, Naganadel, Stakataka och Blacephalon delar den här pärmen. Nästan alla tryck är äldre än Scarlet & Violet.",
  },
  "tomokazu-komiya": {
    title: "Tomokazu Komiya: kortlista",
    h1: "Tomokazu Komiya-kort",
    lede: "Tomokazu Komiyas engelska kort fyller den här pärmen. De flesta är Common, Uncommon eller Rare. Bulk är guld, och den här listan är full av det.",
  },
  "saya-tsuruta": {
    title: "Saya Tsuruta: kortlista",
    h1: "Saya Tsuruta-kort",
    lede: "Saya Tsurutas engelska kort fyller den här pärmen. De flesta är Common, Uncommon eller Rare.",
  },
  sowsow: {
    title: "sowsow: kortlista",
    h1: "sowsow-kort",
    lede: "Kort illustrerade av sowsow fyller den här pärmen. Krediten är tryckt med gemener, och de flesta korten är Common, Uncommon eller Rare.",
  },
  "atsuko-nishida": {
    title: "Atsuko Nishida-kort fram till HeartGold & SoulSilver",
    h1: "Atsuko Nishida, tidiga serier",
    lede: "Atsuko Nishida har ritat engelska kort sedan de första seten. Hela listan är för lång för en pärm, så den här slutar vid HeartGold & SoulSilver. Från Black & White finns en egen pärm.",
  },
  "atsuko-nishida-later": {
    title: "Atsuko Nishida-kort från Black & White och framåt",
    h1: "Atsuko Nishida, senare serier",
    lede: "Det här är resten av Nishida-listan: Black & White till och med Mega-utveckling, plus McDonald's-promos som katalogen lägger utanför en huvudserie. De tidigare serierna ligger i den andra Nishida-pärmen.",
  },
};

const no: Record<string, Bits> = {
  "paldea-starters": {
    title: "Paldea-startere: Sprigatito, Fuecoco og Quaxly",
    h1: "Paldea-startere",
    lede: "Sprigatito, Fuecoco, Quaxly og utviklingene deres deler denne permen. Hvert trykk kommer fra Scarlet & Violet eller Megaevolusjon.",
  },
  "halloween-ghosts": {
    title: "Halloween: Spøkelse-Pokémon, kortliste",
    h1: "Halloween: Spøkelse-Pokémon",
    lede: "Spøkelse-arter fra Scarlet & Violet og Megaevolusjon er her når sjeldenheten er Common, Uncommon eller Rare. Hver Pumpkaboo og hver Gourgeist følger med, også fra eldre sett.",
  },
  "pikachu-friends": {
    title: "Pikachus venner: kortliste",
    h1: "Pikachus venner",
    lede: "Raichu, Pichu, Plusle, Minun og de andre små elektriske gnagerne deler denne permen. Pikachu blir i den egne listen.",
  },
  "paradox-pokemon": {
    title: "Paradox Pokémon: kortliste",
    h1: "Paradox Pokémon",
    lede: "Paradox Pokémon fra fortid og fremtid deler denne permen. Hvert trykk kommer fra Scarlet & Violet eller Megaevolusjon.",
  },
  "kanto-starters": {
    title: "Kanto-startere uten Charizard",
    h1: "Kanto-startere, uten Charizard",
    lede: "Bulbasaur, Charmander, Squirtle og utviklingene deres deler denne permen. Charizard står utenfor, for det ansiktet har allerede en egen liste.",
  },
  "fossil-pokemon": {
    title: "Fossil Pokémon: kortliste",
    h1: "Fossil Pokémon",
    lede: "Omanyte, Aerodactyl, Lileep, Cranidos, Tirtouga, Tyrunt, Dracozolt og de andre artene som er vekket fra et fossil, er her. Fossil-trenerkort er ikke med.",
  },
  "legendary-birds": {
    title: "Alle Articuno-, Zapdos- og Moltres-kort",
    h1: "Legendariske fugler",
    lede: "Articuno, Zapdos og Moltres deler denne listen, Galar Form medregnet, for de bruker samme dex-nummer. Et vanlig kort er unntaket.",
  },
  "sweets-and-snacks": {
    title: "Godteri- og snack-Pokémon: kortliste",
    h1: "Godteri- og snack-Pokémon",
    lede: "Cherubi, Swirlix, Bounsweet, Applin, Sinistea, Milcery, Fidough, Poltchageist og de matlignende artene rundt dem deler denne permen. De fleste kortene er Common, Uncommon eller Rare.",
  },
  dragons: {
    title: "Drage-kort fra Scarlet & Violet og Megaevolusjon",
    h1: "Kort av typen Drage",
    lede: "Et kort er her når den trykte typen er Drage og serien er Scarlet & Violet eller Megaevolusjon. Eldre Drage-kort står utenfor.",
  },
  "winter-ice": {
    title: "Vinter: Is-Pokémon, kortliste",
    h1: "Vinter: Is-Pokémon",
    lede: "Is-arter fra Scarlet & Violet og Megaevolusjon fyller denne permen. Glaceon fra de seriene er også i Eeveelution-listen.",
  },
  "legendary-beasts": {
    title: "Alle Raikou-, Entei- og Suicune-kort",
    h1: "Raikou, Entei og Suicune",
    lede: "Raikou, Entei og Suicune deler denne listen. De fleste trykkene er eldre enn Scarlet & Violet.",
  },
  "mew-mewtwo": {
    title: "Alle Mew- og Mewtwo-kort",
    h1: "Mewtwo og Mew",
    lede: "Mewtwo og Mew deler denne permen. Et vanlig kort er unntaket, og jeg lukker ikke denne listen med bulk.",
  },
  "mythical-modern": {
    title: "Mytiske Pokémon fra Sword & Shield og fremover",
    h1: "Mytiske Pokémon, fra Sword & Shield",
    lede: "Mew, Celebi, Jirachi og de andre mytiske artene er her når serien er Sword & Shield, Scarlet & Violet eller Megaevolusjon. Eldre trykk står utenfor.",
  },
  "galarian-forms": {
    title: "Galar Form: kortliste",
    h1: "Galar Form",
    lede: "Står Galarian i det engelske kortnavnet, har kortet en plass her. De fleste trykkene kommer fra Sword & Shield.",
  },
  "alolan-forms": {
    title: "Alola Form: kortliste",
    h1: "Alola Form",
    lede: "Står Alolan i det engelske kortnavnet, har kortet en plass her. De fleste trykkene kommer fra Sun & Moon.",
  },
  "hisuian-paldean-forms": {
    title: "Hisuian- og Paldean-form: kortliste",
    h1: "Hisuian- og Paldean-former",
    lede: "Hisuian eller Paldean i det engelske navnet er nok til en plass. Paldean alene ville vært en kort liste, så de to formene blir sammen.",
  },
  "mega-evolution": {
    title: "Megaevolusjon: kortliste",
    h1: "Megaevolusjon-kort",
    lede: "Et kort fra Scarlet & Violet eller Megaevolusjon er her når det har undertypen MEGA eller det engelske navnet begynner med Mega. M-EX fra XY-tiden står utenfor.",
  },
  "johto-starters": {
    title: "Johto-startere: Chikorita, Cyndaquil og Totodile",
    h1: "Johto-startere",
    lede: "Chikorita, Cyndaquil, Totodile og utviklingene deres deler denne permen.",
  },
  "hoenn-starters": {
    title: "Hoenn-startere: Treecko, Torchic og Mudkip",
    h1: "Hoenn-startere",
    lede: "Treecko, Torchic, Mudkip og utviklingene deres deler denne permen.",
  },
  "sinnoh-starters": {
    title: "Sinnoh-startere: Turtwig, Chimchar og Piplup",
    h1: "Sinnoh-startere",
    lede: "Turtwig, Chimchar, Piplup og utviklingene deres deler denne permen.",
  },
  "unova-starters": {
    title: "Unova-startere: Snivy, Tepig og Oshawott",
    h1: "Unova-startere",
    lede: "Snivy, Tepig, Oshawott og utviklingene deres deler denne permen.",
  },
  "kalos-starters": {
    title: "Kalos-startere: Chespin, Fennekin og Froakie",
    h1: "Kalos-startere",
    lede: "Chespin, Fennekin, Froakie og utviklingene deres deler denne permen. Froakie, Frogadier og Greninja har også en kortere egen liste.",
  },
  "alola-starters": {
    title: "Alola-startere: Rowlet, Litten og Popplio",
    h1: "Alola-startere",
    lede: "Rowlet, Litten, Popplio og utviklingene deres deler denne permen.",
  },
  "galar-starters": {
    title: "Galar-startere: Grookey, Scorbunny og Sobble",
    h1: "Galar-startere",
    lede: "Grookey, Scorbunny, Sobble og utviklingene deres deler denne permen.",
  },
  "dratini-line": {
    title: "Alle Dragonite-kort: Dratini og Dragonair",
    h1: "Dratini, Dragonair og Dragonite",
    lede: "Dratini, Dragonair og Dragonite deler denne permen. En linje er lettere å gjøre ferdig enn ett trinn alene.",
  },
  "magikarp-gyarados": {
    title: "Alle Magikarp- og Gyarados-kort",
    h1: "Magikarp og Gyarados",
    lede: "Magikarp og Gyarados deler denne listen. Det lille kortet hører sammen med det store.",
  },
  "lucario-riolu": {
    title: "Alle Lucario- og Riolu-kort",
    h1: "Riolu og Lucario",
    lede: "Riolu og Lucario deler denne permen. Riolu er også i baby-Pokémon-listen.",
  },
  "gardevoir-line": {
    title: "Alle Gardevoir-kort: Ralts og Gallade",
    h1: "Ralts, Kirlia, Gardevoir og Gallade",
    lede: "Ralts, Kirlia, Gardevoir og Gallade deler denne permen.",
  },
  "greninja-line": {
    title: "Alle Greninja-kort: Froakie og Frogadier",
    h1: "Froakie, Frogadier og Greninja",
    lede: "Froakie, Frogadier og Greninja deler denne listen. Hvert kort er også i Kalos-starterpermen.",
  },
  "jigglypuff-line": {
    title: "Alle Jigglypuff-kort: Igglybuff og Wigglytuff",
    h1: "Igglybuff, Jigglypuff og Wigglytuff",
    lede: "Igglybuff, Jigglypuff og Wigglytuff deler denne permen. Igglybuff er også i baby-Pokémon-listen.",
  },
  psyduck: {
    title: "Alle Psyduck- og Golduck-kort",
    h1: "Psyduck og Golduck",
    lede: "Psyduck og Golduck deler denne listen. De fleste kortene er Common, Uncommon eller Rare.",
  },
  unown: {
    title: "Alle Unown-kort",
    h1: "Unown",
    lede: "Hver Unown-bokstav i den åpne listen ligger i denne permen. Nesten alt er Common, Uncommon eller Rare, og nesten alt er eldre enn Scarlet & Violet.",
  },
  mimikyu: {
    title: "Alle Mimikyu-kort",
    h1: "Alle Mimikyu-kort",
    lede: "Mimikyu har en kort liste, og den er likevel lengre enn én side. Jeg holder hvert engelske trykk i den rekkefølgen settene kom.",
  },
  ditto: {
    title: "Alle Ditto-kort",
    h1: "Alle Ditto-kort",
    lede: "Ditto har en kort liste. Hvert engelske trykk i den åpne listen er her, i den rekkefølgen settene kom.",
  },
  "winter-holiday": {
    title: "Høytid: Delibird og de andre",
    h1: "Høytid: Delibird og de andre",
    lede: "Delibird, Stantler, Snover, Abomasnow, Cubchoo, Beartic og Wyrdeer deler denne permen. De fleste kortene er Common, Uncommon eller Rare.",
  },
  "bug-catcher": {
    title: "Insekt-Pokémon fra Scarlet & Violet og Megaevolusjon",
    h1: "Insekt-Pokémon",
    lede: "Insekt-arter fra Scarlet & Violet og Megaevolusjon fyller denne permen. Eldre Insekt-kort står utenfor.",
  },
  "pink-pokemon": {
    title: "Rosa Pokémon fra Scarlet & Violet og Megaevolusjon",
    h1: "Rosa Pokémon",
    lede: "Arter med rosa som Pokédex-farge, fra Scarlet & Violet eller Megaevolusjon, deler denne permen.",
  },
  "fire-basics-modern": {
    title: "Ild Basic-Pokémon fra Scarlet & Violet og Megaevolusjon",
    h1: "Ild Basic-Pokémon",
    lede: "Et kort er her når den trykte typen er Ild, undertypen er Basic og serien er Scarlet & Violet eller Megaevolusjon. En Stage 1 står utenfor.",
  },
  "special-illustration-rares": {
    title: "Special Illustration Rare: kortliste",
    h1: "Special Illustration Rare",
    lede: "Hvert engelske kort med sjeldenheten Special Illustration Rare er i denne permen. Ingen av dem er Common, Uncommon eller Rare.",
  },
  "tera-pokemon": {
    title: "Tera-Pokémon: kortliste",
    h1: "Tera-Pokémon",
    lede: "Et kort med undertypen Tera er i denne permen. Dette er Tera-Pokémon-ex, og et vanlig kort er ikke med.",
  },
  "trainer-gallery": {
    title: "Trainer Gallery: kortliste",
    h1: "Trainer Gallery",
    lede: "Trainer Gallery Rare Holo er sjeldenheten på hvert kort her. Strekket er Trainer Gallery i Sword & Shield, og permen er kort.",
  },
  "ultra-beasts": {
    title: "Ultra Beast: kortliste",
    h1: "Ultra Beasts",
    lede: "Nihilego, Buzzwole, Pheromosa, Xurkitree, Celesteela, Kartana, Guzzlord, Poipole, Naganadel, Stakataka og Blacephalon deler denne permen. Nesten alle trykkene er eldre enn Scarlet & Violet.",
  },
  "tomokazu-komiya": {
    title: "Tomokazu Komiya: kortliste",
    h1: "Tomokazu Komiya-kort",
    lede: "Tomokazu Komiyas engelske kort fyller denne permen. De fleste er Common, Uncommon eller Rare. Bulk er gull, og denne listen er full av det.",
  },
  "saya-tsuruta": {
    title: "Saya Tsuruta: kortliste",
    h1: "Saya Tsuruta-kort",
    lede: "Saya Tsurutas engelske kort fyller denne permen. De fleste er Common, Uncommon eller Rare.",
  },
  sowsow: {
    title: "sowsow: kortliste",
    h1: "sowsow-kort",
    lede: "Kort illustrert av sowsow fyller denne permen. Kreditten er trykt med små bokstaver, og de fleste kortene er Common, Uncommon eller Rare.",
  },
  "atsuko-nishida": {
    title: "Atsuko Nishida-kort til og med HeartGold & SoulSilver",
    h1: "Atsuko Nishida, tidlige serier",
    lede: "Atsuko Nishida har tegnet engelske kort siden de første settene. Hele listen er for lang for én perm, så denne stopper ved HeartGold & SoulSilver. Fra Black & White finnes en egen perm.",
  },
  "atsuko-nishida-later": {
    title: "Atsuko Nishida-kort fra Black & White og fremover",
    h1: "Atsuko Nishida, senere serier",
    lede: "Dette er resten av Nishida-listen: Black & White til og med Megaevolusjon, pluss McDonald's-promoene katalogen legger utenfor en hovedserie. De tidligere seriene ligger i den andre Nishida-permen.",
  },
};

const fi: Record<string, Bits> = {
  "paldea-starters": {
    title: "Paldean aloituspokémonit: Sprigatito, Fuecoco ja Quaxly",
    h1: "Paldean aloituspokémonit",
    lede: "Sprigatito, Fuecoco, Quaxly ja niiden kehityslinjat jakavat tämän kansion. Jokainen painos on sarjasta Scarlet & Violet tai Megaevoluutio.",
  },
  "halloween-ghosts": {
    title: "Halloween: Kummitus-Pokémonien korttilista",
    h1: "Halloween: Kummitus-Pokémonit",
    lede: "Kummitus-lajit sarjoista Scarlet & Violet ja Megaevoluutio ovat tässä, kun harvinaisuus on Common, Uncommon tai Rare. Jokainen Pumpkaboo ja jokainen Gourgeist tulee mukaan, myös vanhemmista seteistä.",
  },
  "pikachu-friends": {
    title: "Pikachun ystävät: korttilista",
    h1: "Pikachun ystävät",
    lede: "Raichu, Pichu, Plusle, Minun ja muut pienet sähköjyrsijät jakavat tämän kansion. Pikachu pysyy omassa listassaan.",
  },
  "paradox-pokemon": {
    title: "Paradoksi-Pokémonien korttilista",
    h1: "Paradoksi-Pokémonit",
    lede: "Menneisyyden ja tulevaisuuden Paradoksi-Pokémonit jakavat tämän kansion. Jokainen painos on sarjasta Scarlet & Violet tai Megaevoluutio.",
  },
  "kanto-starters": {
    title: "Kanton aloituspokémonit ilman Charizardia",
    h1: "Kanton aloituspokémonit, ilman Charizardia",
    lede: "Bulbasaur, Charmander, Squirtle ja niiden kehityslinjat jakavat tämän kansion. Charizard jää ulos, koska sillä on jo oma lista.",
  },
  "fossil-pokemon": {
    title: "Fossiili-Pokémonien korttilista",
    h1: "Fossiili-Pokémonit",
    lede: "Omanyte, Aerodactyl, Lileep, Cranidos, Tirtouga, Tyrunt, Dracozolt ja muut fossiilista herätetyt lajit ovat tässä. Fossiili-kouluttajakortit eivät ole listalla.",
  },
  "legendary-birds": {
    title: "Kaikki Articuno-, Zapdos- ja Moltres-kortit",
    h1: "Legendaariset linnut",
    lede: "Articuno, Zapdos ja Moltres jakavat tämän listan, Galar-muodot mukana, koska niillä on sama dex-numero. Tavallinen kortti on poikkeus.",
  },
  "sweets-and-snacks": {
    title: "Herkku- ja välipala-Pokémonien korttilista",
    h1: "Herkku- ja välipala-Pokémonit",
    lede: "Cherubi, Swirlix, Bounsweet, Applin, Sinistea, Milcery, Fidough, Poltchageist ja niiden ruokaa muistuttavat lajit jakavat tämän kansion. Useimmat kortit ovat Common, Uncommon tai Rare.",
  },
  dragons: {
    title: "Lohikäärme-kortit sarjoista Scarlet & Violet ja Megaevoluutio",
    h1: "Lohikäärme-tyypin kortit",
    lede: "Kortti on tässä, kun painettu tyyppi on Lohikäärme ja sarja on Scarlet & Violet tai Megaevoluutio. Vanhemmat Lohikäärme-kortit jäävät ulos.",
  },
  "winter-ice": {
    title: "Talvi: Jää-Pokémonien korttilista",
    h1: "Talvi: Jää-Pokémonit",
    lede: "Jää-lajit sarjoista Scarlet & Violet ja Megaevoluutio täyttävät tämän kansion. Näiden sarjojen Glaceon on myös Eevee-kehitysten listalla.",
  },
  "legendary-beasts": {
    title: "Kaikki Raikou-, Entei- ja Suicune-kortit",
    h1: "Raikou, Entei ja Suicune",
    lede: "Raikou, Entei ja Suicune jakavat tämän listan. Useimmat painokset ovat vanhempia kuin Scarlet & Violet.",
  },
  "mew-mewtwo": {
    title: "Kaikki Mew- ja Mewtwo-kortit",
    h1: "Mewtwo ja Mew",
    lede: "Mewtwo ja Mew jakavat tämän kansion. Tavallinen kortti on poikkeus, enkä sulje tätä listaa bulkilla.",
  },
  "mythical-modern": {
    title: "Mystiset Pokémonit Sword & Shield -sarjasta alkaen",
    h1: "Mystiset Pokémonit, Sword & Shield -sarjasta alkaen",
    lede: "Mew, Celebi, Jirachi ja muut mystiset lajit ovat tässä, kun sarja on Sword & Shield, Scarlet & Violet tai Megaevoluutio. Vanhemmat painokset jäävät ulos.",
  },
  "galarian-forms": {
    title: "Galar-muotojen korttilista",
    h1: "Galar-muodot",
    lede: "Jos englanninkielisessä nimessä on Galarian, kortilla on paikka tässä. Useimmat painokset ovat Sword & Shield -sarjasta.",
  },
  "alolan-forms": {
    title: "Alola-muotojen korttilista",
    h1: "Alola-muodot",
    lede: "Jos englanninkielisessä nimessä on Alolan, kortilla on paikka tässä. Useimmat painokset ovat Sun & Moon -sarjasta.",
  },
  "hisuian-paldean-forms": {
    title: "Hisuian- ja Paldean-muotojen korttilista",
    h1: "Hisuian- ja Paldean-muodot",
    lede: "Hisuian tai Paldean englanninkielisessä nimessä riittää paikaksi. Pelkkä Paldean olisi lyhyt lista, joten molemmat muodot pysyvät yhdessä.",
  },
  "mega-evolution": {
    title: "Megaevoluutio-korttien lista",
    h1: "Megaevoluutio-kortit",
    lede: "Kortti sarjasta Scarlet & Violet tai Megaevoluutio on tässä, kun sillä on alatyyppi MEGA tai englanninkielinen nimi alkaa sanalla Mega. XY-ajan M-EX-kortit jäävät ulos.",
  },
  "johto-starters": {
    title: "Johdon aloituspokémonit: Chikorita, Cyndaquil ja Totodile",
    h1: "Johdon aloituspokémonit",
    lede: "Chikorita, Cyndaquil, Totodile ja niiden kehityslinjat jakavat tämän kansion.",
  },
  "hoenn-starters": {
    title: "Hoennin aloituspokémonit: Treecko, Torchic ja Mudkip",
    h1: "Hoennin aloituspokémonit",
    lede: "Treecko, Torchic, Mudkip ja niiden kehityslinjat jakavat tämän kansion.",
  },
  "sinnoh-starters": {
    title: "Sinnohin aloituspokémonit: Turtwig, Chimchar ja Piplup",
    h1: "Sinnohin aloituspokémonit",
    lede: "Turtwig, Chimchar, Piplup ja niiden kehityslinjat jakavat tämän kansion.",
  },
  "unova-starters": {
    title: "Unovan aloituspokémonit: Snivy, Tepig ja Oshawott",
    h1: "Unovan aloituspokémonit",
    lede: "Snivy, Tepig, Oshawott ja niiden kehityslinjat jakavat tämän kansion.",
  },
  "kalos-starters": {
    title: "Kalosin aloituspokémonit: Chespin, Fennekin ja Froakie",
    h1: "Kalosin aloituspokémonit",
    lede: "Chespin, Fennekin, Froakie ja niiden kehityslinjat jakavat tämän kansion. Froakiella, Frogadierilla ja Greninjalla on myös lyhyempi oma lista.",
  },
  "alola-starters": {
    title: "Alolan aloituspokémonit: Rowlet, Litten ja Popplio",
    h1: "Alolan aloituspokémonit",
    lede: "Rowlet, Litten, Popplio ja niiden kehityslinjat jakavat tämän kansion.",
  },
  "galar-starters": {
    title: "Galarin aloituspokémonit: Grookey, Scorbunny ja Sobble",
    h1: "Galarin aloituspokémonit",
    lede: "Grookey, Scorbunny, Sobble ja niiden kehityslinjat jakavat tämän kansion.",
  },
  "dratini-line": {
    title: "Kaikki Dragonite-kortit: Dratini ja Dragonair",
    h1: "Dratini, Dragonair ja Dragonite",
    lede: "Dratini, Dragonair ja Dragonite jakavat tämän kansion. Linja on helpompi saada valmiiksi kuin yksi vaihe yksinään.",
  },
  "magikarp-gyarados": {
    title: "Kaikki Magikarp- ja Gyarados-kortit",
    h1: "Magikarp ja Gyarados",
    lede: "Magikarp ja Gyarados jakavat tämän listan. Pieni kortti kuuluu ison viereen.",
  },
  "lucario-riolu": {
    title: "Kaikki Lucario- ja Riolu-kortit",
    h1: "Riolu ja Lucario",
    lede: "Riolu ja Lucario jakavat tämän kansion. Riolu on myös baby-Pokémonien listalla.",
  },
  "gardevoir-line": {
    title: "Kaikki Gardevoir-kortit: Ralts ja Gallade",
    h1: "Ralts, Kirlia, Gardevoir ja Gallade",
    lede: "Ralts, Kirlia, Gardevoir ja Gallade jakavat tämän kansion.",
  },
  "greninja-line": {
    title: "Kaikki Greninja-kortit: Froakie ja Frogadier",
    h1: "Froakie, Frogadier ja Greninja",
    lede: "Froakie, Frogadier ja Greninja jakavat tämän listan. Jokainen kortti on myös Kalosin aloituspokémonien kansiossa.",
  },
  "jigglypuff-line": {
    title: "Kaikki Jigglypuff-kortit: Igglybuff ja Wigglytuff",
    h1: "Igglybuff, Jigglypuff ja Wigglytuff",
    lede: "Igglybuff, Jigglypuff ja Wigglytuff jakavat tämän kansion. Igglybuff on myös baby-Pokémonien listalla.",
  },
  psyduck: {
    title: "Kaikki Psyduck- ja Golduck-kortit",
    h1: "Psyduck ja Golduck",
    lede: "Psyduck ja Golduck jakavat tämän listan. Useimmat kortit ovat Common, Uncommon tai Rare.",
  },
  unown: {
    title: "Kaikki Unown-kortit",
    h1: "Unown",
    lede: "Jokainen avoimen listan Unown-kirjain on tässä kansiossa. Lähes kaikki on Common, Uncommon tai Rare, ja lähes kaikki on vanhempaa kuin Scarlet & Violet.",
  },
  mimikyu: {
    title: "Kaikki Mimikyu-kortit",
    h1: "Kaikki Mimikyu-kortit",
    lede: "Mimikyulla on lyhyt lista, ja se on silti pidempi kuin yksi sivu. Pidän jokaisen englanninkielisen painoksen settien järjestyksessä.",
  },
  ditto: {
    title: "Kaikki Ditto-kortit",
    h1: "Kaikki Ditto-kortit",
    lede: "Dittolla on lyhyt lista. Jokainen avoimen listan englanninkielinen painos on tässä, settien järjestyksessä.",
  },
  "winter-holiday": {
    title: "Juhla: Delibird ja muut",
    h1: "Juhla: Delibird ja muut",
    lede: "Delibird, Stantler, Snover, Abomasnow, Cubchoo, Beartic ja Wyrdeer jakavat tämän kansion. Useimmat kortit ovat Common, Uncommon tai Rare.",
  },
  "bug-catcher": {
    title: "Ötökkä-Pokémonit sarjoista Scarlet & Violet ja Megaevoluutio",
    h1: "Ötökkä-Pokémonit",
    lede: "Ötökkä-lajit sarjoista Scarlet & Violet ja Megaevoluutio täyttävät tämän kansion. Vanhemmat Ötökkä-kortit jäävät ulos.",
  },
  "pink-pokemon": {
    title: "Vaaleanpunaiset Pokémonit sarjoista Scarlet & Violet ja Megaevoluutio",
    h1: "Vaaleanpunaiset Pokémonit",
    lede: "Lajit, joiden Pokédex-väri on vaaleanpunainen, sarjoista Scarlet & Violet tai Megaevoluutio, jakavat tämän kansion.",
  },
  "fire-basics-modern": {
    title: "Tuli-Basic-Pokémonit sarjoista Scarlet & Violet ja Megaevoluutio",
    h1: "Tuli-Basic-Pokémonit",
    lede: "Kortti on tässä, kun painettu tyyppi on Tuli, alatyyppi on Basic ja sarja on Scarlet & Violet tai Megaevoluutio. Stage 1 jää ulos.",
  },
  "special-illustration-rares": {
    title: "Special Illustration Rare -korttilista",
    h1: "Special Illustration Rare",
    lede: "Jokainen englanninkielinen kortti, jonka harvinaisuus on Special Illustration Rare, on tässä kansiossa. Yksikään niistä ei ole Common, Uncommon tai Rare.",
  },
  "tera-pokemon": {
    title: "Tera-Pokémonien korttilista",
    h1: "Tera-Pokémonit",
    lede: "Kortti, jolla on alatyyppi Tera, on tässä kansiossa. Nämä ovat Tera-Pokémon-ex-kortteja, eikä tavallinen kortti ole niiden joukossa.",
  },
  "trainer-gallery": {
    title: "Trainer Gallery -korttilista",
    h1: "Trainer Gallery",
    lede: "Trainer Gallery Rare Holo on jokaisen kortin harvinaisuus tässä. Jakso on Sword & Shield -sarjan Trainer Gallery, ja kansio on lyhyt.",
  },
  "ultra-beasts": {
    title: "Ultrapetojen korttilista",
    h1: "Ultrapedot",
    lede: "Nihilego, Buzzwole, Pheromosa, Xurkitree, Celesteela, Kartana, Guzzlord, Poipole, Naganadel, Stakataka ja Blacephalon jakavat tämän kansion. Lähes kaikki painokset ovat vanhempia kuin Scarlet & Violet.",
  },
  "tomokazu-komiya": {
    title: "Tomokazu Komiyan korttilista",
    h1: "Tomokazu Komiyan kortit",
    lede: "Tomokazu Komiyan englanninkieliset kortit täyttävät tämän kansion. Useimmat ovat Common, Uncommon tai Rare. Bulk on kultaa, ja tämä lista on sitä täynnä.",
  },
  "saya-tsuruta": {
    title: "Saya Tsurutan korttilista",
    h1: "Saya Tsurutan kortit",
    lede: "Saya Tsurutan englanninkieliset kortit täyttävät tämän kansion. Useimmat ovat Common, Uncommon tai Rare.",
  },
  sowsow: {
    title: "sowsow-korttilista",
    h1: "sowsow-kortit",
    lede: "sowsowin kuvittamat kortit täyttävät tämän kansion. Tekijänimi on painettu pienin kirjaimin, ja useimmat kortit ovat Common, Uncommon tai Rare.",
  },
  "atsuko-nishida": {
    title: "Atsuko Nishidan kortit HeartGold & SoulSilver -sarjaan asti",
    h1: "Atsuko Nishida, varhaiset sarjat",
    lede: "Atsuko Nishida on piirtänyt englanninkielisiä kortteja ensimmäisistä seteistä asti. Koko lista on liian pitkä yhteen kansioon, joten tämä päättyy HeartGold & SoulSilver -sarjaan. Black & White -sarjasta alkaen on oma kansio.",
  },
  "atsuko-nishida-later": {
    title: "Atsuko Nishidan kortit Black & White -sarjasta alkaen",
    h1: "Atsuko Nishida, myöhemmät sarjat",
    lede: "Tämä on Nishida-listan loppu: Black & White -sarjasta Megaevoluutioon, sekä McDonald's-promot, jotka katalogi arkistoi pääsarjan ulkopuolelle. Aiemmat sarjat ovat toisessa Nishida-kansiossa.",
  },
};

const pl: Record<string, Bits> = {
  "paldea-starters": {
    title: "Startery Paldei: Sprigatito, Fuecoco i Quaxly",
    h1: "Startery Paldei",
    lede: "Sprigatito, Fuecoco, Quaxly i ich ewolucje dzielą ten segregator. Każdy druk pochodzi z serii Scarlet & Violet albo Megaewolucji.",
  },
  "halloween-ghosts": {
    title: "Halloween: lista kart Pokémonów Duch",
    h1: "Halloween: Pokémony Duch",
    lede: "Gatunki Duch z serii Scarlet & Violet i Megaewolucji są tutaj, gdy rzadkość to Common, Uncommon albo Rare. Każdy Pumpkaboo i każdy Gourgeist wchodzi, także ze starszych setów.",
  },
  "pikachu-friends": {
    title: "Przyjaciele Pikachu: lista kart",
    h1: "Przyjaciele Pikachu",
    lede: "Raichu, Pichu, Plusle, Minun i inne małe elektryczne gryzonie dzielą ten segregator. Pikachu zostaje na własnej liście.",
  },
  "paradox-pokemon": {
    title: "Lista kart Pokémon Paradoks",
    h1: "Pokémon Paradoks",
    lede: "Pokémon Paradoks z przeszłości i z przyszłości dzielą ten segregator. Każdy druk pochodzi z serii Scarlet & Violet albo Megaewolucji.",
  },
  "kanto-starters": {
    title: "Startery Kanto bez Charizarda",
    h1: "Startery Kanto, bez Charizarda",
    lede: "Bulbasaur, Charmander, Squirtle i ich ewolucje dzielą ten segregator. Charizard zostaje poza listą, bo ta twarz ma już własną checklistę.",
  },
  "fossil-pokemon": {
    title: "Lista kart Pokémonów ze skamieliny",
    h1: "Pokémony ze skamieliny",
    lede: "Omanyte, Aerodactyl, Lileep, Cranidos, Tirtouga, Tyrunt, Dracozolt i inne gatunki ożywione ze skamieliny są tutaj. Karty trenera Fossil nie wchodzą na listę.",
  },
  "legendary-birds": {
    title: "Wszystkie karty Articuno, Zapdosa i Moltresa",
    h1: "Legendarne ptaki",
    lede: "Articuno, Zapdos i Moltres dzielą tę listę, razem z formą Galarską, bo używają tego samego numeru dex. Zwykła karta jest tu wyjątkiem.",
  },
  "sweets-and-snacks": {
    title: "Pokémony słodyczy i przekąsek: lista kart",
    h1: "Pokémony słodyczy i przekąsek",
    lede: "Cherubi, Swirlix, Bounsweet, Applin, Sinistea, Milcery, Fidough, Poltchageist i podobne do jedzenia gatunki dzielą ten segregator. Większość kart to Common, Uncommon albo Rare.",
  },
  dragons: {
    title: "Karty Smok z serii Scarlet & Violet i Megaewolucji",
    h1: "Karty typu Smok",
    lede: "Karta jest tutaj, gdy drukowany typ to Smok, a seria to Scarlet & Violet albo Megaewolucja. Starsze karty Smok zostają poza listą.",
  },
  "winter-ice": {
    title: "Zima: lista kart Pokémonów Lodowy",
    h1: "Zima: Pokémony Lodowy",
    lede: "Gatunki Lodowy z serii Scarlet & Violet i Megaewolucji wypełniają ten segregator. Glaceon z tych serii jest też na liście ewolucji Eevee.",
  },
  "legendary-beasts": {
    title: "Wszystkie karty Raikou, Enteia i Suicune",
    h1: "Raikou, Entei i Suicune",
    lede: "Raikou, Entei i Suicune dzielą tę listę. Większość druków jest starsza niż Scarlet & Violet.",
  },
  "mew-mewtwo": {
    title: "Wszystkie karty Mew i Mewtwo",
    h1: "Mewtwo i Mew",
    lede: "Mewtwo i Mew dzielą ten segregator. Zwykła karta jest wyjątkiem i nie domykam tej listy bulkiem.",
  },
  "mythical-modern": {
    title: "Mityczne Pokémony od Sword & Shield",
    h1: "Mityczne Pokémony, od Sword & Shield",
    lede: "Mew, Celebi, Jirachi i inne mityczne gatunki są tutaj, gdy seria to Sword & Shield, Scarlet & Violet albo Megaewolucja. Starsze druki zostają poza listą.",
  },
  "galarian-forms": {
    title: "Lista kart formy Galarskiej",
    h1: "Forma Galarska",
    lede: "Gdy w angielskiej nazwie karty jest Galarian, karta ma tu miejsce. Większość druków pochodzi z serii Sword & Shield.",
  },
  "alolan-forms": {
    title: "Lista kart formy Alolańskiej",
    h1: "Forma Alolańska",
    lede: "Gdy w angielskiej nazwie karty jest Alolan, karta ma tu miejsce. Większość druków pochodzi z serii Sun & Moon.",
  },
  "hisuian-paldean-forms": {
    title: "Forma Hisuiańska i forma Paldeańska",
    h1: "Forma Hisuiańska i forma Paldeańska",
    lede: "Hisuian albo Paldean w angielskiej nazwie wystarcza na miejsce. Sama forma Paldeańska byłaby krótką listą, więc obie formy zostają razem.",
  },
  "mega-evolution": {
    title: "Lista kart Megaewolucji",
    h1: "Karty Megaewolucji",
    lede: "Karta z Scarlet & Violet albo Megaewolucji jest tutaj, gdy ma podtyp MEGA albo angielska nazwa zaczyna się od Mega. Karty M-EX z ery XY zostają poza listą.",
  },
  "johto-starters": {
    title: "Startery Johto: Chikorita, Cyndaquil i Totodile",
    h1: "Startery Johto",
    lede: "Chikorita, Cyndaquil, Totodile i ich ewolucje dzielą ten segregator.",
  },
  "hoenn-starters": {
    title: "Startery Hoenn: Treecko, Torchic i Mudkip",
    h1: "Startery Hoenn",
    lede: "Treecko, Torchic, Mudkip i ich ewolucje dzielą ten segregator.",
  },
  "sinnoh-starters": {
    title: "Startery Sinnoh: Turtwig, Chimchar i Piplup",
    h1: "Startery Sinnoh",
    lede: "Turtwig, Chimchar, Piplup i ich ewolucje dzielą ten segregator.",
  },
  "unova-starters": {
    title: "Startery Unova: Snivy, Tepig i Oshawott",
    h1: "Startery Unova",
    lede: "Snivy, Tepig, Oshawott i ich ewolucje dzielą ten segregator.",
  },
  "kalos-starters": {
    title: "Startery Kalos: Chespin, Fennekin i Froakie",
    h1: "Startery Kalos",
    lede: "Chespin, Fennekin, Froakie i ich ewolucje dzielą ten segregator. Froakie, Frogadier i Greninja mają też krótszą własną listę.",
  },
  "alola-starters": {
    title: "Startery Aloli: Rowlet, Litten i Popplio",
    h1: "Startery Aloli",
    lede: "Rowlet, Litten, Popplio i ich ewolucje dzielą ten segregator.",
  },
  "galar-starters": {
    title: "Startery Galar: Grookey, Scorbunny i Sobble",
    h1: "Startery Galar",
    lede: "Grookey, Scorbunny, Sobble i ich ewolucje dzielą ten segregator.",
  },
  "dratini-line": {
    title: "Wszystkie karty Dragonite: Dratini i Dragonair",
    h1: "Dratini, Dragonair i Dragonite",
    lede: "Dratini, Dragonair i Dragonite dzielą ten segregator. Linię łatwiej domknąć niż jeden etap osobno.",
  },
  "magikarp-gyarados": {
    title: "Wszystkie karty Magikarpa i Gyaradosa",
    h1: "Magikarp i Gyarados",
    lede: "Magikarp i Gyarados dzielą tę listę. Mała karta należy do dużej.",
  },
  "lucario-riolu": {
    title: "Wszystkie karty Lucario i Riolu",
    h1: "Riolu i Lucario",
    lede: "Riolu i Lucario dzielą ten segregator. Riolu jest też na liście baby Pokémon.",
  },
  "gardevoir-line": {
    title: "Wszystkie karty Gardevoir: Ralts i Gallade",
    h1: "Ralts, Kirlia, Gardevoir i Gallade",
    lede: "Ralts, Kirlia, Gardevoir i Gallade dzielą ten segregator.",
  },
  "greninja-line": {
    title: "Wszystkie karty Greninji: Froakie i Frogadier",
    h1: "Froakie, Frogadier i Greninja",
    lede: "Froakie, Frogadier i Greninja dzielą tę listę. Każda karta jest też w segregatorze starterów Kalos.",
  },
  "jigglypuff-line": {
    title: "Wszystkie karty Jigglypuff: Igglybuff i Wigglytuff",
    h1: "Igglybuff, Jigglypuff i Wigglytuff",
    lede: "Igglybuff, Jigglypuff i Wigglytuff dzielą ten segregator. Igglybuff jest też na liście baby Pokémon.",
  },
  psyduck: {
    title: "Wszystkie karty Psyducka i Golducka",
    h1: "Psyduck i Golduck",
    lede: "Psyduck i Golduck dzielą tę listę. Większość kart to Common, Uncommon albo Rare.",
  },
  unown: {
    title: "Wszystkie karty Unown",
    h1: "Unown",
    lede: "Każda litera Unown z otwartej listy leży w tym segregatorze. Prawie wszystko to Common, Uncommon albo Rare i prawie wszystko jest starsze niż Scarlet & Violet.",
  },
  mimikyu: {
    title: "Wszystkie karty Mimikyu",
    h1: "Wszystkie karty Mimikyu",
    lede: "Mimikyu ma krótką listę, a i tak jest dłuższa niż jedna strona. Trzymam każdy angielski druk w kolejności setów.",
  },
  ditto: {
    title: "Wszystkie karty Ditto",
    h1: "Wszystkie karty Ditto",
    lede: "Ditto ma krótką listę. Każdy angielski druk z otwartej listy jest tutaj, w kolejności setów.",
  },
  "winter-holiday": {
    title: "Święta: Delibird i pozostali",
    h1: "Święta: Delibird i pozostali",
    lede: "Delibird, Stantler, Snover, Abomasnow, Cubchoo, Beartic i Wyrdeer dzielą ten segregator. Większość kart to Common, Uncommon albo Rare.",
  },
  "bug-catcher": {
    title: "Pokémony Robak z serii Scarlet & Violet i Megaewolucji",
    h1: "Pokémony Robak",
    lede: "Gatunki Robak z serii Scarlet & Violet i Megaewolucji wypełniają ten segregator. Starsze karty Robak zostają poza listą.",
  },
  "pink-pokemon": {
    title: "Różowe Pokémony z serii Scarlet & Violet i Megaewolucji",
    h1: "Różowe Pokémony",
    lede: "Gatunki, których kolor w Pokédexie jest różowy, z serii Scarlet & Violet albo Megaewolucji, dzielą ten segregator.",
  },
  "fire-basics-modern": {
    title: "Podstawowe Pokémony Ognisty z serii Scarlet & Violet i Megaewolucji",
    h1: "Podstawowe Pokémony typu Ognisty",
    lede: "Karta jest tutaj, gdy drukowany typ to Ognisty, podtyp to Basic, a seria to Scarlet & Violet albo Megaewolucja. Stage 1 zostaje poza listą.",
  },
  "special-illustration-rares": {
    title: "Lista kart Special Illustration Rare",
    h1: "Special Illustration Rare",
    lede: "Każda angielska karta o rzadkości Special Illustration Rare jest w tym segregatorze. Żadna nie jest Common, Uncommon ani Rare.",
  },
  "tera-pokemon": {
    title: "Lista kart Pokémonów Tera",
    h1: "Pokémony Tera",
    lede: "Karta z podtypem Tera jest w tym segregatorze. To druki Tera Pokémon ex i zwykłej karty wśród nich nie ma.",
  },
  "trainer-gallery": {
    title: "Lista kart Trainer Gallery",
    h1: "Trainer Gallery",
    lede: "Trainer Gallery Rare Holo to rzadkość każdej karty tutaj. Odcinek to Trainer Gallery z Sword & Shield i segregator jest krótki.",
  },
  "ultra-beasts": {
    title: "Lista kart Ultrabestii",
    h1: "Ultrabestie",
    lede: "Nihilego, Buzzwole, Pheromosa, Xurkitree, Celesteela, Kartana, Guzzlord, Poipole, Naganadel, Stakataka i Blacephalon dzielą ten segregator. Prawie wszystkie druki są starsze niż Scarlet & Violet.",
  },
  "tomokazu-komiya": {
    title: "Lista kart Tomokazu Komiya",
    h1: "Karty Tomokazu Komiya",
    lede: "Angielskie karty Tomokazu Komiya wypełniają ten segregator. Większość to Common, Uncommon albo Rare. Bulk jest złotem i ta lista jest go pełna.",
  },
  "saya-tsuruta": {
    title: "Lista kart Saya Tsuruta",
    h1: "Karty Saya Tsuruta",
    lede: "Angielskie karty Saya Tsuruta wypełniają ten segregator. Większość to Common, Uncommon albo Rare.",
  },
  sowsow: {
    title: "Lista kart sowsow",
    h1: "Karty sowsow",
    lede: "Karty ilustrowane przez sowsow wypełniają ten segregator. Podpis jest drukowany małymi literami, a większość kart to Common, Uncommon albo Rare.",
  },
  "atsuko-nishida": {
    title: "Karty Atsuko Nishida do HeartGold & SoulSilver",
    h1: "Atsuko Nishida, wcześniejsze serie",
    lede: "Atsuko Nishida rysuje angielskie karty od pierwszych setów. Pełna lista jest za długa na jeden segregator, więc ten kończy się na HeartGold & SoulSilver. Od Black & White jest osobny segregator.",
  },
  "atsuko-nishida-later": {
    title: "Karty Atsuko Nishida od Black & White",
    h1: "Atsuko Nishida, późniejsze serie",
    lede: "To reszta listy Atsuko Nishida: od Black & White do Megaewolucji, plus promo McDonald's, które katalog trzyma poza główną serią. Wcześniejsze serie są w drugim segregatorze Nishida.",
  },
};

export const THEME_COPY_BATCH: Record<Locale, Record<string, Bits>> = {
  us,
  uk: us,
  de,
  fr,
  es,
  it,
  nl,
  sv,
  no,
  fi,
  pl,
};
