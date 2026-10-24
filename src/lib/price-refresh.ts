import { numbersMatch } from "./cards";
import { extractEstimates, fetchSetPriceCards } from "./prices";
import { str, type Sql } from "./sql";

export type RefreshResult = { updated: number; unpriced: number; failedSets: string[] };

export async function refreshInventoryPrices(db: Sql): Promise<RefreshResult> {
  const last = await db.query<{ value: string }>(`SELECT value FROM app_meta WHERE key = 'price_refresh_at'`);
  const previous = last[0]?.value;
  if (previous && Date.now() - new Date(previous).getTime() < 15_000) {
    throw new Error("cooldown");
  }
  const started = new Date().toISOString();
  await db.query(
    `INSERT INTO app_meta (key, value) VALUES ('price_refresh_at', $1)
     ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`,
    [started],
  );

  const sets = await db.query<{ set_id: string }>(`SELECT DISTINCT set_id FROM shipment_cards`);
  let updated = 0;
  let unpriced = 0;
  const failedSets: string[] = [];

  for (const setRow of sets) {
    const setId = str(setRow.set_id);
    const heldRows = await db.query<{ card_number: string }>(
      `SELECT DISTINCT card_number FROM shipment_cards WHERE set_id = $1`,
      [setId],
    );
    let apiCards;
    try {
      apiCards = await fetchSetPriceCards(setId);
    } catch (error) {
      console.error("price fetch failed", setId, error instanceof Error ? error.message : "error");
      failedSets.push(setId);
      continue;
    }
    const fetchedAt = new Date().toISOString();
    for (const held of heldRows) {
      const number = str(held.card_number);
      const match = apiCards.find((card) => card.number && numbersMatch(String(card.number), number));
      const estimate = match
        ? extractEstimates(match)
        : {
            tcgCents: null,
            cmCents: null,
            tcgAsOf: null,
            cmAsOf: null,
            note: "Card was not in the price response",
          };
      if (estimate.cmCents == null && estimate.tcgCents == null) unpriced += 1;
      await db.query(
        `INSERT INTO price_cache (
           set_id, card_number, cardmarket_cents, tcgplayer_cents, cardmarket_as_of, tcgplayer_as_of, note, fetched_at
         ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         ON CONFLICT (set_id, card_number) DO UPDATE SET
           cardmarket_cents = EXCLUDED.cardmarket_cents,
           tcgplayer_cents = EXCLUDED.tcgplayer_cents,
           cardmarket_as_of = EXCLUDED.cardmarket_as_of,
           tcgplayer_as_of = EXCLUDED.tcgplayer_as_of,
           note = EXCLUDED.note,
           fetched_at = EXCLUDED.fetched_at`,
        [setId, number, estimate.cmCents, estimate.tcgCents, estimate.cmAsOf, estimate.tcgAsOf, estimate.note, fetchedAt],
      );
      updated += 1;
    }
  }

  return { updated, unpriced, failedSets };
}
