import { PrintButton } from "@/components/site/print-button";
import { checklistPdfPath, type ChecklistModel } from "@/lib/checklists";
import type { Locale } from "@/lib/locales";
import { localePath } from "@/lib/routing";
import { site } from "@/lib/site";

export function PrintableSheet({ locale, model }: { locale: Locale; model: ChecklistModel }) {
  const { labels } = model;
  let line = 0;
  return (
    <article className="print-sheet">
      <header className="print-mast">
        <p className="print-doc-title">{model.title}</p>
        <p className="print-detail">{model.detail}</p>
        {model.countLabel ? <p className="print-detail">{model.countLabel}</p> : null}
        <p className="print-note">{model.note}</p>
        <p className="print-note">{labels.footerNote}</p>
        <p className="print-legend">
          <span className="tick-box" aria-hidden="true" />
          <span>{labels.number}</span>
          <span>{labels.name}</span>
          <span>{labels.rarity}</span>
        </p>
      </header>
      <div className="checklist-actions print-hide">
        <PrintButton label={labels.print} />
        <a className="button" href={localePath(locale, checklistPdfPath(model.kind, model.id, "a4"))}>
          {labels.downloadA4}
        </a>
        <a className="button quiet" href={localePath(locale, checklistPdfPath(model.kind, model.id, "letter"))}>
          {labels.downloadLetter}
        </a>
      </div>
      <ol className="print-list">
        {model.blocks.flatMap((block, blockIndex) => {
          const rows = block.lines.map((item) => {
            line += 1;
            const rarity = item.rarity || labels.missingRarity;
            return (
              <li className="print-row" key={`${blockIndex}-${item.number}-${line}`}>
                <span className="tick-box" aria-hidden="true" />
                <span className="print-num">{item.number}</span>
                <span className="print-name">{item.name}</span>
                <span className="print-rarity">{rarity}</span>
              </li>
            );
          });
          if (!block.heading) return rows;
          return [
            <li className="print-head" key={`head-${blockIndex}`}>
              {block.heading}
            </li>,
            ...rows,
          ];
        })}
      </ol>
      <footer className="print-footer">
        <span>{site.name}</span>
        <span>{site.url}</span>
      </footer>
    </article>
  );
}
