import { Nunito, Quicksand } from "next/font/google";

export const display = Quicksand({
  subsets: ["latin", "latin-ext"],
  weight: ["600", "700"],
  display: "swap",
  variable: "--font-display",
});

export const sans = Nunito({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "600", "700"],
  display: "swap",
  variable: "--font-sans",
});
