import { notFound } from "next/navigation";
import { checklistPdf } from "@/lib/checklist-pdf";
import { getChecklist, paperOf } from "@/lib/checklists";
import { isLocale } from "@/lib/locales";

export const runtime = "nodejs";
export const revalidate = 86400;

export async function GET(_request: Request, context: { params: Promise<{ locale: string; kind: string; id: string; paper: string }> }) {
  const { locale, kind, id, paper } = await context.params;
  const size = paperOf(paper);
  if (!isLocale(locale) || !size || !getChecklist(locale, kind, id)) notFound();
  const pdf = await checklistPdf(locale, kind, id, size);
  if (!pdf) notFound();
  const filename = `linksforcards-${kind}-${id}-${paper}.pdf`;
  return new Response(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "public, max-age=86400, s-maxage=604800, stale-while-revalidate=2592000",
      "X-Robots-Tag": "noindex",
    },
  });
}
