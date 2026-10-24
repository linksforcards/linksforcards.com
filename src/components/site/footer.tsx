import { getMessages } from "@/lib/i18n";
import { type Locale } from "@/lib/locales";
import { localePath } from "@/lib/routing";
import { site } from "@/lib/site";

export function SiteFooter({ locale }: { locale: Locale }) {
  const m = getMessages(locale);
  return (
    <footer className="footer">
      <div className="wrap">
        <p className="disclaimer">{m.footer.disclaimer}</p>
        <p>{m.footer.data}</p>
        <p className="sources">
          <a href="https://github.com/PokemonTCG/pokemon-tcg-data">PokemonTCG/pokemon-tcg-data</a>
          <span aria-hidden="true"> · </span>
          <a href="https://github.com/PokeAPI/pokeapi">PokeAPI/pokeapi</a>
        </p>
        <p className="foot-links">
          <a href={localePath(locale, "/privacy")}>{m.nav.privacy}</a>
          <a href={localePath(locale, "/imprint")}>{m.nav.imprint}</a>
          <a href={`mailto:${site.email}`}>{site.email}</a>
        </p>
        <p>{site.sender}</p>
      </div>
    </footer>
  );
}
