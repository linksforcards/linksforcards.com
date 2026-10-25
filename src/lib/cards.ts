export function numbersMatch(catalogNumber: string, input: string): boolean {
  if (catalogNumber.toLowerCase() === input.toLowerCase()) return true;
  if (!/^\d+$/.test(catalogNumber) || !/^\d+$/.test(input)) return false;
  return String(Number(catalogNumber)) === String(Number(input));
}

export function parseDex(value: string | null | undefined): number[] {
  if (!value) return [];
  return value
    .split(",")
    .map((part) => Number(part))
    .filter((part) => Number.isInteger(part) && part > 0);
}

export function formatDexList(values: number[]): string {
  return [...new Set(values)].filter((value) => value > 0).sort((a, b) => a - b).join(",");
}

export type BulkItem = { number: string; quantity: number };
export type BulkError = { line: number; raw: string; reason: string };

const SINGLE = /^([A-Za-z0-9!?]+)(?:\s*[x*,]\s*(\d+))?$/;
const RANGE = /^(\d+)\s*-\s*(\d+)(?:\s*[x*,]\s*(\d+))?$/;

function validQty(quantity: number): boolean {
  return Number.isInteger(quantity) && quantity >= 1 && quantity <= 999;
}

export function parseBulk(text: string): { items: BulkItem[]; errors: BulkError[] } {
  const errors: BulkError[] = [];
  const totals = new Map<string, number>();
  const lines = text.split(/\r?\n/);
  for (let index = 0; index < lines.length; index += 1) {
    const raw = lines[index].trim();
    if (!raw || raw.startsWith("#")) continue;
    const line = index + 1;
    const range = RANGE.exec(raw);
    if (range) {
      const start = Number(range[1]);
      const end = Number(range[2]);
      const quantity = range[3] ? Number(range[3]) : 1;
      if (!validQty(quantity)) {
        errors.push({ line, raw, reason: "Quantity must be from 1 to 999." });
        continue;
      }
      if (end < start || end - start > 150) {
        errors.push({ line, raw, reason: "That range is empty or longer than 151 numbers." });
        continue;
      }
      for (let number = start; number <= end; number += 1) {
        const key = String(number);
        totals.set(key, (totals.get(key) ?? 0) + quantity);
      }
      continue;
    }
    const single = SINGLE.exec(raw);
    if (!single) {
      errors.push({
        line,
        raw,
        reason: "Use a card number, optionally with a quantity: 4, 4 x3, or 12-20.",
      });
      continue;
    }
    const quantity = single[2] ? Number(single[2]) : 1;
    if (!validQty(quantity)) {
      errors.push({ line, raw, reason: "Quantity must be from 1 to 999." });
      continue;
    }
    totals.set(single[1], (totals.get(single[1]) ?? 0) + quantity);
  }
  if (totals.size > 2000) {
    errors.push({ line: 0, raw: "", reason: "That is more than 2000 different numbers in one shipment." });
    return { items: [], errors };
  }
  return {
    items: [...totals.entries()].map(([number, quantity]) => ({ number, quantity })),
    errors,
  };
}
