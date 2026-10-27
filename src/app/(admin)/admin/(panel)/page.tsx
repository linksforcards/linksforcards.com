import { SubmitButton } from "@/components/admin/submit-button";
import { readAdmin } from "@/lib/admin-data";
import { adminFlash } from "@/lib/admin-flash";
import { getDatabase, usingLocalDatabase } from "@/lib/db";
import { demoToolsEnabled } from "@/lib/demo";
import { formatWhen } from "@/lib/format";
import { formatCents } from "@/lib/money";
import { loadDemo, refreshPrices } from "@/server/actions";

export const metadata = { title: "Overview" };

export default async function OverviewPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const query = await searchParams;
  const flash = adminFlash(query);
  const db = await getDatabase();
  if (!db) {
    return <p className="banner warn">The database is not configured. Set DATABASE_URL on the host.</p>;
  }
  const overview = await readAdmin(db);
  return (
    <>
      <h1>Overview</h1>
      <p>Estimates stay on this page. The public site shows counts, thanks, notes, and handovers.</p>
      {usingLocalDatabase() ? (
        <p className="banner">This server is using the embedded database in .data/pglite. It is not the hosted database.</p>
      ) : null}
      {overview.demoPresent ? (
        <p className="banner warn">Rows marked DEMO are local sample data. They are not on the public site.</p>
      ) : null}
      {flash ? <p className="banner">{flash}</p> : null}
      <dl className="stats">
        <div>
          <dt>Different cards</dt>
          <dd>{overview.differentCards}</dd>
        </div>
        <div>
          <dt>Copies</dt>
          <dd>{overview.copies}</dd>
        </div>
        <div>
          <dt>Cardmarket</dt>
          <dd>{formatCents(overview.cmTotal, "EUR")}</dd>
        </div>
        <div>
          <dt>TCGplayer</dt>
          <dd>{formatCents(overview.tcgTotal, "USD")}</dd>
        </div>
        <div>
          <dt>Unpriced cards</dt>
          <dd>
            {overview.cmMissing} EUR / {overview.tcgMissing} USD
          </dd>
        </div>
      </dl>
      <p>
        Each figure is an estimate: the lowest positive TCGplayer market price across printings, in USD, and a Cardmarket
        figure in EUR (the lower of the trend and the reverse-holo trend, otherwise the 7-day average, otherwise the
        average sell price). Zero and implausible figures are ignored. A card can sit in a set total and a generation
        total. The overall total counts each copy once. A card that names Pokémon from two generations is counted in
        full in each of those generation totals.
      </p>
      <p className="muted">
        {overview.newestFetch
          ? `Prices fetched ${formatWhen(overview.oldestFetch ?? overview.newestFetch, "us")} – ${formatWhen(overview.newestFetch, "us")} UTC.`
          : "No prices have been fetched yet."}
      </p>
      <form action={refreshPrices}>
        <SubmitButton>Refresh price estimates</SubmitButton>
      </form>
      {demoToolsEnabled() ? (
        <form action={loadDemo}>
          <p>Load clearly marked demo shipments into this local database. They stay off the public pages.</p>
          <SubmitButton quiet>Load local demo</SubmitButton>
        </form>
      ) : null}

      <h2>By shop</h2>
      <div className="table-wrap">
        <table>
          <caption>Estimated totals per shop</caption>
          <thead>
            <tr>
              <th>Shop</th>
              <th>Country</th>
              <th className="num">Copies</th>
              <th className="num">EUR</th>
              <th className="num">USD</th>
              <th className="num">Missing</th>
            </tr>
          </thead>
          <tbody>
            {overview.shops.length === 0 ? (
              <tr>
                <td colSpan={6}>No shipments yet.</td>
              </tr>
            ) : (
              overview.shops.map((shop) => (
                <tr key={shop.id}>
                  <td>{shop.name}</td>
                  <td>{shop.country}</td>
                  <td className="num">{shop.copies}</td>
                  <td className="num">{formatCents(shop.cmCents, "EUR")}</td>
                  <td className="num">{formatCents(shop.tcgCents, "USD")}</td>
                  <td className="num">
                    {shop.cmMissing} / {shop.tcgMissing}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <h2>By binder</h2>
      <div className="table-wrap">
        <table>
          <caption>Estimated totals per binder</caption>
          <thead>
            <tr>
              <th>Binder</th>
              <th>Status</th>
              <th className="num">Collected</th>
              <th className="num">EUR</th>
              <th className="num">USD</th>
            </tr>
          </thead>
          <tbody>
            {overview.binders.length === 0 ? (
              <tr>
                <td colSpan={5}>No binder has cards or a mark yet.</td>
              </tr>
            ) : (
              overview.binders.map((binder) => (
                <tr key={`${binder.kind}:${binder.key}`}>
                  <td>{binder.label}</td>
                  <td>{binder.status ?? "open"}</td>
                  <td className="num">
                    {binder.collected}/{binder.total}
                  </td>
                  <td className="num">{formatCents(binder.cmCents, "EUR")}</td>
                  <td className="num">{formatCents(binder.tcgCents, "USD")}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <h2>Cards</h2>
      <div className="table-wrap">
        <table>
          <caption>Every logged card, the shop it came from, and the cached estimate</caption>
          <thead>
            <tr>
              <th>Set</th>
              <th>Language</th>
              <th>No.</th>
              <th>Name</th>
              <th>Shops</th>
              <th className="num">Qty</th>
              <th className="num">EUR each</th>
              <th className="num">EUR line</th>
              <th className="num">USD each</th>
              <th className="num">USD line</th>
              <th>Fetched</th>
            </tr>
          </thead>
          <tbody>
            {overview.cards.length === 0 ? (
              <tr>
                <td colSpan={11}>No cards logged.</td>
              </tr>
            ) : (
              overview.cards.map((card) => (
                <tr key={`${card.language}:${card.setId}:${card.number}`}>
                  <td>{card.setName}</td>
                  <td>{card.language}</td>
                  <td>{card.number}</td>
                  <td>{card.name}</td>
                  <td>{card.shops.map((shop) => `${shop.name} (${shop.qty})`).join(", ")}</td>
                  <td className="num">{card.qty}</td>
                  <td className="num">{formatCents(card.cmCents, "EUR")}</td>
                  <td className="num">{formatCents(card.cmCents == null ? null : card.cmCents * card.qty, "EUR")}</td>
                  <td className="num">{formatCents(card.tcgCents, "USD")}</td>
                  <td className="num">{formatCents(card.tcgCents == null ? null : card.tcgCents * card.qty, "USD")}</td>
                  <td>{card.fetchedAt ? formatWhen(card.fetchedAt, "us") : "—"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
