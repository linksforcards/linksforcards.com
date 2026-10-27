import { getCardIndexPayload } from "@/lib/card-index";

export const revalidate = 86400;

export function GET() {
  return Response.json(getCardIndexPayload(), {
    headers: {
      "Cache-Control": "public, max-age=86400",
      "X-Robots-Tag": "noindex",
    },
  });
}
