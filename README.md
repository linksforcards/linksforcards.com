# LinksForCards

I collect Pokémon cards from shops in Europe and the United States, complete set binders and generation binders, and give the full binders to children. This repository is the public record: [linksforcards.com](https://linksforcards.com).

The counts start at zero. They move when a shipment is logged in the private admin. Card prices are estimates for that admin only. They are not in this repository and not on the public pages.

LinksForCards is an unofficial fan project by Magnus Schmidt. It is not affiliated with or endorsed by Nintendo, Creatures, Game Freak, or The Pokémon Company. The site uses the plain name in text. It does not ship official logos, artwork, or card scans.

## Local development

Node 20 or newer. From this directory:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). With no `DATABASE_URL`, development uses an embedded Postgres in `.data/pglite` (gitignored). Create `.env.local` from `.env.example` and set:

- `ADMIN_EMAIL` — the one address that can sign in. Use `magnus@linksforcards.com`.
- `ADMIN_PASSWORD_HASH` — from `npm run hash-password` (the password is read from the prompt or stdin, never from a command argument). In the Vercel dashboard, paste the hash exactly as printed. In a local `.env` file, write each `$` as `\$`. Next expands `$` while loading env files, and a bcrypt hash is full of them. Single quotes do not stop that.
- `SESSION_SECRET` — at least 16 random characters, for example `openssl rand -base64 32`.

Then open `/admin`. On the overview, **Load local demo** inserts clearly marked sample shipments. Those rows stay out of the public pages. Do not point `NEXT_PUBLIC_SITE_URL` at localhost before `npm run build`; that value is baked into canonical links.

```bash
npm test
npm run build
npm start
```

## Environment

| Variable | Where | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | Server | Pooled Postgres URL (Neon or Vercel Postgres). `POSTGRES_URL` is used when `DATABASE_URL` is empty. |
| `ADMIN_EMAIL` | Server | Sign-in email. |
| `ADMIN_PASSWORD_HASH` | Server | bcrypt hash, cost 12. |
| `SESSION_SECRET` | Server | Signs the session token. At least 16 characters. |
| `NEXT_PUBLIC_SITE_URL` | Build | `https://linksforcards.com`, no trailing slash. |
| `NEXT_PUBLIC_SUBSTACK_URL` | Build | Public notes link. Default `https://linksforcards.substack.com`. |
| `POKEMON_TCG_API_KEY` | Server | Optional. Sent as `X-Api-Key` when the admin refreshes price estimates. |
| `DATABASE_SSL` | Server | Set to `disable` only for a local Postgres without TLS. |
| `LOCAL_DB` | Server | Set to `1` only to force the embedded database outside `next dev`. Never set this on Vercel. |

Copy `.env.example`. Real values live on the host, in `.env.local`, or in the Vercel project. Never commit them.

## Database

Any Postgres that Vercel can reach is enough. [Neon](https://neon.tech) and Vercel Postgres both have a free tier.

1. Create a database and copy the **pooled** connection string into `DATABASE_URL`.
2. Deploy. The app creates its tables on first use (`CREATE TABLE IF NOT EXISTS`) and adds missing columns with `ADD COLUMN IF NOT EXISTS`. There is no separate migration step. The Country Cup reads the shop's country and the card copies already on a shipment, and `shipments.binders_included` (default 0) for binders that arrived in the parcel.
3. Shipments, sessions, and cached price estimates live only in that database.

The public catalog (set names, collector numbers, rarity, subtypes, HP, types, illustrator, national Pokédex numbers) is the JSON in `data/catalog`. It is built from [PokemonTCG/pokemon-tcg-data](https://github.com/PokemonTCG/pokemon-tcg-data) at a pinned commit, with prices and images removed. Species names for English, German, French, Spanish, and Italian come from [PokeAPI](https://github.com/PokeAPI/pokeapi). The other languages show the English species names and say so. Refresh the files with `npm run catalog` when you want a newer snapshot, then commit the result. That command must not be pointed at a file that still contains prices. It also rebuilds `data/catalog/themes.json`. `npm run themes` rebuilds only the themed binders from the commit already pinned in `data/catalog/meta.json`. A theme that cannot be derived from the dataset can be added later as `data/themes/curated/{slug}.json` with `{ "slug", "cards": ["setId:number"] }`.

## Deploy on Vercel

1. Create a [Vercel](https://vercel.com) account and import this GitHub repository. Framework preset: Next.js. Do not override the build command.
2. Add the environment variables from the table above. `NEXT_PUBLIC_*` values are fixed at build time, so set them before the first production build.
3. Deploy. After it is green, add the domain `linksforcards.com` in the project (Settings → Domains), and `www.linksforcards.com` as a redirect to the apex.
4. Vercel shows the DNS records for the domain. Use those exact values at One.com. The apex `A` record is often `76.76.21.21`, and the `www` record is often a CNAME to a project-specific host (older projects used `cname.vercel-dns.com`). The domain card is the source of truth if Vercel shows something else.

## DNS at One.com

Email for `linksforcards.com` is already on Google Workspace. **Do not change the nameservers.** Changing them to Vercel’s nameservers would drop the existing mail records. **Do not add a CNAME on the apex** (`@`); that replaces every other record on the name, including MX. **Do not add an AAAA record** for the website. Leave every MX record, and every SPF, DKIM, and DMARC TXT record, exactly as it is.

Add or replace only the website records:

| Host | Type | Value |
| --- | --- | --- |
| `@` | A | The IPv4 address shown on the Vercel domain card (commonly `76.76.21.21`). Replace the old website `A` record. Do not add a second one. |
| `www` | CNAME | The host shown on the Vercel domain card. |

In Vercel, set `linksforcards.com` as the primary domain so `www` redirects to it. Vercel also provisions HTTPS once the records propagate. Their own notes on this are [Working with DNS](https://vercel.com/docs/domains/working-with-dns) and [Working with nameservers](https://vercel.com/docs/domains/working-with-nameservers).

## What never goes in this repository

Passwords, password hashes, `SESSION_SECRET`, database URLs, API keys, partner agreements, and card values. The public JSON has collector numbers, English names, supertypes, subtypes, HP, types, rarity, illustrator, and national dex numbers. Prices and images are not stored. Demo shops exist only when you press the local demo button, and the public queries exclude them.

The imprint page lists the postal address: Magnus Schmidt, Kongensgade 13B, 1., 5000 Odense C, Denmark. That page is contact information, not legal advice.

## Price estimates

The committed dataset no longer includes Cardmarket or TCGplayer prices. The admin overview asks `api.pokemontcg.io` for the sets you have logged, stores the estimate in cents, and shows when it was fetched. The estimate is the lowest positive TCGplayer market price across printings, and a Cardmarket trend (the lower of the trend and the reverse-holo trend, otherwise the 7-day average, otherwise the average sell price). Zero and implausible figures are ignored. A refresh waits if the previous one was a few seconds ago. If the API is down, the cards stay in the log and the missing prices stay blank.

## Languages

`/` is US English. It is `en-US`, plain `en`, and `x-default` on every page, including inner pages. UK English stays at `/uk` (`en-GB` and `en-IE`). The other languages stay at `/de`, `/fr`, `/it`, `/es`, `/nl`, `/sv`, `/no`, `/fi`, and `/pl`. There is no IP redirect and no language-picker page. `/us` and `/us/...` redirect once to the same path without the prefix. `/en` and `/en/...` redirect once to that US path too. `/binders` redirects once to `/collections`, and `/{locale}/binders` redirects once to that locale's collections URL. Nothing in those redirects points at another redirect. The language menu's English (US) entry uses the root path. Each language's shop list uses the countries in `src/lib/shop-locales.ts` (the root pages use the US list). Card totals stay site-wide.

Collections for US English are `/collections` (sets by series, generation binders, themed binders, and a Pokédex index). Other languages prefix the same path. A series is `/collections/series/{slug}`, a set is `/collections/set/{setId}`, a generation is `/collections/generation/{1-9}`, and a themed binder is `/collections/themes/{slug}`, with the locale prefix on every language except US English. The hub is `/collections/themes`. Species-name themes follow the species indexing rule. Artist and concept themes are indexed in every language. The sitemap split adds `/sitemap/{locale}-themes.xml`. Each Pokémon is `/pokedex/{number}` from 1 to 1,025. Guides are `/guides`. Species pages are indexed for US English, UK English, German, French, Spanish, and Italian, where the Pokédex name is translated. Dutch, Swedish, Norwegian, Finnish, and Polish still render the page for the language menu, with `noindex` and without an hreflang entry, because the name would only repeat the English one. Each English card has its own page at `/cards/{setId}-{number}-{name}` (UK: `/uk/cards/...`), for example `/cards/base1-4-charizard`. Other languages do not have card pages yet. Those pages are rendered on the first request and cached for a day, so the build does not pre-render the whole catalog. Sitemaps are split by locale and type: `/sitemap/{locale}-pages.xml`, `-sets`, `-guides`, and `-species` for the indexed languages, plus `/sitemap/us-cards.xml` and `/sitemap/uk-cards.xml`. A card sitemap is split into numbered parts if it would pass 40,000 URLs. The US files list the root paths. `/sitemap/root.xml` redirects to `/sitemap/us-pages.xml`.

## Type

Headings use [Quicksand](https://github.com/andrew-paglinawan/QuicksandFamily) and the text uses [Nunito](https://github.com/googlefonts/nunito). Both are under the SIL Open Font License. The license texts are in `src/assets/`. The open graph image embeds the same faces.
