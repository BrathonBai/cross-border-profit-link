import { ChangeEvent, ReactNode, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  BarChart3,
  Download,
  FileUp,
  Gauge,
  HelpCircle,
  PackageSearch,
  Plus,
  Save,
  Settings,
  Trash2
} from "lucide-react";
import { downloadText, exportResultsCsv, parseSkuCsv } from "./csv";
import { applyExchangeRateUpdate, applyTariffLookup, fetchCnyToCurrencyExchangeRate, lookupUsTariff } from "./dataSources";
import { calculateSku, hydrateSku, Parameters, SkuInput, SkuResult } from "./domain";
import { estimateLogisticsForSku } from "./logisticsEstimator";
import { logisticsProviders, logisticsServiceOptions, LogisticsService } from "./logisticsDirectory";
import { getMarketPreset, marketPresets, marketsByRegion } from "./markets";
import { loadState, saveState } from "./storage";

type Tab = "calculator" | "batch" | "settings" | "directory" | "wiki";

const gradeOrder = { A: 0, B: 1, C: 2, D: 3 };

export default function App() {
  const initialState = useMemo(loadState, []);
  const [activeTab, setActiveTab] = useState<Tab>("calculator");
  const [parameters, setParameters] = useState<Parameters>(initialState.parameters);
  const [skus, setSkus] = useState<SkuInput[]>(initialState.skus);
  const [selectedSkuId, setSelectedSkuId] = useState(initialState.selectedSkuId);
  const [importMessage, setImportMessage] = useState("");
  const [dataMessage, setDataMessage] = useState("");
  const [loadingAction, setLoadingAction] = useState<"exchange" | "tariff" | "">("");

  const results = useMemo(
    () =>
      skus
        .map((sku) => calculateSku(hydrateSku(sku, parameters), parameters))
        .sort((a, b) => gradeOrder[a.grade] - gradeOrder[b.grade] || b.netProfitUsd - a.netProfitUsd),
    [skus, parameters]
  );
  const market = getMarketPreset(parameters.marketCode);
  const selectedSku = skus.find((sku) => sku.id === selectedSkuId) ?? skus[0];
  const selectedResult = selectedSku ? calculateSku(hydrateSku(selectedSku, parameters), parameters) : undefined;
  const gradeCounts = results.reduce(
    (memo, result) => {
      memo[result.grade] += 1;
      return memo;
    },
    { A: 0, B: 0, C: 0, D: 0 }
  );

  useEffect(() => {
    if (!skus.some((sku) => sku.id === selectedSkuId) && skus[0]) {
      setSelectedSkuId(skus[0].id);
    }
  }, [selectedSkuId, skus]);

  useEffect(() => {
    saveState({ parameters, skus, selectedSkuId });
  }, [parameters, skus, selectedSkuId]);

  function updateSelected<K extends keyof SkuInput>(key: K, value: SkuInput[K]) {
    setSkus((items) => items.map((item) => (item.id === selectedSkuId ? { ...item, [key]: value } : item)));
  }

  function updateParameter<K extends keyof Parameters>(key: K, value: Parameters[K]) {
    setParameters((current) => ({ ...current, [key]: value }));
  }

  function addSku() {
    const sku = hydrateSku(
      {
        sku: `SKU-${String(skus.length + 1).padStart(3, "0")}`,
        name: "New product",
        salePriceUsd: 19.99,
        purchaseCostCny: 25,
        tariffRate: market.defaultTariffRate,
        section301Rate: market.defaultSpecialDutyRate,
        antiDumpingRate: market.defaultTradeRemedyRate,
        otherDutyRate: market.defaultOtherDutyRate,
        vatRate: market.defaultVatRate
      },
      parameters
    );
    setSkus((items) => [sku, ...items]);
    setSelectedSkuId(sku.id);
    setActiveTab("calculator");
  }

  function removeSku(id: string) {
    if (skus.length <= 1) return;
    setSkus((items) => items.filter((item) => item.id !== id));
  }

  async function updateExchangeRate() {
    setLoadingAction("exchange");
    setDataMessage("");
    try {
      const update = await fetchCnyToCurrencyExchangeRate(parameters.settlementCurrency);
      setParameters((current) => applyExchangeRateUpdate(current, update));
      setDataMessage(`${update.baseCurrency}/CNY 汇率已更新为 ${update.exchangeRate.toFixed(4)}，日期 ${update.date}。`);
    } catch (error) {
      setDataMessage(error instanceof Error ? error.message : "汇率更新失败。");
    } finally {
      setLoadingAction("");
    }
  }

  async function updateSelectedTariff() {
    const sku = skus.find((item) => item.id === selectedSkuId);
    if (!sku) return;
    if (market.tariffLookup !== "usitc") {
      setDataMessage(`${market.name} 暂未接入自动关税库，请先手动录入 ${market.tariffCodeLabel} 和税率，或导入该市场参数包。`);
      return;
    }
    setLoadingAction("tariff");
    setDataMessage("");
    try {
      const lookup = await lookupUsTariff(sku.htsCode);
      setSkus((items) => items.map((item) => (item.id === sku.id ? applyTariffLookup(item, lookup) : item)));
      setDataMessage(
        lookup.parsedRate === null
          ? `已找到 ${lookup.htsCode}，但税率 "${lookup.generalRate}" 需要手动判断。`
          : `已回填 ${lookup.htsCode} 基础关税 ${(lookup.parsedRate * 100).toFixed(2)}%${
              lookup.suggestedSection301Rate ? `，并建议 ${market.dutyLabels.special} ${(lookup.suggestedSection301Rate * 100).toFixed(1)}%` : ""
            }。`
      );
    } catch (error) {
      setDataMessage(error instanceof Error ? error.message : "关税查询失败。");
    } finally {
      setLoadingAction("");
    }
  }

  function applyMarket(code: string) {
    const nextMarket = getMarketPreset(code);
    setParameters((current) => ({
      ...current,
      marketCode: nextMarket.code,
      settlementCurrency: nextMarket.currencyCode,
      currencySymbol: nextMarket.currencySymbol,
      exchangeRate: nextMarket.defaultExchangeRate,
      defaultTariffRate: nextMarket.defaultTariffRate,
      defaultVatRate: nextMarket.defaultVatRate,
      defaultPlatformFeeRate: nextMarket.defaultPlatformFeeRate,
      defaultAdRate: nextMarket.defaultAdRate,
      defaultReturnRate: nextMarket.defaultReturnRate,
      defaultLogisticsCost: nextMarket.defaultLogisticsCost,
      defaultFbaFee: nextMarket.defaultFulfillmentFee,
      complianceCostPerUnit: nextMarket.complianceCostPerUnit,
      exchangeRateUpdatedAt: "",
      exchangeRateSource: ""
    }));
    setSkus((items) =>
      items.map((item) => ({
        ...item,
        tariffRate: nextMarket.defaultTariffRate,
        section301Rate: nextMarket.defaultSpecialDutyRate,
        antiDumpingRate: nextMarket.defaultTradeRemedyRate,
        otherDutyRate: nextMarket.defaultOtherDutyRate,
        vatRate: nextMarket.defaultVatRate,
        logisticsCostUsd: nextMarket.defaultLogisticsCost,
        platformFeeRate: nextMarket.defaultPlatformFeeRate,
        fbaFeeUsd: nextMarket.defaultFulfillmentFee,
        adRate: nextMarket.defaultAdRate,
        returnRate: nextMarket.defaultReturnRate,
        tariffSource: nextMarket.tariffLookup === "usitc" ? item.tariffSource : "Market preset",
        tariffWarning: nextMarket.note
      }))
    );
    setDataMessage(`已切换到${nextMarket.name}市场。请更新 ${nextMarket.currencyCode}/CNY 汇率，并按品类确认税费。`);
  }

  function applyDefaultDutiesToSelected() {
    const currentMarket = getMarketPreset(parameters.marketCode);
    setSkus((items) =>
      items.map((item) =>
        item.id === selectedSkuId
          ? {
              ...item,
              tariffRate: currentMarket.defaultTariffRate,
              section301Rate: currentMarket.defaultSpecialDutyRate,
              antiDumpingRate: currentMarket.defaultTradeRemedyRate,
              otherDutyRate: currentMarket.defaultOtherDutyRate,
              vatRate: currentMarket.defaultVatRate,
              tariffSource: `${currentMarket.name} default duty template`,
              tariffWarning: `已套用${currentMarket.name}默认税费模板；这不是最终报关税率，请按商品编码和页面下方链接核对。`
            }
          : item
      )
    );
    setDataMessage(`已为当前 SKU 套用${currentMarket.name}默认税费模板。`);
  }

  function estimateSelectedLogistics() {
    const sku = skus.find((item) => item.id === selectedSkuId);
    if (!sku) return;
    const estimate = estimateLogisticsForSku(sku, parameters.marketCode);
    setSkus((items) =>
      items.map((item) =>
        item.id === sku.id
          ? {
              ...item,
              logisticsCostUsd: estimate.internationalCost,
              fbaFeeUsd: estimate.fulfillmentCost,
              storageCostMonthlyUsd: estimate.storageMonthlyCost,
              logisticsSource: estimate.source,
              logisticsWarning: estimate.warning
            }
          : item
      )
    );
    setDataMessage(
      `已估算物流：国际物流 ${parameters.currencySymbol}${estimate.internationalCost.toFixed(2)}，履约 ${parameters.currencySymbol}${estimate.fulfillmentCost.toFixed(2)}，计费重 ${estimate.chargeableWeightKg.toFixed(2)} kg。`
    );
  }

  async function importCsv(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    const content = await file.text();
    const imported = parseSkuCsv(content, parameters);
    if (imported.length === 0) {
      setImportMessage("没有识别到可导入的 SKU。请检查表头。");
    } else {
      setSkus((items) => [...imported, ...items]);
      setSelectedSkuId(imported[0].id);
      setImportMessage(`已导入 ${imported.length} 个 SKU。`);
    }
    event.target.value = "";
  }

  function downloadCsvTemplate() {
    const content = [
      "sku,name,htsCode,purchaseCostCny,salePriceUsd,weightKg,lengthCm,widthCm,heightCm,tariffRate,section301Rate,antiDumpingRate,otherDutyRate,vatRate,logisticsCostUsd,platformFeeRate,fbaFeeUsd,storageCostMonthlyUsd,adRate,returnRate,packagingQcCny,domesticFreightCny",
      "CN-DEMO-001,Demo product,4202.92.91.00,38,24.99,0.38,28,18,5,12,25,0,0,0,5.8,15,5.2,0.09,10,5,2,1.5"
    ].join("\n");
    downloadText("跨境利通-SKU导入模板.csv", content, "text/csv;charset=utf-8");
  }

  return (
    <main className="app-shell">
      <aside className="sidebar">
          <div>
          <div className="brand-mark">利通</div>
          <h1>跨境利通</h1>
          <p className="muted">值不值得卖 · 本地优先</p>
        </div>

        <nav className="nav-tabs" aria-label="Primary">
          <button className={activeTab === "calculator" ? "active" : ""} onClick={() => setActiveTab("calculator")}>
            <Gauge size={18} />
            单品计算
          </button>
          <button className={activeTab === "batch" ? "active" : ""} onClick={() => setActiveTab("batch")}>
            <BarChart3 size={18} />
            批量雷达
          </button>
          <button className={activeTab === "settings" ? "active" : ""} onClick={() => setActiveTab("settings")}>
            <Settings size={18} />
            参数包
          </button>
          <button className={activeTab === "directory" ? "active" : ""} onClick={() => setActiveTab("directory")}>
            <PackageSearch size={18} />
            物流仓储
          </button>
          <button className={activeTab === "wiki" ? "active" : ""} onClick={() => setActiveTab("wiki")}>
            <HelpCircle size={18} />
            Wiki
          </button>
        </nav>

        <div className="side-summary">
          <span>SKU</span>
          <strong>{skus.length}</strong>
          <span>A / B / C / D</span>
          <strong>
            {gradeCounts.A}/{gradeCounts.B}/{gradeCounts.C}/{gradeCounts.D}
          </strong>
        </div>
      </aside>

      <section className="workspace">
        <header className="topbar">
          <div>
            <p className="eyebrow">Opportunity screening workspace</p>
            <h2>
              {activeTab === "calculator"
                ? "单品利润计算器"
                : activeTab === "batch"
                  ? "批量 SKU 机会排序"
                  : activeTab === "settings"
                    ? "默认参数配置"
                    : activeTab === "directory"
                      ? "物流仓储黄页"
                      : "跨境术语 Wiki"}
            </h2>
          </div>
          <div className="top-actions">
            <button className="icon-button" onClick={addSku} title="新增 SKU">
              <Plus size={18} />
            </button>
            <button
              className="text-button"
              onClick={() => downloadText("import-profit-radar-results.csv", exportResultsCsv(results), "text/csv;charset=utf-8")}
            >
              <Download size={17} />
              导出 CSV
            </button>
          </div>
        </header>

        {dataMessage && <p className="data-message">{dataMessage}</p>}

        {activeTab === "calculator" && selectedSku && selectedResult && (
          <CalculatorView
            result={selectedResult}
            selectedSku={selectedSku}
            market={market}
            currencySymbol={parameters.currencySymbol}
            updateSelected={updateSelected}
            applyDefaultDutiesToSelected={applyDefaultDutiesToSelected}
            estimateSelectedLogistics={estimateSelectedLogistics}
            updateSelectedTariff={updateSelectedTariff}
            tariffLoading={loadingAction === "tariff"}
          />
        )}

        {activeTab === "batch" && (
          <BatchView
            results={results}
            selectedSkuId={selectedSkuId}
            setSelectedSkuId={setSelectedSkuId}
            setActiveTab={setActiveTab}
            currencySymbol={parameters.currencySymbol}
            importCsv={importCsv}
            importMessage={importMessage}
            downloadCsvTemplate={downloadCsvTemplate}
            removeSku={removeSku}
          />
        )}

        {activeTab === "settings" && (
          <SettingsView
            parameters={parameters}
            marketCode={parameters.marketCode}
            applyMarket={applyMarket}
            updateParameter={updateParameter}
            updateExchangeRate={updateExchangeRate}
            exchangeLoading={loadingAction === "exchange"}
          />
        )}

        {activeTab === "directory" && <LogisticsDirectoryView />}

        {activeTab === "wiki" && <WikiView />}
      </section>
    </main>
  );
}

function CalculatorView({
  result,
  selectedSku,
  market,
  currencySymbol,
  updateSelected,
  applyDefaultDutiesToSelected,
  estimateSelectedLogistics,
  updateSelectedTariff,
  tariffLoading
}: {
  result: SkuResult;
  selectedSku: SkuInput;
  market: ReturnType<typeof getMarketPreset>;
  currencySymbol: string;
  updateSelected: <K extends keyof SkuInput>(key: K, value: SkuInput[K]) => void;
  applyDefaultDutiesToSelected: () => void;
  estimateSelectedLogistics: () => void;
  updateSelectedTariff: () => void;
  tariffLoading: boolean;
}) {
  return (
    <div className="calculator-layout">
      <section className="panel input-panel">
        <div className="panel-header">
          <h3>输入</h3>
          <div className="input-header-meta">
            <span className="required-help">* 必须填写</span>
            <span className={`grade-pill grade-${result.grade}`}>{result.grade}</span>
          </div>
        </div>
        <div className="field-grid">
          <TextField label="SKU" value={selectedSku.sku} onChange={(value) => updateSelected("sku", value)} required />
          <TextField label="商品名" value={selectedSku.name} onChange={(value) => updateSelected("name", value)} required />
          <TextField label={market.tariffCodeLabel} value={selectedSku.htsCode} onChange={(value) => updateSelected("htsCode", value)} />
          <div className="field action-field">
            <span>{market.name}关税</span>
            <button className="text-button" onClick={updateSelectedTariff} disabled={tariffLoading}>
              {tariffLoading ? "查询中..." : market.tariffLookup === "usitc" ? "查询 USITC" : "手动/参数包"}
            </button>
          </div>
          <div className="field action-field">
            <span>税费模板</span>
            <button className="text-button secondary" onClick={applyDefaultDutiesToSelected}>
              套用市场默认
            </button>
          </div>
          <div className="field action-field">
            <span>物流/仓储</span>
            <button className="text-button secondary" onClick={estimateSelectedLogistics}>
              自动估算
            </button>
          </div>
          <NumberField label="采购价 CNY" value={selectedSku.purchaseCostCny} onChange={(value) => updateSelected("purchaseCostCny", value)} required />
          <NumberField label={`海外售价 ${market.currencyCode}`} value={selectedSku.salePriceUsd} onChange={(value) => updateSelected("salePriceUsd", value)} required />
          <NumberField label="重量 kg" value={selectedSku.weightKg} onChange={(value) => updateSelected("weightKg", value)} required />
          <NumberField label="长 cm" value={selectedSku.lengthCm} onChange={(value) => updateSelected("lengthCm", value)} required />
          <NumberField label="宽 cm" value={selectedSku.widthCm} onChange={(value) => updateSelected("widthCm", value)} required />
          <NumberField label="高 cm" value={selectedSku.heightCm} onChange={(value) => updateSelected("heightCm", value)} required />
          <PercentField label={market.dutyLabels.base} value={selectedSku.tariffRate} onChange={(value) => updateSelected("tariffRate", value)} />
          <PercentField label={market.dutyLabels.special} value={selectedSku.section301Rate} onChange={(value) => updateSelected("section301Rate", value)} />
          <PercentField label={market.dutyLabels.tradeRemedy} value={selectedSku.antiDumpingRate} onChange={(value) => updateSelected("antiDumpingRate", value)} />
          <PercentField label={market.dutyLabels.other} value={selectedSku.otherDutyRate} onChange={(value) => updateSelected("otherDutyRate", value)} />
          <PercentField label={market.dutyLabels.vat} value={selectedSku.vatRate} onChange={(value) => updateSelected("vatRate", value)} />
          <NumberField label={`国际物流 ${market.currencyCode}`} value={selectedSku.logisticsCostUsd} onChange={(value) => updateSelected("logisticsCostUsd", value)} />
          <PercentField label="平台佣金" value={selectedSku.platformFeeRate} onChange={(value) => updateSelected("platformFeeRate", value)} />
          <NumberField label={`履约费用 ${market.currencyCode}`} value={selectedSku.fbaFeeUsd} onChange={(value) => updateSelected("fbaFeeUsd", value)} />
          <NumberField
            label={`月仓储估算 ${market.currencyCode}`}
            value={selectedSku.storageCostMonthlyUsd}
            onChange={(value) => updateSelected("storageCostMonthlyUsd", value)}
          />
          <PercentField label="广告成本" value={selectedSku.adRate} onChange={(value) => updateSelected("adRate", value)} />
          <PercentField label="退货率" value={selectedSku.returnRate} onChange={(value) => updateSelected("returnRate", value)} />
          <NumberField label="包装/质检 CNY" value={selectedSku.packagingQcCny} onChange={(value) => updateSelected("packagingQcCny", value)} required />
          <NumberField label="国内头程 CNY" value={selectedSku.domesticFreightCny} onChange={(value) => updateSelected("domesticFreightCny", value)} required />
        </div>
        {(selectedSku.tariffSource || selectedSku.tariffWarning) && (
          <div className="source-note">
            {selectedSku.tariffSource && (
              <p>
                来源：{selectedSku.tariffSource}
                {selectedSku.tariffUpdatedAt ? ` · ${new Date(selectedSku.tariffUpdatedAt).toLocaleDateString()}` : ""}
              </p>
            )}
            {selectedSku.tariffDescription && <p>{selectedSku.tariffDescription}</p>}
            {selectedSku.tariffWarning && <p>{selectedSku.tariffWarning}</p>}
          </div>
        )}
        {(selectedSku.logisticsSource || selectedSku.logisticsWarning) && (
          <div className="source-note">
            {selectedSku.logisticsSource && <p>物流来源：{selectedSku.logisticsSource}</p>}
            {selectedSku.logisticsWarning && <p>{selectedSku.logisticsWarning}</p>}
          </div>
        )}
      </section>

      <section className="results-stack">
        <div className="metric-strip">
          <Metric label="单件净利润" value={money(result.netProfitUsd, currencySymbol)} emphasis={result.netProfitUsd > 0 ? "good" : "bad"} />
          <Metric label="净利率" value={percent(result.netMargin)} emphasis={result.netMargin > 0.15 ? "good" : result.netMargin > 0 ? "warn" : "bad"} />
          <Metric label="ROI" value={percent(result.roi)} emphasis={result.roi > 0.35 ? "good" : result.roi > 0 ? "warn" : "bad"} />
          <Metric label="盈亏平衡价" value={money(result.breakEvenPriceUsd, currencySymbol)} />
        </div>

        <section className="panel">
          <div className="panel-header">
            <h3>机会判断</h3>
            <span className={`risk-dot ${result.riskLevel}`}>{riskLabel(result.riskLevel)}风险 · {Math.round(result.riskScore)}</span>
          </div>
          <div className="insight-grid">
            <Insight label="到岸成本" value={money(result.landedCostUsd, currencySymbol)} />
            <Insight label="总成本" value={money(result.totalCostUsd, currencySymbol)} />
            <Insight label="最大采购价" value={`¥${result.maxPurchaseCostCny.toFixed(2)}`} />
            <Insight label="最大物流费" value={money(result.maxLogisticsCostUsd, currencySymbol)} />
            <Insight label="最大有效关税率" value={percent(result.maxTariffRate)} />
            <Insight label={market.dutyLabels.base} value={money(result.tariffUsd, currencySymbol)} />
            <Insight label={market.dutyLabels.special} value={money(result.section301Usd, currencySymbol)} />
            <Insight label={market.dutyLabels.tradeRemedy} value={money(result.antiDumpingUsd, currencySymbol)} />
            <Insight label={market.dutyLabels.other} value={money(result.otherDutyUsd, currencySymbol)} />
            <Insight label={market.dutyLabels.vat} value={money(result.vatUsd, currencySymbol)} />
          </div>
        </section>

        <section className="panel">
          <div className="panel-header">
            <h3>敏感性分析</h3>
            <AlertTriangle size={18} />
          </div>
          <div className="sensitivity-list">
            <Sensitivity label="汇率 -5%" profitable={result.stillProfitable.exchangeMinus5} impact={result.exchangeSensitivity} currencySymbol={currencySymbol} />
            <Sensitivity label="汇率 +5%" profitable={result.stillProfitable.exchangePlus5} impact={result.exchangeSensitivity} currencySymbol={currencySymbol} />
            <Sensitivity label="物流 +20%" profitable={result.stillProfitable.logisticsPlus20} impact={result.logisticsSensitivity} currencySymbol={currencySymbol} />
            <Sensitivity label="关税 +10%" profitable={result.stillProfitable.tariffPlus10} impact={result.tariffSensitivity} currencySymbol={currencySymbol} />
            <Sensitivity label="广告 +10%" profitable={result.stillProfitable.adPlus10} impact={result.adSensitivity} currencySymbol={currencySymbol} />
          </div>
        </section>
      </section>
    </div>
  );
}

function BatchView({
  results,
  selectedSkuId,
  setSelectedSkuId,
  setActiveTab,
  currencySymbol,
  importCsv,
  importMessage,
  downloadCsvTemplate,
  removeSku
}: {
  results: SkuResult[];
  selectedSkuId: string;
  setSelectedSkuId: (id: string) => void;
  setActiveTab: (tab: Tab) => void;
  currencySymbol: string;
  importCsv: (event: ChangeEvent<HTMLInputElement>) => void;
  importMessage: string;
  downloadCsvTemplate: () => void;
  removeSku: (id: string) => void;
}) {
  return (
    <section className="panel batch-panel">
      <div className="panel-header">
        <h3>SKU 排序</h3>
        <div className="batch-actions">
          <button className="text-button secondary" onClick={downloadCsvTemplate}>
            <Download size={17} />
            CSV 模板下载
          </button>
          <label className="text-button file-button">
            <FileUp size={17} />
            导入 CSV
            <input type="file" accept=".csv,text/csv" onChange={importCsv} />
          </label>
        </div>
      </div>
      {importMessage && <p className="notice">{importMessage}</p>}
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>等级</th>
              <th>SKU</th>
              <th>商品</th>
              <th>售价</th>
              <th>净利</th>
              <th>净利率</th>
              <th>ROI</th>
              <th>风险</th>
              <th>盈亏平衡</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {results.map((result) => (
              <tr key={result.id} className={result.id === selectedSkuId ? "selected-row" : ""}>
                <td>
                  <span className={`grade-pill compact grade-${result.grade}`}>{result.grade}</span>
                </td>
                <td>{result.sku}</td>
                <td>{result.name}</td>
                <td>{money(result.salePriceUsd, currencySymbol)}</td>
                <td className={result.netProfitUsd > 0 ? "good-text" : "bad-text"}>{money(result.netProfitUsd, currencySymbol)}</td>
                <td>{percent(result.netMargin)}</td>
                <td>{percent(result.roi)}</td>
                <td>{Math.round(result.riskScore)}</td>
                <td>{money(result.breakEvenPriceUsd, currencySymbol)}</td>
                <td className="row-actions">
                  <button
                    className="mini-button"
                    onClick={() => {
                      setSelectedSkuId(result.id);
                      setActiveTab("calculator");
                    }}
                  >
                    编辑
                  </button>
                  <button className="icon-button small danger" onClick={() => removeSku(result.id)} title="删除">
                    <Trash2 size={15} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function SettingsView({
  parameters,
  marketCode,
  applyMarket,
  updateParameter,
  updateExchangeRate,
  exchangeLoading
}: {
  parameters: Parameters;
  marketCode: string;
  applyMarket: (code: string) => void;
  updateParameter: <K extends keyof Parameters>(key: K, value: Parameters[K]) => void;
  updateExchangeRate: () => void;
  exchangeLoading: boolean;
}) {
  const market = getMarketPreset(marketCode);
  return (
    <section className="panel settings-panel">
      <div className="panel-header">
        <h3>参数配置</h3>
        <div className="settings-actions">
          <button className="text-button" onClick={updateExchangeRate} disabled={exchangeLoading}>
            {exchangeLoading ? "更新中..." : `更新 ${parameters.settlementCurrency}/CNY`}
          </button>
          <span className="saved">
            <Save size={16} />
            自动本地保存
          </span>
        </div>
      </div>
      <div className="market-picker">
        <label className="field">
          <span>目标市场</span>
          <select value={marketCode} onChange={(event) => applyMarket(event.target.value)}>
            {marketsByRegion().map(([region, markets]) => (
              <optgroup key={region} label={region}>
                {markets.map((item) => (
                  <option key={item.code} value={item.code}>
                    {item.name} · {item.currencyCode} · {item.marketplaceLabel}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </label>
        <div>
          <p>{market.note}</p>
          <div className="market-checklist">
            {market.checklist.map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>
        </div>
      </div>
      <div className="field-grid settings-grid">
        <NumberField label={`汇率 CNY/${parameters.settlementCurrency}`} value={parameters.exchangeRate} onChange={(value) => updateParameter("exchangeRate", value)} />
        <PercentField label="默认关税率" value={parameters.defaultTariffRate} onChange={(value) => updateParameter("defaultTariffRate", value)} />
        <PercentField label={market.dutyLabels.special} value={market.defaultSpecialDutyRate} onChange={() => undefined} />
        <PercentField label={market.dutyLabels.tradeRemedy} value={market.defaultTradeRemedyRate} onChange={() => undefined} />
        <PercentField label={market.dutyLabels.other} value={market.defaultOtherDutyRate} onChange={() => undefined} />
        <PercentField label="默认 VAT/GST" value={parameters.defaultVatRate} onChange={(value) => updateParameter("defaultVatRate", value)} />
        <PercentField label="默认平台佣金" value={parameters.defaultPlatformFeeRate} onChange={(value) => updateParameter("defaultPlatformFeeRate", value)} />
        <PercentField label="默认广告成本" value={parameters.defaultAdRate} onChange={(value) => updateParameter("defaultAdRate", value)} />
        <PercentField label="默认退货率" value={parameters.defaultReturnRate} onChange={(value) => updateParameter("defaultReturnRate", value)} />
        <NumberField label={`默认物流费 ${parameters.settlementCurrency}`} value={parameters.defaultLogisticsCost} onChange={(value) => updateParameter("defaultLogisticsCost", value)} />
        <NumberField label={`默认履约费用 ${parameters.settlementCurrency}`} value={parameters.defaultFbaFee} onChange={(value) => updateParameter("defaultFbaFee", value)} />
        <PercentField label="支付手续费" value={parameters.paymentFeeRate} onChange={(value) => updateParameter("paymentFeeRate", value)} />
        <PercentField label="退货损耗比例" value={parameters.returnLossRate} onChange={(value) => updateParameter("returnLossRate", value)} />
        <NumberField label={`合规摊销 ${parameters.settlementCurrency}`} value={parameters.complianceCostPerUnit} onChange={(value) => updateParameter("complianceCostPerUnit", value)} />
        <PercentField label="汇率损耗" value={parameters.exchangeLossRate} onChange={(value) => updateParameter("exchangeLossRate", value)} />
      </div>
      {(parameters.exchangeRateSource || parameters.exchangeRateUpdatedAt) && (
        <p className="source-note flat">
          汇率来源：{parameters.exchangeRateSource || "Manual"} · 日期：{parameters.exchangeRateUpdatedAt || "未更新"} · 币种：
          {parameters.settlementCurrency}
        </p>
      )}
      <section className="resource-section">
        <div className="panel-header">
          <h3>数据来源 / 手动查询</h3>
          <span className="resource-hint">不能稳定自动获取的数值，请从这里核对</span>
        </div>
        <div className="resource-grid">
          <ResourceLink
            label="Frankfurter FX"
            description="当前优先使用的每日参考汇率来源。"
            url="https://www.frankfurter.app/"
          />
          <ResourceLink
            label="ExchangeRate API"
            description="部分非欧美币种的备用汇率来源。"
            url="https://www.exchangerate-api.com/"
          />
          <ResourceLink
            label="Freightos Index"
            description="国际海运/空运价格趋势参考。"
            url="https://fbx.freightos.com/"
          />
          {market.resources.map((resource) => (
            <ResourceLink key={resource.url} {...resource} />
          ))}
        </div>
      </section>
      <p className="disclaimer">
        计算结果为估算，不构成报关、税务或法律意见。HS/HTS/TARIC/NCM code、VAT/GST、反倾销、认证和平台费用需由用户或专业服务方确认。
      </p>
    </section>
  );
}

function ResourceLink({ label, description, url }: { label: string; description: string; url: string }) {
  return (
    <a className="resource-card" href={url} target="_blank" rel="noreferrer">
      <strong>{label}</strong>
      <span>{description}</span>
      <em>{new URL(url).hostname}</em>
    </a>
  );
}

function LogisticsDirectoryView() {
  const [query, setQuery] = useState("");
  const [service, setService] = useState<"全部" | LogisticsService>("全部");
  const filtered = logisticsProviders.filter((provider) => {
    const text = `${provider.name} ${provider.region} ${provider.headquarters} ${provider.markets.join(" ")} ${provider.bestFor} ${provider.note}`.toLowerCase();
    const matchesQuery = text.includes(query.trim().toLowerCase());
    const matchesService = service === "全部" || provider.services.includes(service);
    return matchesQuery && matchesService;
  });

  return (
    <section className="directory-layout">
      <div className="directory-toolbar">
        <label className="field">
          <span>搜索公司/市场/场景</span>
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="例如 美国、海外仓、Shopify、轻小件" />
        </label>
        <label className="field">
          <span>服务类型</span>
          <select value={service} onChange={(event) => setService(event.target.value as "全部" | LogisticsService)}>
            <option value="全部">全部</option>
            {logisticsServiceOptions.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
      </div>

      <p className="directory-note">
        这是公开渠道黄页，不代表推荐或背书。实际价格、仓点、时效、赔付、退货和清关能力需要向服务商确认。
      </p>

      <div className="directory-grid">
        {filtered.map((provider) => (
          <article className="provider-card" key={provider.name}>
            <div className="provider-heading">
              <div>
                <h3>{provider.name}</h3>
                <span>
                  {provider.region} · {provider.headquarters}
                </span>
              </div>
              <div className="provider-links">
                <a href={provider.website} target="_blank" rel="noreferrer">
                  官网
                </a>
                {provider.pricingUrl && (
                  <a href={provider.pricingUrl} target="_blank" rel="noreferrer">
                    报价
                  </a>
                )}
              </div>
            </div>
            <p>{provider.bestFor}</p>
            <div className="tag-row">
              {provider.services.map((item) => (
                <span key={item}>{item}</span>
              ))}
            </div>
            <div className="market-row">
              {provider.markets.map((item) => (
                <em key={item}>{item}</em>
              ))}
            </div>
            <p className="provider-note">{provider.note}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function WikiView() {
  const terms = [
    {
      term: "SKU",
      fullName: "Stock Keeping Unit",
      meaning: "库存管理单位，也就是一个可单独销售、定价、发货和统计的商品款式。",
      example: "同一款水杯，黑色 500ml 和白色 750ml 通常是两个 SKU。",
      use: "本工具每一行 SKU 代表一个候选商品，利润、风险和推荐等级都会单独计算。"
    },
    {
      term: "HS Code",
      fullName: "Harmonized System Code",
      meaning: "国际通用的商品分类编码，用来判断商品归类、关税和监管要求。",
      example: "塑料厨房用品、纺织包袋、电子灯具都会对应不同 HS 编码。",
      use: "卖到不同国家时，HS code 是查询关税和合规风险的起点。"
    },
    {
      term: "HTS Code",
      fullName: "Harmonized Tariff Schedule Code",
      meaning: "美国使用的关税编码体系，通常比 HS code 更细。",
      example: "4202.92.91.00 是一个美国 HTS 编码示例。",
      use: "美国市场可以用 HTS code 查询 USITC 基础关税。"
    },
    {
      term: "TARIC / CN Code",
      fullName: "EU customs classification",
      meaning: "欧盟使用的商品归类和关税体系。",
      example: "欧盟进口时常会用 CN code 或 TARIC code 查询税率、限制和监管条件。",
      use: "欧盟市场暂用手动税率或参数包，后续可接 TARIC 数据。"
    },
    {
      term: "NCM",
      fullName: "Nomenclatura Comum do Mercosul",
      meaning: "巴西等南美部分市场使用的商品分类编码。",
      example: "巴西进口税和本地税项会围绕 NCM 展开。",
      use: "南美市场税制较复杂，建议把 NCM 和税务参数作为独立参数包管理。"
    },
    {
      term: "FBA",
      fullName: "Fulfillment by Amazon",
      meaning: "亚马逊仓储、拣货、包装、配送和部分售后服务。",
      example: "卖家把货发到亚马逊仓库，消费者下单后由亚马逊发货。",
      use: "本工具里的履约费用包含类似 FBA 的仓配费用，不同平台可手动改。"
    },
    {
      term: "VAT",
      fullName: "Value Added Tax",
      meaning: "增值税，欧洲、英国、中东、非洲等市场常见。",
      example: "欧盟常见 VAT 税率约 19%-25%，英国标准税率 20%。",
      use: "VAT 会显著挤压利润，尤其是低毛利商品。"
    },
    {
      term: "GST",
      fullName: "Goods and Services Tax",
      meaning: "商品及服务税，澳大利亚、加拿大等市场常见。",
      example: "澳大利亚 GST 常见为 10%。",
      use: "在本工具中和 VAT 一样作为目的市场消费税录入。"
    },
    {
      term: "Section 301",
      fullName: "U.S. trade remedy tariffs",
      meaning: "美国针对部分中国商品加征的额外关税措施。",
      example: "某些中国商品除了基础关税，还可能额外加征 7.5% 或 25%。报关时常会涉及 9903.88.xx 这类 Chapter 99 编码。",
      use: "本工具会把它作为独立税项计算。USITC 查询结果若提示 9903.88.xx，会给出候选 Section 301 税率，但仍需专业确认。"
    },
    {
      term: "Trade Remedies",
      fullName: "Trade remedy measures",
      meaning: "贸易救济措施，是各国用来保护本国产业的额外进口限制或税费。",
      example: "欧盟、英国、加拿大、澳大利亚、墨西哥、南非等都可能对特定商品征收反倾销、反补贴或保障措施税。",
      use: "非美国市场不叫 Section 301，但也要把这些额外措施作为独立风险录入。"
    },
    {
      term: "AD/CVD",
      fullName: "Anti-Dumping / Countervailing Duties",
      meaning: "反倾销税和反补贴税，可能远高于普通关税。",
      example: "某些钢材、家具、化工、太阳能、轮胎等品类可能涉及 AD/CVD，税率有时会非常高。",
      use: "本工具把 AD/CVD 单独列出，避免它被藏进普通关税里。若不确定，应先按高风险处理。"
    },
    {
      term: "Safeguard",
      fullName: "Safeguard measure",
      meaning: "保障措施，是进口激增伤害本国产业时采取的临时限制。",
      example: "可能表现为额外关税、数量限制、配额或进口许可证要求。",
      use: "在本工具里可录入到“贸易救济/额外措施”或“其他附加税”里。"
    },
    {
      term: "Quota",
      fullName: "Import quota",
      meaning: "进口配额，限制某类商品在一定时期内可进口的数量或享受优惠税率的数量。",
      example: "超过配额后可能适用更高税率，或者需要额外许可证。",
      use: "配额成本通常不能自动计算，建议作为其他附加成本或风险备注处理。"
    },
    {
      term: "ROI",
      fullName: "Return on Investment",
      meaning: "投入回报率，表示每投入 1 元成本能赚多少钱。",
      example: "ROI 30% 大致表示投入 100 元核心成本，净赚 30 元。",
      use: "本工具用 ROI 判断商品是否值得测试，而不是只看单件利润。"
    },
    {
      term: "净利率",
      fullName: "Net Margin",
      meaning: "净利润占售价的比例。",
      example: "售价 20 美元，净利润 4 美元，净利率就是 20%。",
      use: "净利率越低，越容易被广告、物流、汇率波动打穿。"
    },
    {
      term: "到岸成本",
      fullName: "Landed Cost",
      meaning: "商品到达目的国前后的核心进口成本。",
      example: "采购价、包装、国内头程、国际物流、关税通常都算在里面。",
      use: "到岸成本越接近售价，后面的平台费和广告就越难覆盖。"
    },
    {
      term: "盈亏平衡价",
      fullName: "Break-even Price",
      meaning: "刚好不亏钱的最低售价。",
      example: "盈亏平衡价是 18 美元，售价低于 18 美元就会亏。",
      use: "它能帮助判断市场降价竞争时还能不能撑住。"
    }
  ];

  return (
    <section className="wiki-layout">
      <div className="wiki-intro">
        <h3>先把黑话翻译成人话</h3>
        <p>
          跨境选品会遇到大量缩写。这里列的是本工具最常用的概念，每个词都对应利润模型里的一个成本、风险或判断指标。
        </p>
      </div>
      <div className="wiki-grid">
        {terms.map((item) => (
          <article className="wiki-card" key={item.term}>
            <div>
              <h3>{item.term}</h3>
              <span>{item.fullName}</span>
            </div>
            <p>{item.meaning}</p>
            <p>
              <strong>例子：</strong>
              {item.example}
            </p>
            <p>
              <strong>在本工具里：</strong>
              {item.use}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}

function Metric({ label, value, emphasis }: { label: string; value: string; emphasis?: "good" | "warn" | "bad" }) {
  return (
    <div className={`metric ${emphasis ?? ""}`}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function Insight({ label, value }: { label: string; value: string }) {
  return (
    <div className="insight">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function Sensitivity({
  label,
  profitable,
  impact,
  currencySymbol
}: {
  label: string;
  profitable: boolean;
  impact: number;
  currencySymbol: string;
}) {
  return (
    <div className="sensitivity-item">
      <span>{label}</span>
      <strong className={profitable ? "good-text" : "bad-text"}>{profitable ? "仍盈利" : "转亏"}</strong>
      <em>影响 {money(impact, currencySymbol)}</em>
    </div>
  );
}

function RequiredLabel({ children, required }: { children: string; required?: boolean }) {
  return (
    <span>
      {children}
      {required && <b className="required-mark">*</b>}
    </span>
  );
}

function TextField({
  label,
  value,
  onChange,
  required
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}) {
  return (
    <label className="field">
      <RequiredLabel required={required}>{label}</RequiredLabel>
      <input value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

function NumberField({
  label,
  value,
  onChange,
  required
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  required?: boolean;
}) {
  return (
    <label className="field">
      <RequiredLabel required={required}>{label}</RequiredLabel>
      <input type="number" step="0.01" value={Number.isFinite(value) ? value : 0} onChange={(event) => onChange(Number(event.target.value))} />
    </label>
  );
}

function SelectField({
  label,
  value,
  onChange,
  children
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  children: ReactNode;
}) {
  return (
    <label className="field">
      <RequiredLabel>{label}</RequiredLabel>
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        {children}
      </select>
    </label>
  );
}

function PercentField({
  label,
  value,
  onChange,
  required
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  required?: boolean;
}) {
  return (
    <label className="field">
      <RequiredLabel required={required}>{label}</RequiredLabel>
      <input
        type="number"
        step="0.1"
        value={Number.isFinite(value) ? Number((value * 100).toFixed(2)) : 0}
        onChange={(event) => onChange(Number(event.target.value) / 100)}
      />
    </label>
  );
}

function money(value: number, symbol = "$"): string {
  if (!Number.isFinite(value)) return "-";
  return `${symbol}${value.toFixed(2)}`;
}

function percent(value: number): string {
  if (!Number.isFinite(value)) return "-";
  return `${(value * 100).toFixed(1)}%`;
}

function riskLabel(value: string): string {
  return value === "low" ? "低" : value === "medium" ? "中" : "高";
}
