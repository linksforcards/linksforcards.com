import type { Metadata } from "next";
import type { ReactNode } from "react";
import { display, sans } from "@/lib/fonts";
import { pickerMetadata } from "@/lib/seo";
import { site } from "@/lib/site";
import "@/styles/globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  ...pickerMetadata(),
  icons: { icon: "/icon.svg" },
};

export default function PickerLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable}`}>
      <body>{children}</body>
    </html>
  );
}
