# 跨境利通

**值不值得卖**

跨境利通是一款本地优先的跨境选品利润分析工具。它面向想把中国供应链商品卖到海外市场的卖家、贸易商和选品团队，帮助用户快速判断一个产品是否有利润空间、风险在哪里、哪些成本会把利润吃掉。

它不是单纯的成本计算器，而是一个“值不值得卖”的机会筛选工作台。

## 核心能力

- **单品利润计算**：输入采购价、售价、重量尺寸、平台费、广告、退货等数据，计算净利润、净利率、ROI、盈亏平衡价。
- **批量 SKU 雷达**：通过 CSV 批量导入商品，按 A/B/C/D 推荐等级排序。
- **全球市场参数**：支持美国、加拿大、欧盟、英国、澳大利亚、巴西、墨西哥、阿联酋、沙特、南非等市场预设。
- **差异化税费模型**：美国拆分 Section 301、AD/CVD；巴西拆分 II/IPI/PIS/COFINS/ICMS；其他市场按贸易救济、VAT/GST、认证与清关成本处理。
- **自动税费模板**：切换市场、新增 SKU、CSV 导入时自动填入默认税费，单个 SKU 可一键套用市场默认。
- **自动数据获取**：可更新目标币种/CNY 汇率；美国市场可按 HTS code 查询 USITC 基础关税，并识别常见 Chapter 99 / Section 301 提示。
- **物流/仓储估算**：按目标市场、重量和尺寸估算国际物流费、履约费、月仓储费。
- **物流仓储黄页**：收集跨境物流、海外仓、3PL、报价工具入口，可搜索和按服务类型筛选。
- **敏感性分析**：汇率 ±5%、物流 +20%、关税 +10%、广告 +10% 下是否仍盈利。
- **本地保存**：当前使用浏览器 `localStorage` 保存 SKU 和参数，不上传用户数据。
- **术语 Wiki**：解释 SKU、HS/HTS、VAT/GST、FBA、ROI、到岸成本等常见概念。

## 当前技术栈

- Tauri 2 配置
- React
- TypeScript
- Vite
- 本地 `localStorage`
- CSV 导入/导出

> 当前可直接以 Web 开发模式运行。Tauri 桌面壳已配置，但需要本机安装 Rust/Cargo 后才能启动桌面端。

## 快速开始

```bash
npm install
npm run dev
```

打开：

```text
http://127.0.0.1:1420/
```

## 构建

```bash
npm run build
```

## Tauri 桌面端

先安装 Rust/Cargo，然后运行：

```bash
npm run tauri dev
```

## Windows 安装包

仓库已配置 GitHub Actions 工作流：

```text
.github/workflows/windows-build.yml
```

上传到 GitHub 后，可以在 Actions 页面手动运行 **Build Windows Installer**。构建完成后，在 workflow 的 Artifacts 中下载：

- `.msi` 安装包
- `.exe` NSIS 安装包

本地构建 Windows 安装包需要 Windows 环境、Rust/Cargo 和 Tauri 依赖：

```bash
npm ci
npm run tauri:build
```

## CSV 导入

页面内 `批量雷达` 提供：

- CSV 导入
- CSV 模板下载
- CSV 结果导出

示例文件：

[examples/skus.csv](examples/skus.csv)

核心字段：

```text
sku,name,htsCode,purchaseCostCny,salePriceUsd,weightKg,lengthCm,widthCm,heightCm,tariffRate,section301Rate,antiDumpingRate,otherDutyRate,vatRate,logisticsCostUsd,platformFeeRate,fbaFeeUsd,storageCostMonthlyUsd,adRate,returnRate,packagingQcCny,domesticFreightCny
```

说明：

- `salePriceUsd`、`logisticsCostUsd`、`fbaFeeUsd` 是历史字段名，现在表示“当前目标市场币种金额”。
- 费率既可写小数 `0.12`，也可写百分比数值 `12`。
- `section301Rate` 在美国表示 Section 301；在其他市场对应页面上的“贸易救济/特殊附加税”等第二层税费。

## 数据来源与限制

当前项目采用“自动获取 + 默认模板 + 手动核对链接”的组合。

可自动获取：

- 目标币种/CNY 汇率
- 美国 USITC HTS 基础关税
- 部分美国 Chapter 99 / Section 301 候选提示

默认模板估算：

- 各市场默认关税、VAT/GST、平台费、广告、退货
- 物流、履约和仓储估算

需要人工核对：

- HS/HTS/TARIC/NCM 商品编码
- Section 301、AD/CVD、贸易救济措施
- VAT/GST、ICMS、IPI、PIS/COFINS 等本地税
- 平台最新费用
- 物流服务商实时报价
- 合规认证和清关要求

## 项目结构

```text
src/
  App.tsx                  主界面和页面
  domain.ts                利润计算模型
  markets.ts               目标市场和税费模板
  dataSources.ts           汇率、USITC 等数据获取
  logisticsEstimator.ts    物流/仓储估算
  logisticsDirectory.ts    物流仓储黄页数据
  csv.ts                   CSV 导入导出
  storage.ts               本地保存
  styles.css               样式
examples/
  skus.csv                 SKU 导入示例
src-tauri/
  ...                      Tauri 桌面壳配置
```

## 产品路线

- 接入 SQLite，替换浏览器 `localStorage`
- 增加项目/市场/批次管理
- 增加 HTML/PDF 报告导出
- 增加更多国家税费参数包
- 增加可编辑物流报价库
- 接入更多官方关税/税务查询源
- 增加 SKU 对比、利润瀑布图和风险解释

## 免责声明

跨境利通的计算结果仅为商业估算，不构成报关、税务、法律、投资或经营建议。

实际成本会受到商品编码、原产地、贸易政策、清关方式、平台账号、仓储履约、广告表现、汇率波动、物流旺季、退货率和合规认证等因素影响。正式采购或发货前，请向报关行、税务顾问、平台方和物流服务商确认。
