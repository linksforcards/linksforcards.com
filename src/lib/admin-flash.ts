export function queryValue(query: Record<string, string | string[] | undefined>, key: string): string {
  const value = query[key];
  return (Array.isArray(value) ? value[0] : value) ?? "";
}

export function adminFlash(query: Record<string, string | string[] | undefined>): string | null {
  const ok = queryValue(query, "ok");
  const problem = queryValue(query, "e");
  if (ok === "demo") return "Local demo shipments are in this database. The public site leaves them out.";
  if (ok === "prices") {
    const failed = queryValue(query, "failed");
    return `Price cache updated for ${queryValue(query, "updated") || "0"} rows. ${queryValue(query, "unpriced") || "0"} cards had no positive price. Sets that failed: ${failed || "none"}.`;
  }
  if (ok === "logged") return "Shipment logged.";
  if (ok === "deleted") return "Deleted.";
  if (ok === "saved") return "Saved.";
  if (ok === "posted") return "Note posted.";
  if (ok === "cleared") return "Binder mark cleared.";
  if (problem === "cooldown") return "A refresh just ran. Wait a few seconds and try again.";
  if (problem === "prices") return "The price request failed before it could save.";
  if (problem === "demo") return "Demo data is only for local development.";
  if (problem === "config") return "The database is not configured.";
  if (problem === "confirm") return "Tick the confirmation box to delete a shipment.";
  if (problem === "shop") return "That shop needs a name and a country.";
  if (problem === "url") return "The shop link needs to be a normal web address.";
  if (problem === "empty") return "A note needs a title and some text.";
  if (problem === "binder") return "That binder could not be updated.";
  if (problem === "recipient") return "A handover needs the recipient.";
  return null;
}
