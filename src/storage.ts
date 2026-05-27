import { defaultParameters, hydrateSku, Parameters, sampleSku, SkuInput } from "./domain";
import { getMarketPreset } from "./markets";

const STORAGE_KEY = "import-profit-radar-state-v1";

export interface PersistedState {
  parameters: Parameters;
  skus: SkuInput[];
  selectedSkuId: string;
}

export function loadState(): PersistedState {
  const fallback: PersistedState = {
    parameters: defaultParameters,
    skus: [sampleSku],
    selectedSkuId: sampleSku.id
  };

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as Partial<PersistedState>;
    const parameters = { ...defaultParameters, ...parsed.parameters };
    const market = getMarketPreset(parameters.marketCode);
    parameters.settlementCurrency = parameters.settlementCurrency || market.currencyCode;
    parameters.currencySymbol = parameters.currencySymbol || market.currencySymbol;
    parameters.exchangeRate = parameters.exchangeRate || market.defaultExchangeRate;
    parameters.defaultVatRate = parameters.defaultVatRate ?? market.defaultVatRate;
    const skus =
      Array.isArray(parsed.skus) && parsed.skus.length > 0
        ? parsed.skus.map((sku) =>
            hydrateSku(
              {
                ...sku,
                htsCode: sku.htsCode || (sku.sku === "CN-US-DEMO-001" ? "4202.92.91.00" : "")
              },
              parameters
            )
          )
        : fallback.skus;
    return {
      parameters,
      skus,
      selectedSkuId: parsed.selectedSkuId || skus[0].id
    };
  } catch {
    return fallback;
  }
}

export function saveState(state: PersistedState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}
