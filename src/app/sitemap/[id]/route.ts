import { notFound } from "next/navigation";
import { renderUrlset, SITEMAP_IDS, sitemapEntries } from "@/lib/sitemap-data";

export const dynamic = "force-static";
export const revalidate = 86400;
export const dynamicParams = false;

export function generateStaticParams() {
  return SITEMAP_IDS.map((id) => ({ id }));
}

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const bare = id.endsWith(".xml") ? id.slice(0, -4) : id;
  const entries = sitemapEntries(bare);
  if (!entries) notFound();
  return new Response(renderUrlset(entries), {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
