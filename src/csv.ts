import { hydrateSku, Parameters, SkuInput, SkuResult } from "./domain";
import { getMarketPreset } from "./markets";

const csvHeaders = [
  "sku",
  "name",
  "htsCode",
  "purchaseCostCny",
  "salePriceUsd",
  "weightKg",
  "lengthCm",
  "widthCm",
  "heightCm",
  "tariffRate",
  "section301Rate",
  "antiDumpingRate",
  "otherDutyRate",
  "vatRate",
  "logisticsCostUsd",
  "platformFeeRate",
  "fbaFeeUsd",
  "storageCostMonthlyUsd",
  "adRate",
  "returnRate",
  "packagingQcCny",
  "domesticFreightCny"
];

export function parseSkuCsv(content: string, parameters: Parameters): SkuInput[] {
  const market = getMarketPreset(parameters.marketCode);
  const rows = parseRows(content).filter((row) => row.some((cell) => cell.trim().length > 0));
  if (rows.length < 2) return [];
  const headers = rows[0].map(normalizeHeader);
  return rows.slice(1).map((row) => {
    const record = new Map<string, string>();
    headers.forEach((header, index) => record.set(header, row[index] ?? ""));
    return hydrateSku(
      {
        sku: getText(record, ["sku", "SKU"]),
        name: getText(record, ["name", "product", "title"]),
        htsCode: getText(record, ["htscode", "hts", "hs", "hscode", "海关编码"]),
        purchaseCostCny: getNumber(record, ["purchasecostcny", "purchase_cny", "采购价", "采购价cny"]),
        salePriceUsd: getNumber(record, ["salepriceusd", "price_usd", "售价", "售价usd"]),
        weightKg: getNumber(record, ["weightkg", "weight_kg", "重量kg"]),
        lengthCm: getNumber(record, ["lengthcm", "length_cm", "长cm"]),
        widthCm: getNumber(record, ["widthcm", "width_cm", "宽cm"]),
        heightCm: getNumber(record, ["heightcm", "height_cm", "高cm"]),
        tariffRate: percentToRate(getNumber(record, ["tariffrate", "tariff", "关税率"])),
        section301Rate:
          percentToRate(getNumber(record, ["section301rate", "section301", "301", "对华附加税"])) ??
          market.defaultSpecialDutyRate,
        antiDumpingRate:
          percentToRate(getNumber(record, ["antidumpingrate", "adcvd", "ad_cvd", "反倾销", "反补贴"])) ??
          market.defaultTradeRemedyRate,
        otherDutyRate:
          percentToRate(getNumber(record, ["otherdutyrate", "otherduty", "附加税", "其他附加税"])) ?? market.defaultOtherDutyRate,
        vatRate: percentToRate(getNumber(record, ["vatrate", "vat", "gst", "consumptiontax", "消费税率", "增值税率"])),
        logisticsCostUsd: getNumber(record, ["logisticscostusd", "logistics_usd", "物流费usd"]),
        platformFeeRate: percentToRate(getNumber(record, ["platformfeerate", "platform_fee", "平台费率"])),
        fbaFeeUsd: getNumber(record, ["fbafeeusd", "fba_fee", "fba费"]),
        storageCostMonthlyUsd: getNumber(record, ["storagecostmonthlyusd", "storage_monthly", "仓储费", "月仓储费"]),
        adRate: percentToRate(getNumber(record, ["adrate", "ad_rate", "广告费率"])),
        returnRate: percentToRate(getNumber(record, ["returnrate", "return_rate", "退货率"])),
        packagingQcCny: getNumber(record, ["packagingqccny", "packaging_cny", "包装质检cny"]),
        domesticFreightCny: getNumber(record, ["domesticfreightcny", "domestic_cny", "国内头程cny"])
      },
      parameters
    );
  });
}

export function exportResultsCsv(results: SkuResult[]): string {
  const headers = [
    ...csvHeaders,
    "landedCostUsd",
    "totalCostUsd",
    "netProfitUsd",
    "tariffUsd",
    "section301Usd",
    "antiDumpingUsd",
    "otherDutyUsd",
    "vatUsd",
    "netMargin",
    "roi",
    "breakEvenPriceUsd",
    "maxPurchaseCostCny",
    "maxLogisticsCostUsd",
    "maxTariffRate",
    "riskScore",
    "riskLevel",
    "grade"
  ];
  const rows = results.map((item) =>
    headers.map((key) => {
      const value = item[key as keyof SkuResult];
      return typeof value === "number" ? Number(value.toFixed(4)) : value;
    })
  );
  return stringifyRows([headers, ...rows]);
}

export function downloadText(filename: string, content: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

function parseRows(content: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let inQuotes = false;

  for (let index = 0; index < content.length; index += 1) {
    const char = content[index];
    const next = content[index + 1];
    if (char === '"' && inQuotes && next === '"') {
      cell += '"';
      index += 1;
    } else if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      row.push(cell);
      cell = "";
    } else if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && next === "\n") index += 1;
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
    } else {
      cell += char;
    }
  }

  row.push(cell);
  rows.push(row);
  return rows;
}

function stringifyRows(rows: unknown[][]): string {
  return rows
    .map((row) =>
      row
        .map((value) => {
          const text = String(value ?? "");
          return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
        })
        .join(",")
    )
    .join("\n");
}

function normalizeHeader(header: string): string {
  return header.trim().toLowerCase().replace(/[\s_-]/g, "");
}

function getText(record: Map<string, string>, keys: string[]): string | undefined {
  for (const key of keys.map(normalizeHeader)) {
    const value = record.get(key);
    if (value && value.trim()) return value.trim();
  }
  return undefined;
}

function getNumber(record: Map<string, string>, keys: string[]): number | undefined {
  const text = getText(record, keys);
  if (!text) return undefined;
  const normalized = text.replace("%", "").replace(/[$¥￥,]/g, "").trim();
  const value = Number(normalized);
  return Number.isFinite(value) ? value : undefined;
}

function percentToRate(value: number | undefined): number | undefined {
  if (value === undefined) return undefined;
  return value > 1 ? value / 100 : value;
}
