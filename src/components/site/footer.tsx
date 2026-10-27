import { getMessages } from "@/lib/i18n";
import { type Locale } from "@/lib/locales";
import { localePath } from "@/lib/routing";
import { site } from "@/lib/site";

export function SiteFooter({ locale }: { locale: Locale }) {
  const m = getMessages(locale);
  return (
    <footer className="footer">
      <div className="wrap">
        <svg className="doodle doodle-star" viewBox="0 0 64 64" aria-hidden="true" focusable="false">
          <path
            d="M32 5l6.4 16.8 17.6.8-13.6 11.6 4.6 17.2L32 42.4 17 51.4l4.6-17.2L8 22.6l17.6-.8z"
            fill="#ffe08a"
            stroke="#1b2430"
            strokeWidth="3.5"
            strokeLinejoin="round"
          />
        </svg>
        <p className="disclaimer">{m.footer.disclaimer}</p>
        <p>{m.footer.data}</p>
        <p className="sources">
          <a href="https://github.com/PokemonTCG/pokemon-tcg-data">PokemonTCG/pokemon-tcg-data</a>
          <span aria-hidden="true"> · </span>
          <a href="https://github.com/PokeAPI/pokeapi">PokeAPI/pokeapi</a>
          <span aria-hidden="true"> · </span>
          <a href="https://tcgdex.dev">TCGdex</a>
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
