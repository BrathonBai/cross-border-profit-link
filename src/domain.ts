export type RecommendationGrade = "A" | "B" | "C" | "D";

export type RiskLevel = "low" | "medium" | "high";

export interface Parameters {
  marketCode: string;
  settlementCurrency: string;
  currencySymbol: string;
  exchangeRate: number;
  exchangeRateUpdatedAt?: string;
  exchangeRateSource?: string;
  defaultTariffRate: number;
  defaultVatRate: number;
  defaultPlatformFeeRate: number;
  defaultAdRate: number;
  defaultReturnRate: number;
  defaultLogisticsCost: number;
  defaultFbaFee: number;
  paymentFeeRate: number;
  returnLossRate: number;
  complianceCostPerUnit: number;
  exchangeLossRate: number;
}

export interface SkuInput {
  id: string;
  sku: string;
  name: string;
  htsCode: string;
  tariffSource?: string;
  tariffDescription?: string;
  tariffUpdatedAt?: string;
  tariffWarning?: string;
  logisticsSource?: string;
  logisticsWarning?: string;
  storageCostMonthlyUsd: number;
  purchaseCostCny: number;
  salePriceUsd: number;
  weightKg: number;
  lengthCm: number;
  widthCm: number;
  heightCm: number;
  tariffRate: number;
  section301Rate: number;
  antiDumpingRate: number;
  otherDutyRate: number;
  vatRate: number;
  logisticsCostUsd: number;
  platformFeeRate: number;
  fbaFeeUsd: number;
  adRate: number;
  returnRate: number;
  packagingQcCny: number;
  domesticFreightCny: number;
}

export interface SkuResult extends SkuInput {
  purchaseCostUsd: number;
  packagingQcUsd: number;
  domesticFreightUsd: number;
  landedCostUsd: number;
  totalCostUsd: number;
  platformFeeUsd: number;
  paymentFeeUsd: number;
  adCostUsd: number;
  returnLossUsd: number;
  tariffUsd: number;
  section301Usd: number;
  antiDumpingUsd: number;
  otherDutyUsd: number;
  vatUsd: number;
  complianceUsd: number;
  exchangeLossUsd: number;
  netProfitUsd: number;
  netMargin: number;
  roi: number;
  breakEvenPriceUsd: number;
  maxPurchaseCostCny: number;
  maxLogisticsCostUsd: number;
  maxTariffRate: number;
  exchangeSensitivity: number;
  logisticsSensitivity: number;
  tariffSensitivity: number;
  adSensitivity: number;
  riskScore: number;
  riskLevel: RiskLevel;
  grade: RecommendationGrade;
  stillProfitable: {
    exchangeMinus5: boolean;
    exchangePlus5: boolean;
    logisticsPlus20: boolean;
    tariffPlus10: boolean;
    adPlus10: boolean;
  };
}

export const defaultParameters: Parameters = {
  marketCode: "US",
  settlementCurrency: "USD",
  currencySymbol: "$",
  exchangeRate: 6.78,
  defaultTariffRate: 0.12,
  defaultVatRate: 0,
  defaultPlatformFeeRate: 0.15,
  defaultAdRate: 0.12,
  defaultReturnRate: 0.06,
  defaultLogisticsCost: 5,
  defaultFbaFee: 4.5,
  paymentFeeRate: 0.029,
  returnLossRate: 0.5,
  complianceCostPerUnit: 0.35,
  exchangeLossRate: 0.01
};

export const sampleSku: SkuInput = {
  id: crypto.randomUUID(),
  sku: "CN-US-DEMO-001",
  name: "Foldable travel organizer",
  htsCode: "4202.92.91.00",
  tariffSource: "Manual default",
  tariffDescription: "",
  tariffUpdatedAt: "",
  tariffWarning: "",
  logisticsSource: "",
  logisticsWarning: "",
  storageCostMonthlyUsd: 0,
  purchaseCostCny: 38,
  salePriceUsd: 24.99,
  weightKg: 0.38,
  lengthCm: 28,
  widthCm: 18,
  heightCm: 5,
  tariffRate: defaultParameters.defaultTariffRate,
  section301Rate: 0.25,
  antiDumpingRate: 0,
  otherDutyRate: 0,
  vatRate: defaultParameters.defaultVatRate,
  logisticsCostUsd: defaultParameters.defaultLogisticsCost,
  platformFeeRate: defaultParameters.defaultPlatformFeeRate,
  fbaFeeUsd: defaultParameters.defaultFbaFee,
  adRate: defaultParameters.defaultAdRate,
  returnRate: defaultParameters.defaultReturnRate,
  packagingQcCny: 2,
  domesticFreightCny: 1.5
};

export function hydrateSku(partial: Partial<SkuInput>, parameters: Parameters): SkuInput {
  return {
    id: partial.id || crypto.randomUUID(),
    sku: partial.sku || "NEW-SKU",
    name: partial.name || "Untitled product",
    htsCode: partial.htsCode || "",
    tariffSource: partial.tariffSource || "",
    tariffDescription: partial.tariffDescription || "",
    tariffUpdatedAt: partial.tariffUpdatedAt || "",
    tariffWarning: partial.tariffWarning || "",
    logisticsSource: partial.logisticsSource || "",
    logisticsWarning: partial.logisticsWarning || "",
    storageCostMonthlyUsd: finiteOr(partial.storageCostMonthlyUsd, 0),
    purchaseCostCny: finiteOr(partial.purchaseCostCny, 0),
    salePriceUsd: finiteOr(partial.salePriceUsd, 0),
    weightKg: finiteOr(partial.weightKg, 0),
    lengthCm: finiteOr(partial.lengthCm, 0),
    widthCm: finiteOr(partial.widthCm, 0),
    heightCm: finiteOr(partial.heightCm, 0),
    tariffRate: finiteOr(partial.tariffRate, parameters.defaultTariffRate),
    section301Rate: finiteOr(partial.section301Rate, 0),
    antiDumpingRate: finiteOr(partial.antiDumpingRate, 0),
    otherDutyRate: finiteOr(partial.otherDutyRate, 0),
    vatRate: finiteOr(partial.vatRate, parameters.defaultVatRate),
    logisticsCostUsd: finiteOr(partial.logisticsCostUsd, parameters.defaultLogisticsCost),
    platformFeeRate: finiteOr(partial.platformFeeRate, parameters.defaultPlatformFeeRate),
    fbaFeeUsd: finiteOr(partial.fbaFeeUsd, parameters.defaultFbaFee),
    adRate: finiteOr(partial.adRate, parameters.defaultAdRate),
    returnRate: finiteOr(partial.returnRate, parameters.defaultReturnRate),
    packagingQcCny: finiteOr(partial.packagingQcCny, 0),
    domesticFreightCny: finiteOr(partial.domesticFreightCny, 0)
  };
}

export function calculateSku(input: SkuInput, parameters: Parameters): SkuResult {
  const purchaseCostUsd = cnyToUsd(input.purchaseCostCny, parameters.exchangeRate);
  const packagingQcUsd = cnyToUsd(input.packagingQcCny, parameters.exchangeRate);
  const domesticFreightUsd = cnyToUsd(input.domesticFreightCny, parameters.exchangeRate);
  const productBaseUsd = purchaseCostUsd + packagingQcUsd + domesticFreightUsd;
  const tariffUsd = productBaseUsd * input.tariffRate;
  const section301Usd = productBaseUsd * input.section301Rate;
  const antiDumpingUsd = productBaseUsd * input.antiDumpingRate;
  const otherDutyUsd = productBaseUsd * input.otherDutyRate;
  const totalDutyUsd = tariffUsd + section301Usd + antiDumpingUsd + otherDutyUsd;
  const vatUsd = (productBaseUsd + input.logisticsCostUsd + totalDutyUsd) * input.vatRate;
  const platformFeeUsd = input.salePriceUsd * input.platformFeeRate;
  const paymentFeeUsd = input.salePriceUsd * parameters.paymentFeeRate;
  const adCostUsd = input.salePriceUsd * input.adRate;
  const returnLossUsd = input.salePriceUsd * input.returnRate * parameters.returnLossRate;
  const complianceUsd = parameters.complianceCostPerUnit;
  const exchangeLossUsd = productBaseUsd * parameters.exchangeLossRate;
  const landedCostUsd = productBaseUsd + input.logisticsCostUsd + totalDutyUsd;
  const totalCostUsd =
    landedCostUsd +
    vatUsd +
    input.fbaFeeUsd +
    platformFeeUsd +
    paymentFeeUsd +
    adCostUsd +
    returnLossUsd +
    complianceUsd +
    exchangeLossUsd;
  const netProfitUsd = input.salePriceUsd - totalCostUsd;
  const variableRate =
    input.platformFeeRate +
    parameters.paymentFeeRate +
    input.adRate +
    input.returnRate * parameters.returnLossRate;
  const fixedCostUsd =
    productBaseUsd +
    input.logisticsCostUsd +
    totalDutyUsd +
    vatUsd +
    input.fbaFeeUsd +
    complianceUsd +
    exchangeLossUsd;
  const breakEvenPriceUsd = variableRate < 0.95 ? fixedCostUsd / (1 - variableRate) : Infinity;
  const margin = safeDivide(netProfitUsd, input.salePriceUsd);
  const roi = safeDivide(netProfitUsd, productBaseUsd + input.logisticsCostUsd + tariffUsd);
  const totalDutyRate = input.tariffRate + input.section301Rate + input.antiDumpingRate + input.otherDutyRate;
  const maxPurchaseCostUsd = Math.max(
    0,
    (input.salePriceUsd * (1 - variableRate) -
      input.fbaFeeUsd -
      input.logisticsCostUsd -
      complianceUsd -
      packagingQcUsd -
      domesticFreightUsd) /
      (1 + totalDutyRate + input.vatRate * (1 + totalDutyRate) + parameters.exchangeLossRate)
  );
  const maxPurchaseCostCny = maxPurchaseCostUsd * parameters.exchangeRate;
  const maxLogisticsCostUsd = Math.max(0, input.logisticsCostUsd + netProfitUsd);
  const maxTariffRate = productBaseUsd > 0 ? Math.max(0, totalDutyRate + netProfitUsd / productBaseUsd) : 0;
  const baseline = netProfitUsd;
  const exchangeDown = calculateNetProfitOnly(input, { ...parameters, exchangeRate: parameters.exchangeRate * 0.95 });
  const exchangeUp = calculateNetProfitOnly(input, { ...parameters, exchangeRate: parameters.exchangeRate * 1.05 });
  const logisticsUp = calculateNetProfitOnly({ ...input, logisticsCostUsd: input.logisticsCostUsd * 1.2 }, parameters);
  const tariffUp = calculateNetProfitOnly({ ...input, tariffRate: input.tariffRate * 1.1 }, parameters);
  const adUp = calculateNetProfitOnly({ ...input, adRate: input.adRate * 1.1 }, parameters);
  const exchangeSensitivity = Math.max(Math.abs(baseline - exchangeDown), Math.abs(baseline - exchangeUp));
  const logisticsSensitivity = Math.abs(baseline - logisticsUp);
  const tariffSensitivity = Math.abs(baseline - tariffUp);
  const adSensitivity = Math.abs(baseline - adUp);
  const riskScore = scoreRisk({
    margin,
    roi,
    tariffRate: input.tariffRate,
    extraDutyRate: input.section301Rate + input.antiDumpingRate + input.otherDutyRate,
    adRate: input.adRate,
    returnRate: input.returnRate,
    netProfitUsd,
    exchangeDown,
    exchangeUp,
    logisticsUp,
    tariffUp,
    adUp
  });
  const riskLevel: RiskLevel = riskScore < 35 ? "low" : riskScore < 65 ? "medium" : "high";
  const grade = gradeSku(margin, roi, riskScore, netProfitUsd);

  return {
    ...input,
    purchaseCostUsd,
    packagingQcUsd,
    domesticFreightUsd,
    landedCostUsd,
    totalCostUsd,
    platformFeeUsd,
    paymentFeeUsd,
    adCostUsd,
    returnLossUsd,
    tariffUsd,
    section301Usd,
    antiDumpingUsd,
    otherDutyUsd,
    vatUsd,
    complianceUsd,
    exchangeLossUsd,
    netProfitUsd,
    netMargin: margin,
    roi,
    breakEvenPriceUsd,
    maxPurchaseCostCny,
    maxLogisticsCostUsd,
    maxTariffRate,
    exchangeSensitivity,
    logisticsSensitivity,
    tariffSensitivity,
    adSensitivity,
    riskScore,
    riskLevel,
    grade,
    stillProfitable: {
      exchangeMinus5: exchangeDown > 0,
      exchangePlus5: exchangeUp > 0,
      logisticsPlus20: logisticsUp > 0,
      tariffPlus10: tariffUp > 0,
      adPlus10: adUp > 0
    }
  };
}

function calculateNetProfitOnly(input: SkuInput, parameters: Parameters): number {
  const purchaseCostUsd = cnyToUsd(input.purchaseCostCny, parameters.exchangeRate);
  const packagingQcUsd = cnyToUsd(input.packagingQcCny, parameters.exchangeRate);
  const domesticFreightUsd = cnyToUsd(input.domesticFreightCny, parameters.exchangeRate);
  const productBaseUsd = purchaseCostUsd + packagingQcUsd + domesticFreightUsd;
  const tariffUsd = productBaseUsd * input.tariffRate;
  const section301Usd = productBaseUsd * input.section301Rate;
  const antiDumpingUsd = productBaseUsd * input.antiDumpingRate;
  const otherDutyUsd = productBaseUsd * input.otherDutyRate;
  const totalDutyUsd = tariffUsd + section301Usd + antiDumpingUsd + otherDutyUsd;
  const vatUsd = (productBaseUsd + input.logisticsCostUsd + totalDutyUsd) * input.vatRate;
  const totalCost =
    productBaseUsd +
    totalDutyUsd +
    vatUsd +
    input.logisticsCostUsd +
    input.fbaFeeUsd +
    input.salePriceUsd * input.platformFeeRate +
    input.salePriceUsd * parameters.paymentFeeRate +
    input.salePriceUsd * input.adRate +
    input.salePriceUsd * input.returnRate * parameters.returnLossRate +
    parameters.complianceCostPerUnit +
    productBaseUsd * parameters.exchangeLossRate;
  return input.salePriceUsd - totalCost;
}

function cnyToUsd(value: number, exchangeRate: number): number {
  return exchangeRate > 0 ? value / exchangeRate : 0;
}

function scoreRisk(input: {
  margin: number;
  roi: number;
  tariffRate: number;
  extraDutyRate: number;
  adRate: number;
  returnRate: number;
  netProfitUsd: number;
  exchangeDown: number;
  exchangeUp: number;
  logisticsUp: number;
  tariffUp: number;
  adUp: number;
}): number {
  let score = 10;
  if (input.netProfitUsd <= 0) score += 55;
  if (input.margin < 0.08) score += 20;
  else if (input.margin < 0.16) score += 12;
  if (input.roi < 0.15) score += 15;
  else if (input.roi < 0.35) score += 8;
  if (input.tariffRate > 0.25) score += 14;
  else if (input.tariffRate > 0.15) score += 8;
  if (input.extraDutyRate > 0.25) score += 22;
  else if (input.extraDutyRate > 0.1) score += 12;
  if (input.adRate > 0.18) score += 10;
  else if (input.adRate > 0.12) score += 5;
  if (input.returnRate > 0.12) score += 10;
  else if (input.returnRate > 0.08) score += 5;
  [input.exchangeDown, input.exchangeUp, input.logisticsUp, input.tariffUp, input.adUp].forEach((profit) => {
    if (profit <= 0) score += 7;
  });
  return clamp(score, 0, 100);
}

function gradeSku(margin: number, roi: number, riskScore: number, profit: number): RecommendationGrade {
  if (profit <= 0 || margin < 0.03 || riskScore >= 75) return "D";
  if (margin >= 0.22 && roi >= 0.55 && riskScore < 35) return "A";
  if (margin >= 0.12 && roi >= 0.3 && riskScore < 60) return "B";
  return "C";
}

function safeDivide(numerator: number, denominator: number): number {
  return denominator > 0 ? numerator / denominator : 0;
}

function finiteOr(value: unknown, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
