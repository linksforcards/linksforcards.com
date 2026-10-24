import de from "../../messages/de.json";
import en from "../../messages/en.json";
import es from "../../messages/es.json";
import fi from "../../messages/fi.json";
import fr from "../../messages/fr.json";
import it from "../../messages/it.json";
import nl from "../../messages/nl.json";
import no from "../../messages/no.json";
import pl from "../../messages/pl.json";
import sv from "../../messages/sv.json";
import { isLocale, type Locale } from "./locales";
import { notFound } from "next/navigation";

export type Messages = typeof en;

function asMessages(value: Messages): Messages {
  return value;
}

const dictionaries: Record<Locale, Messages> = {
  en,
  de: asMessages(de),
  fr: asMessages(fr),
  it: asMessages(it),
  es: asMessages(es),
  nl: asMessages(nl),
  sv: asMessages(sv),
  no: asMessages(no),
  fi: asMessages(fi),
  pl: asMessages(pl),
};

export function getMessages(locale: Locale): Messages {
  return dictionaries[locale];
}

export async function readLocale(params: Promise<{ locale: string }>): Promise<{ locale: Locale; m: Messages }> {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return { locale, m: getMessages(locale) };
}
