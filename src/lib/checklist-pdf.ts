import { readFileSync } from "node:fs";
import path from "node:path";
import PDFDocument from "pdfkit";
import { unstable_cache } from "next/cache";
import { getChecklist, type ChecklistLine, type ChecklistModel, type Paper } from "@/lib/checklists";
import type { Locale } from "@/lib/locales";
import { site } from "@/lib/site";

const INK = "#1b2430";
const MUTED = "#3e5168";
const FONT_REGULAR = path.join(process.cwd(), "src/assets/fonts/DejaVuSans.ttf");
const FONT_BOLD = path.join(process.cwd(), "src/assets/fonts/DejaVuSans-Bold.ttf");
const FONT_JP = path.join(process.cwd(), "src/assets/fonts/NotoSansJP-Bold.ttf");

const SIZE: Record<Paper, { width: number; height: number }> = {
  a4: { width: 595.28, height: 841.89 },
  letter: { width: 612, height: 792 },
};

const MARGIN_X = 32;
const COL_GAP = 14;
const BOX = 11;
const NUM_W = 42;

let fontBytes: { regular: Buffer; bold: Buffer; jp: Buffer } | null = null;

function fonts() {
  if (!fontBytes) {
    fontBytes = {
      regular: readFileSync(FONT_REGULAR),
      bold: readFileSync(FONT_BOLD),
      jp: readFileSync(FONT_JP),
    };
  }
  return fontBytes;
}

function isKana(code: number): boolean {
  return (code >= 0x30a0 && code <= 0x30ff) || (code >= 0x3040 && code <= 0x309f);
}

type Item = { type: "head"; text: string } | { type: "row"; line: ChecklistLine };

function itemsOf(model: ChecklistModel): Item[] {
  const items: Item[] = [];
  for (const block of model.blocks) {
    if (block.heading) items.push({ type: "head", text: block.heading });
    for (const line of block.lines) items.push({ type: "row", line });
  }
  return items;
}

function drawMixed(doc: PDFKit.PDFDocument, text: string, x: number, y: number, width: number): number {
  const kana = [...text].some((char) => isKana(char.codePointAt(0) ?? 0));
  doc.fillColor(INK).fontSize(8.5);
  if (!kana) {
    doc.font("bold");
    const height = doc.heightOfString(text, { width });
    doc.text(text, x, y, { width, height: height + 0.5, lineGap: 0 });
    return height;
  }
  let cursor = x;
  let buffer = "";
  let useJp = false;
  const flush = () => {
    if (!buffer) return;
    doc.font(useJp ? "jp" : "bold").fontSize(8.5);
    doc.text(buffer, cursor, y, { lineBreak: false });
    cursor += doc.widthOfString(buffer);
    buffer = "";
  };
  for (const char of text) {
    const next = isKana(char.codePointAt(0) ?? 0);
    if (buffer && next !== useJp) flush();
    useJp = next;
    buffer += char;
  }
  flush();
  return 11;
}

export function renderChecklistPdf(model: ChecklistModel, paper: Paper, compress = true): Promise<Buffer> {
  const face = fonts();
  const page = SIZE[paper];
  const colW = (page.width - MARGIN_X * 2 - COL_GAP) / 2;
  const nameX = BOX + 4 + NUM_W;
  const nameW = colW - nameX;
  const bottom = page.height - 40;

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      compress,
      autoFirstPage: false,
      bufferPages: true,
      size: [page.width, page.height],
      margin: 0,
      info: {
        Title: model.title,
        Author: site.sender,
        Creator: site.name,
      },
    });
    const chunks: Buffer[] = [];
    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);
    doc.registerFont("regular", face.regular);
    doc.registerFont("bold", face.bold);
    doc.registerFont("jp", face.jp);

    let contentTop = 0;
    let y = 0;
    let col = 0;

    const columnX = () => MARGIN_X + col * (colW + COL_GAP);

    const rule = (fromX: number, toX: number, at: number, width: number, color: string) => {
      doc.save();
      doc.lineWidth(width).strokeColor(color).moveTo(fromX, at).lineTo(toX, at).stroke();
      doc.restore();
    };

    const drawRunning = () => {
      doc.font("bold").fontSize(9).fillColor(INK);
      doc.text(model.title, MARGIN_X, 20, { width: page.width - MARGIN_X * 2, lineBreak: false, ellipsis: true });
      rule(MARGIN_X, page.width - MARGIN_X, 34, 0.6, "#d5e3ef");
      return 42;
    };

    const drawIntro = () => {
      doc.font("bold").fontSize(15).fillColor(INK);
      doc.text(model.title, MARGIN_X, 26, { width: page.width - MARGIN_X * 2, lineGap: 1 });
      let cursor = doc.y + 2;
      doc.font("regular").fontSize(8.5).fillColor(MUTED);
      for (const paragraph of [model.detail, model.countLabel, model.note, model.labels.footerNote]) {
        if (!paragraph) continue;
        doc.text(paragraph, MARGIN_X, cursor, { width: page.width - MARGIN_X * 2, lineGap: 0 });
        cursor = doc.y + 1;
      }
      cursor += 3;
      doc.font("bold").fontSize(7).fillColor(MUTED);
      doc.text(`${model.labels.tick}   ${model.labels.number}   ${model.labels.name}   ${model.labels.rarity}`, MARGIN_X, cursor, {
        width: page.width - MARGIN_X * 2,
        lineBreak: false,
      });
      cursor = doc.y + 4;
      rule(MARGIN_X, page.width - MARGIN_X, cursor, 1, INK);
      return cursor + 8;
    };

    const newPage = (intro: boolean) => {
      doc.addPage({ size: [page.width, page.height], margin: 0 });
      contentTop = intro ? drawIntro() : drawRunning();
      col = 0;
      y = contentTop;
    };

    const advance = () => {
      if (col === 0) {
        col = 1;
        y = contentTop;
        return;
      }
      newPage(false);
    };

    const rowHeight = (line: ChecklistLine) => {
      doc.font("bold").fontSize(8.5);
      const nameH = Math.max(10, doc.heightOfString(line.name, { width: nameW, lineGap: 0 }));
      doc.font("regular").fontSize(7);
      const rarityText = line.rarity || model.labels.missingRarity;
      const rarityH = doc.heightOfString(rarityText, { width: nameW, lineGap: 0 });
      return Math.max(BOX + 2, nameH + rarityH + 1) + 4;
    };

    newPage(true);
    const items = itemsOf(model);
    for (let index = 0; index < items.length; index += 1) {
      const item = items[index];
      if (!item) continue;
      if (item.type === "head") {
        const height = 16;
        const next = items[index + 1];
        const follow = next?.type === "row" ? rowHeight(next.line) : 0;
        if (y + height + follow > bottom) advance();
        const x = columnX();
        doc.font("bold").fontSize(8).fillColor(INK);
        doc.text(item.text, x, y + 2, { width: colW, height: 11, lineBreak: false, ellipsis: true });
        rule(x, x + colW, y + 13, 0.8, INK);
        y += height;
        continue;
      }
      const height = rowHeight(item.line);
      if (y + height > bottom) advance();
      const x = columnX();
      doc.save();
      doc.lineWidth(1.1).strokeColor(INK).rect(x, y + 1, BOX, BOX).stroke();
      doc.restore();
      doc.font("bold").fontSize(8).fillColor(INK);
      doc.text(item.line.number, x + BOX + 4, y, { width: NUM_W, height: 11, lineBreak: false, ellipsis: true });
      const nameH = drawMixed(doc, item.line.name, x + nameX, y, nameW);
      doc.font("regular").fontSize(7).fillColor(MUTED);
      const rarityText = item.line.rarity || model.labels.missingRarity;
      doc.text(rarityText, x + nameX, y + nameH, { width: nameW, lineGap: 0 });
      y += height;
    }

    const range = doc.bufferedPageRange();
    for (let index = 0; index < range.count; index += 1) {
      doc.switchToPage(range.start + index);
      const footerY = page.height - 26;
      rule(MARGIN_X, page.width - MARGIN_X, footerY, 0.7, INK);
      doc.font("bold").fontSize(8).fillColor(INK);
      doc.text(site.name, MARGIN_X, footerY + 6, { lineBreak: false });
      const brandW = doc.widthOfString(site.name);
      doc.font("regular").fontSize(8).fillColor(MUTED);
      doc.text(`   ${site.url}`, MARGIN_X + brandW, footerY + 6, { lineBreak: false });
      const pageLabel = `${index + 1} / ${range.count}`;
      const pageW = doc.widthOfString(pageLabel);
      doc.text(pageLabel, page.width - MARGIN_X - pageW, footerY + 6, { lineBreak: false });
    }
    doc.end();
  });
}

const cachedPdf = unstable_cache(
  async (locale: string, kind: string, id: string, paper: string) => {
    const model = getChecklist(locale, kind, id);
    if (!model) return "";
    const pdf = await renderChecklistPdf(model, paper as Paper);
    return pdf.toString("base64");
  },
  ["checklist-pdf-v1"],
  { revalidate: 60 * 60 * 24 * 7 },
);

export async function checklistPdf(locale: Locale, kind: string, id: string, paper: Paper): Promise<Buffer | null> {
  if (!getChecklist(locale, kind, id)) return null;
  const encoded = await cachedPdf(locale, kind, id, paper);
  if (!encoded) return null;
  return Buffer.from(encoded, "base64");
}
