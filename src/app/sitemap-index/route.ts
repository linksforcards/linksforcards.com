import { renderSitemapIndex } from "@/lib/sitemap-data";

export const dynamic = "force-static";
export const revalidate = 86400;

export function GET() {
  return new Response(renderSitemapIndex(), {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
