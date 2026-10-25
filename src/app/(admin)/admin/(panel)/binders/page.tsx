import { themeCopy } from "@/content/theme-copy";
import { readAdmin } from "@/lib/admin-data";
import { adminFlash } from "@/lib/admin-flash";
import { getSets } from "@/lib/catalog";
import { getDatabase } from "@/lib/db";
import { todayIso } from "@/lib/format";
import { GENERATIONS } from "@/lib/generations";
import { getThemes } from "@/lib/themes";
import { markBinder } from "@/server/actions";

export const metadata = { title: "Binders" };

export default async function BindersAdminPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const flash = adminFlash(await searchParams);
  const db = await getDatabase();
  if (!db) return <p className="banner warn">The database is not configured.</p>;
  const overview = await readAdmin(db);
  const today = todayIso();
  const sets = [...getSets()].sort((a, b) => a.name.localeCompare(b.name));
  return (
    <>
      <h1>Binders</h1>
      <p>
        Marking a binder complete or given away is separate from the checklist. A public handover needs the recipient,
        the date, and the box that shows it on the site.
      </p>
      {flash ? <p className="banner">{flash}</p> : null}
      <h2>Generations</h2>
      {GENERATIONS.map((generation) => {
        const current = overview.binders.find((binder) => binder.kind === "generation" && binder.key === String(generation.id));
        return (
          <form key={generation.id} className="grid-form" action={markBinder}>
            <input type="hidden" name="kind" value="generation" />
            <input type="hidden" name="key" value={generation.id} />
            <h3>Generation {generation.id}</h3>
            <p className="muted">
              {current ? `${current.collected}/${current.total} species · ${current.status ?? "open"}` : "No cards in this generation yet."}
              {current?.recipient ? ` · ${current.recipient}` : ""}
            </p>
            <label>
              Date
              <input name="date" type="date" defaultValue={current?.givenOn ?? today} />
            </label>
            <label>
              Recipient
              <input name="recipient" defaultValue={current?.recipient ?? ""} maxLength={200} />
            </label>
            <label>
              Notes
              <input name="notes" maxLength={2000} />
            </label>
            <label className="checks">
              <input type="checkbox" name="is_public" defaultChecked />
              Show on the public site
            </label>
            <div className="row-actions">
              <button name="mark" value="completed" type="submit">
                Mark complete
              </button>
              <button name="mark" value="given_away" type="submit">
                Mark given away
              </button>
              <button className="quiet" name="mark" value="clear" type="submit">
                Clear
              </button>
            </div>
          </form>
        );
      })}
      <h2>Themed binders</h2>
      {getThemes().map((theme) => {
        const current = overview.binders.find((binder) => binder.kind === "theme" && binder.key === theme.slug);
        const label = themeCopy("us", theme.slug)?.h1 ?? theme.slug;
        return (
          <form key={theme.slug} className="grid-form" action={markBinder}>
            <input type="hidden" name="kind" value="theme" />
            <input type="hidden" name="key" value={theme.slug} />
            <h3>{label}</h3>
            <p className="muted">
              {current ? `${current.collected}/${current.total} cards · ${current.status ?? "open"}` : "No cards in this theme yet."}
              {current?.recipient ? ` · ${current.recipient}` : ""}
            </p>
            <label>
              Date
              <input name="date" type="date" defaultValue={current?.givenOn ?? today} />
            </label>
            <label>
              Recipient
              <input name="recipient" defaultValue={current?.recipient ?? ""} maxLength={200} />
            </label>
            <label>
              Notes
              <input name="notes" maxLength={2000} />
            </label>
            <label className="checks">
              <input type="checkbox" name="is_public" defaultChecked />
              Show on the public site
            </label>
            <div className="row-actions">
              <button name="mark" value="completed" type="submit">
                Mark complete
              </button>
              <button name="mark" value="given_away" type="submit">
                Mark given away
              </button>
              <button className="quiet" name="mark" value="clear" type="submit">
                Clear
              </button>
            </div>
          </form>
        );
      })}
      <h2>A set</h2>
      <form className="grid-form" action={markBinder}>
        <input type="hidden" name="kind" value="set" />
        <label>
          Set
          <select name="key" required defaultValue="">
            <option value="" disabled>
              Choose a set
            </option>
            {sets.map((set) => (
              <option key={set.id} value={set.id}>
                {set.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Date
          <input name="date" type="date" defaultValue={today} />
        </label>
        <label>
          Recipient
          <input name="recipient" maxLength={200} />
        </label>
        <label>
          Notes
          <input name="notes" maxLength={2000} />
        </label>
        <label className="checks">
          <input type="checkbox" name="is_public" defaultChecked />
          Show on the public site
        </label>
        <div className="row-actions">
          <button name="mark" value="completed" type="submit">
            Mark complete
          </button>
          <button name="mark" value="given_away" type="submit">
            Mark given away
          </button>
          <button className="quiet" name="mark" value="clear" type="submit">
            Clear
          </button>
        </div>
      </form>
      <h2>Sets already in the log</h2>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Set</th>
              <th>Status</th>
              <th className="num">Collected</th>
              <th>Recipient</th>
            </tr>
          </thead>
          <tbody>
            {overview.binders.filter((binder) => binder.kind === "set").length === 0 ? (
              <tr>
                <td colSpan={4}>No set has cards or a mark yet.</td>
              </tr>
            ) : (
              overview.binders
                .filter((binder) => binder.kind === "set")
                .map((binder) => (
                  <tr key={binder.key}>
                    <td>{binder.label}</td>
                    <td>{binder.status ?? "open"}</td>
                    <td className="num">
                      {binder.collected}/{binder.total}
                    </td>
                    <td>{binder.recipient}</td>
                  </tr>
                ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
