"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath, revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { attemptLogin, clearSessionCookie, clientIp, requireSession, writeSessionCookie } from "@/lib/auth";
import { formatDexList, parseBulk } from "@/lib/cards";
import { getSet, getSetCards, matchCard } from "@/lib/catalog";
import { getTheme } from "@/lib/themes";
import { getDatabase } from "@/lib/db";
import { num } from "@/lib/sql";
import { demoToolsEnabled, replaceDemoData } from "@/lib/demo";
import { clip, isIsoDate, isUuid } from "@/lib/format";
import { generationById } from "@/lib/generations";
import { LOCALES } from "@/lib/locales";
import { PUBLIC_SNAPSHOT_TAG } from "@/lib/stats";
import { refreshInventoryPrices } from "@/lib/price-refresh";
import { normalizeWebsite } from "@/lib/urls";
import { parseBindersIncluded } from "@/lib/country-cup";

export type FormState = { error: string } | null;

function revalidatePublic() {
  revalidateTag(PUBLIC_SNAPSHOT_TAG);
  revalidatePath("/", "layout");
  for (const locale of LOCALES) revalidatePath(`/${locale}`, "layout");
}

function keepRedirect(error: unknown): void {
  if (
    typeof error === "object" &&
    error !== null &&
    "digest" in error &&
    String((error as { digest: unknown }).digest).startsWith("NEXT_REDIRECT")
  ) {
    throw error;
  }
}

async function databaseOrRedirect() {
  const db = await getDatabase();
  if (!db) redirect("/admin/login?e=config");
  return db;
}

export async function login(_prev: FormState, formData: FormData): Promise<FormState> {
  const result = await attemptLogin(String(formData.get("email") ?? ""), String(formData.get("password") ?? ""), await clientIp());
  if ("error" in result) {
    await new Promise((resolve) => setTimeout(resolve, 400));
    if (result.error === "config") return { error: "Sign-in is not configured yet. Set ADMIN_EMAIL, ADMIN_PASSWORD_HASH, and SESSION_SECRET on the host." };
    if (result.error === "locked") return { error: "Too many attempts. Wait fifteen minutes and try again." };
    return { error: "That email or password does not match." };
  }
  await writeSessionCookie(result.token);
  redirect("/admin");
}

export async function logout() {
  await clearSessionCookie();
  redirect("/admin/login");
}

export async function createShipment(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireSession();
  const db = await getDatabase();
  if (!db) return { error: "The database is not configured." };

  const receivedOn = String(formData.get("received_on") ?? "");
  if (!isIsoDate(receivedOn)) return { error: "Enter the date you received the parcel." };
  const setId = String(formData.get("set_id") ?? "");
  const cards = getSetCards(setId);
  if (!cards) return { error: "Choose a set from the list." };
  const notes = clip(formData.get("notes"), 2000);
  const bindersIncluded = parseBindersIncluded(formData.get("binders_included"));
  if (bindersIncluded === null) return { error: "Binders included needs a whole number from 0 to 99." };
  const parsed = parseBulk(String(formData.get("bulk") ?? ""));
  if (!parsed.items.length) {
    const detail = parsed.errors[0]?.reason ?? "Add at least one card number.";
    return { error: detail };
  }
  if (parsed.errors.length) {
    const sample = parsed.errors
      .slice(0, 6)
      .map((error) => (error.line ? `Line ${error.line}: ${error.reason}` : error.reason))
      .join(" ");
    return { error: sample };
  }

  const resolved: { number: string; name: string; qty: number; dex: string }[] = [];
  const missing: string[] = [];
  for (const item of parsed.items) {
    const card = matchCard(cards, item.number);
    if (!card) missing.push(item.number);
    else resolved.push({ number: card.n, name: card.name, qty: item.quantity, dex: formatDexList(card.dex ?? []) });
  }
  if (missing.length) {
    return { error: `Not in this set: ${missing.slice(0, 12).join(", ")}.` };
  }

  const shopIdInput = String(formData.get("shop_id") ?? "");
  const creating = !shopIdInput || shopIdInput === "__new";
  let shopId = shopIdInput;
  let newShop: { name: string; country: string; contact: string; website: string | null } | null = null;
  if (creating) {
    const name = clip(formData.get("new_name"), 120);
    const country = clip(formData.get("new_country"), 80);
    const contact = clip(formData.get("new_contact"), 160);
    const websiteInput = clip(formData.get("new_website"), 300);
    if (!name || !country) return { error: "A new shop needs a name and a country." };
    const website = websiteInput ? normalizeWebsite(websiteInput) : null;
    if (websiteInput && !website) return { error: "The shop link needs to be a normal web address." };
    shopId = randomUUID();
    newShop = { name, country, contact, website };
  } else if (!isUuid(shopId)) {
    return { error: "Choose a shop, or add a new one." };
  } else {
    const existing = await db.query<{ is_demo: unknown }>(`SELECT is_demo FROM shops WHERE id = $1`, [shopId]);
    if (!existing.length) return { error: "That shop is not in the log." };
    if (num(existing[0].is_demo) === 1) return { error: "That row is local demo data. Add the real shop by name." };
  }

  const shipmentId = randomUUID();
  const now = new Date().toISOString();
  await db.transaction(async (tx) => {
    if (newShop) {
      await tx.query(
        `INSERT INTO shops (id, name, country, website, contact, is_public, is_demo, created_at)
         VALUES ($1, $2, $3, $4, $5, 1, 0, $6)`,
        [shopId, newShop.name, newShop.country, newShop.website, newShop.contact, now],
      );
    }
    await tx.query(
      `INSERT INTO shipments (id, shop_id, received_on, notes, binders_included, is_demo, created_at)
       VALUES ($1, $2, $3, $4, $5, 0, $6)`,
      [shipmentId, shopId, receivedOn, notes, bindersIncluded, now],
    );
    for (const card of resolved) {
      await tx.query(
        `INSERT INTO shipment_cards (id, shipment_id, set_id, card_number, card_name, quantity, dex_numbers)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [randomUUID(), shipmentId, setId, card.number, card.name, card.qty, card.dex],
      );
    }
  });
  revalidatePublic();
  redirect("/admin/shipments?ok=logged");
}

export async function updateShipmentBinders(formData: FormData) {
  await requireSession();
  const db = await databaseOrRedirect();
  const id = String(formData.get("id") ?? "");
  const bindersIncluded = parseBindersIncluded(formData.get("binders_included"));
  if (!isUuid(id) || bindersIncluded === null) redirect("/admin/shipments?e=binders");
  const updated = await db.query<{ id: string }>(
    `UPDATE shipments SET binders_included = $2 WHERE id = $1 AND is_demo = 0 RETURNING id`,
    [id, bindersIncluded],
  );
  if (!updated.length) redirect("/admin/shipments?e=binders");
  revalidatePublic();
  redirect("/admin/shipments?ok=saved");
}

export async function deleteShipment(formData: FormData) {
  await requireSession();
  const db = await databaseOrRedirect();
  const id = String(formData.get("id") ?? "");
  if (String(formData.get("confirm") ?? "") !== "yes" || !isUuid(id)) redirect("/admin/shipments?e=confirm");
  await db.query(`DELETE FROM shipments WHERE id = $1`, [id]);
  revalidatePublic();
  redirect("/admin/shipments?ok=deleted");
}

export async function updateShop(formData: FormData) {
  await requireSession();
  const db = await databaseOrRedirect();
  const id = String(formData.get("id") ?? "");
  if (!isUuid(id)) redirect("/admin/partners?e=shop");
  const name = clip(formData.get("name"), 120);
  const country = clip(formData.get("country"), 80);
  const contact = clip(formData.get("contact"), 160);
  const websiteInput = clip(formData.get("website"), 300);
  if (!name || !country) redirect("/admin/partners?e=shop");
  const website = websiteInput ? normalizeWebsite(websiteInput) : null;
  if (websiteInput && !website) redirect("/admin/partners?e=url");
  const isPublic = formData.get("is_public") === "on" ? 1 : 0;
  await db.query(
    `UPDATE shops SET name = $2, country = $3, website = $4, contact = $5, is_public = $6 WHERE id = $1 AND is_demo = 0`,
    [id, name, country, website, contact, isPublic],
  );
  revalidatePublic();
  redirect("/admin/partners?ok=saved");
}

export async function createUpdate(formData: FormData) {
  await requireSession();
  const db = await databaseOrRedirect();
  const title = clip(formData.get("title"), 160);
  const body = clip(formData.get("body"), 8000);
  if (!title || !body) redirect("/admin/updates?e=empty");
  await db.query(
    `INSERT INTO updates (id, title, body, published_at, is_demo) VALUES ($1, $2, $3, $4, 0)`,
    [randomUUID(), title, body, new Date().toISOString()],
  );
  revalidatePublic();
  redirect("/admin/updates?ok=posted");
}

export async function deleteUpdate(formData: FormData) {
  await requireSession();
  const db = await databaseOrRedirect();
  const id = String(formData.get("id") ?? "");
  if (!isUuid(id)) redirect("/admin/updates");
  await db.query(`DELETE FROM updates WHERE id = $1`, [id]);
  revalidatePublic();
  redirect("/admin/updates?ok=deleted");
}

export async function markBinder(formData: FormData) {
  await requireSession();
  const db = await databaseOrRedirect();
  const kind = String(formData.get("kind") ?? "");
  const key = String(formData.get("key") ?? "");
  const action = String(formData.get("mark") ?? "");
  if (kind !== "set" && kind !== "generation" && kind !== "theme") redirect("/admin/binders?e=binder");
  if (kind === "generation" && !generationById(Number(key))) redirect("/admin/binders?e=binder");
  if (kind === "set" && !getSet(key)) redirect("/admin/binders?e=binder");
  if (kind === "theme" && !getTheme(key)) redirect("/admin/binders?e=binder");
  if (action === "clear") {
    await db.query(`DELETE FROM binders WHERE binder_kind = $1 AND binder_key = $2`, [kind, key]);
    revalidatePublic();
    redirect("/admin/binders?ok=cleared");
  }
  const date = String(formData.get("date") ?? "");
  if ((action !== "completed" && action !== "given_away") || !isIsoDate(date)) redirect("/admin/binders?e=binder");
  const recipient = clip(formData.get("recipient"), 200);
  const notes = clip(formData.get("notes"), 2000);
  if (action === "given_away" && !recipient) redirect("/admin/binders?e=recipient");
  const existing = await db.query<{ completed_on: string | null }>(
    `SELECT completed_on FROM binders WHERE binder_kind = $1 AND binder_key = $2`,
    [kind, key],
  );
  const completedOn = action === "completed" ? date : existing[0]?.completed_on || date;
  const givenOn = action === "given_away" ? date : null;
  const status = action === "given_away" ? "given_away" : "completed";
  const isPublic = formData.get("is_public") === "on" ? 1 : 0;
  await db.query(
    `INSERT INTO binders (
       binder_kind, binder_key, status, completed_on, given_on, recipient, notes, is_public, is_demo
     ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 0)
     ON CONFLICT (binder_kind, binder_key) DO UPDATE SET
       status = EXCLUDED.status,
       completed_on = EXCLUDED.completed_on,
       given_on = EXCLUDED.given_on,
       recipient = EXCLUDED.recipient,
       notes = EXCLUDED.notes,
       is_public = EXCLUDED.is_public,
       is_demo = 0`,
    [kind, key, status, completedOn, givenOn, action === "given_away" ? recipient : "", notes, isPublic],
  );
  revalidatePublic();
  redirect("/admin/binders?ok=saved");
}

export async function refreshPrices() {
  await requireSession();
  const db = await databaseOrRedirect();
  try {
    const result = await refreshInventoryPrices(db);
    const failed = result.failedSets.slice(0, 8).join(",");
    redirect(`/admin?ok=prices&updated=${result.updated}&unpriced=${result.unpriced}&failed=${encodeURIComponent(failed)}`);
  } catch (error) {
    keepRedirect(error);
    if (error instanceof Error && error.message === "cooldown") redirect("/admin?e=cooldown");
    redirect("/admin?e=prices");
  }
}

export async function loadDemo() {
  await requireSession();
  if (!demoToolsEnabled()) redirect("/admin?e=demo");
  const db = await databaseOrRedirect();
  await replaceDemoData(db);
  revalidatePublic();
  redirect("/admin?ok=demo");
}
