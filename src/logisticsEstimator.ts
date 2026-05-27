import { SkuInput } from "./domain";
import { getMarketPreset } from "./markets";

export interface LogisticsEstimate {
  marketCode: string;
  serviceLevel: "economy" | "standard" | "express" | "warehouse";
  chargeableWeightKg: number;
  volumeCbm: number;
  internationalCost: number;
  fulfillmentCost: number;
  storageMonthlyCost: number;
  totalFirstUnitCost: number;
  source: string;
  warning: string;
}

interface LogisticsRateTemplate {
  marketCode: string;
  serviceLevel: LogisticsEstimate["serviceLevel"];
  label: string;
  baseCost: number;
  perKg: number;
  minCost: number;
  fulfillmentBase: number;
  fulfillmentPerKg: number;
  storagePerCbmMonth: number;
  leadTime: string;
}

export const logisticsRateTemplates: LogisticsRateTemplate[] = [
  {
    marketCode: "US",
    serviceLevel: "standard",
    label: "美国标准小包/专线 + 本地履约",
    baseCost: 2.2,
    perKg: 7.5,
    minCost: 4.2,
    fulfillmentBase: 3.2,
    fulfillmentPerKg: 1.8,
    storagePerCbmMonth: 58,
    leadTime: "7-15 天"
  },
  {
    marketCode: "US",
    serviceLevel: "express",
    label: "美国快线/商业快递",
    baseCost: 8,
    perKg: 14,
    minCost: 10,
    fulfillmentBase: 3.8,
    fulfillmentPerKg: 2.2,
    storagePerCbmMonth: 65,
    leadTime: "3-7 天"
  },
  {
    marketCode: "EU",
    serviceLevel: "standard",
    label: "欧盟标准专线 + 本地履约",
    baseCost: 2.8,
    perKg: 8.2,
    minCost: 4.8,
    fulfillmentBase: 3.4,
    fulfillmentPerKg: 1.9,
    storagePerCbmMonth: 52,
    leadTime: "8-16 天"
  },
  {
    marketCode: "UK",
    serviceLevel: "standard",
    label: "英国标准专线 + 本地履约",
    baseCost: 2.5,
    perKg: 7.8,
    minCost: 4.4,
    fulfillmentBase: 3,
    fulfillmentPerKg: 1.7,
    storagePerCbmMonth: 48,
    leadTime: "7-14 天"
  },
  {
    marketCode: "CA",
    serviceLevel: "standard",
    label: "加拿大标准专线 + 本地履约",
    baseCost: 3.5,
    perKg: 9.5,
    minCost: 6.2,
    fulfillmentBase: 4,
    fulfillmentPerKg: 2.1,
    storagePerCbmMonth: 62,
    leadTime: "8-16 天"
  },
  {
    marketCode: "AU",
    serviceLevel: "standard",
    label: "澳大利亚标准专线 + 本地履约",
    baseCost: 3.2,
    perKg: 8.8,
    minCost: 5.8,
    fulfillmentBase: 3.8,
    fulfillmentPerKg: 2,
    storagePerCbmMonth: 58,
    leadTime: "7-15 天"
  },
  {
    marketCode: "BR",
    serviceLevel: "standard",
    label: "巴西跨境专线/本地履约",
    baseCost: 18,
    perKg: 26,
    minCost: 28,
    fulfillmentBase: 18,
    fulfillmentPerKg: 7,
    storagePerCbmMonth: 210,
    leadTime: "12-25 天"
  },
  {
    marketCode: "MX",
    serviceLevel: "standard",
    label: "墨西哥专线/本地履约",
    baseCost: 42,
    perKg: 64,
    minCost: 72,
    fulfillmentBase: 48,
    fulfillmentPerKg: 18,
    storagePerCbmMonth: 760,
    leadTime: "8-18 天"
  },
  {
    marketCode: "AE",
    serviceLevel: "standard",
    label: "阿联酋专线/本地履约",
    baseCost: 12,
    perKg: 20,
    minCost: 20,
    fulfillmentBase: 13,
    fulfillmentPerKg: 4,
    storagePerCbmMonth: 145,
    leadTime: "6-12 天"
  },
  {
    marketCode: "SA",
    serviceLevel: "standard",
    label: "沙特专线/本地履约",
    baseCost: 13,
    perKg: 22,
    minCost: 22,
    fulfillmentBase: 14,
    fulfillmentPerKg: 4.5,
    storagePerCbmMonth: 155,
    leadTime: "7-14 天"
  },
  {
    marketCode: "ZA",
    serviceLevel: "standard",
    label: "南非专线/本地履约",
    baseCost: 56,
    perKg: 82,
    minCost: 95,
    fulfillmentBase: 52,
    fulfillmentPerKg: 21,
    storagePerCbmMonth: 880,
    leadTime: "10-22 天"
  }
];

export function estimateLogisticsForSku(
  sku: SkuInput,
  marketCode: string,
  serviceLevel: LogisticsEstimate["serviceLevel"] = "standard"
): LogisticsEstimate {
  const market = getMarketPreset(marketCode);
  const template =
    logisticsRateTemplates.find((item) => item.marketCode === marketCode && item.serviceLevel === serviceLevel) ??
    logisticsRateTemplates.find((item) => item.marketCode === marketCode) ??
    logisticsRateTemplates[0];
  const volumeCbm = Math.max(0.0001, (sku.lengthCm * sku.widthCm * sku.heightCm) / 1_000_000);
  const volumetricWeightKg = (sku.lengthCm * sku.widthCm * sku.heightCm) / 6000;
  const chargeableWeightKg = Math.max(sku.weightKg, volumetricWeightKg, 0.05);
  const internationalCost = roundMoney(Math.max(template.minCost, template.baseCost + template.perKg * chargeableWeightKg));
  const fulfillmentCost = roundMoney(template.fulfillmentBase + template.fulfillmentPerKg * chargeableWeightKg);
  const storageMonthlyCost = roundMoney(volumeCbm * template.storagePerCbmMonth);

  return {
    marketCode,
    serviceLevel: template.serviceLevel,
    chargeableWeightKg,
    volumeCbm,
    internationalCost,
    fulfillmentCost,
    storageMonthlyCost,
    totalFirstUnitCost: roundMoney(internationalCost + fulfillmentCost),
    source: `${market.name} ${template.label} 估算模板`,
    warning: `估算按计费重 ${chargeableWeightKg.toFixed(2)} kg、参考时效 ${template.leadTime} 计算。实际报价会随渠道、燃油、偏远地址、旺季、仓点和账号折扣变化。`
  };
}

function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}
