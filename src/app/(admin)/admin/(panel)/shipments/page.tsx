import { adminFlash } from "@/lib/admin-flash";
import { listShipments } from "@/lib/admin-data";
import { getDatabase } from "@/lib/db";
import { formatDay } from "@/lib/format";
import { num } from "@/lib/sql";
import { deleteShipment, updateShipmentBinders } from "@/server/actions";

export const metadata = { title: "Shipments" };

export default async function ShipmentsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const flash = adminFlash(await searchParams);
  const db = await getDatabase();
  if (!db) return <p className="banner warn">The database is not configured.</p>;
  const rows = await listShipments(db);
  return (
    <>
      <h1>Shipments</h1>
      <p>
        <a className="button" href="/admin/shipments/new">
          Log a parcel
        </a>
      </p>
      <p>
        The public Country Cup scores the shop&apos;s country: one point per card copy, plus 1,000 for each binder in the parcel. Shop names stay off that board.
      </p>
      {flash ? <p className="banner">{flash}</p> : null}
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Received</th>
              <th>Shop</th>
              <th>Languages</th>
              <th className="num">Lines</th>
              <th className="num">Cards</th>
              <th className="num">Binders</th>
              <th>Notes</th>
              <th>Delete</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={8}>No shipments yet.</td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.id}>
                  <td>{formatDay(row.received_on, "us")}</td>
                  <td>
                    {row.shop_name}
                    <span className="muted"> · {row.country}</span>
                    {num(row.is_demo) === 1 ? <span className="muted"> · DEMO</span> : null}
                  </td>
                  <td>{row.languages || "en"}</td>
                  <td className="num">{num(row.lines)}</td>
                  <td className="num">{num(row.copies)}</td>
                  <td className="num">
                    {num(row.is_demo) === 1 ? (
                      num(row.binders_included)
                    ) : (
                      <form className="row-actions" action={updateShipmentBinders}>
                        <input type="hidden" name="id" value={row.id} />
                        <input
                          className="narrow"
                          name="binders_included"
                          type="number"
                          min={0}
                          max={99}
                          step={1}
                          defaultValue={num(row.binders_included)}
                          aria-label={`Binders included from ${row.shop_name}`}
                        />
                        <button className="quiet" type="submit">
                          Save
                        </button>
                      </form>
                    )}
                  </td>
                  <td>{row.notes}</td>
                  <td>
                    <form className="row-actions" action={deleteShipment}>
                      <input type="hidden" name="id" value={row.id} />
                      <label className="checks">
                        <input type="checkbox" name="confirm" value="yes" />
                        Confirm
                      </label>
                      <button className="quiet" type="submit">
                        Delete
                      </button>
                    </form>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
