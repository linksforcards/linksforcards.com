import type { Locale } from "@/lib/locales";

type Bits = { title: string; h1: string; lede: string };

function named(title: string, h1: string, english: string, note = ""): Bits {
  return {
    title,
    h1,
    lede: `De Engelse kaart heet ${english}, of begint met ${english}'s of ${english} &.${note}`,
  };
}

const nl: Record<string, Bits> = {
  "kanto-gym-leaders": { title: "Kanto-gymleiderkaarten", h1: "Kanto-gymleiders en hun Pokémon", lede: "De Engelse naam is Brock, Misty, Lt. Surge, Erika, Koga, Sabrina, Blaine, Giovanni of Janine, of begint met die naam. De meeste kaarten zijn Common, Uncommon of Rare." },
  misty: named("Misty-kaarten", "Misty en haar Pokémon", "Misty", " De meeste kaarten zijn Common, Uncommon of Rare."),
  erika: named("Erika-kaarten", "Erika en haar Pokémon", "Erika", " De meeste kaarten zijn Common, Uncommon of Rare."),
  brock: named("Brock-kaarten", "Brock en zijn Pokémon", "Brock", " De meeste kaarten zijn Common, Uncommon of Rare."),
  sabrina: named("Sabrina-kaarten", "Sabrina en haar Pokémon", "Sabrina", " Deze drukken zijn ouder dan Scarlet & Violet."),
  blaine: named("Blaine-kaarten", "Blaine en zijn Pokémon", "Blaine", " Deze drukken zijn ouder dan Scarlet & Violet."),
  "lt-surge": named("Lt. Surge-kaarten", "Lt. Surge en zijn Pokémon", "Lt. Surge", " In het Nederlands blijft de naam Lt. Surge."),
  giovanni: named("Giovanni-kaarten", "Giovanni en zijn Pokémon", "Giovanni", " De Team Rocket-lijst is de bredere verzameling."),
  "n-pokemon": named("N-kaarten", "N en zijn Pokémon", "N", " De meeste drukken komen uit Scarlet & Violet of Mega-evolutie."),
  cynthia: named("Cynthia-kaarten", "Cynthia en haar Pokémon", "Cynthia", " Dialga, Palkia en Giratina hebben een eigen lijst."),
  hop: named("Hop-kaarten", "Hop en zijn Pokémon", "Hop", " De meeste drukken komen uit Scarlet & Violet of Mega-evolutie."),
  lillie: named("Lillie-kaarten", "Lillie en haar Pokémon", "Lillie"),
  iono: named("Iono-kaarten", "Iono en haar Pokémon", "Iono", " Elke druk komt uit Scarlet & Violet of Mega-evolutie."),
  ethan: named("Ethan-kaarten", "Ethan en zijn Pokémon", "Ethan", " Elke druk komt uit Scarlet & Violet of Mega-evolutie."),
  marnie: named("Marnie-kaarten", "Marnie en haar Pokémon", "Marnie"),
  steven: named("Steven-kaarten", "Steven en zijn Pokémon", "Steven", " De lijst is kort."),
  "team-aqua-magma": { title: "Team Aqua en Team Magma", h1: "Team Aqua en Team Magma", lede: "Team Aqua, Team Magma, Archie of Maxie in de Engelse naam is genoeg voor een vak. De meeste kaarten zijn Common, Uncommon of Rare." },
  "team-plasma": { title: "Team Plasma-kaarten", h1: "Team Plasma", lede: "Een kaart staat hier bij het subtype Team Plasma, of als de Engelse naam Team Plasma, Ghetsis of Colress bevat." },
  "modern-villains": { title: "Team Galactic, Flare, Skull, Yell en Star", h1: "Team Galactic, Flare, Skull, Yell en Star", lede: "Team Galactic, Team Flare, Team Skull, Team Yell, Team Star, Cyrus, Lysandre of Guzma in de Engelse naam zet de kaart hier." },
  stadiums: { title: "Stadionkaarten", h1: "Stadionkaarten", lede: "Elke kaart met het subtype Stadium zit in deze binder. De meeste zijn Common, Uncommon of Rare." },
  "poke-balls": { title: "Poké Ball-kaarten", h1: "Poké Balls", lede: "Een Trainerkaart staat hier als de Engelse naam het woord Ball bevat. De meeste zijn Common, Uncommon of Rare." },
  professors: { title: "Pokémon-professoren", h1: "Pokémon-professoren", lede: "Een Trainerkaart staat hier als de Engelse naam Professor bevat of met Prof. begint." },
  "mcdonalds-promos": { title: "McDonald's-promo's", h1: "McDonald's-promo's", lede: "Elke kaart uit een set waarvan de id met mcd begint, staat hier. De McDonald's-set van 2023 zit niet in deze catalogus." },
  "pop-series": { title: "POP Series-kaarten", h1: "POP Series", lede: "POP Series 1 tot en met 9 zijn deze binder. De zeldzaamheid van deze promo's is Common, Uncommon of Rare." },
  "card-number-one": { title: "Kaart nummer 1 van elke set", h1: "Kaart nummer 1", lede: "De kaart met nummer 1 staat hier als de set er een heeft. Niet elke set drukt een 1." },
  "first-151": { title: "Eerste Engelse drukken van de oorspronkelijke 151", h1: "Eerste drukken van de oorspronkelijke 151", lede: "Elke Kanto-soort heeft één vak: de vroegste Engelse Pokémon-kaart waarvan het dexnummer alleen die soort is." },
  "living-dex-151": { title: "Moderne living dex van de 151", h1: "Moderne living dex: de 151", lede: "Elke Kanto-soort heeft één vak uit Scarlet & Violet of Mega-evolutie: de vroegste kaart met alleen dat dexnummer." },
  "living-dex-paldea": { title: "Living dex van Paldea", h1: "Moderne living dex: Paldea", lede: "Elke soort van Sprigatito tot en met Pecharunt heeft één vak uit Scarlet & Violet of Mega-evolutie." },
  "box-legendaries": { title: "Coverlegendarissen, Scarlet & Violet en Mega-evolutie", h1: "Coverlegendarissen", lede: "Lugia, Ho-Oh, het weertrio, het scheppingstrio, Reshiram, Zekrom, Kyurem, Xerneas, Yveltal, Zygarde, Solgaleo, Lunala, Necrozma, Zacian, Zamazenta, Eternatus, Koraidon en Miraidon staan hier in Scarlet & Violet of Mega-evolutie." },
  "pseudo-legendaries": { title: "Pseudo-legendarissen, Scarlet & Violet en Mega-evolutie", h1: "Pseudo-legendarische lijnen", lede: "Larvitar, Bagon, Beldum, Gible, Deino, Goomy, Jangmo-o, Dreepy, Frigibax en hun evoluties staan hier. Dratini heeft al een binder." },
  "latias-latios": { title: "Alle Latias- en Latios-kaarten", h1: "Latias en Latios", lede: "Latias en Latios delen deze lijst. Een gewone kaart is de uitzondering." },
  "weather-trio": { title: "Alle Groudon-, Kyogre- en Rayquaza-kaarten", h1: "Groudon, Kyogre en Rayquaza", lede: "Groudon, Kyogre en Rayquaza delen deze lijst. Een gewone kaart is de uitzondering. Rayquaza heeft ook een kortere lijst." },
  "creation-trio": { title: "Alle Dialga-, Palkia- en Giratina-kaarten", h1: "Dialga, Palkia en Giratina", lede: "Dialga, Palkia en Giratina delen deze lijst. Een gewone kaart is de uitzondering." },
  "swords-of-justice": { title: "Zwaarden der Gerechtigheid", h1: "Zwaarden der Gerechtigheid", lede: "Cobalion, Terrakion, Virizion en Keldeo delen deze lijst. Een gewone kaart is de uitzondering." },
  tapus: { title: "Tapu-kaarten", h1: "Eilandbeschermers", lede: "Tapu Koko, Tapu Lele, Tapu Bulu en Tapu Fini delen deze lijst. Een gewone kaart is de uitzondering." },
  "lake-guardians": { title: "Meertrio-kaarten", h1: "Meertrio", lede: "Uxie, Mesprit en Azelf delen deze lijst." },
  "dog-pokemon": { title: "Honden-Pokémon, Scarlet & Violet en Mega-evolutie", h1: "Honden-Pokémon", lede: "Growlithe, Snubbull, Houndour, Poochyena, Electrike, Lillipup, Furfrou, Rockruff, Yamper, Zacian, Zamazenta, Fidough, Maschiff, Greavard en hun evoluties staan hier." },
  "cat-pokemon": { title: "Katten-Pokémon, Scarlet & Violet en Mega-evolutie", h1: "Katten-Pokémon", lede: "Meowth, Skitty, Shinx, Glameow, Purrloin, Litleo, Espurr, Litten, Zeraora en hun evoluties staan hier. De Sprigatito-lijn blijft in de Paldea-starterbinder." },
  "bird-pokemon": { title: "Vogel-Pokémon, Scarlet & Violet en Mega-evolutie", h1: "Vogel-Pokémon", lede: "Vliegende soorten met vleugelvorm staan hier als de zeldzaamheid Common, Uncommon of Rare is. Vleermuizen, Ledyba, Gligar, Mantine, Lugia, Ho-Oh en Yveltal blijven erbuiten." },
  "tiny-pokemon": { title: "Kleine Pokémon, Scarlet & Violet en Mega-evolutie", h1: "Kleine Pokémon", lede: "Soorten waarvan de standaardvorm hoogstens 0,2 m is, staan hier. De meeste kaarten zijn Common, Uncommon of Rare." },
  "giant-pokemon": { title: "Reuzen-Pokémon vanaf Sword & Shield", h1: "Reuzen-Pokémon", lede: "Soorten waarvan de standaardvorm minstens 5 m is, staan hier in Sword & Shield, Scarlet & Violet of Mega-evolutie." },
  "nap-time": { title: "Dutje-kaartenlijst", h1: "Dutje", lede: "Een Pokémon staat hier als een aanvalsnaam Nap, Snore, Yawn, Sleep, Sleepy, Doze, Dozing, Slumber of Lullaby als heel woord bevat. Rest en Sing tellen niet. De slug is nap-time, omdat sleep gereserveerd is." },
  "night-pokemon": { title: "Nacht- en maan-Pokémon", h1: "Nacht- en maan-Pokémon", lede: "De Pokédex-tekst heeft night, nocturnal, moon, moonlight of moonlit als heel woord, en de serie is Sword & Shield, Scarlet & Violet of Mega-evolutie. Het gaat om de gedrukte tekst, niet om de tekening." },
  "beach-pokemon": { title: "Strand- en oever-Pokémon", h1: "Strand- en oever-Pokémon", lede: "De Pokédex-tekst heeft beach, shore, shoreline, coast, coastal, sandy, onshore of ashore als heel woord. Het gaat om de gedrukte tekst, niet om de tekening." },
  "flower-pokemon": { title: "Bloemen-Pokémon", h1: "Bloemen-Pokémon", lede: "De Pokédex-tekst heeft flower, blossom, petal, bloom, pollen of nectar als heel woord. Het gaat om de gedrukte tekst, niet om de tekening." },
  "berry-lovers": { title: "Bes- en fruit-Pokémon", h1: "Bessen en fruit", lede: "De Pokédex-tekst heeft berry, berries, fruit, apple of honey als heel woord. De snoepbinder is een andere lijst en volgt dexnummers." },
  vmax: { title: "VMAX-kaarten", h1: "VMAX-kaarten", lede: "Elke kaart met het subtype VMAX staat hier. Een gewone kaart zit er niet bij. Bijna alle drukken komen uit Sword & Shield." },
  "rapid-strike": { title: "Rapid Strike-kaarten", h1: "Rapid Strike", lede: "Elke kaart met het subtype Rapid Strike staat hier. De drukken komen uit Sword & Shield." },
  "single-strike": { title: "Single Strike-kaarten", h1: "Single Strike", lede: "Elke kaart met het subtype Single Strike staat hier. De drukken komen uit Sword & Shield." },
  "level-x": { title: "Pokémon LV.X-kaarten", h1: "Pokémon LV.X", lede: "Elke kaart met het subtype Level-Up staat hier. Een gewone kaart zit er niet bij." },
  "prism-star": { title: "Prism Star- en Star-kaarten", h1: "Prism Star en Star", lede: "Een kaart staat hier als het subtype Prism Star of Star is. Een gewone kaart is de uitzondering." },
  break: { title: "BREAK-kaarten", h1: "BREAK-evolutie", lede: "Elke kaart met het subtype BREAK staat hier. Een gewone kaart zit er niet bij." },
  "pokemon-legend": { title: "Pokémon LEGEND-kaarten", h1: "Pokémon LEGEND", lede: "Elke kaart met het subtype LEGEND staat hier. De helften horen bij elkaar, en een gewone kaart zit er niet bij." },
  meowth: { title: "Alle Meowth-kaarten", h1: "Meowth, Persian en Perrserker", lede: "Meowth, Persian en Perrserker delen deze binder, regionale vormen inbegrepen als ze die dexnummers gebruiken." },
  "magnemite-line": { title: "Alle Magnemite-kaarten", h1: "Magnemite, Magneton en Magnezone", lede: "Magnemite, Magneton en Magnezone delen deze binder." },
  "vulpix-line": { title: "Alle Vulpix- en Ninetales-kaarten", h1: "Vulpix en Ninetales", lede: "Vulpix en Ninetales delen deze binder, Alola-vormen inbegrepen." },
  "slowpoke-line": { title: "Alle Slowpoke-kaarten", h1: "Slowpoke, Slowbro en Slowking", lede: "Slowpoke, Slowbro en Slowking delen deze binder, Galar-vormen inbegrepen." },
  "clefairy-line": { title: "Alle Clefairy-kaarten", h1: "Cleffa, Clefairy en Clefable", lede: "Cleffa, Clefairy en Clefable delen deze binder. Cleffa staat ook op de baby-Pokémon-lijst." },
  "dedenne-morpeko": { title: "Alle Dedenne- en Morpeko-kaarten", h1: "Dedenne en Morpeko", lede: "Dedenne en Morpeko delen deze lijst. Beide staan ook in de binder van Pikachu's vrienden." },
  rayquaza: { title: "Alle Rayquaza-kaarten", h1: "Alle Rayquaza-kaarten", lede: "Rayquaza heeft deze lijst alleen. De weertrio-binder houdt ook Groudon en Kyogre. Een gewone kaart is de uitzondering." },
  "togepi-line": { title: "Alle Togepi-kaarten", h1: "Togepi, Togetic en Togekiss", lede: "Togepi, Togetic en Togekiss delen deze binder. Togepi staat ook op de baby-Pokémon-lijst." },
  lapras: { title: "Alle Lapras-kaarten", h1: "Alle Lapras-kaarten", lede: "Elke Engelse Lapras-druk uit de open lijst staat hier, in de volgorde van de sets." },
  rotom: { title: "Alle Rotom-kaarten", h1: "Alle Rotom-kaarten", lede: "Elke Engelse Rotom-druk uit de open lijst staat hier. De meeste kaarten zijn Common, Uncommon of Rare." },
  lugia: { title: "Alle Lugia-kaarten", h1: "Alle Lugia-kaarten", lede: "Elke Engelse Lugia-druk uit de open lijst staat hier. Een gewone kaart is de uitzondering." },
};

function mirror(bits: Record<string, Bits>, rewrite: (text: string) => string): Record<string, Bits> {
  const out: Record<string, Bits> = {};
  for (const [slug, item] of Object.entries(bits)) {
    out[slug] = { title: rewrite(item.title), h1: rewrite(item.h1), lede: rewrite(item.lede) };
  }
  return out;
}

const sv = mirror(nl, (text) =>
  text
    .replaceAll(" en hun evoluties", " och deras utvecklingar")
    .replaceAll(" en haar ", " och hennes ")
    .replaceAll(" en zijn ", " och hans ")
    .replaceAll(" of ", " eller ")
    .replaceAll("De Engelse kaart heet", "Det engelska kortet heter")
    .replaceAll("of begint met", "eller börjar med")
    .replaceAll("De Engelse naam is", "Det engelska namnet är")
    .replaceAll("of begint met die naam", "eller börjar med det namnet")
    .replaceAll("De meeste kaarten zijn", "De flesta korten är")
    .replaceAll("De meeste drukken komen uit", "De flesta trycken kommer från")
    .replaceAll("Elke druk komt uit", "Varje tryck kommer från")
    .replaceAll("Elke kaart", "Varje kort")
    .replaceAll("Een kaart staat hier", "Ett kort finns här")
    .replaceAll("Een Pokémon staat hier als een aanvalsnaam", "En Pokémon finns här när ett attacknamn")
    .replaceAll("Deze drukken zijn ouder dan", "De här trycken är äldre än")
    .replaceAll("De lijst is kort.", "Listan är kort.")
    .replaceAll("hebben een eigen lijst.", "har en egen lista.")
    .replaceAll("De Team Rocket-lijst is de bredere verzameling.", "Team Rocket-listan är den bredare samlingen.")
    .replaceAll("In het Nederlands blijft de naam Lt. Surge.", "På svenska står namnet kvar som Lt. Surge.")
    .replaceAll("binder", "pärm")
    .replaceAll("staan hier", "finns här")
    .replaceAll("delen deze", "delar den här")
    .replaceAll("Een gewone kaart is de uitzondering.", "Ett vanligt kort är undantaget.")
    .replaceAll("Een gewone kaart zit er niet bij.", "Ett vanligt kort finns inte med.")
    .replaceAll("Mega-evolutie", "Mega-utveckling")
    .replaceAll("Kanto-gymleiders en hun Pokémon", "Kanto-gymledare och deras Pokémon")
    .replaceAll("Kanto-gymleiderkaarten", "Kanto-gymledarkort")
    .replaceAll("kaarten", "kort")
    .replaceAll("De Pokédex-tekst heeft", "Pokédex-texten har")
    .replaceAll("als heel woord", "som helt ord")
    .replaceAll("Het gaat om de gedrukte tekst, niet om de tekening.", "Det är den tryckta texten, inte bilden.")
    .replaceAll("De snoepbinder is een andere lijst en volgt dexnummers.", "Godispärmen är en annan lista och följer dexnummer.")
    .replaceAll("De slug is nap-time, omdat sleep gereserveerd is.", "Slugen är nap-time, eftersom sleep är reserverat.")
    .replaceAll("Rest en Sing tellen niet.", "Rest och Sing räknas inte.")
    .replaceAll("Bijna alle drukken komen uit Sword & Shield.", "Nästan alla tryck kommer från Sword & Shield.")
    .replaceAll("De drukken komen uit Sword & Shield.", "Trycken kommer från Sword & Shield.")
    .replaceAll("elke set er een heeft", "setet har ett")
    .replaceAll("Niet elke set drukt een 1.", "Inte varje set trycker en 1.")
    .replaceAll("zit niet in deze catalogus.", "finns inte i den här katalogen.")
    .replaceAll("zit in deze pärm", "finns i den här pärmen")
    .replaceAll("en hun evoluties", "och deras utvecklingar")
    .replaceAll("blijven erbuiten", "står utanför")
    .replaceAll("staat ook op de baby-Pokémon-lijst.", "finns också i baby-Pokémon-listan.")
    .replaceAll("heeft deze lijst alleen.", "har den här listan ensam.")
    .replaceAll("houdt ook", "håller också")
    .replaceAll("Elke Engelse", "Varje engelsk")
    .replaceAll("uit de open lijst staat hier, in de volgorde van de sets.", "från den öppna listan finns här, i setens ordning.")
    .replaceAll("begint met die naam", "börjar med det namnet")
    .replaceAll("begint met", "börjar med")
);

const no = mirror(nl, (text) =>
  text
    .replaceAll(" en hun evoluties", " og utviklingene deres")
    .replaceAll(" en haar ", " og hennes ")
    .replaceAll(" en zijn ", " og hans ")
    .replaceAll(" of ", " eller ")
    .replaceAll("De Engelse kaart heet", "Det engelske kortet heter")
    .replaceAll("of begint met", "eller begynner med")
    .replaceAll("De Engelse naam is", "Det engelske navnet er")
    .replaceAll("De meeste kaarten zijn", "De fleste kortene er")
    .replaceAll("De meeste drukken komen uit", "De fleste trykkene kommer fra")
    .replaceAll("Elke druk komt uit", "Hvert trykk kommer fra")
    .replaceAll("Elke kaart", "Hvert kort")
    .replaceAll("Een kaart staat hier", "Et kort er her")
    .replaceAll("Een Pokémon staat hier als een aanvalsnaam", "En Pokémon er her når et angrepsnavn")
    .replaceAll("Deze drukken zijn ouder dan", "Disse trykkene er eldre enn")
    .replaceAll("De lijst is kort.", "Listen er kort.")
    .replaceAll("hebben een eigen lijst.", "har en egen liste.")
    .replaceAll("De Team Rocket-lijst is de bredere verzameling.", "Team Rocket-listen er den bredere samlingen.")
    .replaceAll("In het Nederlands blijft de naam Lt. Surge.", "På norsk blir navnet stående som Lt. Surge.")
    .replaceAll("binder", "perm")
    .replaceAll("staan hier", "er her")
    .replaceAll("delen deze", "deler denne")
    .replaceAll("Een gewone kaart is de uitzondering.", "Et vanlig kort er unntaket.")
    .replaceAll("Een gewone kaart zit er niet bij.", "Et vanlig kort er ikke med.")
    .replaceAll("Mega-evolutie", "Megaevolusjon")
    .replaceAll("kaarten", "kort")
    .replaceAll("De Pokédex-tekst heeft", "Pokédex-teksten har")
    .replaceAll("als heel woord", "som helt ord")
    .replaceAll("Het gaat om de gedrukte tekst, niet om de tekening.", "Det er den trykte teksten, ikke tegningen.")
    .replaceAll("De snoeppärm is een andere lijst en volgt dexnummers.", "Godteripermen er en annen liste og følger dex-numre.")
    .replaceAll("De slug is nap-time, omdat sleep gereserveerd is.", "Slugen er nap-time, fordi sleep er reservert.")
    .replaceAll("Rest en Sing tellen niet.", "Rest og Sing teller ikke.")
    .replaceAll("Bijna alle drukken komen uit Sword & Shield.", "Nesten alle trykkene kommer fra Sword & Shield.")
    .replaceAll("Kanto-gymleiders en hun Pokémon", "Kanto-gymledere og Pokémonene deres")
    .replaceAll("begint met", "begynner med")
);

const fi = mirror(nl, (text) =>
  text
    .replaceAll(" en hun evoluties", " ja niiden kehityslinjat")
    .replaceAll(" en haar ", " ja hänen ")
    .replaceAll(" en zijn ", " ja hänen ")
    .replaceAll(" of ", " tai ")
    .replaceAll("Kanto-gymleiders en hun Pokémon", "Kanton salijohtajat ja heidän Pokémoninsa")
    .replaceAll("Kanto-gymleiderkaarten", "Kanton salijohtajien kortit")
    .replaceAll("De Engelse kaart heet", "Englanninkielinen kortti on nimeltään")
    .replaceAll("of begint met", "tai alkaa sanoilla")
    .replaceAll("De meeste kaarten zijn", "Useimmat kortit ovat")
    .replaceAll("De meeste drukken komen uit", "Useimmat painokset ovat sarjasta")
    .replaceAll("Elke druk komt uit", "Jokainen painos on sarjasta")
    .replaceAll("Elke kaart", "Jokainen kortti")
    .replaceAll("Een Pokémon staat hier als een aanvalsnaam", "Pokémon on tässä, kun hyökkäyksen nimessä on")
    .replaceAll("Deze drukken zijn ouder dan", "Nämä painokset ovat vanhempia kuin")
    .replaceAll("De lijst is kort.", "Lista on lyhyt.")
    .replaceAll("Mega-evolutie", "Megaevoluutio")
    .replaceAll("kaarten", "kortit")
    .replaceAll("binder", "kansio")
    .replaceAll("De Pokédex-tekst heeft", "Pokédex-tekstissä on")
    .replaceAll("als heel woord", "kokonaisena sanana")
    .replaceAll("Het gaat om de gedrukte tekst, niet om de tekening.", "Ratkaisee painettu teksti, ei kuva.")
    .replaceAll("De slug is nap-time, omdat sleep gereserveerd is.", "Tunnus on nap-time, koska sleep on varattu.")
    .replaceAll("Rest en Sing tellen niet.", "Rest ja Sing eivät kelpaa.")
    .replaceAll("Een gewone kaart is de uitzondering.", "Tavallinen kortti on poikkeus.")
    .replaceAll("Een gewone kaart zit er niet bij.", "Tavallinen kortti ei ole mukana.")
    .replaceAll("begint met", "alkaa sanoilla")
);

const pl = mirror(nl, (text) =>
  text
    .replaceAll(" en hun evoluties", " i ich ewolucje")
    .replaceAll(" en haar ", " i jej ")
    .replaceAll(" en zijn ", " i jego ")
    .replaceAll(" of ", " albo ")
    .replaceAll("Kanto-gymleiders en hun Pokémon", "Liderzy sal Kanto i ich Pokémony")
    .replaceAll("Kanto-gymleiderkaarten", "Karty liderów sal Kanto")
    .replaceAll("De Engelse kaart heet", "Angielska karta nazywa się")
    .replaceAll("of begint met", "albo zaczyna się od")
    .replaceAll("De meeste kaarten zijn", "Większość kart to")
    .replaceAll("De meeste drukken komen uit", "Większość druków pochodzi z")
    .replaceAll("Elke druk komt uit", "Każdy druk pochodzi z")
    .replaceAll("Elke kaart", "Każda karta")
    .replaceAll("Een Pokémon staat hier als een aanvalsnaam", "Pokémon jest tutaj, gdy nazwa ataku zawiera")
    .replaceAll("Deze drukken zijn ouder dan", "Te druki są starsze niż")
    .replaceAll("De lijst is kort.", "Lista jest krótka.")
    .replaceAll("Mega-evolutie", "Megaewolucja")
    .replaceAll("kaarten", "karty")
    .replaceAll("binder", "segregator")
    .replaceAll("De Pokédex-tekst heeft", "Tekst Pokédexa ma")
    .replaceAll("als heel woord", "jako całe słowo")
    .replaceAll("Het gaat om de gedrukte tekst, niet om de tekening.", "Liczy się drukowany tekst, nie rysunek.")
    .replaceAll("De slug is nap-time, omdat sleep gereserveerd is.", "Skrót to nap-time, bo sleep jest zarezerwowane.")
    .replaceAll("Rest en Sing tellen niet.", "Rest i Sing nie wchodzą.")
    .replaceAll("Een gewone kaart is de uitzondering.", "Zwykła karta jest wyjątkiem.")
    .replaceAll("Een gewone kaart zit er niet bij.", "Zwykłej karty tu nie ma.")
    .replaceAll("In het Nederlands blijft de naam Lt. Surge.", "Po polsku imię zostaje Lt. Surge.")
    .replaceAll("begint met", "zaczyna się od")
);

export const ROUND2_FILL: Record<Locale, Record<string, Bits>> = {
  us: {},
  uk: {},
  de: {},
  fr: {},
  es: {},
  it: {},
  nl,
  sv,
  no,
  fi,
  pl,
};
