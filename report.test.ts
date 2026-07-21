import { describe, expect, test } from "vitest";
import { buildChartSeries } from "./report";
import type { ProductReport } from "../types/report";

const report: ProductReport = {
  dataProvenance: {
    status: "unverified",
    summary: "当前仅包含用户指定商品名称和本地报告结构，尚未接入真实销售、舆情或官方商品数据。",
    disclaimer: "未标注来源的数据不会展示为结论。",
    sources: [{ name: "用户输入", status: "available", note: "商品名称来自用户。" }]
  },
  product: {
    name: "【含百亿活菌吸管】乳酸菌美式",
    brand: "瑞幸咖啡",
    category: "功能型咖啡饮品",
    launchContext: "当前尚未接入公开资料或业务数据。",
    heroTagline: "等待真实数据接入后生成商品洞察"
  },
  productDetail: {
    status: "unverified",
    summary: "当前仅记录用户指定的商品名称和品牌归属。",
    facts: [
      { label: "商品名称", value: "【含百亿活菌吸管】乳酸菌美式", status: "known", source: "用户输入" },
      { label: "配方与菌株", value: "待接入", status: "pending", source: "需接入官方资料" }
    ],
    deploymentItems: [
      {
        title: "商品页资料区",
        status: "pending",
        description: "用于展示官方商品名、卖点、规格、价格、配料和图片。",
        inputNeeded: "官方商品页"
      }
    ],
    reviewNote: "未接入的数据不会展示成结论。"
  },
  executiveSummary: ["当前报告不展示市场关注度、复购、用户占比等结论性指标。"],
  keyMetrics: [
    { label: "市场关注度", value: null, unit: "", trend: "", status: "pending", source: "未接入真实数据" }
  ],
  audienceSegments: [{ name: "目标人群", share: null, insight: "待接入真实数据。" }],
  sellingPoints: [{ title: "益生菌概念", detail: "待接入真实数据。", strength: null }],
  coreInsights: {
    userPersonas: [
      {
        name: "目标用户画像",
        status: "pending",
        source: "未接入订单、会员、人群画像或调研数据",
        insight: "待接入真实用户数据后生成。"
      }
    ],
    hotWordCloud: [
      {
        label: "搜索词待接入",
        status: "pending",
        source: "未接入搜索热度数据",
        weight: null
      }
    ],
    popularContents: [
      {
        channel: "社媒内容",
        title: "待接入热门内容标题",
        status: "pending",
        source: "未接入社媒内容数据",
        reason: "接入后展示真实标题、互动量、发布时间、链接和内容主题。"
      }
    ]
  },
  knowledgeBase: {
    disclaimer: "以下内容是通用知识普及，不构成对本商品的功效确认。",
    entries: [
      {
        category: "益生菌基础",
        title: "益生菌不能只看热词",
        summary: "具体商品需要看菌株、添加量、存活条件和证据。",
        points: ["确认是否宣称活菌。"],
        source: "通用科普，正式报告需补充来源"
      }
    ]
  },
  riskSignals: [{ title: "功效感知门槛", level: "medium", mitigation: "避免过度功效承诺。" }],
  visualizations: {
    sentiment: [],
    purchaseDrivers: [],
    trend: []
  },
  ai: {
    provider: "zhipu",
    status: "reserved",
    endpointHint: "/api/ai/zhipu/analyze",
    note: "智谱 AI API 已预留，当前展示 JSON 静态分析结果。"
  }
};

describe("buildChartSeries", () => {
  test("converts report visualization data into chart-friendly arrays", () => {
    const series = buildChartSeries(report);

    expect(series.sentimentLegend).toEqual([]);
    expect(series.purchaseDriverNames).toEqual([]);
    expect(series.purchaseDriverValues).toEqual([]);
    expect(series.trendPoints).toEqual([]);
  });
});
