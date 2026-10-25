import { adminFlash } from "@/lib/admin-flash";
import { listShipments } from "@/lib/admin-data";
import { getDatabase } from "@/lib/db";
import { formatDay } from "@/lib/format";
import { num } from "@/lib/sql";
import { deleteShipment } from "@/server/actions";

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
      {flash ? <p className="banner">{flash}</p> : null}
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Received</th>
              <th>Shop</th>
              <th className="num">Lines</th>
              <th className="num">Copies</th>
              <th>Notes</th>
              <th>Delete</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={6}>No shipments yet.</td>
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
                  <td className="num">{num(row.lines)}</td>
                  <td className="num">{num(row.copies)}</td>
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
