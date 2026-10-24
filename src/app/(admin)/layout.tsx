import type { Metadata } from "next";
import type { ReactNode } from "react";
import { display, sans } from "@/lib/fonts";
import { site } from "@/lib/site";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: { default: `Admin · ${site.name}`, template: `%s · Admin · ${site.name}` },
  robots: { index: false, follow: false },
  icons: { icon: "/icon.svg" },
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en-US" className={`${display.variable} ${sans.variable}`}>
      <body className="admin">{children}</body>
    </html>
  );
}
