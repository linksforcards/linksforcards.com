import type {
  AboutPage,
  Article,
  Blog,
  BlogPosting,
  BreadcrumbList,
  CollectionPage,
  ContactPage,
  FAQPage,
  Graph,
  ImageObject,
  ItemList,
  Organization,
  Person,
  Thing,
  WebPage,
  WebSite,
} from "schema-dts";
import type { Locale } from "./locales";
import { htmlLang } from "./locales";
import { localePath } from "./routing";
import { absoluteUrl, site } from "./site";

export type Crumb = { name: string; href: string };
export type ListEntry = { name: string; url?: string };
export type FaqPair = { q: string; a: string };
export type NoteEntry = { id: string; title: string; body: string; publishedAt: string };

export type PageKind = "AboutPage" | "WebPage" | "CollectionPage" | "ContactPage" | "Blog" | "Article";

const ORG = absoluteUrl("/#organization");
const PERSON = absoluteUrl("/#magnus");
const WEBSITE = absoluteUrl("/#website");

function logo(): ImageObject {
  return {
    "@type": "ImageObject",
    "@id": absoluteUrl("/#logo"),
    url: absoluteUrl("/icon.svg"),
    contentUrl: absoluteUrl("/icon.svg"),
    width: "32",
    height: "32",
    caption: site.name,
  };
}

export function organizationNode(): Organization {
  return {
    "@type": "Organization",
    "@id": ORG,
    name: site.name,
    url: absoluteUrl("/"),
    logo: logo(),
    founder: { "@id": PERSON },
    sameAs: [site.substackUrl],
  };
}

export function personNode(): Person {
  return {
    "@type": "Person",
    "@id": PERSON,
    name: site.sender,
    email: `mailto:${site.email}`,
    url: absoluteUrl("/"),
  };
}

export function websiteNode(): WebSite {
  return {
    "@type": "WebSite",
    "@id": WEBSITE,
    name: site.name,
    url: absoluteUrl("/"),
    inLanguage: ["en-US", "en-GB", "de", "fr", "it", "es", "nl", "sv", "nb", "fi", "pl"],
    publisher: { "@id": ORG },
  };
}

export function breadcrumbNode(crumbs: Crumb[]): BreadcrumbList {
  const page = crumbs.at(-1)?.href ?? "/";
  return {
    "@type": "BreadcrumbList",
    "@id": `${absoluteUrl(page)}#breadcrumb`,
    itemListElement: crumbs.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.name,
      item: absoluteUrl(crumb.href),
    })),
  };
}

export function pageNode(options: {
  kind: PageKind;
  locale: Locale | "en";
  path: string;
  name: string;
  description: string;
  datePublished?: string;
  dateModified?: string;
}): AboutPage | WebPage | CollectionPage | ContactPage | Blog | Article {
  const url = options.locale === "en" ? absoluteUrl(options.path) : absoluteUrl(localePath(options.locale, options.path));
  const page = {
    "@type": options.kind,
    "@id": `${url}#webpage`,
    url,
    name: options.name,
    description: options.description,
    inLanguage: options.locale === "en" ? "en" : htmlLang(options.locale),
    isPartOf: { "@id": WEBSITE },
    publisher: { "@id": ORG },
    breadcrumb: { "@id": `${url}#breadcrumb` },
    image: {
      "@type": "ImageObject" as const,
      url: absoluteUrl(options.locale === "en" ? "/og/uk" : `/og/${options.locale}`),
      width: "1200",
      height: "630",
    },
  };
  if (options.kind !== "Article") return page;
  return Object.assign(page, {
    "@id": `${url}#article`,
    headline: options.name,
    datePublished: options.datePublished,
    dateModified: options.dateModified ?? options.datePublished,
    author: { "@id": PERSON },
    mainEntityOfPage: { "@id": `${url}#article` },
  });
}

export function faqNode(pageHref: string, pairs: FaqPair[]): FAQPage {
  const url = absoluteUrl(pageHref);
  return {
    "@type": "FAQPage",
    "@id": `${url}#faq`,
    url,
    mainEntity: pairs.map((pair) => ({
      "@type": "Question",
      name: pair.q,
      acceptedAnswer: { "@type": "Answer", text: pair.a },
    })),
  };
}

export function itemListNode(pageHref: string, name: string, items: ListEntry[]): ItemList {
  const url = absoluteUrl(pageHref);
  return {
    "@type": "ItemList",
    "@id": `${url}#list`,
    name,
    numberOfItems: items.length,
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      ...(item.url ? { url: item.url } : {}),
    })),
  };
}

export function blogPostNodes(pageHref: string, locale: Locale, notes: NoteEntry[]): BlogPosting[] {
  const page = absoluteUrl(pageHref);
  return notes.map((note) => ({
    "@type": "BlogPosting",
    "@id": `${page}#update-${note.id}`,
    headline: note.title,
    articleBody: note.body,
    datePublished: note.publishedAt,
    dateModified: note.publishedAt,
    inLanguage: htmlLang(locale),
    author: { "@id": PERSON },
    publisher: { "@id": ORG },
    mainEntityOfPage: { "@id": `${page}#webpage` },
    url: `${page}#update-${note.id}`,
  }));
}

export function ldGraph(nodes: Thing[]): Graph {
  return { "@context": "https://schema.org", "@graph": [organizationNode(), personNode(), websiteNode(), ...nodes] };
}

export function serializeLd(graph: Graph): string {
  return JSON.stringify(graph).replace(/</g, "\\u003c");
}
