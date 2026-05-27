export type MarketRegion = "North America" | "Europe" | "South America" | "Oceania" | "Middle East" | "Africa";

export interface MarketPreset {
  code: string;
  name: string;
  region: MarketRegion;
  currencyCode: string;
  currencySymbol: string;
  defaultExchangeRate: number;
  marketplaceLabel: string;
  tariffCodeLabel: string;
  tariffLookup: "usitc" | "manual";
  defaultTariffRate: number;
  defaultSpecialDutyRate: number;
  defaultTradeRemedyRate: number;
  defaultOtherDutyRate: number;
  defaultVatRate: number;
  defaultPlatformFeeRate: number;
  defaultAdRate: number;
  defaultReturnRate: number;
  defaultLogisticsCost: number;
  defaultFulfillmentFee: number;
  complianceCostPerUnit: number;
  dutyLabels: {
    base: string;
    special: string;
    tradeRemedy: string;
    other: string;
    vat: string;
  };
  checklist: string[];
  note: string;
  resources: Array<{
    label: string;
    description: string;
    url: string;
  }>;
}

export const marketPresets: MarketPreset[] = [
  {
    code: "US",
    name: "美国",
    region: "North America",
    currencyCode: "USD",
    currencySymbol: "$",
    defaultExchangeRate: 6.78,
    marketplaceLabel: "Amazon FBA",
    tariffCodeLabel: "HTS Code",
    tariffLookup: "usitc",
    defaultTariffRate: 0.12,
    defaultSpecialDutyRate: 0.25,
    defaultTradeRemedyRate: 0,
    defaultOtherDutyRate: 0,
    defaultVatRate: 0,
    defaultPlatformFeeRate: 0.15,
    defaultAdRate: 0.12,
    defaultReturnRate: 0.06,
    defaultLogisticsCost: 5,
    defaultFulfillmentFee: 4.5,
    complianceCostPerUnit: 0.35,
    dutyLabels: {
      base: "基础关税",
      special: "Section 301 / 对华附加税",
      tradeRemedy: "AD/CVD 反倾销/反补贴",
      other: "其他 Chapter 99 / 附加税",
      vat: "销售税/进口税预留"
    },
    checklist: ["基础 HTS 税率", "Section 301 / Chapter 99", "AD/CVD", "FDA/FCC/CPSC 等品类合规", "Amazon FBA/Referral fee"],
    note: "可查询 USITC 基础关税；Section 301、AD/CVD 等需额外确认。",
    resources: [
      {
        label: "USITC HTS",
        description: "查询美国 HTS 编码与基础关税。",
        url: "https://hts.usitc.gov/"
      },
      {
        label: "CBP AD/CVD",
        description: "查询美国反倾销/反补贴风险。",
        url: "https://www.cbp.gov/trade/priority-issues/adcvd"
      },
      {
        label: "Amazon US fees",
        description: "查看 Amazon referral / FBA 费用说明。",
        url: "https://sell.amazon.com/fulfillment-by-amazon/pricing"
      }
    ]
  },
  {
    code: "EU",
    name: "欧盟",
    region: "Europe",
    currencyCode: "EUR",
    currencySymbol: "€",
    defaultExchangeRate: 7.9,
    marketplaceLabel: "Amazon EU / DTC",
    tariffCodeLabel: "CN/TARIC Code",
    tariffLookup: "manual",
    defaultTariffRate: 0.06,
    defaultSpecialDutyRate: 0,
    defaultTradeRemedyRate: 0,
    defaultOtherDutyRate: 0,
    defaultVatRate: 0.2,
    defaultPlatformFeeRate: 0.15,
    defaultAdRate: 0.12,
    defaultReturnRate: 0.08,
    defaultLogisticsCost: 5.2,
    defaultFulfillmentFee: 4.8,
    complianceCostPerUnit: 0.55,
    dutyLabels: {
      base: "TARIC 基础关税",
      special: "贸易救济 / 额外措施",
      tradeRemedy: "反倾销/反补贴",
      other: "配额/监管附加成本",
      vat: "VAT"
    },
    checklist: ["TARIC 税率", "VAT/IOSS/EORI", "反倾销/反补贴", "CE/REACH/电池等合规", "欧盟履约与退货成本"],
    note: "VAT、EORI、IOSS、CE/REACH 等会显著影响利润；关税建议用 TARIC 参数包确认。",
    resources: [
      {
        label: "EU TARIC",
        description: "查询欧盟 TARIC 关税与监管措施。",
        url: "https://ec.europa.eu/taxation_customs/dds2/taric/taric_consultation.jsp"
      },
      {
        label: "EU VAT rules",
        description: "查看欧盟 VAT 基本规则与跨境电商说明。",
        url: "https://taxation-customs.ec.europa.eu/vat_en"
      },
      {
        label: "Amazon Europe fees",
        description: "查看欧洲站销售与履约费用。",
        url: "https://sell.amazon.de/fulfillment-by-amazon"
      }
    ]
  },
  {
    code: "UK",
    name: "英国",
    region: "Europe",
    currencyCode: "GBP",
    currencySymbol: "£",
    defaultExchangeRate: 9.1,
    marketplaceLabel: "Amazon UK / DTC",
    tariffCodeLabel: "UK Commodity Code",
    tariffLookup: "manual",
    defaultTariffRate: 0.05,
    defaultSpecialDutyRate: 0,
    defaultTradeRemedyRate: 0,
    defaultOtherDutyRate: 0,
    defaultVatRate: 0.2,
    defaultPlatformFeeRate: 0.15,
    defaultAdRate: 0.12,
    defaultReturnRate: 0.08,
    defaultLogisticsCost: 4.8,
    defaultFulfillmentFee: 4.4,
    complianceCostPerUnit: 0.5,
    dutyLabels: {
      base: "UK 基础关税",
      special: "贸易救济 / 额外措施",
      tradeRemedy: "反倾销/反补贴",
      other: "UKCA/清关附加成本",
      vat: "VAT"
    },
    checklist: ["UK Trade Tariff", "VAT", "UKCA/品类合规", "Trade remedies", "英国本地履约费"],
    note: "英国 VAT、UKCA、进口申报和平台代扣规则需单独校验。",
    resources: [
      {
        label: "UK Trade Tariff",
        description: "查询英国商品编码、关税和进口措施。",
        url: "https://www.trade-tariff.service.gov.uk/"
      },
      {
        label: "UK VAT",
        description: "查看英国 VAT 规则。",
        url: "https://www.gov.uk/topic/business-tax/vat"
      },
      {
        label: "Amazon UK fees",
        description: "查看英国站销售和履约费用。",
        url: "https://sell.amazon.co.uk/fulfilment-by-amazon"
      }
    ]
  },
  {
    code: "CA",
    name: "加拿大",
    region: "North America",
    currencyCode: "CAD",
    currencySymbol: "C$",
    defaultExchangeRate: 4.9,
    marketplaceLabel: "Amazon CA / DTC",
    tariffCodeLabel: "HS Code",
    tariffLookup: "manual",
    defaultTariffRate: 0.08,
    defaultSpecialDutyRate: 0,
    defaultTradeRemedyRate: 0,
    defaultOtherDutyRate: 0,
    defaultVatRate: 0.13,
    defaultPlatformFeeRate: 0.15,
    defaultAdRate: 0.11,
    defaultReturnRate: 0.06,
    defaultLogisticsCost: 6.5,
    defaultFulfillmentFee: 5.2,
    complianceCostPerUnit: 0.45,
    dutyLabels: {
      base: "加拿大基础关税",
      special: "SIMA 特别措施",
      tradeRemedy: "反倾销/反补贴",
      other: "省份/清关附加成本",
      vat: "GST/HST"
    },
    checklist: ["加拿大 Customs Tariff", "GST/HST", "SIMA 反倾销/反补贴", "省份差异", "Amazon CA 费用"],
    note: "GST/HST 因省份和销售模式不同；关税需按加拿大海关规则确认。",
    resources: [
      {
        label: "Canada Customs Tariff",
        description: "查询加拿大海关税则。",
        url: "https://www.cbsa-asfc.gc.ca/trade-commerce/tariff-tarif/menu-eng.html"
      },
      {
        label: "Canada GST/HST",
        description: "查看 GST/HST 税务规则。",
        url: "https://www.canada.ca/en/revenue-agency/services/tax/businesses/topics/gst-hst-businesses.html"
      },
      {
        label: "Amazon CA fees",
        description: "查看加拿大站销售与履约费用。",
        url: "https://sell.amazon.ca/fulfillment-by-amazon"
      }
    ]
  },
  {
    code: "AU",
    name: "澳大利亚",
    region: "Oceania",
    currencyCode: "AUD",
    currencySymbol: "A$",
    defaultExchangeRate: 4.84,
    marketplaceLabel: "Amazon AU / DTC",
    tariffCodeLabel: "HS Code",
    tariffLookup: "manual",
    defaultTariffRate: 0.05,
    defaultSpecialDutyRate: 0,
    defaultTradeRemedyRate: 0,
    defaultOtherDutyRate: 0.02,
    defaultVatRate: 0.1,
    defaultPlatformFeeRate: 0.15,
    defaultAdRate: 0.1,
    defaultReturnRate: 0.05,
    defaultLogisticsCost: 6.2,
    defaultFulfillmentFee: 5.1,
    complianceCostPerUnit: 0.45,
    dutyLabels: {
      base: "澳洲基础关税",
      special: "保障措施/额外关税",
      tradeRemedy: "反倾销/反补贴",
      other: "Biosecurity/RCM 成本",
      vat: "GST"
    },
    checklist: ["澳洲 Tariff", "GST", "Biosecurity", "RCM/电气认证", "反倾销/反补贴"],
    note: "GST、Biosecurity、RCM 等合规要求需按品类确认。",
    resources: [
      {
        label: "Australia tariff",
        description: "查询澳大利亚关税分类。",
        url: "https://www.abf.gov.au/importing-exporting-and-manufacturing/tariff-classification"
      },
      {
        label: "Australia GST",
        description: "查看澳大利亚 GST 规则。",
        url: "https://www.ato.gov.au/businesses-and-organisations/gst-excise-and-indirect-taxes/gst"
      },
      {
        label: "Amazon AU fees",
        description: "查看澳洲站销售与履约费用。",
        url: "https://sell.amazon.com.au/fulfilment-by-amazon"
      }
    ]
  },
  {
    code: "BR",
    name: "巴西",
    region: "South America",
    currencyCode: "BRL",
    currencySymbol: "R$",
    defaultExchangeRate: 1.34,
    marketplaceLabel: "Mercado Livre / DTC",
    tariffCodeLabel: "NCM Code",
    tariffLookup: "manual",
    defaultTariffRate: 0.22,
    defaultSpecialDutyRate: 0.08,
    defaultTradeRemedyRate: 0.0925,
    defaultOtherDutyRate: 0.18,
    defaultVatRate: 0.18,
    defaultPlatformFeeRate: 0.16,
    defaultAdRate: 0.13,
    defaultReturnRate: 0.08,
    defaultLogisticsCost: 38,
    defaultFulfillmentFee: 28,
    complianceCostPerUnit: 3,
    dutyLabels: {
      base: "II 进口税",
      special: "IPI 工业产品税",
      tradeRemedy: "PIS/COFINS",
      other: "ICMS/州税",
      vat: "其他流转税预留"
    },
    checklist: ["NCM 分类", "II/IPI/PIS/COFINS", "ICMS 州税", "本地税务/清关代理", "Mercado Livre 费用"],
    note: "巴西税制复杂，ICMS/IPI/PIS/COFINS 等通常需要本地税务参数包。",
    resources: [
      {
        label: "Brazil NCM",
        description: "查询巴西 NCM 商品分类入口。",
        url: "https://portalunico.siscomex.gov.br/classif/#/sumario"
      },
      {
        label: "Receita Federal",
        description: "巴西联邦税务和进口规则信息。",
        url: "https://www.gov.br/receitafederal/pt-br"
      },
      {
        label: "Mercado Livre fees",
        description: "查看 Mercado Livre 费用与销售规则。",
        url: "https://www.mercadolivre.com.br/ajuda"
      }
    ]
  },
  {
    code: "MX",
    name: "墨西哥",
    region: "North America",
    currencyCode: "MXN",
    currencySymbol: "MX$",
    defaultExchangeRate: 0.39,
    marketplaceLabel: "Amazon MX / Mercado Libre",
    tariffCodeLabel: "HS Code",
    tariffLookup: "manual",
    defaultTariffRate: 0.12,
    defaultSpecialDutyRate: 0.02,
    defaultTradeRemedyRate: 0,
    defaultOtherDutyRate: 0,
    defaultVatRate: 0.16,
    defaultPlatformFeeRate: 0.16,
    defaultAdRate: 0.12,
    defaultReturnRate: 0.07,
    defaultLogisticsCost: 95,
    defaultFulfillmentFee: 65,
    complianceCostPerUnit: 6,
    dutyLabels: {
      base: "墨西哥基础关税",
      special: "NOM 合规/附加成本",
      tradeRemedy: "反倾销/反补贴",
      other: "清关/其他税费",
      vat: "IVA"
    },
    checklist: ["墨西哥税则", "IVA", "NOM 合规", "反倾销风险", "Amazon/Mercado Libre 费用"],
    note: "IVA、NOM 合规和清关模式会影响总成本。",
    resources: [
      {
        label: "Mexico tariff",
        description: "查询墨西哥税则和商品分类入口。",
        url: "https://www.snice.gob.mx/"
      },
      {
        label: "Mexico SAT",
        description: "墨西哥税务局 IVA 等税务信息。",
        url: "https://www.sat.gob.mx/"
      },
      {
        label: "Amazon MX fees",
        description: "查看墨西哥站销售与履约费用。",
        url: "https://vender.amazon.com.mx/fulfillment-by-amazon"
      }
    ]
  },
  {
    code: "AE",
    name: "阿联酋",
    region: "Middle East",
    currencyCode: "AED",
    currencySymbol: "د.إ",
    defaultExchangeRate: 1.85,
    marketplaceLabel: "Amazon AE / Noon",
    tariffCodeLabel: "HS Code",
    tariffLookup: "manual",
    defaultTariffRate: 0.05,
    defaultSpecialDutyRate: 0,
    defaultTradeRemedyRate: 0,
    defaultOtherDutyRate: 0.02,
    defaultVatRate: 0.05,
    defaultPlatformFeeRate: 0.15,
    defaultAdRate: 0.11,
    defaultReturnRate: 0.07,
    defaultLogisticsCost: 24,
    defaultFulfillmentFee: 18,
    complianceCostPerUnit: 2,
    dutyLabels: {
      base: "海湾基础关税",
      special: "GCC/品类附加措施",
      tradeRemedy: "反倾销/反补贴",
      other: "合规/清关附加成本",
      vat: "VAT"
    },
    checklist: ["GCC/阿联酋关税", "VAT", "品类合规", "清关文件", "Amazon AE/Noon 费用"],
    note: "AED 与 USD 基本挂钩；VAT、SABER/GCC 合规需按品类确认。",
    resources: [
      {
        label: "UAE customs",
        description: "查看阿联酋海关与进口相关信息。",
        url: "https://u.ae/en/information-and-services/finance-and-investment/customs"
      },
      {
        label: "UAE VAT",
        description: "查看阿联酋 VAT 规则。",
        url: "https://tax.gov.ae/en/default.aspx"
      },
      {
        label: "Amazon AE fees",
        description: "查看阿联酋站销售与履约费用。",
        url: "https://sell.amazon.ae/fulfillment-by-amazon"
      }
    ]
  },
  {
    code: "SA",
    name: "沙特",
    region: "Middle East",
    currencyCode: "SAR",
    currencySymbol: "ر.س",
    defaultExchangeRate: 1.81,
    marketplaceLabel: "Amazon SA / Noon",
    tariffCodeLabel: "HS Code",
    tariffLookup: "manual",
    defaultTariffRate: 0.08,
    defaultSpecialDutyRate: 0.03,
    defaultTradeRemedyRate: 0,
    defaultOtherDutyRate: 0.02,
    defaultVatRate: 0.15,
    defaultPlatformFeeRate: 0.15,
    defaultAdRate: 0.12,
    defaultReturnRate: 0.08,
    defaultLogisticsCost: 26,
    defaultFulfillmentFee: 19,
    complianceCostPerUnit: 2.5,
    dutyLabels: {
      base: "沙特基础关税",
      special: "SABER/品类附加成本",
      tradeRemedy: "反倾销/反补贴",
      other: "清关/认证附加成本",
      vat: "VAT"
    },
    checklist: ["沙特关税", "VAT", "SABER 认证", "清关文件", "Amazon SA/Noon 费用"],
    note: "SAR 与 USD 基本挂钩；SABER、VAT、清关文件会影响上市速度和成本。",
    resources: [
      {
        label: "Saudi ZATCA",
        description: "查看沙特税务、海关和 VAT 信息。",
        url: "https://zatca.gov.sa/en/Pages/default.aspx"
      },
      {
        label: "SABER",
        description: "查询沙特产品合规认证入口。",
        url: "https://saber.sa/"
      },
      {
        label: "Amazon SA fees",
        description: "查看沙特站销售与履约费用。",
        url: "https://sell.amazon.sa/fulfillment-by-amazon"
      }
    ]
  },
  {
    code: "ZA",
    name: "南非",
    region: "Africa",
    currencyCode: "ZAR",
    currencySymbol: "R",
    defaultExchangeRate: 0.41,
    marketplaceLabel: "Takealot / Amazon ZA",
    tariffCodeLabel: "HS Code",
    tariffLookup: "manual",
    defaultTariffRate: 0.15,
    defaultSpecialDutyRate: 0,
    defaultTradeRemedyRate: 0,
    defaultOtherDutyRate: 0.03,
    defaultVatRate: 0.15,
    defaultPlatformFeeRate: 0.15,
    defaultAdRate: 0.11,
    defaultReturnRate: 0.08,
    defaultLogisticsCost: 115,
    defaultFulfillmentFee: 75,
    complianceCostPerUnit: 8,
    dutyLabels: {
      base: "南非基础关税",
      special: "SARS 特殊措施",
      tradeRemedy: "反倾销/反补贴",
      other: "清关/本地附加成本",
      vat: "VAT"
    },
    checklist: ["南非 Tariff", "VAT", "SARS 清关", "本地认证", "Takealot/Amazon ZA 费用"],
    note: "VAT、SARS 清关和本地履约成本波动较大。",
    resources: [
      {
        label: "South Africa tariff",
        description: "查看南非海关税则和进口规则。",
        url: "https://www.sars.gov.za/customs-and-excise/tariff/"
      },
      {
        label: "South Africa VAT",
        description: "查看南非 VAT 规则。",
        url: "https://www.sars.gov.za/types-of-tax/value-added-tax/"
      },
      {
        label: "Takealot seller portal",
        description: "查看 Takealot 卖家和费用信息入口。",
        url: "https://www.takealot.com/sell"
      }
    ]
  }
];

export function getMarketPreset(code: string): MarketPreset {
  return marketPresets.find((market) => market.code === code) ?? marketPresets[0];
}

export function marketsByRegion(): Array<[MarketRegion, MarketPreset[]]> {
  const regions: MarketRegion[] = ["North America", "Europe", "South America", "Oceania", "Middle East", "Africa"];
  return regions.map((region) => [region, marketPresets.filter((market) => market.region === region)]);
}
