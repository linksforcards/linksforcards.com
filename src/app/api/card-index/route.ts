import { getCardIndexPayload } from "@/lib/card-index";
import { applyCdnCacheHeaders, CDN_CACHE_CONTROL } from "@/lib/cdn-cache";

export const dynamic = "force-dynamic";

export function GET() {
  const headers = new Headers({ "X-Robots-Tag": "noindex" });
  applyCdnCacheHeaders(headers, CDN_CACHE_CONTROL);
  return Response.json(getCardIndexPayload(), { headers });
}
