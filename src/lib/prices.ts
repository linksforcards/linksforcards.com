export type PriceCard = {
  number?: string;
  tcgplayer?: {
    updatedAt?: string;
    prices?: Record<string, { market?: number | null } | undefined>;
  };
  cardmarket?: {
    updatedAt?: string;
    prices?: Record<string, number | null | undefined>;
  };
};

export type PriceEstimate = {
  tcgCents: number | null;
  cmCents: number | null;
  tcgAsOf: string | null;
  cmAsOf: string | null;
  note: string;
};

export function toCents(amount: number): number {
  if (!Number.isFinite(amount) || amount <= 0 || amount >= 100_000) return 0;
  return Math.round((amount + Number.EPSILON) * 100);
}

export function normalizeAsOf(value?: string | null): string | null {
  if (!value) return null;
  const match = /^(\d{4})[/-](\d{2})[/-](\d{2})/.exec(value);
  if (!match) return null;
  return `${match[1]}-${match[2]}-${match[3]}`;
}

function positive(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) && value > 0 && value < 100_000 ? value : null;
}

export function extractEstimates(card: PriceCard): PriceEstimate {
  const markets: { variant: string; market: number }[] = [];
  for (const [variant, row] of Object.entries(card.tcgplayer?.prices ?? {})) {
    const market = positive(row?.market);
    if (market != null) markets.push({ variant, market });
  }
  markets.sort((a, b) => a.market - b.market);
  const tcg = markets[0];

  const cm = card.cardmarket?.prices ?? {};
  const trend = positive(cm.trendPrice);
  const reverse = positive(cm.reverseHoloTrend);
  let cmAmount: number | null = null;
  let cmKey = "";
  if (trend != null || reverse != null) {
    const options = [trend, reverse].filter((value): value is number => value != null);
    cmAmount = Math.min(...options);
    cmKey = cmAmount === reverse && reverse != null && (trend == null || reverse < trend) ? "reverseHoloTrend" : "trendPrice";
  } else if (positive(cm.avg7) != null) {
    cmAmount = positive(cm.avg7);
    cmKey = "avg7";
  } else if (positive(cm.averageSellPrice) != null) {
    cmAmount = positive(cm.averageSellPrice);
    cmKey = "averageSellPrice";
  }

  const notes: string[] = [];
  if (tcg) notes.push(`TCGplayer market, lowest printing (${tcg.variant})`);
  if (cmAmount != null) notes.push(`Cardmarket ${cmKey}`);
  if (!notes.length) notes.push("No positive price in the response");

  return {
    tcgCents: tcg ? toCents(tcg.market) || null : null,
    cmCents: cmAmount != null ? toCents(cmAmount) || null : null,
    tcgAsOf: normalizeAsOf(card.tcgplayer?.updatedAt),
    cmAsOf: normalizeAsOf(card.cardmarket?.updatedAt),
    note: notes.join("; "),
  };
}

type ApiPage = {
  data?: PriceCard[];
  totalCount?: number;
  page?: number;
  pageSize?: number;
};

async function fetchPage(url: string, attempt = 1): Promise<ApiPage> {
  const headers: Record<string, string> = {
    Accept: "application/json",
    "User-Agent": "linksforcards.com",
  };
  const apiKey = process.env.POKEMON_TCG_API_KEY;
  if (apiKey) headers["X-Api-Key"] = apiKey;
  const response = await fetch(url, { headers, signal: AbortSignal.timeout(20_000), cache: "no-store" });
  if ((response.status === 429 || response.status >= 500) && attempt < 4) {
    const retryAfter = Number(response.headers.get("retry-after"));
    const wait = Number.isFinite(retryAfter) && retryAfter > 0 ? retryAfter * 1000 : attempt * 700;
    await new Promise((resolve) => setTimeout(resolve, wait));
    return fetchPage(url, attempt + 1);
  }
  if (!response.ok) throw new Error(`Price request failed (${response.status})`);
  return (await response.json()) as ApiPage;
}

export async function fetchSetPriceCards(setId: string): Promise<PriceCard[]> {
  if (!/^[a-z0-9]+$/.test(setId)) throw new Error("Unknown set");
  const cards: PriceCard[] = [];
  let page = 1;
  let total = Infinity;
  while ((page - 1) * 250 < total && page < 20) {
    const query = encodeURIComponent(`set.id:${setId}`);
    const url = `https://api.pokemontcg.io/v2/cards?q=${query}&pageSize=250&page=${page}&orderBy=number&select=number,tcgplayer,cardmarket`;
    const payload = await fetchPage(url);
    const batch = payload.data ?? [];
    total = payload.totalCount ?? batch.length;
    cards.push(...batch);
    if (!batch.length) break;
    page += 1;
    if ((page - 1) * 250 < total) await new Promise((resolve) => setTimeout(resolve, 150));
  }
  return cards;
}
