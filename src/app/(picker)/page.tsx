import { BinderMark } from "@/components/site/doodles";
import { JsonLd } from "@/components/site/json-ld";
import { getMessages } from "@/lib/i18n";
import { breadcrumbNode, ldGraph, pageNode } from "@/lib/jsonld";
import { htmlLang, LOCALES, primaryHreflang } from "@/lib/locales";
import { localePath } from "@/lib/routing";
import { site } from "@/lib/site";

export const revalidate = 60;

export default function PickerPage() {
  const disclaimer = getMessages("uk").footer.disclaimer;
  const crumbs = [{ name: "Choose a language", href: "/" }];
  const graph = ldGraph([
    pageNode({
      kind: "WebPage",
      locale: "en",
      path: "/",
      name: "LinksForCards",
      description: "Choose a language. I'm Magnus Schmidt, and this is the public record of the binders I collect and give away.",
    }),
    breadcrumbNode(crumbs),
  ]);

  return (
    <>
      <JsonLd graph={graph} />
      <header className="top">
        <div className="wrap top-bar">
          <a className="brand" href="/">
            <BinderMark className="brand-mark" />
            <span>
              <span className="brand-name">LinksForCards</span>
              <span className="brand-by">{site.sender}</span>
            </span>
          </a>
        </div>
      </header>
      <main id="content" className="wrap">
        <section className="hero">
          <h1>Choose a language</h1>
          <p className="lede">
            I'm Magnus Schmidt. This is the public record of the binders I collect and give away. Pick the language you
            want to read.
          </p>
        </section>
        <ul className="picker-list">
          {LOCALES.map((locale) => (
            <li key={locale}>
              <a href={localePath(locale, "/")} hrefLang={primaryHreflang(locale)} lang={htmlLang(locale)}>
                {getMessages(locale).langName}
              </a>
            </li>
          ))}
        </ul>
      </main>
      <footer className="footer">
        <div className="wrap">
          <p className="disclaimer">{disclaimer}</p>
          <p>{site.sender}</p>
        </div>
      </footer>
    </>
  );
}
