import type { Locale } from "@/lib/locales";
import type { DeltaReignCopy } from "./types";
import { germanDeltaReign } from "./de";
import { englishDeltaReign } from "./en";
import { spanishDeltaReign } from "./es";
import { finnishDeltaReign } from "./fi";
import { frenchDeltaReign } from "./fr";
import { italianDeltaReign } from "./it";
import { dutchDeltaReign } from "./nl";
import { norwegianDeltaReign } from "./no";
import { polishDeltaReign } from "./pl";
import { swedishDeltaReign } from "./sv";

export function deltaReignCopy(locale: Locale): DeltaReignCopy {
  if (locale === "us") return englishDeltaReign("us");
  if (locale === "uk") return englishDeltaReign("uk");
  if (locale === "de") return germanDeltaReign;
  if (locale === "fr") return frenchDeltaReign;
  if (locale === "es") return spanishDeltaReign;
  if (locale === "it") return italianDeltaReign;
  if (locale === "nl") return dutchDeltaReign;
  if (locale === "sv") return swedishDeltaReign;
  if (locale === "no") return norwegianDeltaReign;
  if (locale === "fi") return finnishDeltaReign;
  return polishDeltaReign;
}
