"use client";

import { useActionState, useState } from "react";
import { PRINT_LANGUAGES, PRINT_LANGUAGE_LABELS } from "@/lib/print-languages";
import { createShipment, type FormState } from "@/server/actions";
import { SubmitButton } from "./submit-button";

type Shop = { id: string; name: string; country: string };
type Group = { series: string; sets: { id: string; name: string }[] };

export function ShipmentForm({ shops, groups }: { shops: Shop[]; groups: Group[] }) {
  const [state, action] = useActionState(createShipment, null as FormState);
  const [shopId, setShopId] = useState("__new");
  const creating = shopId === "__new";
  return (
    <form className="grid-form" action={action}>
      {state?.error ? <p className="banner warn">{state.error}</p> : null}
      <label>
        Shop
        <select name="shop_id" value={shopId} onChange={(event) => setShopId(event.target.value)}>
          <option value="__new">New shop</option>
          {shops.map((shop) => (
            <option key={shop.id} value={shop.id}>
              {shop.name} · {shop.country}
            </option>
          ))}
        </select>
      </label>
      {creating ? (
        <>
          <label>
            Shop name
            <input name="new_name" required maxLength={120} />
          </label>
          <label>
            Country
            <input name="new_country" required maxLength={80} />
          </label>
          <label>
            Shop website
            <input name="new_website" placeholder="example.com" maxLength={300} />
          </label>
          <label>
            Contact
            <input name="new_contact" maxLength={160} />
          </label>
        </>
      ) : null}
      <label>
        Date received
        <input name="received_on" type="date" required />
      </label>
      <label>
        Language
        <select name="language" defaultValue="en">
          {PRINT_LANGUAGES.map((code) => (
            <option key={code} value={code}>
              {PRINT_LANGUAGE_LABELS[code]} ({code})
            </option>
          ))}
        </select>
      </label>
      <label>
        Set
        <select name="set_id" defaultValue="">
          <option value="">Lines name their own set</option>
          {groups.map((group) => (
            <optgroup key={group.series} label={group.series}>
              {group.sets.map((set) => (
                <option key={set.id} value={set.id}>
                  {set.name}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      </label>
      <label>
        Cards
        <textarea name="bulk" required placeholder={"4\n4 x3\n12-20\nde swsh3 136\nzh-cn CSV1C 001 x2 = name"} />
      </label>
      <p className="muted">
        One number per line, for the language and set above. A quantity looks like 4 x3. A range looks like 12-20. A line can name its own language and set, as in de swsh3 136 or zh-cn CSV1C 001 x2. When the list has no name, add = and the name. Lines starting with # are skipped.
      </p>
      <label>
        Binders included
        <input name="binders_included" type="number" min={0} max={99} step={1} defaultValue={0} inputMode="numeric" />
      </label>
      <p className="muted">
        How many binders were in the parcel. Leave 0 if it was cards only. The country is the shop&apos;s country, and the card count is these lines, bulk included. You do not enter either again.
      </p>
      <label>
        Notes
        <textarea name="notes" />
      </label>
      <SubmitButton>Log shipment</SubmitButton>
    </form>
  );
}
