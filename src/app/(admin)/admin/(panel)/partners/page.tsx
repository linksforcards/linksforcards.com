import { listShops, shopWebsite } from "@/lib/admin-data";
import { adminFlash } from "@/lib/admin-flash";
import { getDatabase } from "@/lib/db";
import { num, str } from "@/lib/sql";
import { updateShop } from "@/server/actions";

export const metadata = { title: "Partners" };

export default async function PartnersAdminPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const flash = adminFlash(await searchParams);
  const db = await getDatabase();
  if (!db) return <p className="banner warn">The database is not configured.</p>;
  const shops = await listShops(db);
  return (
    <>
      <h1>Partners</h1>
      <p>The public thank-you wall shows the name, the country, a normal link, and which binders the cards helped. It does not show a contact or an estimate.</p>
      {flash ? <p className="banner">{flash}</p> : null}
      {shops.length === 0 ? <p>No shops yet. A shop is created when you log a parcel.</p> : null}
      {shops.map((shop) => {
        const demo = num(shop.is_demo) === 1;
        const website = shopWebsite(shop.website);
        return (
          <form key={shop.id} className="grid-form" action={updateShop}>
            <input type="hidden" name="id" value={shop.id} />
            <h2>
              {str(shop.name)}
              {demo ? " · DEMO" : ""}
            </h2>
            {demo ? <p className="muted">Local demo rows cannot be edited here. They never appear on the public site.</p> : null}
            <label>
              Name
              <input name="name" defaultValue={str(shop.name)} required disabled={demo} />
            </label>
            <label>
              Country
              <input name="country" defaultValue={str(shop.country)} required disabled={demo} />
            </label>
            <label>
              Website
              <input name="website" defaultValue={website ?? ""} disabled={demo} />
            </label>
            <label>
              Contact
              <input name="contact" defaultValue={str(shop.contact)} disabled={demo} />
            </label>
            <label className="checks">
              <input type="checkbox" name="is_public" defaultChecked={num(shop.is_public) === 1} disabled={demo} />
              Show on the public thank-you wall
            </label>
            {demo ? null : <button type="submit">Save</button>}
          </form>
        );
      })}
    </>
  );
}
