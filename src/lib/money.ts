export function formatCents(cents: number | null, currency: "EUR" | "USD"): string {
  if (cents == null) return "—";
  return new Intl.NumberFormat("en-GB", { style: "currency", currency }).format(cents / 100);
}

export function lineCents(quantity: number, unit: number | null): number | null {
  if (unit == null) return null;
  return unit * quantity;
}
