import { Fraunces, Source_Sans_3 } from "next/font/google";

export const display = Fraunces({
  subsets: ["latin", "latin-ext"],
  display: "swap",
  variable: "--font-display",
});

export const sans = Source_Sans_3({
  subsets: ["latin", "latin-ext"],
  display: "swap",
  variable: "--font-sans",
});
