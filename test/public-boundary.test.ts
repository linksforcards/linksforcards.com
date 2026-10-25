import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

function files(target: string): string[] {
  if (!statSync(target).isDirectory()) return [target];
  return readdirSync(target).flatMap((name) => files(path.join(target, name)));
}

describe("public surface", () => {
  it("does not name a language or country that this site does not publish", () => {
    const banned = ["Den" + "mark", "Dan" + "mark", "Dan" + "sk", "Dan" + "ish"].map((word) => word.toLowerCase());
    const roots = ["src", "messages", "scripts", "public", "README.md"].map((item) => path.join(process.cwd(), item));
    for (const file of roots.flatMap(files)) {
      if (!/\.(tsx?|json|md|mjs|svg|txt|yml)$/.test(file)) continue;
      if (file.includes(`${path.sep}assets${path.sep}`)) continue;
      const text = readFileSync(file, "utf8")
        .toLowerCase()
        .replaceAll("magnus schmidt, kongensgade 13b, 1., 5000 odense c, denmark", "")
        .replaceAll('addresscountry: "denmark"', "");
      for (const word of banned) expect(text, file).not.toContain(word);
    }
  });

  it("does not import prices or mark thank-you links as nofollow", () => {
    const paths = [
      path.join(process.cwd(), "src/app/(site)"),
      path.join(process.cwd(), "src/components/site"),
      path.join(process.cwd(), "src/app/og"),
      path.join(process.cwd(), "src/app/sitemap-index"),
      path.join(process.cwd(), "src/app/sitemap"),
      path.join(process.cwd(), "src/lib/sitemap-data.ts"),
      path.join(process.cwd(), "src/app/robots.ts"),
    ];
    const banned = [/cardmarket/i, /tcgplayer/i, /price_cache/, /@\/lib\/money/, /@\/lib\/prices/, /nofollow/i, /\bsponsored\b/];
    for (const file of paths.flatMap(files)) {
      if (!/\.(tsx|ts)$/.test(file)) continue;
      const text = readFileSync(file, "utf8");
      for (const pattern of banned) expect(text, file).not.toMatch(pattern);
    }
  });
});
