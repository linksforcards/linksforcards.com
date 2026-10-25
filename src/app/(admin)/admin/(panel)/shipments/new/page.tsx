import { ShipmentForm } from "@/components/admin/shipment-form";
import { listShops } from "@/lib/admin-data";
import { setsBySeries } from "@/lib/catalog";
import { getDatabase } from "@/lib/db";
import { num, str } from "@/lib/sql";

export const metadata = { title: "Log a parcel" };

export default async function NewShipmentPage() {
  const db = await getDatabase();
  if (!db) return <p className="banner warn">The database is not configured.</p>;
  const shops = (await listShops(db))
    .filter((shop) => num(shop.is_demo) === 0)
    .map((shop) => ({ id: str(shop.id), name: str(shop.name), country: str(shop.country) }));
  const groups = setsBySeries().map((group) => ({
    series: group.series,
    sets: group.sets.map((set) => ({ id: set.id, name: set.name })),
  }));
  return (
    <>
      <h1>Log a parcel</h1>
      <p>Pick the set, then paste collector numbers. Quantities are how many copies arrived, not a price.</p>
      <ShipmentForm shops={shops} groups={groups} />
    </>
  );
}
