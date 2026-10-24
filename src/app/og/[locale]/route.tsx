import { readFileSync } from "node:fs";
import path from "node:path";
import { ImageResponse } from "next/og";
import { getMessages } from "@/lib/i18n";
import { isLocale } from "@/lib/locales";
import { site } from "@/lib/site";

export const runtime = "nodejs";

const sans = readFileSync(path.join(process.cwd(), "src/assets/source-sans-3-latin-ext-400.woff"));
const display = readFileSync(path.join(process.cwd(), "src/assets/fraunces-latin-ext-600.woff"));

export async function GET(_request: Request, context: { params: Promise<{ locale: string }> }) {
  const { locale } = await context.params;
  if (!isLocale(locale)) return new Response("Not found", { status: 404 });
  const m = getMessages(locale);
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: "#efe6d6",
          padding: 48,
          color: "#231c16",
          fontFamily: "Source Sans 3",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            width: "100%",
            background: "#fffaf3",
            border: "2px solid #e4d8c8",
            padding: "56px 64px",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", fontFamily: "Fraunces", fontSize: 42 }}>LinksForCards</div>
            <div style={{ display: "flex", width: 18, height: 72, background: "#8f3d2c" }} />
          </div>
          <div style={{ display: "flex", fontFamily: "Fraunces", fontSize: 58, lineHeight: 1.15, maxWidth: 920 }}>
            {m.meta.ogTitle}
          </div>
          <div style={{ display: "flex", fontSize: 28, color: "#5c5148" }}>{site.sender}</div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: [
        { name: "Source Sans 3", data: sans, weight: 400, style: "normal" },
        { name: "Fraunces", data: display, weight: 600, style: "normal" },
      ],
    },
  );
}
