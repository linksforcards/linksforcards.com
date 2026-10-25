import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { site } from "../src/lib/site";

const dir = path.join(process.cwd(), "messages");
const files = readdirSync(dir).filter((name) => name.endsWith(".json")).sort();

function leaves(value: unknown, prefix = ""): string[] {
  if (Array.isArray(value)) return [prefix];
  if (value && typeof value === "object") {
    return Object.entries(value).flatMap(([key, child]) => leaves(child, prefix ? `${prefix}.${key}` : key));
  }
  return [prefix];
}

function textOf(value: unknown): string {
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return value.map(textOf).join("\n");
  if (value && typeof value === "object") return Object.values(value).map(textOf).join("\n");
  return "";
}

const plural: Record<string, RegExp[]> = {
  en: [/\bwe\b/i, /\bour\b/i, /\bours\b/i],
  de: [/\bwir\b/i, /\bunser\w*/i, /\buns\b/i],
  fr: [/\bnous\b/i, /\bnotre\b/i, /\bnos\b/i],
  es: [/\bnosotros\b/i, /\bnuestro\w*/i],
  it: [/\bnoi\b/i, /\bnostro\b/i, /\bnostra\b/i, /\bnostri\b/i],
  nl: [/\bwij\b/i, /\bons\b/i, /\bonze\b/i],
  sv: [/\bvi\b/i, /\bvår\b/i, /\bvåra\b/i, /\bvårt\b/i],
  no: [/\bvi\b/i, /\bvår\b/i, /\bvåre\b/i, /\bvårt\b/i],
  fi: [/\bme\b/i, /\bmeidän\b/i],
  pl: [/\bmy\b/i, /\bnasz\w*/i],
};

const marketing = [
  /\bbacklinks?\b/i,
  /link building/i,
  /\bcampaigns?\b/i,
  /\bcustomers?\b/i,
  /\bpremium\b/i,
  /\bdonate\b/i,
  /\bkampagne\b/i,
  /\bcampagnes?\b/i,
  /\bcampaña\b/i,
  /\bcampagna\b/i,
  /\bkampan(?:j|ja|je|ia)\b/i,
];

describe("messages", () => {
  it("covers both Englishes and the other public languages with the same keys", () => {
    expect(files).toEqual([
      "de.json",
      "en-GB.json",
      "en-US.json",
      "es.json",
      "fi.json",
      "fr.json",
      "it.json",
      "nl.json",
      "no.json",
      "pl.json",
      "sv.json",
    ]);
    const english = leaves(JSON.parse(readFileSync(path.join(dir, "en-US.json"), "utf8")));
    for (const file of files) {
      const data = JSON.parse(readFileSync(path.join(dir, file), "utf8")) as { regions: string[] };
      expect(leaves(data)).toEqual(english);
      expect(data.regions).toHaveLength(9);
    }
  });

  it("keeps the voice in the first person and names the contact address", () => {
    const place = ["Den" + "mark", "Dan" + "mark", "Dan" + "sk", "Dan" + "ish"];
    for (const file of files) {
      const raw = readFileSync(path.join(dir, file), "utf8");
      const data = JSON.parse(raw) as { home: { shopsP1: string }; privacy: { p1: string }; imprint: { address: string } };
      const code = file.replace(/\.json$/, "");
      const voice = code === "en-US" || code === "en-GB" ? "en" : code;
      const body = textOf(data);
      const { guides, ...rest } = data as { guides?: unknown };
      const outside = textOf(rest);
      expect(raw).toContain("magnus@linksforcards.com");
      expect(data.home.shopsP1).toContain("magnus@linksforcards.com");
      expect(data.privacy.p1).toContain("magnus@linksforcards.com");
      for (const pattern of plural[voice] ?? []) expect(body).not.toMatch(pattern);
      for (const pattern of marketing) {
        if (pattern.source.includes("donate")) expect(outside).not.toMatch(pattern);
        else expect(body).not.toMatch(pattern);
      }
      expect(data.imprint.address).toBe(site.postalAddress);
      const outsideAddress = raw.split(site.postalAddress).join("");
      for (const word of place) expect(outsideAddress.toLowerCase()).not.toContain(word.toLowerCase());
      expect(guides).toBeTruthy();
    }
  });
});
