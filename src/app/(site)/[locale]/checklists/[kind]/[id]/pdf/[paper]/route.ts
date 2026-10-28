import { notFound } from "next/navigation";
import { applyCdnCacheHeaders, PDF_CACHE_CONTROL } from "@/lib/cdn-cache";
import { checklistPdf } from "@/lib/checklist-pdf";
import { getChecklist, paperOf } from "@/lib/checklists";
import { isLocale } from "@/lib/locales";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_request: Request, context: { params: Promise<{ locale: string; kind: string; id: string; paper: string }> }) {
  const { locale, kind, id, paper } = await context.params;
  const size = paperOf(paper);
  if (!isLocale(locale) || !size || !getChecklist(locale, kind, id)) notFound();
  const pdf = await checklistPdf(locale, kind, id, size);
  if (!pdf) notFound();
  const filename = `linksforcards-${kind}-${id}-${paper}.pdf`;
  const headers = new Headers({
    "Content-Type": "application/pdf",
    "Content-Disposition": `attachment; filename="${filename}"`,
    "X-Robots-Tag": "noindex",
  });
  applyCdnCacheHeaders(headers, PDF_CACHE_CONTROL);
  return new Response(new Uint8Array(pdf), { headers });
}
