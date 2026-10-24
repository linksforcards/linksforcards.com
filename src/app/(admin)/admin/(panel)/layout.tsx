import type { ReactNode } from "react";
import { requireSession } from "@/lib/auth";
import { site } from "@/lib/site";
import { logout } from "@/server/actions";

export const dynamic = "force-dynamic";

export default async function PanelLayout({ children }: { children: ReactNode }) {
  const session = await requireSession();
  return (
    <>
      <header className="wrap admin-bar">
        <div>
          <span className="stamp">Private</span>
        </div>
        <nav className="admin-nav" aria-label="Admin">
          <a href="/admin">Overview</a>
          <a href="/admin/shipments">Shipments</a>
          <a href="/admin/shipments/new">Log a parcel</a>
          <a href="/admin/binders">Binders</a>
          <a href="/admin/partners">Partners</a>
          <a href="/admin/updates">Notes</a>
          <a href="/">Public site</a>
          <form action={logout}>
            <button className="quiet" type="submit">
              Sign out
            </button>
          </form>
        </nav>
        <p className="muted">
          {session.email} · {site.sender}
        </p>
      </header>
      <main id="content" className="wrap">
        {children}
      </main>
    </>
  );
}
