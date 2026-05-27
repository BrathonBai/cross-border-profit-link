export type LogisticsService = "小包专线" | "国际快递" | "头程货代" | "海外仓" | "3PL履约" | "退货处理" | "报价/面单工具";

export interface LogisticsProvider {
  name: string;
  region: string;
  headquarters: string;
  services: LogisticsService[];
  markets: string[];
  bestFor: string;
  note: string;
  website: string;
  pricingUrl?: string;
}

export const logisticsProviders: LogisticsProvider[] = [
  {
    name: "4PX 递四方",
    region: "中国出海",
    headquarters: "中国深圳",
    services: ["小包专线", "海外仓", "3PL履约", "退货处理"],
    markets: ["美国", "欧洲", "英国", "加拿大", "澳大利亚"],
    bestFor: "中国卖家跨境小包、海外仓和多平台履约。",
    note: "适合从中国发货或先备货到海外仓的卖家，需按目的国和时效询价。",
    website: "https://en.4px.com/",
    pricingUrl: "https://en.4px.com/"
  },
  {
    name: "万邑通 WINIT",
    region: "中国出海",
    headquarters: "中国上海",
    services: ["海外仓", "3PL履约", "退货处理"],
    markets: ["美国", "加拿大", "英国", "德国", "澳大利亚"],
    bestFor: "已有稳定销量、需要海外仓备货和本地履约的卖家。",
    note: "海外仓网络较适合测算本地派送、仓储和退货成本。",
    website: "https://www.winit.com/en",
    pricingUrl: "https://www.winit.com/en"
  },
  {
    name: "谷仓 GoodCang",
    region: "中国出海",
    headquarters: "中国深圳",
    services: ["海外仓", "3PL履约", "退货处理"],
    markets: ["美国", "欧洲", "英国", "澳大利亚"],
    bestFor: "多平台跨境卖家的海外仓和一件代发。",
    note: "适合作为海外仓备选渠道，具体仓点和价格需询价确认。",
    website: "https://www.goodcang.com/",
    pricingUrl: "https://www.goodcang.com/"
  },
  {
    name: "云途 YunExpress",
    region: "中国出海",
    headquarters: "中国深圳",
    services: ["小包专线", "国际快递"],
    markets: ["美国", "欧洲", "英国", "加拿大", "澳大利亚", "中东"],
    bestFor: "轻小件、DTC 小包和平台订单跨境配送。",
    note: "适合和邮政/商业快递做时效与妥投率对比。",
    website: "https://www.yunexpress.com/",
    pricingUrl: "https://www.yunexpress.com/"
  },
  {
    name: "CNE Express",
    region: "中国出海",
    headquarters: "中国上海",
    services: ["小包专线", "国际快递"],
    markets: ["美国", "欧洲", "英国", "加拿大", "澳大利亚"],
    bestFor: "跨境电商小包、专线和 FBM 物流。",
    note: "适合轻小件和平台自发货场景，需核对尾程承运商。",
    website: "https://www.cne.com/en",
    pricingUrl: "https://www.cne.com/en"
  },
  {
    name: "DHL eCommerce / Fulfillment",
    region: "全球",
    headquarters: "德国",
    services: ["国际快递", "海外仓", "3PL履约"],
    markets: ["欧洲", "美国", "亚洲", "澳大利亚", "非洲"],
    bestFor: "跨境包裹、全球履约网络和品牌型卖家。",
    note: "适合对服务稳定性要求高的卖家，价格通常需商务报价。",
    website: "https://www.dhl.com/global-en/home/our-divisions/ecommerce.html",
    pricingUrl: "https://www.dhl.com/global-en/home/get-a-quote.html"
  },
  {
    name: "UPS",
    region: "全球",
    headquarters: "美国",
    services: ["国际快递", "头程货代", "3PL履约"],
    markets: ["美国", "欧洲", "加拿大", "拉美", "亚太"],
    bestFor: "商业快递、B2B/B2C 配送和高价值商品。",
    note: "适合高时效订单和清关能力要求较高的货物。",
    website: "https://www.ups.com/",
    pricingUrl: "https://wwwapps.ups.com/ctc/request"
  },
  {
    name: "FedEx",
    region: "全球",
    headquarters: "美国",
    services: ["国际快递", "头程货代"],
    markets: ["美国", "欧洲", "加拿大", "拉美", "中东", "亚太"],
    bestFor: "高时效国际快递和样品、小批量补货。",
    note: "适合用于高客单价、紧急补货或样品寄送测算。",
    website: "https://www.fedex.com/",
    pricingUrl: "https://www.fedex.com/en-us/online/rating.html"
  },
  {
    name: "Flexport",
    region: "全球",
    headquarters: "美国",
    services: ["头程货代", "海外仓", "3PL履约", "报价/面单工具"],
    markets: ["美国", "欧洲", "加拿大", "亚太"],
    bestFor: "需要头程、清关、库存可视化和电商履约一体化的卖家。",
    note: "适合中大型卖家或准备规模化补货的项目。",
    website: "https://www.flexport.com/products/ecommerce-fulfillment/",
    pricingUrl: "https://www.flexport.com/request-a-demo/"
  },
  {
    name: "Maersk",
    region: "全球",
    headquarters: "丹麦",
    services: ["头程货代", "海外仓", "3PL履约"],
    markets: ["欧洲", "美国", "拉美", "中东", "非洲", "亚太"],
    bestFor: "海运头程、端到端供应链和大货补货。",
    note: "更适合货量较稳定、需要海运和仓配组合的卖家。",
    website: "https://www.maersk.com/",
    pricingUrl: "https://www.maersk.com/book"
  },
  {
    name: "ShipBob",
    region: "北美/全球",
    headquarters: "美国",
    services: ["海外仓", "3PL履约", "退货处理"],
    markets: ["美国", "加拿大", "英国", "欧洲", "澳大利亚"],
    bestFor: "Shopify/DTC 品牌的海外仓和订单履约。",
    note: "适合独立站卖家评估海外本地履约成本。",
    website: "https://www.shipbob.com/",
    pricingUrl: "https://www.shipbob.com/pricing/"
  },
  {
    name: "ShipMonk",
    region: "北美/欧洲",
    headquarters: "美国",
    services: ["海外仓", "3PL履约", "退货处理"],
    markets: ["美国", "加拿大", "欧洲", "英国"],
    bestFor: "DTC 品牌、电商订阅盒和多渠道履约。",
    note: "适合需要和 Shopify、Amazon、Walmart 等渠道对接的卖家。",
    website: "https://www.shipmonk.com/",
    pricingUrl: "https://www.shipmonk.com/pricing"
  },
  {
    name: "Easyship",
    region: "全球",
    headquarters: "香港/新加坡",
    services: ["报价/面单工具", "国际快递", "小包专线"],
    markets: ["美国", "欧洲", "加拿大", "澳大利亚", "亚洲"],
    bestFor: "比较多承运商运费、生成面单和测试跨境小包方案。",
    note: "适合早期卖家做物流价格比较和多渠道发货。",
    website: "https://www.easyship.com/",
    pricingUrl: "https://www.easyship.com/rates"
  },
  {
    name: "Amazon MCF / FBA",
    region: "平台履约",
    headquarters: "美国",
    services: ["海外仓", "3PL履约", "退货处理"],
    markets: ["美国", "加拿大", "英国", "欧洲", "澳大利亚", "中东"],
    bestFor: "Amazon 卖家或想用 Amazon 库存履约其他渠道的卖家。",
    note: "适合平台内履约，需注意仓储、长期仓储和多渠道配送费用。",
    website: "https://sell.amazon.com/fulfillment-by-amazon",
    pricingUrl: "https://sell.amazon.com/fulfillment-by-amazon/pricing"
  },
  {
    name: "SF International 顺丰国际",
    region: "中国出海",
    headquarters: "中国深圳",
    services: ["国际快递", "头程货代", "小包专线"],
    markets: ["亚洲", "美国", "欧洲", "澳大利亚"],
    bestFor: "样品、商业快递和部分跨境电商线路。",
    note: "适合需要中文服务和较强国内揽收网络的卖家。",
    website: "https://intl.sf-express.com/",
    pricingUrl: "https://intl.sf-express.com/"
  }
];

export const logisticsServiceOptions: LogisticsService[] = [
  "小包专线",
  "国际快递",
  "头程货代",
  "海外仓",
  "3PL履约",
  "退货处理",
  "报价/面单工具"
];
