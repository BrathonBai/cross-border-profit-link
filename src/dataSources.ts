import { Parameters, SkuInput } from "./domain";

export interface ExchangeRateUpdate {
  baseCurrency: string;
  quoteCurrency: string;
  exchangeRate: number;
  date: string;
  source: string;
}

export interface TariffLookupResult {
  htsCode: string;
  description: string;
  generalRate: string;
  parsedRate: number | null;
  suggestedSection301Rate: number | null;
  chapter99Codes: string[];
  source: string;
  updatedAt: string;
  warning: string;
}

interface FrankfurterResponse {
  date: string;
  rates: Record<string, number | undefined>;
}

interface OpenExchangeResponse {
  result: string;
  time_last_update_utc?: string;
  rates: Record<string, number | undefined>;
}

interface HtsSearchResult {
  htsno?: string;
  description?: string;
  general?: string;
  footnotes?: Array<{ value?: string; columns?: string[] }>;
}

export async function fetchCnyToCurrencyExchangeRate(currencyCode: string): Promise<ExchangeRateUpdate> {
  const quoteCurrency = currencyCode.toUpperCase();
  try {
    const response = await fetch(`https://api.frankfurter.dev/v1/latest?base=${quoteCurrency}&symbols=CNY`);
    if (!response.ok) {
      throw new Error(`Exchange rate request failed: ${response.status}`);
    }
    const data = (await response.json()) as FrankfurterResponse;
    const rate = data.rates.CNY;
    if (!rate || !Number.isFinite(rate)) {
      throw new Error(`Exchange rate response did not include CNY for ${quoteCurrency}.`);
    }
    return {
      baseCurrency: quoteCurrency,
      quoteCurrency: "CNY",
      exchangeRate: rate,
      date: data.date,
      source: "Frankfurter daily reference rates"
    };
  } catch {
    return fetchFallbackExchangeRate(quoteCurrency);
  }
}

async function fetchFallbackExchangeRate(currencyCode: string): Promise<ExchangeRateUpdate> {
  const response = await fetch(`https://open.er-api.com/v6/latest/${currencyCode}`);
  if (!response.ok) {
    throw new Error(`Fallback exchange rate request failed: ${response.status}`);
  }
  const data = (await response.json()) as OpenExchangeResponse;
  const rate = data.rates.CNY;
  if (data.result !== "success" || !rate || !Number.isFinite(rate)) {
    throw new Error(`Exchange rate response did not include CNY for ${currencyCode}.`);
  }
  return {
    baseCurrency: currencyCode,
    quoteCurrency: "CNY",
    exchangeRate: rate,
    date: data.time_last_update_utc || new Date().toISOString(),
    source: "open.er-api.com free exchange rates"
  };
}

export async function lookupUsTariff(htsCode: string): Promise<TariffLookupResult> {
  const normalized = (htsCode || "").trim();
  if (!normalized) {
    throw new Error("请先填写 HTS code，例如 4202.92.91.00。");
  }

  const response = await fetchWithProxyFallback(
    `https://hts.usitc.gov/reststop/search?keyword=${encodeURIComponent(normalized)}`,
    `/api/usitc/reststop/search?keyword=${encodeURIComponent(normalized)}`
  );
  if (!response.ok) {
    throw new Error(`USITC HTS request failed: ${response.status}`);
  }

  const rows = (await response.json()) as HtsSearchResult[];
  const exact = rows.find((row) => compact(row.htsno) === compact(normalized));
  const candidate = exact ?? rows.find((row) => row.htsno && !row.htsno.startsWith("99")) ?? rows[0];
  if (!candidate?.htsno) {
    throw new Error("No HTS match found.");
  }

  const generalRate = candidate.general || "";
  const parsedRate = parseAdValoremRate(generalRate);
  const footnotes = candidate.footnotes?.map((note) => note.value || "").filter(Boolean) ?? [];
  const chapter99Codes = extractChapter99Codes(footnotes.join(" "));
  const suggestedSection301Rate = suggestSection301Rate(chapter99Codes);
  const warningParts = [
    parsedRate === null ? `General rate "${generalRate || "N/A"}" could not be converted into a simple percentage.` : "",
    footnotes.length > 0 ? `Footnote: ${footnotes.join(" ")}` : "",
    suggestedSection301Rate !== null
      ? `Potential Section 301 additional duty detected from ${chapter99Codes.join(", ")}. Suggested placeholder: ${(suggestedSection301Rate * 100).toFixed(1)}%.`
      : "",
    "Section 301, AD/CVD, quotas, exclusions and product-specific notes may add duties. Verify with a customs broker before buying inventory."
  ].filter(Boolean);

  return {
    htsCode: candidate.htsno,
    description: candidate.description || "",
    generalRate,
    parsedRate,
    suggestedSection301Rate,
    chapter99Codes,
    source: "USITC HTS REST API",
    updatedAt: new Date().toISOString(),
    warning: warningParts.join(" ")
  };
}

export function applyExchangeRateUpdate(parameters: Parameters, update: ExchangeRateUpdate): Parameters {
  return {
    ...parameters,
    exchangeRate: update.exchangeRate,
    exchangeRateUpdatedAt: update.date,
    exchangeRateSource: update.source
  };
}

export function applyTariffLookup(sku: SkuInput, lookup: TariffLookupResult): SkuInput {
  return {
    ...sku,
    htsCode: lookup.htsCode,
    tariffRate: lookup.parsedRate ?? sku.tariffRate,
    section301Rate: lookup.suggestedSection301Rate ?? sku.section301Rate,
    tariffSource: lookup.source,
    tariffDescription: lookup.description,
    tariffUpdatedAt: lookup.updatedAt,
    tariffWarning: lookup.warning
  };
}

function parseAdValoremRate(value: string): number | null {
  const percentMatch = value.match(/(\d+(?:\.\d+)?)\s*%/);
  if (percentMatch) return Number(percentMatch[1]) / 100;
  if (/free/i.test(value)) return 0;
  return null;
}

function compact(value = ""): string {
  return value.replace(/\D/g, "");
}

function extractChapter99Codes(value: string): string[] {
  const matches = value.match(/9903\.\d{2}\.\d{2}/g) ?? [];
  return Array.from(new Set(matches));
}

function suggestSection301Rate(codes: string[]): number | null {
  if (codes.length === 0) return null;
  if (codes.some((code) => ["9903.88.01", "9903.88.02", "9903.88.03"].includes(code))) return 0.25;
  if (codes.some((code) => ["9903.88.04", "9903.88.15"].includes(code))) return 0.075;
  return null;
}

async function fetchWithProxyFallback(primaryUrl: string, proxyUrl: string): Promise<Response> {
  try {
    return await fetch(primaryUrl);
  } catch {
    return fetch(proxyUrl);
  }
}
