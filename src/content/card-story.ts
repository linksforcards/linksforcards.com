import type { Locale } from "@/lib/locales";
import { germanFaq, germanStory } from "./card-story-de";
import { englishFaq, englishStory } from "./card-story-en";
import { spanishFaq, spanishStory } from "./card-story-es";
import { finnishFaq, finnishStory } from "./card-story-fi";
import { frenchFaq, frenchStory } from "./card-story-fr";
import { italianFaq, italianStory } from "./card-story-it";
import { dutchFaq, dutchStory } from "./card-story-nl";
import { norwegianFaq, norwegianStory } from "./card-story-no";
import { polishFaq, polishStory } from "./card-story-pl";
import { swedishFaq, swedishStory } from "./card-story-sv";
import type { CardFaq, CardStory } from "./card-story-types";

export function renderCardStory(locale: Locale, story: CardStory): { paragraphs: string[]; faqs: CardFaq[] } {
  if (locale === "de") return { paragraphs: germanStory(story), faqs: germanFaq(story) };
  if (locale === "fr") return { paragraphs: frenchStory(story), faqs: frenchFaq(story) };
  if (locale === "es") return { paragraphs: spanishStory(story), faqs: spanishFaq(story) };
  if (locale === "it") return { paragraphs: italianStory(story), faqs: italianFaq(story) };
  if (locale === "nl") return { paragraphs: dutchStory(story), faqs: dutchFaq(story) };
  if (locale === "sv") return { paragraphs: swedishStory(story), faqs: swedishFaq(story) };
  if (locale === "no") return { paragraphs: norwegianStory(story), faqs: norwegianFaq(story) };
  if (locale === "fi") return { paragraphs: finnishStory(story), faqs: finnishFaq(story) };
  if (locale === "pl") return { paragraphs: polishStory(story), faqs: polishFaq(story) };
  return { paragraphs: englishStory(story), faqs: englishFaq(story) };
}
