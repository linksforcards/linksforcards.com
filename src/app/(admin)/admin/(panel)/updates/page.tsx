import { PlainText } from "@/components/site/plain-text";
import { adminFlash } from "@/lib/admin-flash";
import { listUpdates } from "@/lib/admin-data";
import { getDatabase } from "@/lib/db";
import { formatWhen } from "@/lib/format";
import { num, str } from "@/lib/sql";
import { createUpdate, deleteUpdate } from "@/server/actions";

export const metadata = { title: "Notes" };

export default async function UpdatesAdminPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const flash = adminFlash(await searchParams);
  const db = await getDatabase();
  if (!db) return <p className="banner warn">The database is not configured.</p>;
  const updates = await listUpdates(db);
  return (
    <>
      <h1>Notes</h1>
      <p>A note shows on the public site in the language I write it. The longer writing stays on Substack.</p>
      {flash ? <p className="banner">{flash}</p> : null}
      <form className="grid-form" action={createUpdate}>
        <label>
          Title
          <input name="title" required maxLength={160} />
        </label>
        <label>
          Note
          <textarea name="body" required />
        </label>
        <button type="submit">Post note</button>
      </form>
      {updates.map((update) => (
        <article key={update.id} className="note">
          <h2>{str(update.title)}</h2>
          <p className="muted">
            {formatWhen(str(update.published_at), "us")}
            {num(update.is_demo) === 1 ? " · DEMO" : ""}
          </p>
          <PlainText text={str(update.body)} />
          <form action={deleteUpdate}>
            <input type="hidden" name="id" value={update.id} />
            <button className="quiet" type="submit">
              Delete
            </button>
          </form>
        </article>
      ))}
    </>
  );
}
