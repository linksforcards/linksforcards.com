import { readFileSync } from "node:fs";
import path from "node:path";
import { ImageResponse } from "next/og";
import { getArticle, isArticleSlug } from "@/lib/articles";
import { isLocale } from "@/lib/locales";
import { site } from "@/lib/site";

export const runtime = "nodejs";

const sans = readFileSync(path.join(process.cwd(), "src/assets/nunito-latin-ext-400.woff"));
const display = readFileSync(path.join(process.cwd(), "src/assets/quicksand-latin-ext-700.woff"));

export async function GET(_request: Request, context: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await context.params;
  if (!isLocale(locale) || !isArticleSlug(slug)) return new Response("Not found", { status: 404 });
  const article = getArticle(locale, slug);
  if (!article) return new Response("Not found", { status: 404 });
  const title = article.h1;
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: "#d7f0ff",
          padding: 48,
          color: "#1b2430",
          fontFamily: "Nunito",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            width: "100%",
            background: "#fffdf8",
            border: "8px solid #1b2430",
            borderRadius: 36,
            padding: "56px 64px",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", fontFamily: "Quicksand", fontSize: 42 }}>LinksForCards</div>
            <div
              style={{
                display: "flex",
                width: 54,
                height: 54,
                background: "#ffe08a",
                border: "6px solid #1b2430",
                borderRadius: 14,
              }}
            />
          </div>
          <div style={{ display: "flex", fontFamily: "Quicksand", fontSize: title.length > 48 ? 46 : 58, lineHeight: 1.15, maxWidth: 980 }}>
            {title}
          </div>
          <div style={{ display: "flex", fontSize: 28, color: "#3e5168" }}>{site.sender}</div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: [
        { name: "Nunito", data: sans, weight: 400, style: "normal" },
        { name: "Quicksand", data: display, weight: 700, style: "normal" },
      ],
    },
  );
}
