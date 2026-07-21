import { useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties } from "react";
import ReactECharts from "echarts-for-react";
import {
  ArrowLeft,
  BarChart3,
  BookOpen,
  BrainCircuit,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleDashed,
  Compass,
  Coffee,
  GitCompareArrows,
  MapPin,
  Radio,
  ShoppingCart,
  Sparkles,
  Target,
  TrendingUp,
  Users,
  Video,
  X
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { fetchProductReport } from "./services/report";
import type { CompetitorSlot, KnowledgeEntry, ProductReport } from "./types/report";
import type { EChartsOption } from "echarts";
import douyinExcelRows from "./douyinData.json";
import "./styles.css";

type SectionId = "insights" | "charts" | "competitors" | "knowledge";

interface SectionMeta {
  id: SectionId;
  label: string;
  description: string;
  Icon: LucideIcon;
}

const reportSections: SectionMeta[] = [
  { id: "insights", label: "核心洞察", description: "用户画像、热点词云、热门内容", Icon: Sparkles },
  { id: "knowledge", label: "知识库", description: "益生菌、咖啡和合规科普", Icon: BookOpen },
  { id: "competitors", label: "竞品分析", description: "竞品池、对比维度、差异机会", Icon: GitCompareArrows },
  { id: "charts", label: "数据看板", description: "全渠道汇总与 POI / 直播下钻", Icon: BarChart3 }
];

const metricStatusText = {
  pending: "待接入",
  verified: "已验证"
} as const;

const personaDimensions = ["年龄层", "城市层级", "消费频次", "购买动机"] as const;

const popularContentWordTerms: Record<string, string[]> = {
  社媒内容: ["热门标题", "互动量", "发布时间", "内容链接", "内容主题"],
  用户评价: ["高频评价", "评价样本", "评价来源", "情绪倾向", "口味反馈"]
};

const presaleDailySummary = [
  {
    date: "2026-07-10",
    label: "7月10日",
    saleCount: 110651,
    saleAmount: 1109333.9,
    status: "售卖已确认"
  },
  {
    date: "2026-07-11",
    label: "7月11日",
    saleCount: 100744,
    saleAmount: 1001257.6,
    status: "售卖已确认"
  },
  {
    date: "2026-07-12",
    label: "7月12日",
    saleCount: 96040,
    saleAmount: 954074,
    status: "售卖已确认"
  }
] as const;

const presaleDates = ["2026-07-10", "2026-07-11", "2026-07-12"] as const;
type PresaleDate = (typeof presaleDates)[number];

const presaleDailySchemes: {
  name: string;
  shortName: string;
  dayData: Record<PresaleDate, { count: number; amount: number }>;
}[] = [
  {
    name: "预售-乳酸菌美式-poi",
    shortName: "POI",
    dayData: {
      "2026-07-10": { count: 96330, amount: 953876 },
      "2026-07-11": { count: 96521, amount: 955849.9 },
      "2026-07-12": { count: 84623, amount: 838015.7 }
    }
  },
  {
    name: "乳酸菌美式-武汉小红书预售",
    shortName: "武汉小红书",
    dayData: {
      "2026-07-10": { count: 0, amount: 0 },
      "2026-07-11": { count: 2, amount: 19.8 },
      "2026-07-12": { count: 7628, amount: 75517.2 }
    }
  },
  {
    name: "预售-乳酸菌美式-矩阵",
    shortName: "矩阵",
    dayData: {
      "2026-07-10": { count: 1574, amount: 17156.6 },
      "2026-07-11": { count: 1937, amount: 21113.3 },
      "2026-07-12": { count: 1604, amount: 17483.6 }
    }
  },
  {
    name: "预售-乳酸菌美式-自播26",
    shortName: "自播26",
    dayData: {
      "2026-07-10": { count: 6778, amount: 73880.2 },
      "2026-07-11": { count: 1300, amount: 14170 },
      "2026-07-12": { count: 1072, amount: 11684.8 }
    }
  },
  {
    name: "预售-乳酸菌美式-自营",
    shortName: "自营",
    dayData: {
      "2026-07-10": { count: 599, amount: 5930.1 },
      "2026-07-11": { count: 555, amount: 5494.5 },
      "2026-07-12": { count: 710, amount: 7029 }
    }
  },
  {
    name: "预售-乳酸菌美式-达播26",
    shortName: "达播26",
    dayData: {
      "2026-07-10": { count: 5328, amount: 58075.2 },
      "2026-07-11": { count: 363, amount: 3956.7 },
      "2026-07-12": { count: 354, amount: 3858.6 }
    }
  },
  {
    name: "预售-乳酸菌美式-自营达人",
    shortName: "自营达人",
    dayData: {
      "2026-07-10": { count: 25, amount: 247.5 },
      "2026-07-11": { count: 40, amount: 396 },
      "2026-07-12": { count: 17, amount: 168.3 }
    }
  },
  {
    name: "乳酸菌美式-天猫预售",
    shortName: "天猫预售",
    dayData: {
      "2026-07-10": { count: 15, amount: 148.5 },
      "2026-07-11": { count: 24, amount: 237.6 },
      "2026-07-12": { count: 30, amount: 297 }
    }
  },
  {
    name: "预售-乳酸菌美式-pop1",
    shortName: "POP1",
    dayData: {
      "2026-07-10": { count: 1, amount: 9.9 },
      "2026-07-11": { count: 2, amount: 19.8 },
      "2026-07-12": { count: 1, amount: 9.9 }
    }
  },
  {
    name: "乳酸菌美式-郑州小红书预售",
    shortName: "郑州小红书",
    dayData: {
      "2026-07-10": { count: 1, amount: 9.9 },
      "2026-07-11": { count: 0, amount: 0 },
      "2026-07-12": { count: 1, amount: 9.9 }
    }
  }
];

const presaleSchemeRows = presaleDailySchemes
  .map((scheme) => {
    const totalCount = presaleDates.reduce((sum, date) => sum + scheme.dayData[date].count, 0);
    const totalAmount = presaleDates.reduce((sum, date) => sum + scheme.dayData[date].amount, 0);
    return { ...scheme, totalCount, totalAmount };
  })
  .sort((first, second) => second.totalCount - first.totalCount);

const presaleChannelGroups = [
  { name: "POI", values: [96330, 96521, 84623] },
  { name: "小红书", values: [1, 2, 7629] },
  { name: "矩阵", values: [1574, 1937, 1604] },
  { name: "自播/达播", values: [12106, 1663, 1426] },
  { name: "自营", values: [624, 595, 727] },
  { name: "其他", values: [16, 26, 31] }
] as const;

const presaleHourlyTrend = [
  { hour: "0点", july12: 14761, july11: 10094 },
  { hour: "1点", july12: 8855, july11: 6473 },
  { hour: "2点", july12: 4548, july11: 3581 },
  { hour: "3点", july12: 2544, july11: 1947 },
  { hour: "4点", july12: 1691, july11: 1243 },
  { hour: "5点", july12: 1862, july11: 1422 },
  { hour: "6点", july12: 4143, july11: 3351 },
  { hour: "7点", july12: 8572, july11: 6960 },
  { hour: "8点", july12: 11086, july11: 8406 },
  { hour: "9点", july12: 10334, july11: 7192 },
  { hour: "10点", july12: 10866, july11: 7671 },
  { hour: "11点", july12: 12001, july11: 8643 },
  { hour: "12点", july12: 14492, july11: 10406 },
  { hour: "13点", july12: 14885, july11: 11005 },
  { hour: "14点", july12: 16263, july11: 12173 },
  { hour: "15点", july12: 14756, july11: 11003 },
  { hour: "16点", july12: 13259, july11: 9465 },
  { hour: "17点", july12: 11851, july11: 8619 },
  { hour: "18点", july12: 12241, july11: 8250 },
  { hour: "19点", july12: 12134, july11: 8046 },
  { hour: "20点", july12: 15504, july11: 9080 },
  { hour: "21点", july12: 16468, july11: 9878 },
  { hour: "22点", july12: 21823, july11: 13666 },
  { hour: "23点", july12: 30236, july11: 14320 }
] as const;

const presaleAmountShareRows = [
  ...presaleSchemeRows
    .filter((scheme) => scheme.totalAmount >= 1000)
    .map((scheme) => ({ name: scheme.shortName, value: scheme.totalAmount })),
  {
    name: "其他小渠道",
    value: presaleSchemeRows
      .filter((scheme) => scheme.totalAmount < 1000)
      .reduce((sum, scheme) => sum + scheme.totalAmount, 0)
  }
].filter((row) => row.value > 0);

const businessSummary = {
  period: "2026-07-13",
  records: 29,
  tradedProducts: 4,
  activeProducts: 10,
  exposures: 4616813,
  visits: 150222,
  saleCount: 56769,
  buyers: 48802,
  newCustomerBuyers: 2608,
  refundCount: 8630,
  refundAmount: 93143,
  conversionRate: 1.23
} as const;

const businessProductRows = [
  {
    name: "【含百亿活菌吸管】乳酸菌美式",
    shortName: "活菌吸管",
    productId: "7660422210460403747",
    price: "¥13.90 / ¥20.00",
    exposures: 3289362,
    visits: 110955,
    saleCount: 38656,
    buyers: 35646,
    newCustomerBuyers: 1509,
    conversionRate: 1.18,
    refundCount: 7008,
    refundAmount: 74171.2
  },
  {
    name: "【百亿活菌吸管】乳酸菌美式",
    shortName: "百亿活菌",
    productId: "7530126401387694120",
    price: "¥20.00 / ¥20.00",
    exposures: 835154,
    visits: 22250,
    saleCount: 11811,
    buyers: 7351,
    newCustomerBuyers: 930,
    conversionRate: 1.41,
    refundCount: 796,
    refundAmount: 9472.4
  },
  {
    name: "【元气|百亿活菌吸管】乳酸菌美式",
    shortName: "元气活菌",
    productId: "7660450958727465001",
    price: "¥20.00 / ¥20.00",
    exposures: 342787,
    visits: 14164,
    saleCount: 5533,
    buyers: 5106,
    newCustomerBuyers: 128,
    conversionRate: 1.61,
    refundCount: 396,
    refundAmount: 4712.4
  },
  {
    name: "【达播|百亿活菌吸管】乳酸菌美式",
    shortName: "达播活菌",
    productId: "7660414653077030946",
    price: "¥20.00 / ¥20.00",
    exposures: 144232,
    visits: 2490,
    saleCount: 769,
    buyers: 699,
    newCustomerBuyers: 41,
    conversionRate: 0.53,
    refundCount: 100,
    refundAmount: 1190
  },
  {
    name: "【+3元升超大杯】乳酸菌美式",
    shortName: "+3元升杯",
    productId: "7312817221938677796",
    price: "¥11.90 / ¥32.00",
    exposures: 77,
    visits: 22,
    saleCount: 0,
    buyers: 0,
    newCustomerBuyers: 0,
    conversionRate: 0,
    refundCount: 0,
    refundAmount: 0
  },
  {
    name: "【预售福利×百亿活菌吸管】乳酸菌美式",
    shortName: "预售福利",
    productId: "7351253994834020367",
    price: "¥20.00 / ¥20.00",
    exposures: 1381,
    visits: 161,
    saleCount: 0,
    buyers: 0,
    newCustomerBuyers: 0,
    conversionRate: 0,
    refundCount: 148,
    refundAmount: 1613.2
  },
  {
    name: "【+3元升超大杯】乳酸菌美式",
    shortName: "升杯长尾",
    productId: "7527959403924916263",
    price: "¥11.50 / ¥32.00",
    exposures: 2,
    visits: 0,
    saleCount: 0,
    buyers: 0,
    newCustomerBuyers: 0,
    conversionRate: 0,
    refundCount: 0,
    refundAmount: 0
  },
  {
    name: "【瑞幸达播】预售-限量9.9乳酸菌美式",
    shortName: "达播9.9",
    productId: "7528318067663783982",
    exposures: 0,
    price: "¥9.90 / ¥32.00",
    visits: 1,
    saleCount: 0,
    buyers: 0,
    newCustomerBuyers: 0,
    conversionRate: 0,
    refundCount: 0,
    refundAmount: 0
  },
  {
    name: "【达播|百亿活菌吸管】乳酸菌美式",
    shortName: "达播旧ID",
    productId: "7660416358933252150",
    price: "¥20.00 / ¥20.00",
    exposures: 1891,
    visits: 75,
    saleCount: 0,
    buyers: 0,
    newCustomerBuyers: 0,
    conversionRate: 0,
    refundCount: 93,
    refundAmount: 1013.7
  },
  {
    name: "【元气预售|百亿活菌吸管】乳酸菌美式",
    shortName: "元气预售",
    productId: "7660421619864586246",
    price: "¥20.00 / ¥20.00",
    exposures: 1927,
    visits: 104,
    saleCount: 0,
    buyers: 0,
    newCustomerBuyers: 0,
    conversionRate: 0,
    refundCount: 89,
    refundAmount: 970.1
  }
] as const;

const businessDetailModuleRows = [
  { module: "核心指标", status: "暂无数据", score: 0 },
  { module: "转化漏斗", status: "暂无数据", score: 0 },
  { module: "流量来源", status: "暂无数据", score: 0 },
  { module: "承接体裁", status: "暂无数据", score: 0 },
  { module: "首购回购", status: "人数小于100", score: 0.22 },
  { module: "成交用户画像", status: "人数小于100", score: 0.22 },
  { module: "复购分析", status: "暂无数据", score: 0 },
  { module: "连带购买", status: "暂无数据", score: 0 }
] as const;

const compassSummary = {
  period: "2026-07-13 全量取数",
  saleSchemeRecords: 23,
  saleSchemeCount: 57637,
  saleSchemeAmount: 686163.4,
  salePresaleRecords: 10,
  salePresaleCount: 273,
  salePresaleAmount: 2707.7,
  salePresaleSubtableRecords: 5,
  verifySchemeRecords: 15,
  verifySchemeCount: 83804,
  verifySchemeIncome: 979355.49,
  verifyPresaleRecords: 7,
  verifyPresaleCount: 59756,
  verifyPresaleIncome: 663760.97,
  top20ProductCount: 84644,
  top20ProductIncome: 994063.78
} as const;

const compassMetricCards = [
  {
    label: "售卖实时 券方案名称",
    value: compassSummary.saleSchemeCount,
    amount: compassSummary.saleSchemeAmount,
    note: `${compassSummary.saleSchemeRecords} 条乳酸菌美式方案，逐页翻完 42 页。`
  },
  {
    label: "售卖实时 预售记录",
    value: compassSummary.salePresaleCount,
    amount: compassSummary.salePresaleAmount,
    note: `${compassSummary.salePresaleRecords} 条名称含预售的今日列汇总，预售子表 ${compassSummary.salePresaleSubtableRecords} 条不重复累加。`
  },
  {
    label: "核销实时 券方案名称",
    value: compassSummary.verifySchemeCount,
    amount: compassSummary.verifySchemeIncome,
    note: `${compassSummary.verifySchemeRecords} 条乳酸菌美式券方案，逐页翻完 44 页。`
  },
  {
    label: "预售核销杯量",
    value: compassSummary.verifyPresaleCount,
    amount: compassSummary.verifyPresaleIncome,
    note: `${compassSummary.verifyPresaleRecords} 条名称含预售的核销方案今日列汇总。`
  },
  {
    label: "Top20商品杯量",
    value: compassSummary.top20ProductCount,
    amount: compassSummary.top20ProductIncome,
    note: "实时-Top20商品中的商品维度记录，和券方案维度分开读取。"
  }
] as const;

const compassSaleRows = [
  { name: "乳酸菌美式-15天poi", shortName: "15天POI", count: 38649, amount: 460739.1, price: 11.92 },
  { name: "乳酸菌美式-15天自播", shortName: "15天自播", count: 11811, amount: 140550.9, price: 11.9 },
  { name: "乳酸菌美式-15天矩阵", shortName: "15天矩阵", count: 5532, amount: 65830.8, price: 11.9 },
  { name: "乳酸菌美式-15天达播26", shortName: "达播26", count: 769, amount: 9159.2, price: 11.91 },
  { name: "乳酸菌美式-15天自营", shortName: "15天自营", count: 427, amount: 5081.3, price: 11.9 },
  { name: "乳酸菌美式-武汉闲鱼预售", shortName: "闲鱼预售", count: 140, amount: 1386, price: 9.9 },
  { name: "乳酸菌美式-15天自营达人", shortName: "自营达人", count: 118, amount: 1404.2, price: 11.9 },
  { name: "乳酸菌美式-天猫预售", shortName: "天猫预售", count: 116, amount: 1148.4, price: 9.9 },
  { name: "乳酸菌美式-15天小店", shortName: "15天小店", count: 28, amount: 333.2, price: 11.9 },
  { name: "乳酸菌美式-天猫", shortName: "天猫", count: 13, amount: 154.7, price: 11.9 },
  { name: "乳酸菌美式-15天pop1", shortName: "POP1", count: 11, amount: 130.9, price: 11.9 },
  { name: "乳酸菌美式-郑州小红书预售", shortName: "郑州小红书", count: 9, amount: 89.1, price: 9.9 },
  { name: "预售-乳酸菌美式-poi", shortName: "预售POI", count: 7, amount: 74.3, price: 10.61 }
] as const;

const compassVerifyRows = [
  { name: "预售-乳酸菌美式-poi", shortName: "预售POI", count: 55655, income: 614199.8, price: 11.04, share: 3.09 },
  { name: "乳酸菌美式-15天poi", shortName: "15天POI", count: 19018, income: 248730.23, price: 13.08, share: 1.05 },
  { name: "乳酸菌美式-15天矩阵", shortName: "15天矩阵", count: 2650, income: 35202.82, price: 13.28, share: 0.15 },
  { name: "乳酸菌美式-15天自播", shortName: "15天自播", count: 1905, income: 25304.7, price: 13.28, share: 0.11 },
  { name: "预售-乳酸菌美式-自播26", shortName: "预售自播26", count: 1674, income: 20551.6, price: 12.28, share: 0.09 },
  { name: "预售-乳酸菌美式-矩阵", shortName: "预售矩阵", count: 957, income: 11679.3, price: 12.2, share: 0.05 },
  { name: "预售-乳酸菌美式-达播26", shortName: "预售达播26", count: 911, income: 11140.9, price: 12.23, share: 0.05 },
  { name: "预售-乳酸菌美式-自营", shortName: "预售自营", count: 429, income: 4811.1, price: 11.21, share: 0.02 },
  { name: "乳酸菌美式-15天自营", shortName: "15天自营", count: 208, income: 2800.25, price: 13.46, share: 0.01 },
  { name: "乳酸菌美式-15天达播26", shortName: "达播26", count: 172, income: 2254.02, price: 13.1, share: 0.01 },
  { name: "乳酸菌美式-天猫预售", shortName: "天猫预售", count: 107, income: 1130.57, price: 10.57, share: 0.01 }
] as const;

const compassComparisonRows = [
  { name: "乳酸菌美式-15天poi", shortName: "15天POI", saleCount: 38649, saleAmount: 460739.1, verifyCount: 19018, verifyIncome: 248730.23 },
  { name: "乳酸菌美式-15天自播", shortName: "15天自播", saleCount: 11811, saleAmount: 140550.9, verifyCount: 1905, verifyIncome: 25304.7 },
  { name: "乳酸菌美式-15天矩阵", shortName: "15天矩阵", saleCount: 5532, saleAmount: 65830.8, verifyCount: 2650, verifyIncome: 35202.82 },
  { name: "乳酸菌美式-15天达播26", shortName: "达播26", saleCount: 769, saleAmount: 9159.2, verifyCount: 172, verifyIncome: 2254.02 },
  { name: "乳酸菌美式-15天自营", shortName: "15天自营", saleCount: 427, saleAmount: 5081.3, verifyCount: 208, verifyIncome: 2800.25 },
  { name: "预售-乳酸菌美式-poi", shortName: "预售POI", saleCount: 7, saleAmount: 74.3, verifyCount: 55655, verifyIncome: 614199.8 },
  { name: "乳酸菌美式-天猫预售", shortName: "天猫预售", saleCount: 116, saleAmount: 1148.4, verifyCount: 107, verifyIncome: 1130.57 }
] as const;

const compassMethodNotes = [
  "售卖实时券方案名称表翻完 42 页，核销实时券方案名称表翻完 44 页。",
  "今日列无数值的行按 0 处理，昨日、上周仅作原表对照。",
  "商品维度与券方案维度不可相加，预售子表也不与券方案主表重复累加。"
] as const;

const aiSummaryTerms = [
  { label: "平台推荐", weight: 3 },
  { label: "直播上涨", weight: 2 },
  { label: "短视频上涨", weight: 2 },
  { label: "成交金额", weight: 3 },
  { label: "访问人数", weight: 2 },
  { label: "百亿活菌吸管", weight: 3 },
  { label: "预售福利", weight: 1 },
  { label: "达播", weight: 1 },
  { label: "元气预售", weight: 1 }
] as const;

const numberFormatter = new Intl.NumberFormat("zh-CN");
const currencyFormatter = new Intl.NumberFormat("zh-CN", {
  maximumFractionDigits: 2,
  minimumFractionDigits: 2
});
const safeTooltipCss = "max-width: min(260px, calc(100vw - 48px)); white-space: normal; word-break: break-word;";

type DataPanelId = "douyin" | "presale" | "compass" | "business";

const dataPanelDetailTitles: Record<DataPanelId, string> = {
  douyin: "抖音整体数据看板",
  presale: "预售数据详情",
  compass: "指南针取数详情",
  business: "生意经数据详情"
};

const compassAvailableDates = ["2026-07-13"];
const businessAvailableDates = ["2026-07-13"];

type DouyinExcelRow = Record<string, string | number>;

interface ChannelMetric {
  exposures: number;
  exposureUsers: number;
  visitPv: number;
  visits: number;
  saleCount: number;
  saleAmount: number;
  buyers: number;
  newCustomerBuyers: number;
  newCustomerAmount: number;
  refundCount: number;
  refundAmount: number;
  refundUsers: number;
  verifiedCount: number;
}

interface ChannelRow {
  key: string;
  name: string;
  productName: string;
  productId: string;
  metric: ChannelMetric;
  byDate: { date: string; saleCount: number; saleAmount: number; exposures: number; exposureUsers: number; visitPv: number; visits: number; buyers: number; refundCount: number; refundUsers: number }[];
  records: DouyinExcelRow[];
}

const toNumber = (value: string | number | undefined) => (typeof value === "number" ? value : Number(value || 0));
const rawDouyinRows = douyinExcelRows as DouyinExcelRow[];
const channelOrder = ["POI", "官号+团购", "KOL达人", "矩阵号"] as const;

const metricFromRows = (rows: DouyinExcelRow[]): ChannelMetric => ({
  exposures: rows.reduce((sum, row) => sum + toNumber(row["商品曝光次数"]), 0),
  exposureUsers: rows.reduce((sum, row) => sum + toNumber(row["商品曝光人数"]), 0),
  visitPv: rows.reduce((sum, row) => sum + toNumber(row["商品访问次数"]), 0),
  visits: rows.reduce((sum, row) => sum + toNumber(row["商品访问人数"]), 0),
  saleCount: rows.reduce((sum, row) => sum + toNumber(row["商品成交券数"]), 0),
  saleAmount: rows.reduce((sum, row) => sum + toNumber(row["商品成交金额"]), 0),
  buyers: rows.reduce((sum, row) => sum + toNumber(row["商品成交人数"]), 0),
  newCustomerBuyers: rows.reduce((sum, row) => sum + toNumber(row["新客成交人数"]), 0),
  newCustomerAmount: rows.reduce((sum, row) => sum + toNumber(row["新客成交金额"]), 0),
  refundCount: rows.reduce((sum, row) => sum + toNumber(row["商品退款券数"]), 0),
  refundAmount: rows.reduce((sum, row) => sum + toNumber(row["商品退款金额"]), 0),
  refundUsers: rows.reduce((sum, row) => sum + toNumber(row["商品退款人数"]), 0),
  verifiedCount: rows.reduce((sum, row) => sum + toNumber(row["商品核销券数"]), 0)
});

const businessChannelRows: ChannelRow[] = channelOrder.map((channel) => {
  const records = rawDouyinRows.filter((row) => row["渠道"] === channel);
  const first = records[0];
  return {
    key: channel,
    name: channel,
    productName: String(first?.["商品名称"] ?? channel),
    productId: String(first?.["商品id"] ?? ""),
    metric: metricFromRows(records),
    byDate: records.map((row) => ({
      date: String(row["日期"]),
      saleCount: toNumber(row["商品成交券数"]),
      saleAmount: toNumber(row["商品成交金额"]),
      exposures: toNumber(row["商品曝光次数"]),
      exposureUsers: toNumber(row["商品曝光人数"]),
      visitPv: toNumber(row["商品访问次数"]),
      visits: toNumber(row["商品访问人数"]),
      buyers: toNumber(row["商品成交人数"]),
      refundCount: toNumber(row["商品退款券数"]),
      refundUsers: toNumber(row["商品退款人数"])
    })),
    records
  };
});

const businessDates = ["2026-07-10", "2026-07-11", "2026-07-12"] as const;

const findChannelRow = (key: string) => businessChannelRows.find((row) => row.key === key);

const poiChannelRow = findChannelRow("POI")!;
const livestreamChannelKeys = ["官号+团购", "KOL达人", "矩阵号"] as const;

const emptyChannelMetric: ChannelMetric = {
  exposures: 0,
  exposureUsers: 0,
  visitPv: 0,
  visits: 0,
  saleCount: 0,
  saleAmount: 0,
  buyers: 0,
  newCustomerBuyers: 0,
  newCustomerAmount: 0,
  refundCount: 0,
  refundAmount: 0,
  refundUsers: 0,
  verifiedCount: 0
};

const mergeChannelMetric = (rows: ChannelRow[]) =>
  rows.reduce<ChannelMetric>(
    (acc, row) => ({
      exposures: acc.exposures + row.metric.exposures,
      exposureUsers: acc.exposureUsers + row.metric.exposureUsers,
      visitPv: acc.visitPv + row.metric.visitPv,
      visits: acc.visits + row.metric.visits,
      saleCount: acc.saleCount + row.metric.saleCount,
      saleAmount: acc.saleAmount + row.metric.saleAmount,
      buyers: acc.buyers + row.metric.buyers,
      newCustomerBuyers: acc.newCustomerBuyers + row.metric.newCustomerBuyers,
      newCustomerAmount: acc.newCustomerAmount + row.metric.newCustomerAmount,
      refundCount: acc.refundCount + row.metric.refundCount,
      refundAmount: acc.refundAmount + row.metric.refundAmount,
      refundUsers: acc.refundUsers + row.metric.refundUsers,
      verifiedCount: acc.verifiedCount + row.metric.verifiedCount
    }),
    emptyChannelMetric
  );

const livestreamTotalMetric: ChannelMetric = mergeChannelMetric(
  livestreamChannelKeys.map((key) => findChannelRow(key)).filter((row): row is ChannelRow => row !== undefined)
);

const rateOf = (part: number, total: number) => (total > 0 ? (part / total) * 100 : 0);
const douyinOverallMetric = mergeChannelMetric(businessChannelRows);
const douyinVisitRate = rateOf(douyinOverallMetric.visitPv, douyinOverallMetric.exposures);
const douyinConversionRate = rateOf(douyinOverallMetric.saleCount, douyinOverallMetric.exposures);
const douyinRefundRate = rateOf(douyinOverallMetric.refundCount, douyinOverallMetric.saleCount);


function App() {
  const [report, setReport] = useState<ProductReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<SectionId>("insights");
  const [activeDataPanel, setActiveDataPanel] = useState<DataPanelId | null>(null);
  const [selectedKnowledge, setSelectedKnowledge] = useState<KnowledgeEntry | null>(null);
  const [isHeroImageClicked, setIsHeroImageClicked] = useState(false);
  const heroAnimationTimer = useRef<number | undefined>(undefined);

  useEffect(() => {
    let isMounted = true;

    fetchProductReport()
      .then((nextReport) => {
        if (isMounted) {
          setReport(nextReport);
          setError(null);
        }
      })
      .catch((unknownError) => {
        if (isMounted) {
          setError(unknownError instanceof Error ? unknownError.message : "商品报告加载失败");
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    return () => {
      if (heroAnimationTimer.current !== undefined) {
        window.clearTimeout(heroAnimationTimer.current);
      }
    };
  }, []);

  const activeMeta = useMemo(
    () => reportSections.find((section) => section.id === activeSection) ?? reportSections[0],
    [activeSection]
  );

  if (isLoading) {
    return (
      <main className="page-shell page-shell--centered">
        <div className="status-panel">正在读取商品洞察报告...</div>
      </main>
    );
  }

  if (error || !report) {
    return (
      <main className="page-shell page-shell--centered">
        <div className="status-panel status-panel--error">{error ?? "商品报告为空"}</div>
      </main>
    );
  }

  const heroStyle = report.product.imageUrl ? ({ "--hero-image": `url(${report.product.imageUrl})` } as CSSProperties) : undefined;
  const heroClasses = [
    "report-hero",
    report.product.imageUrl ? "report-hero--with-image" : "",
    isHeroImageClicked ? "report-hero--image-clicked" : ""
  ]
    .filter(Boolean)
    .join(" ");

  function handleHeroClick() {
    if (!report?.product.imageUrl) {
      return;
    }

    setIsHeroImageClicked(true);
    if (heroAnimationTimer.current !== undefined) {
      window.clearTimeout(heroAnimationTimer.current);
    }
    heroAnimationTimer.current = window.setTimeout(() => setIsHeroImageClicked(false), 240);
  }

  return (
    <main className="page-shell">
      <header className="topbar">
        <div className="brand-mark">
          <Coffee aria-hidden="true" size={22} />
          <span>商品洞察展示平台</span>
        </div>

      </header>

      {activeDataPanel ? (
        <DataPanelPage panel={activeDataPanel} onBack={() => setActiveDataPanel(null)} />
      ) : (
        <>
      <section
        aria-label={`${report.product.name} 商品摘要`}
        className={heroClasses}
        onClick={handleHeroClick}
        style={heroStyle}
      >
        <div className="report-hero__copy">
          <span className="analysis-status">仅展示已确认数据</span>
          <h1>{report.product.name}</h1>
          <p className="brand-line">{report.product.brand}</p>
          {report.product.heroTagline ? <p className="hero-tagline">{report.product.heroTagline}</p> : null}
          {report.product.launchContext ? <p className="context-line">{report.product.launchContext}</p> : null}
        </div>
      </section>

      <nav className="section-tabs" aria-label="报告模块">
        {reportSections.map(({ id, label, description, Icon }) => (
          <button
            className={`section-tab ${activeSection === id ? "section-tab--active" : ""}`}
            key={id}
            onClick={() => setActiveSection(id)}
            type="button"
          >
            <Icon aria-hidden="true" size={20} />
            <span>
              <strong>{label}</strong>
              <small>{description}</small>
            </span>
          </button>
        ))}
      </nav>

      <section className="section-stage" aria-labelledby="active-section-title">
        <div className="section-stage__heading">
          <div>
            <activeMeta.Icon aria-hidden="true" size={24} />
            <div>
              <h2 id="active-section-title">{activeMeta.id === "knowledge" ? "资料归档" : activeMeta.label}</h2>
              <p>{activeMeta.description}</p>
            </div>
          </div>
        </div>

        {activeSection === "insights" ? <InsightsSection report={report} /> : null}
        {activeSection === "charts" ? <DouyinOverallPanel onOpenDetail={() => setActiveDataPanel("douyin")} /> : null}
        {activeSection === "competitors" ? (
          <CompetitorsSection report={report} />
        ) : null}
        {activeSection === "knowledge" ? (
          <KnowledgeSectionView report={report} onSelectKnowledge={setSelectedKnowledge} />
        ) : null}
      </section>

      {selectedKnowledge ? (
        <KnowledgeDialog entry={selectedKnowledge} onClose={() => setSelectedKnowledge(null)} />
      ) : null}
        </>
      )}
    </main>
  );
}

function PersonaChartTile({
  label,
  items,
  personaName
}: {
  label: string;
  items: { name: string; value: number }[];
  personaName?: string;
}) {
  const isCompare = items.length === 2;
  const colors = ["#74d8c5", "#f59bb8", "#78bde8", "#ffd36d", "#a88bea", "#b9ec70", "#f7b267", "#98d6c3", "#ff9f7f", "#6ec1e4"];

  const option: EChartsOption = isCompare
    ? {
        tooltip: { trigger: "axis", axisPointer: { type: "shadow" } },
        grid: { left: 10, right: 10, top: 24, bottom: 24, containLabel: true },
        xAxis: { type: "category", data: items.map((i) => i.name), axisTick: { show: false }, axisLabel: { fontSize: 10, color: "#173934", interval: 0, overflow: "truncate", width: 80 } },
        yAxis: { type: "value", axisLabel: { fontSize: 10, color: "#547069", formatter: "{value}%" }, splitLine: { lineStyle: { color: "#e8f5f0" } } },
        color: colors.slice(0, items.length),
        series: [{
          type: "bar",
          barWidth: 24,
          itemStyle: { borderRadius: [6, 6, 0, 0] },
          label: { show: true, position: "top", formatter: "{c}%", fontSize: 10, color: "#173934" },
          data: items.map((i) => i.value)
        }]
      }
    : {
        tooltip: { trigger: "item", formatter: "{b}: {c}%" },
        legend: { show: items.length <= 4, bottom: 0, left: "center", itemHeight: 8, itemWidth: 8, textStyle: { fontSize: 10, color: "#173934" } },
        color: colors,
        series: [{
          type: "pie",
          radius: items.length <= 3 ? ["38%", "62%"] : ["30%", "55%"],
          center: ["50%", items.length <= 4 ? "45%" : "50%"],
          avoidLabelOverlap: true,
          label: { show: true, formatter: items.length <= 4 ? "{b}\n{c}%" : "{b}", fontSize: 10, color: "#173934" },
          labelLine: { length: 6, length2: 4 },
          data: items.map((i) => ({ name: i.name, value: i.value }))
        }]
      };

  return (
    <article aria-label={`${personaName ?? "用户画像"}${label}饼状图`} className="persona-mini-chart">
      <strong>{label}</strong>
      <ReactECharts option={withSafeChartLayout(option)} notMerge lazyUpdate style={{ height: 140 }} />
    </article>
  );
}

function InsightsSection({ report }: { report: ProductReport }) {
  const visiblePopularContents = report.coreInsights.popularContents.filter((content) =>
    ["社媒内容", "用户评价"].includes(content.channel)
  );
  const visualSource = report.dataProvenance.sources.find((source) => source.visualization);

  return (
    <div className="insight-layout">
      <section className="panel">
        <div className="panel__heading">
          <Target aria-hidden="true" size={20} />
          <h3>用户画像</h3>
        </div>
        <div className="persona-chart-list">
          {report.coreInsights.userPersonas.map((persona) => (
            <article aria-label={`${persona.name}饼状图`} className="persona-chart-card" key={persona.name}>
              <div className="persona-chart-card__copy">
                <h4>{persona.name}</h4>
                <span>{metricStatusText[persona.status]}</span>
              </div>
              {persona.status !== "pending" ? <p className="persona-insight-text">{persona.insight}</p> : null}
              {persona.charts ? (
                <div className="persona-chart-grid">
                  {persona.charts.map((chart) => (
                    <PersonaChartTile key={chart.label} label={chart.label} items={chart.items} personaName={persona.name} />
                  ))}
                </div>
              ) : persona.name === "目标用户画像" ? (
                <div className="persona-chart-grid">
                  {[
                    { label: "年龄层" },
                    { label: "城市层级" },
                    { label: "消费频次" },
                    { label: "购买动机" }
                  ].map((chart) => (
                    <PersonaChartTile
                      key={chart.label}
                      label={chart.label}
                      items={[{ name: "待接入", value: 100 }]}
                      personaName={persona.name}
                    />
                  ))}
                </div>
              ) : (
                <div className="persona-chart persona-chart-single" />
              )}
            </article>
          ))}
        </div>
      </section>

      <section className="panel">
        <div className="panel__heading">
          <Sparkles aria-hidden="true" size={20} />
          <h3>热点词云</h3>
          <h3 className="sr-only">AI摘要词云</h3>
        </div>
        <div className="word-cloud">
          {report.coreInsights.hotWordCloud.map((term, index) => (
            <span className={`word-chip word-chip--weight-${(index % 3) + 1}`} key={term.label}>
              {term.label}
            </span>
          ))}
        </div>
      </section>

      <section className="panel popular-panel">
        <div className="panel__heading">
          <BookOpen aria-hidden="true" size={20} />
          <h3>热门内容</h3>
        </div>

        <div className="insight-cards-grid">
          <article className="insight-card insight-card--overview">
            <div className="insight-card__head">
              <span className="insight-card__badge"><TrendingUp aria-hidden="true" size={13} />平台热度</span>
              <h4>三大平台传播概览</h4>
            </div>
            <ul className="insight-card__list">
              <li>
                <strong>小红书</strong>
                <span>话题浏览量超 428 万，参与讨论用户超 2 万，女性用户为主，以测评、点单攻略、自制配方为主</span>
              </li>
              <li>
                <strong>抖音</strong>
                <span>上线两天霸占热搜，"百亿活菌吸管"刷屏，短视频测评为主，评论区互动活跃</span>
              </li>
              <li>
                <strong>微博</strong>
                <span>#乳酸菌美式 成为热搜词条，话题传播性强，"窜稀警告"成梗</span>
              </li>
            </ul>
            <div className="insight-card__keywords">
              <span>吸管外卖</span><span>热量测评</span><span>点单攻略</span><span>自制</span><span>气泡版</span><span>配方</span><span>减脂版</span><span>孕妇</span><span>联名杯</span>
            </div>
          </article>

          <article className="insight-card insight-card--review">
            <div className="insight-card__head">
              <span className="insight-card__badge insight-card__badge--berry"><Coffee aria-hidden="true" size={13} />饮用体验</span>
              <h4>两极分化的肠胃反应</h4>
            </div>
            <div className="insight-card__bars">
              <div className="insight-bar"><span className="insight-bar__label">窜稀派</span><div className="insight-bar__track"><div className="insight-bar__fill" style={{ width: "40%" }} /></div><span className="insight-bar__pct">40%</span></div>
              <div className="insight-bar"><span className="insight-bar__label">无反应派</span><div className="insight-bar__track"><div className="insight-bar__fill insight-bar__fill--muted" style={{ width: "30%" }} /></div><span className="insight-bar__pct">30%</span></div>
              <div className="insight-bar"><span className="insight-bar__label">通便派</span><div className="insight-bar__track"><div className="insight-bar__fill insight-bar__fill--green" style={{ width: "15%" }} /></div><span className="insight-bar__pct">15%</span></div>
              <div className="insight-bar"><span className="insight-bar__label">不适派</span><div className="insight-bar__track"><div className="insight-bar__fill insight-bar__fill--orange" style={{ width: "10%" }} /></div><span className="insight-bar__pct">10%</span></div>
              <div className="insight-bar"><span className="insight-bar__label">其他</span><div className="insight-bar__track"><div className="insight-bar__fill insight-bar__fill--gray" style={{ width: "5%" }} /></div><span className="insight-bar__pct">5%</span></div>
            </div>
            <p className="insight-card__note">"喝完半小时就窜"、"便秘三天终于通了"、"胃有点疼，可能太酸了"——店员提示：部分人群对咖啡或乳制品不耐受会腹泻。</p>
          </article>

          <article className="insight-card insight-card--straw">
            <div className="insight-card__head">
              <span className="insight-card__badge insight-card__badge--aqua"><Sparkles aria-hidden="true" size={13} />出圈亮点</span>
              <h4>百亿活菌吸管体验</h4>
            </div>
            <ul className="insight-card__list insight-card__list--check">
              <li><strong>口感</strong>：边吸边化，酸甜乳酸菌风味融合咖啡，弱化苦涩感</li>
              <li><strong>体验感</strong>："喝一口要歇三秒，仿佛在练肺活量"</li>
              <li><strong>童年回忆</strong>："这不就是小时候五毛钱的吸管糖吗"</li>
              <li><strong>颜值</strong>：透明吸管内白色颗粒清晰可见，拍照氛围感强</li>
              <li><strong>用户呼声</strong>："瑞幸这个百亿活菌吸管能不能单独卖！！！"</li>
            </ul>
          </article>

          <article className="insight-card insight-card--taste">
            <div className="insight-card__head">
              <span className="insight-card__badge insight-card__badge--green"><CheckCircle2 aria-hidden="true" size={13} />口味评价</span>
              <h4>好评 vs 差评</h4>
            </div>
            <div className="insight-card__duo">
              <div className="insight-card__duo-col insight-card__duo-col--good">
                <span className="insight-card__duo-title">好评</span>
                <ul>
                  <li>比普通美式好喝，不苦</li>
                  <li>酸甜口，像喝饮料</li>
                  <li>清爽透亮，解暑提神</li>
                  <li>分层明显，活菌颗粒融化</li>
                </ul>
              </div>
              <div className="insight-card__duo-col insight-card__duo-col--bad">
                <span className="insight-card__duo-title">差评</span>
                <ul>
                  <li>咖啡味太淡，像乳酸菌饮料</li>
                  <li>有点像儿童咖啡，太甜</li>
                  <li>酸甜味盖过咖啡味</li>
                  <li>世界上最难喝的美式出现了</li>
                </ul>
              </div>
            </div>
          </article>

          <article className="insight-card insight-card--persona">
            <div className="insight-card__head">
              <span className="insight-card__badge insight-card__badge--purple"><Users aria-hidden="true" size={13} />用户画像</span>
              <h4>八大特征描绘核心人群</h4>
            </div>
            <div className="insight-card__chips">
              <div className="insight-chip"><span>年龄层</span><strong>18-35 岁 Z 世代</strong></div>
              <div className="insight-chip"><span>性别倾向</span><strong>女性占比更高</strong></div>
              <div className="insight-chip"><span>核心动机</span><strong>猎奇尝鲜 / 社交分享</strong></div>
              <div className="insight-chip"><span>健康诉求</span><strong>肠道健康 / 低卡低脂</strong></div>
              <div className="insight-chip"><span>生活方式</span><strong>久坐熬夜养生党</strong></div>
              <div className="insight-chip"><span>消费特征</span><strong>重创意周边，轻价格</strong></div>
              <div className="insight-chip"><span>讨论风格</span><strong>幽默吐槽成梗</strong></div>
              <div className="insight-chip"><span>社交行为</span><strong>晒图打卡传播强</strong></div>
            </div>
          </article>

          <article className="insight-card insight-card--insight">
            <div className="insight-card__head">
              <span className="insight-card__badge insight-card__badge--yellow"><BrainCircuit aria-hidden="true" size={13} />关键洞察</span>
              <h4>亮点 · 风险 · 传播逻辑</h4>
            </div>
            <div className="insight-card__blocks">
              <div className="insight-block insight-block--good">
                <span className="insight-block__title">产品亮点</span>
                <p>活菌吸管是最大卖点，讨论热度远超产品本身，用户呼吁单独售卖。</p>
              </div>
              <div className="insight-block insight-block--warn">
                <span className="insight-block__title">痛点风险</span>
                <p>口感两极分化；40% 用户腹泻；"窜稀"标签或劝退部分消费者；孕妇需谨慎。</p>
              </div>
              <div className="insight-block insight-block--info">
                <span className="insight-block__title">传播逻辑</span>
                <p>"窜稀警告"从负面体验转化为社交梗，反而推动出圈，二次传播效应强。</p>
              </div>
              <div className="insight-block insight-block--info">
                <span className="insight-block__title">平台推荐</span>
                <p><span>直播上涨</span><span>短视频上涨</span></p>
              </div>
            </div>
          </article>
        </div>

        <div className="popular-list">
          {visiblePopularContents.map((content) => (
            <article aria-label={`${content.channel}词云`} className="popular-item popular-item--word-cloud" key={content.channel}>
              <span className="popular-item__channel">{content.channel}</span>
              <div className="popular-word-cloud">
                {(popularContentWordTerms[content.channel] ?? [content.title]).map((term, index) => (
                  <span className={`word-chip word-chip--weight-${(index % 3) + 1}`} key={term}>
                    {term}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>

    </div>
  );
}

type ChannelLevel = "overview" | "poi" | "livestream" | "overall";
type LivestreamChannelKey = "官号+团购" | "KOL达人" | "矩阵号";

interface BusinessChannelDetailProps {
  channel: ChannelRow;
  onBack: () => void;
}

function DouyinOverallPanel({ onOpenDetail }: { onOpenDetail: () => void }) {
  const metricCards = [
    { label: "抖音整体曝光", value: numberFormatter.format(douyinOverallMetric.exposures), note: "Excel 全部渠道合计" },
    { label: "抖音整体访问次数", value: numberFormatter.format(douyinOverallMetric.visitPv), note: `PV访问率 ${douyinVisitRate.toFixed(2)}%` },
    { label: "抖音整体成交券数", value: `${numberFormatter.format(douyinOverallMetric.saleCount)} 张`, note: `曝光成交率 ${douyinConversionRate.toFixed(2)}%` },
    { label: "抖音整体成交金额", value: `¥${currencyFormatter.format(douyinOverallMetric.saleAmount)}`, note: `退款率 ${douyinRefundRate.toFixed(2)}%` }
  ];

  return (
    <section aria-label="抖音整体数据总览" className="douyin-overview-board">
      <button aria-label="打开抖音整体数据面板" className="douyin-overview-hero" onClick={onOpenDetail} type="button">
        <div className="douyin-overview-hero__copy">
          <span>Douyin Overall</span>
          <h3>抖音整体</h3>
          <p>汇总 Excel 文档中 POI、官号+团购、KOL达人、矩阵号全部渠道数据，点击这里直接进入 POI 和直播看板。</p>
        </div>
        <div className="douyin-overview-hero__metric">
          <small>总成交券数</small>
          <strong>{numberFormatter.format(douyinOverallMetric.saleCount)}</strong>
          <em>全渠道合计</em>
        </div>
        <ChevronRight aria-hidden="true" className="douyin-overview-hero__arrow" size={24} />
      </button>

      <div aria-label="抖音整体核心数据" className="douyin-overview-metrics">
        {metricCards.map((card) => (
          <article className="douyin-overview-metric" key={card.label}>
            <span>{card.label}</span>
            <strong>{card.value}</strong>
            <small>{card.note}</small>
          </article>
        ))}
      </div>

      <section aria-label="抖音整体转换率" className="douyin-conversion-minimal">
        <div>
          <span>Conversion Rate</span>
          <h4>转换率</h4>
        </div>
        <div className="douyin-conversion-minimal__steps">
          {[
            { label: "曝光 → 访问", value: douyinVisitRate },
            { label: "访问 → 成交", value: rateOf(douyinOverallMetric.saleCount, douyinOverallMetric.visitPv) },
            { label: "成交 → 退款", value: douyinRefundRate }
          ].map((item) => (
            <article key={item.label}>
              <span>{item.label}</span>
              <strong>{item.value.toFixed(2)}%</strong>
              <i style={{ width: `${Math.max(4, Math.min(100, item.value))}%` }} />
            </article>
          ))}
        </div>
      </section>

    </section>
  );
}

function DouyinOverallDrilldownPanel() {
  return (
    <section aria-label="抖音整体下钻看板" className="douyin-drilldown-board">
      <div className="presale-block-heading">
        <h4>抖音整体下钻看板</h4>
        <span>POI 与直播板块在独立界面查看</span>
      </div>
      <span className="sr-only">全量 Excel 明细</span>
      <PresaleSection initialLevel="overall" />

    </section>
  );
}
function PresaleSection({ initialLevel = "overview" }: { initialLevel?: ChannelLevel }) {
  const [level, setLevel] = useState<ChannelLevel>(initialLevel);
  const [selectedLivestream, setSelectedLivestream] = useState<LivestreamChannelKey | null>(null);

  useEffect(() => {
    setLevel(initialLevel);
    setSelectedLivestream(null);
  }, [initialLevel]);

  const goToPoi = () => {
    setLevel("poi");
    setSelectedLivestream(null);
  };
  const goToLivestream = () => {
    setLevel("livestream");
    setSelectedLivestream(null);
  };
  const openLivestreamDetail = (key: LivestreamChannelKey) => {
    setLevel("livestream");
    setSelectedLivestream(key);
  };
  const goToOverview = () => {
    setLevel("overview");
    setSelectedLivestream(null);
  };

  if (level === "poi") {
    return <BusinessChannelDetail channel={poiChannelRow} onBack={goToOverview} />;
  }

  if (level === "livestream") {
    if (selectedLivestream) {
      const row = findChannelRow(selectedLivestream);
      if (row) {
        return <BusinessChannelDetail channel={row} onBack={() => setSelectedLivestream(null)} />;
      }
    }
    return <LivestreamOverview onBack={goToOverview} onSelect={openLivestreamDetail} />;
  }

  return <BusinessChannelOverview onEnterPoi={goToPoi} onEnterLivestream={goToLivestream} />;
}

function ChannelFunnelBoard({ channel }: { channel: ChannelRow }) {
  const renderFunnel = (
    title: string,
    subtitle: string,
    stages: { label: string; value: number }[],
    tone: "pv" | "uv"
  ) => {
    const maxValue = Math.max(1, ...stages.map((stage) => stage.value));

    return (
      <article className={`channel-funnel-card channel-funnel-card--${tone}`}>
        <div className="channel-funnel-card__head">
          <strong>{title}</strong>
          <span>{subtitle}</span>
        </div>
        <div className="channel-funnel-figure">
          <div className="channel-funnel-stack">
            {stages.map((stage, index) => {
              const width = `${Math.max(22, (stage.value / maxValue) * 100)}%`;
              const next = stages[index + 1];
              const transitionRate = next ? rateOf(next.value, stage.value) : null;

              return (
                <div className="channel-funnel-stage-wrap" key={`${title}-${stage.label}`}>
                  <div className="channel-funnel-stage" style={{ "--funnel-width": width } as CSSProperties}>
                    <span>{stage.label}</span>
                    <strong>{numberFormatter.format(stage.value)}</strong>
                  </div>
                  {transitionRate !== null ? (
                    <div className="channel-funnel-connector">
                      <i aria-hidden="true" className="channel-funnel-down-arrow" />
                      <div className="channel-funnel-rate-callout">
                        <span>{transitionRate.toFixed(2)}%</span>
                      </div>
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>
      </article>
    );
  };

  return (
    <article aria-label={`${channel.name}PV和UV双漏斗`} className="channel-funnel-board">
      <div className="presale-chart-tile__heading">
        <div>
          <h4>PV / UV 转化漏斗</h4>
          <span>次数和人数分开看，避免 PV 与 UV 口径混用</span>
        </div>
      </div>
      <div className="channel-funnel-grid">
        {renderFunnel(
          "PV 漏斗",
          "商品曝光次数 → 商品访问次数 → 成交券数 → 退款券数",
          [
            { label: "商品曝光次数", value: channel.metric.exposures },
            { label: "商品访问次数", value: channel.metric.visitPv },
            { label: "成交券数", value: channel.metric.saleCount },
            { label: "退款券数", value: channel.metric.refundCount }
          ],
          "pv"
        )}
        {renderFunnel(
          "UV 漏斗",
          "商品曝光人数 → 商品访问人数 → 商品成交人数 → 退款人数",
          [
            { label: "商品曝光人数", value: channel.metric.exposureUsers },
            { label: "商品访问人数", value: channel.metric.visits },
            { label: "商品成交人数", value: channel.metric.buyers },
            { label: "退款人数", value: channel.metric.refundUsers }
          ],
          "uv"
        )}
      </div>
      <p className="channel-funnel-formula">转化率 = 下层数据 ÷ 上层数据 × 100%；PV 用次数口径，UV 用人数口径。</p>
    </article>
  );
}
function BusinessChannelOverview({
  onEnterPoi,
  onEnterLivestream
}: {
  onEnterPoi: () => void;
  onEnterLivestream: () => void;
}) {
  const poiShare =
    (poiChannelRow.metric.saleCount / (poiChannelRow.metric.saleCount + livestreamTotalMetric.saleCount)) * 100;
  const livestreamShare = 100 - poiShare;

  const channelCompareOption: EChartsOption = {
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "shadow" },
      backgroundColor: "rgba(255, 255, 255, 0.95)",
      borderColor: "#e8f7f3",
      borderWidth: 1,
      padding: [10, 14],
      textStyle: { color: "#345f57", fontSize: 12 },
      formatter: (params: unknown) => {
        const p = params as Array<{ seriesName: string; axisValue: string; value: number; color: string }>;
        return `<strong>${p[0].axisValue}</strong><br/>${p.map((item) => `<span style="display:inline-block;margin-right:6px;border-radius:4px;width:10px;height:10px;background-color:${item.color}"></span>${item.seriesName}: ${item.value.toLocaleString()}</span>`).join("<br/>")}`;
      }
    },
    legend: { top: 18, left: 16, itemGap: 16, itemWidth: 18, itemHeight: 10, textStyle: { fontSize: 11, color: "#345f57", fontWeight: 700 } },
    grid: { left: 60, right: 54, top: 76, bottom: 38, containLabel: true },
    xAxis: {
      type: "category",
      data: ["POI", "直播"],
      axisTick: { show: false },
      axisLabel: { fontSize: 12, color: "#345f57", fontWeight: 600 },
      axisLine: { lineStyle: { color: "#e8f7f3" } }
    },
    yAxis: [
      {
        type: "value",
        name: "成交券数",
        axisLabel: { formatter: (v: number) => `${Math.round(v / 1000)}k`, color: "#6a8a83", fontSize: 10 },
        axisLine: { show: false },
        axisTick: { show: false },
        splitLine: { lineStyle: { color: "#f2faf7", type: "dashed" } }
      },
      {
        type: "value",
        name: "成交金额(万元)",
        axisLabel: { formatter: (v: number) => `${v}`, color: "#6a8a83", fontSize: 10 },
        axisLine: { show: false },
        axisTick: { show: false },
        splitLine: { show: false }
      }
    ],
    color: ["#43b9ae", "#f59bb8"],
    series: [
      {
        name: "成交券数",
        type: "bar",
        barWidth: 48,
        itemStyle: {
          borderRadius: [10, 10, 0, 0],
          color: {
            type: "linear",
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: "#54c7b7" },
              { offset: 1, color: "#43b9ae" }
            ]
          },
          shadowColor: "rgba(67, 185, 174, 0.35)",
          shadowBlur: 12,
          shadowOffsetY: 6
        },
        emphasis: {
          itemStyle: {
            color: {
              type: "linear",
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: "#6dd5c7" },
                { offset: 1, color: "#54c7b7" }
              ]
            }
          }
        },
        animationDuration: 1500,
        animationEasing: "elasticOut",
        data: [poiChannelRow.metric.saleCount, livestreamTotalMetric.saleCount]
      },
      {
        name: "成交金额(万元)",
        type: "line",
        yAxisIndex: 1,
        smooth: true,
        symbol: "circle",
        symbolSize: 12,
        lineStyle: { width: 3, color: "#f59bb8" },
        itemStyle: {
          color: "#f59bb8",
          borderColor: "#fff",
          borderWidth: 2,
          shadowColor: "rgba(245, 155, 184, 0.4)",
          shadowBlur: 8,
          shadowOffsetY: 3
        },
        emphasis: {
          scale: true,
          itemStyle: {
            borderWidth: 3
          }
        },
        animationDuration: 2000,
        animationEasing: "cubicInOut",
        data: [
          Number((poiChannelRow.metric.saleAmount / 10000).toFixed(2)),
          Number((livestreamTotalMetric.saleAmount / 10000).toFixed(2))
        ]
      }
    ]
  };

  const channelEfficiencyOption: EChartsOption = {
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "shadow" },
      valueFormatter: (value) => `${Number(value).toFixed(2)}%`
    },
    legend: { top: 18, left: 16, itemGap: 16, itemWidth: 18, itemHeight: 10, textStyle: { fontSize: 11, color: "#345f57", fontWeight: 700 } },
    grid: { left: 56, right: 28, top: 86, bottom: 48, containLabel: true },
    xAxis: {
      type: "category",
      data: ["PV访问率", "访问成交率", "退款率", "新客占比"],
      axisTick: { show: false },
      axisLabel: { fontSize: 11, color: "#345f57", fontWeight: 700, interval: 0 }
    },
    yAxis: {
      type: "value",
      axisLabel: { formatter: "{value}%", color: "#6a8a83", fontSize: 10 },
      splitLine: { lineStyle: { color: "#f2faf7", type: "dashed" } }
    },
    color: ["#43b9ae", "#f59bb8"],
    series: [
      {
        name: "POI",
        type: "bar",
        barWidth: 18,
        itemStyle: { borderRadius: [6, 6, 0, 0] },
        data: [
          rateOf(poiChannelRow.metric.visitPv, poiChannelRow.metric.exposures),
          rateOf(poiChannelRow.metric.saleCount, poiChannelRow.metric.visitPv),
          rateOf(poiChannelRow.metric.refundCount, poiChannelRow.metric.saleCount),
          rateOf(poiChannelRow.metric.newCustomerBuyers, poiChannelRow.metric.buyers)
        ].map((value) => Number(value.toFixed(2)))
      },
      {
        name: "直播",
        type: "bar",
        barWidth: 18,
        itemStyle: { borderRadius: [6, 6, 0, 0] },
        data: [
          rateOf(livestreamTotalMetric.visitPv, livestreamTotalMetric.exposures),
          rateOf(livestreamTotalMetric.saleCount, livestreamTotalMetric.visitPv),
          rateOf(livestreamTotalMetric.refundCount, livestreamTotalMetric.saleCount),
          rateOf(livestreamTotalMetric.newCustomerBuyers, livestreamTotalMetric.buyers)
        ].map((value) => Number(value.toFixed(2)))
      }
    ]
  };

  return (
    <div className="charts-layout data-dashboard-layout">
      <div className="business-channel-grid">
        <ChannelBlock
          accent="poi"
          badge="独立板块"
          description="本地生活 POI 入口，主力成交渠道。"
          highlight={`占比 ${poiShare.toFixed(2)}%`}
          icon={MapPin}
          metric={{
            label: "成交券数 / 金额",
            value: `${numberFormatter.format(poiChannelRow.metric.saleCount)} 张`,
            extra: `¥${currencyFormatter.format(poiChannelRow.metric.saleAmount)}`
          }}
          onClick={onEnterPoi}
          productName={poiChannelRow.productName}
          stats={[
            { label: "商品曝光", value: numberFormatter.format(poiChannelRow.metric.exposures) },
            { label: "成交人数", value: numberFormatter.format(poiChannelRow.metric.buyers) },
            { label: "退款券数", value: numberFormatter.format(poiChannelRow.metric.refundCount) }
          ]}
          title="POI"
        />

        <ChannelBlock
          accent="livestream"
          badge="3 个子渠道"
          description="官号+团购、KOL达人、矩阵号，点击进入可进一步查看。"
          highlight={`占比 ${livestreamShare.toFixed(2)}%`}
          icon={Radio}
          metric={{
            label: "成交券数 / 金额",
            value: `${numberFormatter.format(livestreamTotalMetric.saleCount)} 张`,
            extra: `¥${currencyFormatter.format(livestreamTotalMetric.saleAmount)}`
          }}
          onClick={onEnterLivestream}
          productName="官号+团购 / KOL达人 / 矩阵号"
          stats={[
            { label: "商品曝光", value: numberFormatter.format(livestreamTotalMetric.exposures) },
            { label: "成交人数", value: numberFormatter.format(livestreamTotalMetric.buyers) },
            { label: "退款券数", value: numberFormatter.format(livestreamTotalMetric.refundCount) }
          ]}
          subChannels={livestreamChannelKeys.map((key) => {
            const row = findChannelRow(key);
            if (!row) {
              return null;
            }
            return {
              key,
              name: row.name,
              icon: key === "KOL达人" ? Users : key === "矩阵号" ? Video : ShoppingCart,
              saleCount: row.metric.saleCount,
              saleAmount: row.metric.saleAmount
            };
          }).filter((item): item is NonNullable<typeof item> => item !== null)}
          title="直播"
        />
      </div>

      <section className="channel-compare-board">
        <div className="channel-compare-board__heading">
          <strong>渠道间数据可视化对比</strong>
          <span>POI vs 直播 · 成交与份额对比</span>
        </div>
        <div className="channel-compare-grid">
          <ChartTile option={channelCompareOption} title="成交体量对比" subtitle="成交券数与成交金额" />
          <ChartTile option={channelEfficiencyOption} title="渠道转化效率对比" subtitle="PV访问、访问成交、退款和新客" footnote="百分数公式：PV访问率=访问次数/曝光次数；访问成交率=成交券数/访问次数；退款率=退款券数/成交券数。" />
        </div>
      </section>
    </div>
  );
}

function LivestreamOverview({
  onBack,
  onSelect
}: {
  onBack: () => void;
  onSelect: (key: LivestreamChannelKey) => void;
}) {
  const livestreamChannelConfigs: {
    key: LivestreamChannelKey;
    name: string;
    icon: LucideIcon;
    description: string;
  }[] = [
    { key: "官号+团购", name: "官号+团购", icon: ShoppingCart, description: "品牌官号+团购入口的成交数据" },
    { key: "KOL达人", name: "KOL达人", icon: Users, description: "KOL 达人直播与短视频成交" },
    { key: "矩阵号", name: "矩阵号", icon: Video, description: "品牌矩阵号与达播联动数据" }
  ];

  const livestreamSubRows = livestreamChannelKeys
    .map((key) => findChannelRow(key))
    .filter((row): row is ChannelRow => Boolean(row));

  const livestreamTotalSale = livestreamSubRows.reduce((sum, r) => sum + r.metric.saleCount, 0);
  const livestreamTotalAmount = livestreamSubRows.reduce((sum, r) => sum + r.metric.saleAmount, 0);

  const livestreamVolumeOption: EChartsOption = {
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "shadow" },
      backgroundColor: "rgba(255, 255, 255, 0.95)",
      borderColor: "#fce8ed",
      borderWidth: 1,
      padding: [10, 14],
      textStyle: { color: "#345f57", fontSize: 12 },
      formatter: (params: unknown) => {
        const p = params as Array<{ seriesName: string; axisValue: string; value: number; color: string }>;
        return `<strong>${p[0].axisValue}</strong><br/>${p.map((item) => `<span style="display:inline-block;margin-right:6px;border-radius:4px;width:10px;height:10px;background-color:${item.color}"></span>${item.seriesName}: ${item.value.toLocaleString()}</span>`).join("<br/>")}`;
      }
    },
    legend: { top: 18, left: 16, itemGap: 16, itemWidth: 18, itemHeight: 10, textStyle: { fontSize: 11, color: "#345f57", fontWeight: 700 } },
    grid: { left: 60, right: 54, top: 88, bottom: 46, containLabel: true },
    xAxis: {
      type: "category",
      data: livestreamSubRows.map((r) => r.name),
      axisTick: { show: false },
      axisLabel: { fontSize: 12, color: "#345f57", fontWeight: 600 },
      axisLine: { lineStyle: { color: "#fce8ed" } }
    },
    yAxis: [
      {
        type: "value",
        name: "成交券数",
        axisLabel: { formatter: (v: number) => `${Math.round(v / 1000)}k`, color: "#6a8a83", fontSize: 10 },
        axisLine: { show: false },
        axisTick: { show: false },
        splitLine: { lineStyle: { color: "#fcf0f3", type: "dashed" } }
      },
      {
        type: "value",
        name: "成交金额(万元)",
        axisLabel: { formatter: (v: number) => `${v}`, color: "#6a8a83", fontSize: 10 },
        axisLine: { show: false },
        axisTick: { show: false },
        splitLine: { show: false }
      }
    ],
    color: ["#f59bb8", "#78bde8"],
    series: [
      {
        name: "成交券数",
        type: "bar",
        barWidth: 36,
        itemStyle: {
          borderRadius: [10, 10, 0, 0],
          color: {
            type: "linear",
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: "#ffc6d4" },
              { offset: 1, color: "#f59bb8" }
            ]
          },
          shadowColor: "rgba(245, 155, 184, 0.35)",
          shadowBlur: 12,
          shadowOffsetY: 6
        },
        emphasis: {
          itemStyle: {
            color: {
              type: "linear",
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: "#ffe0e8" },
                { offset: 1, color: "#ffc6d4" }
              ]
            }
          }
        },
        animationDuration: 1500,
        animationEasing: "elasticOut",
        data: livestreamSubRows.map((r) => r.metric.saleCount)
      },
      {
        name: "成交金额(万元)",
        type: "line",
        yAxisIndex: 1,
        smooth: true,
        symbol: "circle",
        symbolSize: 12,
        lineStyle: { width: 3, color: "#78bde8" },
        itemStyle: {
          color: "#78bde8",
          borderColor: "#fff",
          borderWidth: 2,
          shadowColor: "rgba(120, 189, 232, 0.4)",
          shadowBlur: 8,
          shadowOffsetY: 3
        },
        emphasis: {
          scale: true,
          itemStyle: {
            borderWidth: 3
          }
        },
        animationDuration: 2000,
        animationEasing: "cubicInOut",
        data: livestreamSubRows.map((r) => Number((r.metric.saleAmount / 10000).toFixed(2)))
      }
    ]
  };

  const livestreamRatioOption: EChartsOption = {
    tooltip: {
      trigger: "axis",
      backgroundColor: "rgba(255, 255, 255, 0.95)",
      borderColor: "#fce8ed",
      borderWidth: 1,
      padding: [10, 14],
      textStyle: { color: "#345f57", fontSize: 12 }
    },
    legend: { top: 18, left: 16, itemGap: 14, itemWidth: 16, itemHeight: 9, textStyle: { fontSize: 11, color: "#5a7a73", fontWeight: 700 } },
    grid: { left: 60, right: 54, top: 88, bottom: 46, containLabel: true },
    xAxis: {
      type: "category",
      data: livestreamSubRows.map((r) => r.name),
      axisTick: { show: false },
      axisLabel: { fontSize: 12, color: "#345f57", fontWeight: 600 },
      axisLine: { lineStyle: { color: "#fce8ed" } }
    },
    yAxis: {
      type: "value",
      axisLabel: { formatter: "{value}%", color: "#6a8a83", fontSize: 10 },
      axisLine: { show: false },
      axisTick: { show: false },
      splitLine: { lineStyle: { color: "#fcf0f3", type: "dashed" } }
    },
    color: ["#f59bb8", "#78bde8", "#a88bea", "#ffd36d"],
    series: [
      {
        name: "PV访问率",
        type: "bar",
        barWidth: 28,
                itemStyle: {
          borderRadius: [8, 8, 0, 0],
          color: {
            type: "linear",
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: "#ffc6d4" },
              { offset: 1, color: "#f59bb8" }
            ]
          }
        },
        animationDuration: 1200,
        animationEasing: "cubicOut",
        data: livestreamSubRows.map((r) => Number(rateOf(r.metric.visitPv, r.metric.exposures).toFixed(2)))
      },
      {
        name: "访问成交率",
        type: "bar",
        barWidth: 28,
                itemStyle: {
          borderRadius: [8, 8, 0, 0],
          color: {
            type: "linear",
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: "#99ceef" },
              { offset: 1, color: "#78bde8" }
            ]
          }
        },
        animationDuration: 1400,
        animationEasing: "cubicOut",
        data: livestreamSubRows.map((r) => Number(rateOf(r.metric.saleCount, r.metric.visitPv).toFixed(2)))
      },
      {
        name: "退款率",
        type: "bar",
        barWidth: 28,
                itemStyle: {
          borderRadius: [8, 8, 0, 0],
          color: {
            type: "linear",
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: "#d4c6f2" },
              { offset: 1, color: "#a88bea" }
            ]
          }
        },
        animationDuration: 1600,
        animationEasing: "cubicOut",
        data: livestreamSubRows.map((r) => Number(rateOf(r.metric.refundCount, r.metric.saleCount).toFixed(2)))
      },
      {
        name: "新客占比",
        type: "bar",
        barWidth: 28,
                itemStyle: {
          borderRadius: [8, 8, 0, 0],
          color: {
            type: "linear",
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: "#ffe0a8" },
              { offset: 1, color: "#ffd36d" }
            ]
          }
        },
        animationDuration: 1800,
        animationEasing: "cubicOut",
        data: livestreamSubRows.map((r) => Number(rateOf(r.metric.newCustomerBuyers, r.metric.buyers).toFixed(2)))
      }
    ]
  };

  return (
    <div className="charts-layout data-dashboard-layout">
      <div className="data-dashboard-breadcrumb">
        <button className="breadcrumb-link" onClick={onBack} type="button">
          返回 渠道总览
        </button>
        <ChevronRight aria-hidden="true" size={14} />
        <span>直播</span>
      </div>

      <div className="business-channel-grid livestream-sub-grid">
        {livestreamChannelConfigs.map(({ key, name, icon: Icon, description }) => {
          const row = findChannelRow(key);
          if (!row) {
            return null;
          }
          const share = livestreamTotalSale ? (row.metric.saleCount / livestreamTotalSale) * 100 : 0;
          return (
            <ChannelBlock
              key={key}
              accent="livestream"
              description={description}
              icon={Icon}
              metric={{
                label: "成交券数 / 金额",
                value: `${numberFormatter.format(row.metric.saleCount)} 张`,
                extra: `¥${currencyFormatter.format(row.metric.saleAmount)}`
              }}
              onClick={() => onSelect(key)}
              productName={row.productName}
              stats={[
                { label: "商品曝光", value: numberFormatter.format(row.metric.exposures) },
                { label: "成交人数", value: numberFormatter.format(row.metric.buyers) },
                { label: "退款券数", value: numberFormatter.format(row.metric.refundCount) }
              ]}
              highlight={`直播占比 ${share.toFixed(2)}%`}
              title={name}
            />
          );
        })}
      </div>

      <section className="channel-compare-board channel-compare-board--livestream">
        <div className="channel-compare-board__heading">
          <strong>直播板块数据可视化对比</strong>
          <span>
            官号+团购 / KOL达人 / 矩阵号 · 合计 {numberFormatter.format(livestreamTotalSale)} 张 / ¥
            {currencyFormatter.format(livestreamTotalAmount)}
          </span>
        </div>
        <div className="channel-compare-grid">
          <ChartTile option={livestreamVolumeOption} title="直播子渠道成交体量" subtitle="券数与金额" />
          <ChartTile option={livestreamRatioOption} title="直播转化效率对比" subtitle="PV访问率、访问成交率、退款率、新客占比" footnote="百分数公式按相邻环节计算：PV访问率=访问次数/曝光次数，访问成交率=成交券数/访问次数，退款率=退款券数/成交券数。" />
        </div>

      </section>
    </div>
  );
}

function ChannelBlock({
  title,
  icon: Icon,
  description,
  productName,
  metric,
  stats,
  highlight,
  badge,
  accent,
  onClick,
  subChannels
}: {
  title: string;
  icon: LucideIcon;
  description: string;
  productName: string;
  metric: { label: string; value: string; extra: string };
  stats: { label: string; value: string }[];
  highlight?: string;
  badge?: string;
  accent: "poi" | "livestream";
  onClick: () => void;
  subChannels?: { key: string; name: string; icon: LucideIcon; saleCount: number; saleAmount: number }[];
}) {
  return (
    <button
      aria-label={`查看 ${title} 板块详情`}
      className={`channel-block channel-block--${accent}`}
      onClick={onClick}
      type="button"
    >
      <header className="channel-block__head">
        <div className="channel-block__icon">
          <Icon aria-hidden="true" size={22} />
        </div>
        <div className="channel-block__heading">
          <div className="channel-block__title-row">
            <strong>{title}</strong>
            {badge ? <span className="channel-block__badge">{badge}</span> : null}
          </div>
          <span className="channel-block__product">{productName}</span>
        </div>
        <ChevronRight aria-hidden="true" className="channel-block__arrow" size={18} />
      </header>

      <p className="channel-block__description">{description}</p>

      <div className="channel-block__metric">
        <small>{metric.label}</small>
        <strong>{metric.value}</strong>
        <em>{metric.extra}</em>
        {highlight ? <span className="channel-block__highlight">{highlight}</span> : null}
      </div>

      <div className="channel-block__stats">
        {stats.map((stat) => (
          <div className="channel-block__stat" key={stat.label}>
            <span>{stat.label}</span>
            <strong>{stat.value}</strong>
          </div>
        ))}
      </div>

      {subChannels?.length ? (
        <div className="channel-block__subchannels">
          <span className="channel-block__subchannels-title">子渠道预览 · 点击进入直播再选择</span>
          <ul>
            {subChannels.map((sub) => {
              const SubIcon = sub.icon;
              return (
                <li key={sub.key}>
                  <SubIcon aria-hidden="true" size={14} />
                  <strong>{sub.name}</strong>
                  <em>
                    {numberFormatter.format(sub.saleCount)} 张 / ¥{currencyFormatter.format(sub.saleAmount)}
                  </em>
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}
    </button>
  );
}

function BusinessChannelDetail({ channel, onBack }: BusinessChannelDetailProps) {
  const lactoText = "#345f57";
  const visitRate = rateOf(channel.metric.visitPv, channel.metric.exposures);
  const conversionRate = rateOf(channel.metric.saleCount, channel.metric.exposures);
  const refundRate = rateOf(channel.metric.refundCount, channel.metric.saleCount);
  const averageTicket = channel.metric.saleAmount / channel.metric.saleCount;

  const charts = useMemo(() => {
    const dateLabels = businessDates;
    const dailyTrendOption: EChartsOption = {
      tooltip: { trigger: "axis" },
      legend: { top: 18, left: 16, itemGap: 16, itemWidth: 18, itemHeight: 10, textStyle: { color: lactoText, fontSize: 11, fontWeight: 700 } },
      grid: { left: 62, right: 62, top: 82, bottom: 42, containLabel: true },
      xAxis: { type: "category", data: dateLabels as unknown as string[], axisTick: { show: false } },
      yAxis: [
        { type: "value", name: "券数", axisLabel: { formatter: (v: number) => `${Math.round(v / 1000)}k` } },
        { type: "value", name: "万元", axisLabel: { formatter: (v: number) => `${v}` } }
      ],
      color: ["#74d8c5", "#f59bb8"],
      series: [
        {
          name: "成交券数",
          type: "bar",
          data: channel.byDate.map((d) => d.saleCount),
          barWidth: 24,
          itemStyle: { borderRadius: [7, 7, 0, 0] }
        },
        {
          name: "成交金额(万元)",
          type: "line",
          yAxisIndex: 1,
          smooth: true,
          symbolSize: 8,
          data: channel.byDate.map((d) => Number((d.saleAmount / 10000).toFixed(2)))
        }
      ]
    };

    const exposureVisitOption: EChartsOption = {
      tooltip: { trigger: "axis", axisPointer: { type: "shadow" } },
      legend: { top: 18, left: 16, itemGap: 16, itemWidth: 18, itemHeight: 10, textStyle: { color: lactoText, fontSize: 11, fontWeight: 700 } },
      grid: { left: 62, right: 56, top: 82, bottom: 42, containLabel: true },
      xAxis: { type: "category", data: dateLabels as unknown as string[], axisTick: { show: false } },
      yAxis: [
        { type: "value", name: "曝光", axisLabel: { formatter: (v: number) => `${Math.round(v / 10000)}万` } },
        { type: "value", name: "访问", axisLabel: { formatter: (v: number) => `${Math.round(v / 1000)}k` } }
      ],
      color: ["#43b9ae", "#a88bea"],
      series: [
        {
          name: "商品曝光次数",
          type: "bar",
          barWidth: 22,
          itemStyle: { borderRadius: [6, 6, 0, 0] },
          data: channel.byDate.map((d) => d.exposures)
        },
        {
          name: "商品访问人数",
          type: "line",
          yAxisIndex: 1,
          smooth: true,
          symbolSize: 8,
          data: channel.byDate.map((d) => d.visits)
        }
      ]
    };

        const customerCompareOption: EChartsOption = {
      tooltip: {
        trigger: "axis",
        axisPointer: { type: "shadow" },
        valueFormatter: (value) => `${numberFormatter.format(Number(value))} 人`
      },
      grid: { left: 110, right: 24, top: 28, bottom: 36, containLabel: true },
      xAxis: {
        type: "value",
        axisLabel: { color: "#547069", fontSize: 11 },
        splitLine: { lineStyle: { color: "#d7e9e3" } }
      },
      yAxis: {
        type: "category",
        data: ["老客成交人数", "新客成交人数", "退款人数"],
        axisTick: { show: false },
        axisLabel: { color: lactoText, fontSize: 12, fontWeight: 700 }
      },
      color: ["#43b9ae"],
      series: [
        {
          name: "人数",
          type: "bar",
          barWidth: 18,
          label: { show: true, position: "right", color: lactoText, fontSize: 11, formatter: (params) => numberFormatter.format(Number(params.value)) },
          itemStyle: { borderRadius: [0, 7, 7, 0] },
          data: [
            channel.metric.buyers - channel.metric.newCustomerBuyers,
            channel.metric.newCustomerBuyers,
            channel.metric.refundUsers
          ]
        }
      ]
    };

    return {
      dailyTrendOption,
      exposureVisitOption,
      customerCompareOption
    };
  }, [channel, lactoText]);

  return (
    <div className="charts-layout data-dashboard-layout">
      <div className="data-dashboard-breadcrumb">
        <button className="breadcrumb-link" onClick={onBack} type="button">
          返回上一级
        </button>
        <ChevronRight aria-hidden="true" size={14} />
        <span>{channel.name}</span>
      </div>

      <section className="presale-board business-board">
        <div className="presale-board__header">
          <div>
            <span className="presale-board__date">2026-07-10 至 2026-07-12</span>
            <h3>{channel.name} · 生意经详情</h3>
            <p>
              关联商品：{channel.productName}（商品id：{channel.productId}）。点击右侧返回可回到渠道总览或直播子渠道。
            </p>
          </div>
          <span className="presale-board__badge">
            <CheckCircle2 aria-hidden="true" size={16} />
            已记录 {channel.byDate.length} 天数据
          </span>
        </div>

        <div aria-label={`${channel.name}核心指标`} className="presale-metric-grid business-metric-grid">
          <article className="presale-metric">
            <span>商品曝光次数</span>
            <strong>{numberFormatter.format(channel.metric.exposures)}</strong>
            <small>曝光到访问 {visitRate.toFixed(2)}%</small>
          </article>
          <article className="presale-metric">
            <span>商品访问人数</span>
            <strong>{numberFormatter.format(channel.metric.visits)}</strong>
            <small>访问/曝光 {visitRate.toFixed(2)}%</small>
          </article>
          <article className="presale-metric">
            <span>成交券数</span>
            <strong>{numberFormatter.format(channel.metric.saleCount)}</strong>
            <small>成交金额 ¥{currencyFormatter.format(channel.metric.saleAmount)}</small>
          </article>
          <article className="presale-metric">
            <span>整体转化率</span>
            <strong>{conversionRate.toFixed(2)}%</strong>
            <small>成交券数 / 商品曝光次数</small>
          </article>
          <article className="presale-metric">
            <span>新客成交人数</span>
            <strong>{numberFormatter.format(channel.metric.newCustomerBuyers)}</strong>
            <small>新客金额 ¥{currencyFormatter.format(channel.metric.newCustomerAmount)}</small>
          </article>
          <article className="presale-metric">
            <span>退款券数</span>
            <strong>{numberFormatter.format(channel.metric.refundCount)}</strong>
            <small>退款率 {refundRate.toFixed(2)}% · 退款金额 ¥{currencyFormatter.format(channel.metric.refundAmount)}</small>
          </article>
          <article className="presale-metric">
            <span>商品访问次数</span>
            <strong>{numberFormatter.format(channel.metric.visitPv)}</strong>
            <small>PV 漏斗第二层</small>
          </article>
          <article className="presale-metric">
            <span>平均单券金额</span>
            <strong>¥{currencyFormatter.format(averageTicket)}</strong>
            <small>成交金额 / 成交券数</small>
          </article>
        </div>

        <div className="presale-block-heading">
          <h4>分天明细</h4>
          <span>2026-07-10 ~ 2026-07-12</span>
        </div>
        <div className="presale-day-grid">
          {channel.byDate.map((d) => {
            const dayVisitRate = rateOf(d.visitPv, d.exposures);
            const dayConv = rateOf(d.saleCount, d.visitPv);
            return (
              <article className="presale-day-card" key={d.date}>
                <div>
                  <strong>{d.date}</strong>
                  <span>3天连续监测</span>
                </div>
                <dl>
                  <div>
                    <dt>商品曝光次数</dt>
                    <dd>{numberFormatter.format(d.exposures)}</dd>
                  </div>
                  <div>
                    <dt>商品访问次数 / 人数</dt>
                    <dd>{numberFormatter.format(d.visitPv)} / {numberFormatter.format(d.visits)}</dd>
                  </div>
                  <div>
                    <dt>成交券数</dt>
                    <dd>{numberFormatter.format(d.saleCount)} 张</dd>
                  </div>
                  <div>
                    <dt>成交金额</dt>
                    <dd>¥{currencyFormatter.format(d.saleAmount)}</dd>
                  </div>
                  <div>
                    <dt>曝光到访问</dt>
                    <dd>{dayVisitRate.toFixed(2)}%</dd>
                  </div>
                  <div>
                    <dt>转化率</dt>
                    <dd>{dayConv.toFixed(2)}%</dd>
                  </div>
                </dl>
              </article>
            );
          })}
        </div>

        <div className="presale-block-heading">
          <h4>可视化拆解</h4>
          <span>柱线、PV/UV双漏斗、双轴、人群条形</span>
        </div>
        <div className="presale-visual-grid">
          <ChartTile option={charts.dailyTrendOption} title="分天成交趋势" subtitle="券数与金额" />
          <ChannelFunnelBoard channel={channel} />
          <ChartTile option={charts.exposureVisitOption} title="曝光与访问双轴" subtitle="日维度对照" wide />
          <ChartTile option={charts.customerCompareOption} title="成交人群对照" subtitle="老客、新客和退款人数" footnote="占比=当前人数 / 成交人数 × 100%，退款人数用于观察售后压力。" />
        </div>

      </section>
    </div>
  );
}

function PresaleDataBoard() {
  const totalCount = presaleDailySummary.reduce((total, day) => total + day.saleCount, 0);
  const totalAmount = presaleDailySummary.reduce((total, day) => total + day.saleAmount, 0);
  const latestCountChange = presaleDailySummary[2].saleCount - presaleDailySummary[1].saleCount;
  const latestAmountChange = presaleDailySummary[2].saleAmount - presaleDailySummary[1].saleAmount;
  const maxSchemeCount = Math.max(...presaleSchemeRows.map((scheme) => scheme.totalCount));
  const firstToLastCountChange = presaleDailySummary[2].saleCount - presaleDailySummary[0].saleCount;
  const firstToLastAmountChange = presaleDailySummary[2].saleAmount - presaleDailySummary[0].saleAmount;
  const averageTicketAmount = totalAmount / totalCount;
  const poiRow = presaleSchemeRows.find((scheme) => scheme.shortName === "POI");
  const poiShare = poiRow ? (poiRow.totalCount / totalCount) * 100 : 0;
  const xiaohongshuJuly12 = presaleChannelGroups.find((group) => group.name === "小红书")?.values[2] ?? 0;
  const xiaohongshuJuly11 = presaleChannelGroups.find((group) => group.name === "小红书")?.values[1] ?? 0;
  const analysisCards = [
    {
      label: "三日峰值日",
      value: `7月10日 ${numberFormatter.format(presaleDailySummary[0].saleCount)} 张`,
      note: "售卖券数与金额均为三日最高，后两日进入回落。"
    },
    {
      label: "7月10日至7月12日变化",
      value: `${numberFormatter.format(firstToLastCountChange)} 张`,
      note: `券数 ${((firstToLastCountChange / presaleDailySummary[0].saleCount) * 100).toFixed(1)}%，金额 ${((firstToLastAmountChange / presaleDailySummary[0].saleAmount) * 100).toFixed(1)}%。`
    },
    {
      label: "主渠道集中度",
      value: `POI ${poiShare.toFixed(2)}%`,
      note: `三日 POI 合计 ${numberFormatter.format(poiRow?.totalCount ?? 0)} 张，是售卖基本盘。`
    },
    {
      label: "7月12日新增动能",
      value: `小红书 ${numberFormatter.format(xiaohongshuJuly12)} 张`,
      note: `7月11日为 ${numberFormatter.format(xiaohongshuJuly11)} 张，7月12日主要由武汉小红书放量。`
    },
    {
      label: "三日平均单券金额",
      value: `¥${currencyFormatter.format(averageTicketAmount)}`,
      note: "9.90 元方案贡献主量，10.90 元方案抬高局部均价。"
    }
  ];
  const charts = useMemo(() => {
    const dateLabels = presaleDailySummary.map((day) => day.label);
    const lactoText = "#345f57";
    const channelColors = ["#74d8c5", "#b9ec70", "#78bde8", "#f59bb8", "#ffd36d", "#a88bea"];
    const dailyTrendOption: EChartsOption = {
      tooltip: { trigger: "axis" },
      legend: { top: 18, left: 16, itemGap: 16, itemWidth: 18, itemHeight: 10, textStyle: { fontSize: 11, color: lactoText, fontWeight: 700 } },
      grid: { left: 60, right: 62, top: 82, bottom: 42, containLabel: true },
      xAxis: {
        type: "category",
        data: dateLabels,
        axisTick: { show: false }
      },
      yAxis: [
        {
          type: "value",
          name: "券数",
          axisLabel: { formatter: (value: number) => `${Math.round(value / 1000)}k` }
        },
        {
          type: "value",
          name: "万元",
          axisLabel: { formatter: (value: number) => `${value}` }
        }
      ],
      color: ["#74d8c5", "#f59bb8"],
      series: [
        {
          name: "售卖券数",
          type: "bar",
          data: presaleDailySummary.map((day) => day.saleCount),
          barWidth: 24,
          itemStyle: { borderRadius: [7, 7, 0, 0] }
        },
        {
          name: "售卖金额(万元)",
          type: "line",
          yAxisIndex: 1,
          smooth: true,
          symbolSize: 8,
          data: presaleDailySummary.map((day) => Number((day.saleAmount / 10000).toFixed(1)))
        }
      ]
    };

    const channelStackOption: EChartsOption = {
      tooltip: { trigger: "axis", axisPointer: { type: "shadow" } },
      legend: {
        top: 18,
        left: 16,
        itemGap: 12,
        itemHeight: 9,
        itemWidth: 10,
        textStyle: { fontSize: 10, color: lactoText, fontWeight: 700 }
      },
      grid: { left: 56, right: 24, top: 78, bottom: 38, containLabel: true },
      xAxis: {
        type: "category",
        data: dateLabels,
        axisTick: { show: false }
      },
      yAxis: {
        type: "value",
        axisLabel: { formatter: (value: number) => `${Math.round(value / 1000)}k` }
      },
      color: channelColors,
      series: presaleChannelGroups.map((group) => ({
        name: group.name,
        type: "bar",
        stack: "presale",
        barWidth: 34,
        emphasis: { focus: "series" },
        data: [...group.values]
      }))
    };

    const hourlyTrendOption: EChartsOption = {
      tooltip: { trigger: "axis" },
      legend: { top: 18, left: 16, itemGap: 16, itemWidth: 18, itemHeight: 10, textStyle: { fontSize: 11, color: lactoText, fontWeight: 700 } },
      grid: { left: 58, right: 54, top: 82, bottom: 42, containLabel: true },
      xAxis: {
        type: "category",
        data: presaleHourlyTrend.map((point) => point.hour),
        axisTick: { show: false }
      },
      yAxis: {
        type: "value",
        name: "券数",
        axisLabel: { formatter: (value: number) => `${Math.round(value / 1000)}k` }
      },
      color: ["#43b9ae", "#f59bb8"],
      series: [
        {
          name: "7月12日筛选曲线",
          type: "line",
          smooth: true,
          symbolSize: 5,
          areaStyle: { opacity: 0.12 },
          data: presaleHourlyTrend.map((point) => point.july12)
        },
        {
          name: "7月11日对照曲线",
          type: "line",
          smooth: true,
          symbolSize: 5,
          data: presaleHourlyTrend.map((point) => point.july11)
        }
      ]
    };

    const channelShareOption: EChartsOption = {
      tooltip: {
        trigger: "axis",
        axisPointer: { type: "shadow" },
        valueFormatter: (value) => `${Number(value).toFixed(1)}%`
      },
      legend: {
        top: 18,
        left: 16,
        itemGap: 12,
        itemHeight: 9,
        itemWidth: 10,
        textStyle: { fontSize: 10, color: lactoText, fontWeight: 700 }
      },
      grid: { left: 56, right: 24, top: 78, bottom: 40, containLabel: true },
      xAxis: {
        type: "category",
        data: dateLabels,
        axisTick: { show: false }
      },
      yAxis: {
        type: "value",
        max: 100,
        axisLabel: { formatter: "{value}%" }
      },
      color: channelColors,
      series: presaleChannelGroups.map((group) => ({
        name: group.name,
        type: "bar",
        stack: "share",
        barWidth: 34,
        emphasis: { focus: "series" },
        data: group.values.map((value, index) => Number(((value / presaleDailySummary[index].saleCount) * 100).toFixed(2)))
      }))
    };

    const amountShareOption: EChartsOption = {
      tooltip: { trigger: "item" },
      legend: {
        bottom: 2,
        left: "center",
        itemGap: 8,
        itemHeight: 9,
        itemWidth: 9,
        textStyle: { fontSize: 10 }
      },
      color: ["#74d8c5", "#b9ec70", "#f59bb8", "#78bde8", "#ffd36d", "#a88bea", "#f7b267"],
      series: [
        {
          name: "三日确认金额",
          type: "pie",
          radius: ["42%", "66%"],
          center: ["50%", "42%"],
          avoidLabelOverlap: true,
          label: { color: lactoText, formatter: "{b}", fontSize: 10 },
          labelLine: { length: 7, length2: 4 },
          data: presaleAmountShareRows
        }
      ]
    };

    const schemeHeatmapOption: EChartsOption = {
      tooltip: {
        position: "top",
        formatter: (params) => {
          const point = params as { data?: [number, number, number] };
          const data = point.data;
          if (!data) {
            return "";
          }
          const dateLabel = presaleDailySummary[data[0]].date;
          const groupLabel = presaleChannelGroups[data[1]].name;
          return `${dateLabel}<br/>${groupLabel}：${numberFormatter.format(data[2])} 张`;
        }
      },
      grid: { left: 58, right: 24, top: 36, bottom: 70, containLabel: true },
      xAxis: {
        type: "category",
        data: dateLabels,
        axisTick: { show: false }
      },
      yAxis: {
        type: "category",
        data: presaleChannelGroups.map((group) => group.name),
        axisTick: { show: false }
      },
      visualMap: {
        min: 0,
        max: Math.max(...presaleChannelGroups.flatMap((group) => [...group.values])),
        calculable: false,
        orient: "horizontal",
        left: "center",
        bottom: 12,
        inRange: { color: ["#fff9eb", "#bdf1de", "#43b9ae"] }
      },
      series: [
        {
          name: "方案券数",
          type: "heatmap",
          data: presaleChannelGroups.flatMap((group, groupIndex) =>
            group.values.map((value, dateIndex) => [dateIndex, groupIndex, value])
          ),
          label: { show: false },
          emphasis: { itemStyle: { borderColor: "#19433e", borderWidth: 1 } }
        }
      ]
    };

    const averageTicketOption: EChartsOption = {
      tooltip: {
        trigger: "axis",
        valueFormatter: (value) => `¥${currencyFormatter.format(Number(value))}`
      },
      grid: { left: 56, right: 24, top: 34, bottom: 42, containLabel: true },
      xAxis: {
        type: "category",
        data: dateLabels,
        axisTick: { show: false }
      },
      yAxis: {
        type: "value",
        min: 9.8,
        max: 10.1,
        axisLabel: { formatter: (value: number) => `¥${value.toFixed(1)}` }
      },
      color: ["#a88bea"],
      series: [
        {
          name: "平均单券金额",
          type: "line",
          smooth: true,
          symbolSize: 9,
          areaStyle: { opacity: 0.1 },
          label: {
            show: true,
            formatter: (params) => `¥${currencyFormatter.format(Number(params.value))}`,
            color: lactoText,
            fontSize: 10
          },
          data: presaleDailySummary.map((day) => Number((day.saleAmount / day.saleCount).toFixed(2)))
        }
      ]
    };

    return {
      dailyTrendOption,
      channelStackOption,
      hourlyTrendOption,
      channelShareOption,
      amountShareOption,
      schemeHeatmapOption,
      averageTicketOption
    };
  }, []);

  return (
    <section aria-label="预售数据看板" className="presale-board">
        <div className="presale-board__header">
          <div>
            <span className="presale-board__date">2026-07-10 至 2026-07-12</span>
            <h3>预售</h3>
            <p>整合三日 Markdown 预售数据，按分天确认、渠道结构、金额占比、单券金额和小时趋势拆分展示。</p>
          </div>
          <span className="presale-board__badge">
            <CheckCircle2 aria-hidden="true" size={16} />
            仅展示已确认数据
          </span>
        </div>

        <div aria-label="预售核心指标" className="presale-metric-grid">
          <article className="presale-metric">
            <span>已确认售卖券数</span>
            <strong>{numberFormatter.format(totalCount)}</strong>
            <small>3 天已确认</small>
          </article>
          <article className="presale-metric">
            <span>已确认售卖金额</span>
            <strong>¥{currencyFormatter.format(totalAmount)}</strong>
            <small>2026-07-10 至 2026-07-12</small>
          </article>
          <article className="presale-metric">
            <span>7月12日较7月11日</span>
            <strong>{numberFormatter.format(latestCountChange)} 张</strong>
            <small>
              {((latestCountChange / presaleDailySummary[1].saleCount) * 100).toFixed(1)}%，金额{" "}
              {((latestAmountChange / presaleDailySummary[1].saleAmount) * 100).toFixed(1)}%
            </small>
          </article>
        </div>

        <div className="presale-block-heading">
          <h4>分析结论</h4>
          <span>先读结论，再看图表细节</span>
        </div>
        <div aria-label="预售分析结论" className="presale-analysis-grid">
          {analysisCards.map((card) => (
            <article className="presale-analysis-card" key={card.label}>
              <span>{card.label}</span>
              <strong>{card.value}</strong>
              <p>{card.note}</p>
            </article>
          ))}
        </div>

        <div className="presale-block-heading">
          <h4>分天汇总</h4>
          <span>仅展示有明确数值的日期</span>
        </div>
        <div aria-label="预售分天汇总" className="presale-day-grid">
          {presaleDailySummary.map((day) => (
            <article className="presale-day-card" key={day.date}>
              <div>
                <strong>{day.date}</strong>
                <span>{day.status}</span>
              </div>
              <dl>
                <div>
                  <dt>售卖券数</dt>
                  <dd>{numberFormatter.format(day.saleCount)} 张</dd>
                </div>
                <div>
                  <dt>售卖金额</dt>
                  <dd>¥{currencyFormatter.format(day.saleAmount)}</dd>
                </div>
              </dl>
            </article>
          ))}
        </div>

        <div className="presale-block-heading">
          <h4>可视化拆解</h4>
          <span>柱线、堆叠、100%份额、环图、热力图</span>
        </div>
        <div className="presale-visual-grid">
          <ChartTile option={charts.dailyTrendOption} title="分天售卖趋势" subtitle="券数与金额" />
          <ChartTile option={charts.channelStackOption} title="渠道结构堆叠" subtitle="7月10日 vs 7月11日 vs 7月12日" />
          <ChartTile option={charts.hourlyTrendOption} title="小时趋势曲线" subtitle="趋势图 tooltip 口径，明确标注日期" wide />
          <ChartTile option={charts.channelShareOption} title="渠道份额 100%" subtitle="看每天内部结构变化" />
          <ChartTile option={charts.amountShareOption} title="金额占比" subtitle="三日确认金额" />
          <ChartTile option={charts.averageTicketOption} title="平均单券金额" subtitle="分天均价变化" />
          <ChartTile option={charts.schemeHeatmapOption} title="方案热力图" subtitle="三日渠道结构热力" wide />
        </div>

        <div className="presale-block-heading">
          <h4>库券方案明细</h4>
          <span>10 个方案，按三日券数排序</span>
        </div>
        <div aria-label="预售库券方案分天明细" className="presale-scheme-list">
          {presaleSchemeRows.map((scheme) => {
            const schemeCount = scheme.totalCount;
            const width = maxSchemeCount ? `${(schemeCount / maxSchemeCount) * 100}%` : "0%";

            return (
              <article className="presale-scheme-row" key={scheme.name}>
                <div className="presale-scheme-row__name">
                  <strong>{scheme.name}</strong>
                  <span>三日合计 {numberFormatter.format(schemeCount)} 张</span>
                </div>
                <div>
                  <span>7月10日</span>
                  <strong>{numberFormatter.format(scheme.dayData["2026-07-10"].count)} 张</strong>
                </div>
                <div>
                  <span>7月11日</span>
                  <strong>{numberFormatter.format(scheme.dayData["2026-07-11"].count)} 张</strong>
                </div>
                <div>
                  <span>7月12日</span>
                  <strong>{numberFormatter.format(scheme.dayData["2026-07-12"].count)} 张</strong>
                </div>
                <div>
                  <span>三日金额</span>
                  <strong>¥{currencyFormatter.format(scheme.totalAmount)}</strong>
                </div>
                <div className="presale-scheme-row__bar" aria-hidden="true">
                  <span style={{ "--presale-row-value": width } as CSSProperties} />
                </div>
              </article>
            );
          })}
        </div>
    </section>
  );
}

function DataPanelPage({ panel, onBack }: { panel: DataPanelId; onBack: () => void }) {
  const title = dataPanelDetailTitles[panel];

  return (
    <section aria-label={title} className="data-detail-page">
      <div className="data-detail-page__header">
        <button aria-label="返回数据看板" className="data-detail-page__back" onClick={onBack} type="button">
          <ArrowLeft aria-hidden="true" size={18} />
          <span>返回数据看板</span>
        </button>
        <div>
          <span>数据面板</span>
          <h2>{title}</h2>
          <p>详情内容以网页形式展开，避免弹窗遮挡，也方便连续阅读完整数据。</p>
        </div>
      </div>
      <div className="data-detail-page__body">
        {panel === "douyin" ? <DouyinOverallDrilldownPanel /> : null}
        {panel === "presale" ? <PresaleDataBoard /> : null}
        {panel === "compass" ? <CompassDataSection /> : null}
        {panel === "business" ? <BusinessPerformanceSection /> : null}
      </div>
    </section>
  );
}

function DataDateFilter({
  label,
  value,
  onChange
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="data-date-filter">
      <span>日期</span>
      <input aria-label={label} onChange={(event) => onChange(event.currentTarget.value)} type="date" value={value} />
    </label>
  );
}

function DataEmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="data-empty-state" role="status">
      <CircleDashed aria-hidden="true" size={22} />
      <div>
        <strong>{title}</strong>
        <p>{description}</p>
      </div>
    </div>
  );
}

function CompassDataSection() {
  const [selectedDate, setSelectedDate] = useState(compassAvailableDates[0]);
  const hasSelectedDateData = compassAvailableDates.includes(selectedDate);
  const selectedDateLabel = selectedDate || "所选日期";
  const selectedPeriod = hasSelectedDateData ? compassSummary.period : `${selectedDateLabel} 暂无数据`;
  const maxComparisonCount = Math.max(
    ...compassComparisonRows.map((row) => Math.max(row.saleCount, row.verifyCount))
  );
  const charts = useMemo(() => {
    const lactoText = "#345f57";
    const sourceLabels = ["售卖券方案", "核销券方案", "Top20商品"];
    const topSaleRows = compassSaleRows.slice(0, 6);
    const saleOtherCount = compassSaleRows.slice(6).reduce((sum, row) => sum + row.count, 0);
    const verifyRankRows = [...compassVerifyRows].slice(0, 9).reverse();
    const presaleVerifyRatio = (compassSummary.verifyPresaleCount / compassSummary.verifySchemeCount) * 100;

    const sourceCompareOption: EChartsOption = {
      tooltip: { trigger: "axis", axisPointer: { type: "shadow" } },
      legend: {
        bottom: 0,
        left: "center",
        itemHeight: 9,
        itemWidth: 9,
        textStyle: { color: lactoText, fontSize: 10 }
      },
      grid: { left: 16, right: 20, top: 28, bottom: 42, containLabel: true },
      xAxis: {
        type: "category",
        data: sourceLabels,
        axisTick: { show: false },
        axisLabel: { color: lactoText, fontSize: 11 }
      },
      yAxis: [
        {
          type: "value",
          name: "数量",
          axisLabel: { color: "#547069", fontSize: 11 },
          splitLine: { lineStyle: { color: "#d7e9e3" } }
        },
        {
          type: "value",
          name: "金额",
          axisLabel: {
            color: "#547069",
            fontSize: 11,
            formatter: (value: number) => `${Math.round(value / 10000)}万`
          },
          splitLine: { show: false }
        }
      ],
      color: ["#43b9ae", "#78bde8"],
      series: [
        {
          name: "今日数量",
          type: "bar",
          barWidth: 18,
          itemStyle: { borderRadius: [6, 6, 0, 0] },
          data: [compassSummary.saleSchemeCount, compassSummary.verifySchemeCount, compassSummary.top20ProductCount]
        },
        {
          name: "今日金额/收入",
          type: "line",
          yAxisIndex: 1,
          smooth: true,
          symbolSize: 8,
          data: [compassSummary.saleSchemeAmount, compassSummary.verifySchemeIncome, compassSummary.top20ProductIncome]
        }
      ]
    };

    const saleStructureOption: EChartsOption = {
      tooltip: {
        trigger: "item",
        valueFormatter: (value) => `${numberFormatter.format(Number(value))} 张`
      },
      legend: {
        bottom: 0,
        left: "center",
        itemHeight: 9,
        itemWidth: 9,
        textStyle: { color: lactoText, fontSize: 10 }
      },
      color: ["#43b9ae", "#b9ec70", "#78bde8", "#f59bb8", "#ffd36d", "#a88bea", "#98d6c3"],
      series: [
        {
          name: "售卖方案结构",
          type: "pie",
          radius: ["38%", "64%"],
          center: ["50%", "43%"],
          label: { color: lactoText, formatter: "{b}", fontSize: 10 },
          data: [
            ...topSaleRows.map((row) => ({ name: row.shortName, value: row.count })),
            { name: "其他方案", value: saleOtherCount }
          ].filter((row) => row.value > 0)
        }
      ]
    };

    const verifyRankOption: EChartsOption = {
      tooltip: { trigger: "axis", axisPointer: { type: "shadow" } },
      grid: { left: 10, right: 24, top: 26, bottom: 36, containLabel: true },
      xAxis: {
        type: "value",
        splitNumber: 3,
        axisLabel: {
          color: "#547069",
          fontSize: 11,
          formatter: (value: number) => `${Math.round(value / 1000)}千`
        },
        splitLine: { lineStyle: { color: "#d7e9e3" } }
      },
      yAxis: {
        type: "category",
        data: verifyRankRows.map((row) => row.shortName),
        axisTick: { show: false },
        axisLabel: { color: lactoText, fontSize: 11, overflow: "truncate", width: 88 }
      },
      color: ["#43b9ae"],
      series: [
        {
          name: "核销杯量",
          type: "bar",
          barWidth: 16,
          itemStyle: { borderRadius: [0, 7, 7, 0] },
          data: verifyRankRows.map((row) => row.count)
        }
      ]
    };

    const saleVerifyScatterOption: EChartsOption = {
      tooltip: {
        formatter: (params) => {
          const data = (params as { data?: [number, number, string] }).data;
          if (!data) {
            return "";
          }
          return `${data[2]}<br/>售卖 ${numberFormatter.format(data[0])}<br/>核销 ${numberFormatter.format(data[1])}`;
        }
      },
      grid: { left: 48, right: 26, top: 24, bottom: 46, containLabel: true },
      xAxis: {
        type: "value",
        name: "售卖",
        axisLabel: { color: "#547069", fontSize: 11 },
        splitLine: { lineStyle: { color: "#d7e9e3" } }
      },
      yAxis: {
        type: "value",
        name: "核销",
        axisLabel: { color: "#547069", fontSize: 11 },
        splitLine: { lineStyle: { color: "#d7e9e3" } }
      },
      series: [
        {
          name: "售卖核销散点",
          type: "scatter",
          symbolSize: (value: unknown) => {
            const point = value as [number, number, string];
            return Math.max(16, Math.min(58, Math.sqrt(point[0] + point[1]) / 6));
          },
          itemStyle: { color: "#43b9ae", opacity: 0.76 },
          label: {
            show: true,
            position: "top",
            color: lactoText,
            fontSize: 10,
            formatter: (params) => String((params.data as [number, number, string])[2])
          },
          data: compassComparisonRows.map((row) => [row.saleCount, row.verifyCount, row.shortName])
        }
      ]
    };

    const presaleGaugeOption: EChartsOption = {
      series: [
        {
          name: "预售占比",
          type: "gauge",
          startAngle: 210,
          endAngle: -30,
          min: 0,
          max: 100,
          progress: { show: true, width: 14, itemStyle: { color: "#43b9ae" } },
          axisLine: { lineStyle: { width: 14, color: [[1, "#d7e9e3"]] } },
          axisTick: { show: false },
          splitLine: { show: false },
          axisLabel: { show: false },
          pointer: { show: false },
          detail: {
            valueAnimation: true,
            formatter: `${presaleVerifyRatio.toFixed(1)}%`,
            color: lactoText,
            fontSize: 24,
            fontWeight: 800,
            offsetCenter: [0, "12%"]
          },
          title: {
            offsetCenter: [0, "50%"],
            color: "#547069",
            fontSize: 12
          },
          data: [{ value: Number(presaleVerifyRatio.toFixed(1)), name: "预售核销占券方案" }]
        }
      ]
    };

    return {
      sourceCompareOption,
      saleStructureOption,
      verifyRankOption,
      saleVerifyScatterOption,
      presaleGaugeOption
    };
  }, []);

  return (
    <section aria-label="指南针取数板块" className="presale-board compass-board">
      <div className="presale-board__header">
        <div>
          <span className="presale-board__date">{selectedPeriod}</span>
          <h3>指南针取数</h3>
          <p>
            {hasSelectedDateData
              ? "整合 2026-07-13 乳酸菌美式全量采集数据，按售卖实时、核销实时、Top20商品和预售子表拆开呈现。"
              : "当前日期还没有指南针取数数据，切回有数据日期后会恢复图表和明细。"}
          </p>
        </div>
        <div className="presale-board__actions">
          <DataDateFilter label="选择指南针取数日期" onChange={setSelectedDate} value={selectedDate} />
          <span className="presale-board__badge">
            <Compass aria-hidden="true" size={16} />
            {hasSelectedDateData ? "已翻页 86 页" : "等待取数"}
          </span>
        </div>
      </div>

      {hasSelectedDateData ? (
        <>
      <div aria-label="指南针全量核心指标" className="presale-metric-grid compass-metric-grid">
        {compassMetricCards.map((card) => (
          <article className="presale-metric compass-metric-card" key={card.label}>
            <span>{card.label}</span>
            <strong>{numberFormatter.format(card.value)}</strong>
            <small>¥{currencyFormatter.format(card.amount)}</small>
            <p>{card.note}</p>
          </article>
        ))}
      </div>

      <div className="presale-block-heading">
        <h4>口径说明</h4>
        <span>商品维度与券方案维度不可相加</span>
      </div>
      <div aria-label="指南针全量口径说明" className="presale-check-grid compass-check-grid">
        {compassMethodNotes.map((item) => (
          <article className="presale-check" key={item}>
            <CheckCircle2 aria-hidden="true" size={18} />
            <span>{item}</span>
          </article>
        ))}
      </div>

      <div className="presale-block-heading">
        <h4>可视化拆解</h4>
        <span>柱线、环图、横条、散点、仪表</span>
      </div>
      <div className="presale-visual-grid">
        <ChartTile option={charts.sourceCompareOption} title="全量口径对比" subtitle="售卖、核销与Top20商品分开看" />
        <ChartTile option={charts.saleStructureOption} title="售卖方案结构" subtitle="售卖实时券方案今日券数占比" />
        <ChartTile option={charts.verifyRankOption} title="核销方案排行" subtitle="实时-劵方案名称今日杯量" variant="ranking" />
        <ChartTile option={charts.saleVerifyScatterOption} title="售卖核销散点" subtitle="同名方案售卖与核销不混算" wide />
        <ChartTile option={charts.presaleGaugeOption} title="预售占比仪表" subtitle="预售核销杯量 / 券方案核销杯量" />
      </div>

      <div className="presale-block-heading">
        <h4>方案明细</h4>
        <span>同名方案对照，按重点流量方案展示</span>
      </div>
      <div aria-label="指南针全量方案明细" className="compass-detail-list">
        {compassComparisonRows.map((row) => {
          const saleWidth = maxComparisonCount ? `${(row.saleCount / maxComparisonCount) * 100}%` : "0%";
          const verifyWidth = maxComparisonCount ? `${(row.verifyCount / maxComparisonCount) * 100}%` : "0%";

          return (
            <article className="compass-detail-row" key={row.name}>
              <div className="compass-detail-row__name">
                <strong>{row.name}</strong>
                <span>售卖与核销分口径展示</span>
              </div>
              <div>
                <span>今日售卖券数</span>
                <strong>{numberFormatter.format(row.saleCount)}</strong>
                <small>¥{currencyFormatter.format(row.saleAmount)}</small>
              </div>
              <div>
                <span>今日核销杯量</span>
                <strong>{numberFormatter.format(row.verifyCount)}</strong>
                <small>¥{currencyFormatter.format(row.verifyIncome)}</small>
              </div>
              <div className="compass-detail-row__bars" aria-hidden="true">
                <span style={{ "--compass-row-value": saleWidth } as CSSProperties} />
                <span style={{ "--compass-row-value": verifyWidth } as CSSProperties} />
              </div>
            </article>
          );
        })}
      </div>
        </>
      ) : (
        <DataEmptyState
          description="请选择已完成取数的日期，或导入当天数据后再查看对应图表。"
          title={`暂无 ${selectedDateLabel} 的指南针取数数据`}
        />
      )}
    </section>
  );
}

function BusinessPerformanceSection() {
  const [selectedDate, setSelectedDate] = useState(businessAvailableDates[0]);
  const hasSelectedDateData = businessAvailableDates.includes(selectedDate);
  const selectedDateLabel = selectedDate || "所选日期";
  const selectedPeriod = hasSelectedDateData ? businessSummary.period : `${selectedDateLabel} 暂无数据`;
  const soldProductRows = businessProductRows.filter((row) => row.saleCount > 0);
  const topProduct = soldProductRows[0];
  const maxSaleCount = Math.max(...soldProductRows.map((row) => row.saleCount));
  const refundRate = (businessSummary.refundCount / businessSummary.saleCount) * 100;
  const visitRate = (businessSummary.visits / businessSummary.exposures) * 100;
  const topShare = (topProduct.saleCount / businessSummary.saleCount) * 100;
  const newCustomerShare = (businessSummary.newCustomerBuyers / businessSummary.buyers) * 100;
  const analysisCards = [
    {
      label: "曝光成交转化",
      value: `${businessSummary.conversionRate.toFixed(2)}% 口径`,
      note: `按成交券数 / 商品曝光次数计算：${numberFormatter.format(businessSummary.saleCount)} / ${numberFormatter.format(businessSummary.exposures)}。`
    },
    {
      label: "曝光到访问",
      value: `${visitRate.toFixed(2)}%`,
      note: `商品曝光 ${numberFormatter.format(businessSummary.exposures)} 次，带来访问 ${numberFormatter.format(businessSummary.visits)} 人。`
    },
    {
      label: "成交集中度",
      value: `${topShare.toFixed(2)}%`,
      note: `TOP 商品成交 ${numberFormatter.format(topProduct.saleCount)} 张，仍是主要成交承接。`
    },
    {
      label: "退款压力",
      value: `${refundRate.toFixed(2)}%`,
      note: `退款券数 ${numberFormatter.format(businessSummary.refundCount)} 张，退款金额 ¥${currencyFormatter.format(businessSummary.refundAmount)}。`
    },
    {
      label: "新客成交人数",
      value: `${numberFormatter.format(businessSummary.newCustomerBuyers)}人`,
      note: `新客占成交人数 ${newCustomerShare.toFixed(2)}%，适合单独追踪券包承接效率。`
    }
  ];

  const charts = useMemo(() => {
    const lactoText = "#345f57";
    const soldRows = businessProductRows.filter((row) => row.saleCount > 0);
    const soldLabels = soldRows.map((row) => row.shortName);
    const refundRows = [...businessProductRows]
      .filter((row) => row.refundCount > 0)
      .sort((first, second) => first.refundCount - second.refundCount);

    const funnelOption: EChartsOption = {
      tooltip: { trigger: "item" },
      color: ["#54c7b7", "#78bde8", "#b9ec70", "#ffd36d", "#f59bb8", "#a88bea"],
      series: [
        {
          name: "曝光成交漏斗",
          type: "funnel",
          left: "8%",
          right: "8%",
          top: 16,
          bottom: 12,
          sort: "none",
          label: { color: lactoText, formatter: "{b}", fontSize: 12, fontWeight: 700, overflow: "break", width: 96 },
          data: [
            { name: "曝光次数", value: businessSummary.exposures },
            { name: "访问人数", value: businessSummary.visits },
            { name: "成交券数", value: businessSummary.saleCount },
            { name: "成交人数", value: businessSummary.buyers },
            { name: "新客成交人数", value: businessSummary.newCustomerBuyers },
            { name: "退款券数", value: businessSummary.refundCount }
          ]
        }
      ]
    };

    const topShareOption: EChartsOption = {
      tooltip: {
        trigger: "item",
        valueFormatter: (value) => `${numberFormatter.format(Number(value))} 张`
      },
      legend: {
        bottom: 2,
        left: "center",
        itemGap: 8,
        itemHeight: 9,
        itemWidth: 9,
        textStyle: { fontSize: 10, color: lactoText }
      },
      color: ["#74d8c5", "#b9ec70", "#f59bb8", "#78bde8"],
      series: [
        {
          name: "成交券数",
          type: "pie",
          radius: ["42%", "66%"],
          center: ["50%", "42%"],
          label: { color: lactoText, formatter: "{b}", fontSize: 10 },
          data: soldRows.map((row) => ({ name: row.shortName, value: row.saleCount }))
        }
      ]
    };

    const bubbleOption: EChartsOption = {
      tooltip: {
        formatter: (params) => {
          const point = params as { data?: [number, number, number, string] };
          const data = point.data;
          if (!data) {
            return "";
          }
          return `${data[3]}<br/>曝光 ${numberFormatter.format(data[0])}<br/>成交 ${numberFormatter.format(data[1])} 张`;
        }
      },
      grid: { left: 54, right: 24, top: 24, bottom: 46, containLabel: true },
      xAxis: {
        type: "value",
        name: "曝光",
        nameTextStyle: { color: "#547069", fontSize: 11 },
        axisLabel: {
          color: "#547069",
          fontSize: 11,
          formatter: (value: number) => `${Math.round(value / 10000)}万`
        },
        splitLine: { lineStyle: { color: "#d7e9e3" } }
      },
      yAxis: {
        type: "value",
        name: "成交券",
        nameTextStyle: { color: "#547069", fontSize: 11 },
        axisLabel: { color: "#547069", fontSize: 11 },
        splitLine: { lineStyle: { color: "#d7e9e3" } }
      },
      series: [
        {
          name: "曝光成交",
          type: "scatter",
          symbolSize: (data: unknown) => {
            const point = data as [number, number, number, string];
            return point[2];
          },
          label: {
            show: true,
            color: lactoText,
            formatter: (params) => String((params.data as [number, number, number, string])[3]),
            position: "top",
            fontSize: 10
          },
          itemStyle: { color: "#43b9ae", opacity: 0.78 },
          data: soldRows.map((row) => [
            row.exposures,
            row.saleCount,
            Math.max(18, Math.min(58, row.refundCount / 160 + 16)),
            row.shortName
          ])
        }
      ]
    };

    const conversionHeatmapOption: EChartsOption = {
      tooltip: {
        formatter: (params) => {
          const point = params as { data?: [number, number, number] };
          const data = point.data;
          if (!data) {
            return "";
          }
          return `${soldLabels[data[0]]}<br/>转化率 ${data[2].toFixed(2)}%`;
        }
      },
      grid: { left: 24, right: 24, top: 42, bottom: 50, containLabel: true },
      xAxis: {
        type: "category",
        data: soldLabels,
        axisTick: { show: false },
        axisLabel: { color: lactoText, fontSize: 11, interval: 0, overflow: "truncate", width: 58 }
      },
      yAxis: {
        type: "category",
        data: ["转化率"],
        axisTick: { show: false },
        axisLabel: { color: lactoText, fontSize: 11 }
      },
      visualMap: {
        min: 0,
        max: 1.8,
        show: false,
        inRange: { color: ["#f7e8e8", "#fff3ca", "#74d8c5"] }
      },
      series: [
        {
          type: "heatmap",
          data: soldRows.map((row, index) => [index, 0, row.conversionRate]),
          label: {
            show: true,
            color: lactoText,
            formatter: (params) => `${(params.data as [number, number, number])[2].toFixed(2)}%`
          },
          itemStyle: { borderColor: "#ffffff", borderWidth: 2, borderRadius: 5 }
        }
      ]
    };

    const refundRankOption: EChartsOption = {
      tooltip: { trigger: "axis", axisPointer: { type: "shadow" } },
      grid: { left: 10, right: 24, top: 26, bottom: 42, containLabel: true },
      xAxis: {
        type: "value",
        splitNumber: 3,
        axisLabel: {
          color: "#547069",
          fontSize: 11,
          hideOverlap: true,
          margin: 10,
          formatter: (value: number) => `${Math.round(value / 10000)}万`
        },
        splitLine: { lineStyle: { color: "#d7e9e3" } }
      },
      yAxis: {
        type: "category",
        data: refundRows.map((row) => row.shortName),
        axisTick: { show: false },
        axisLabel: {
          color: lactoText,
          fontSize: 12,
          margin: 12,
          overflow: "truncate",
          width: 92
        }
      },
      color: ["#43b9ae"],
      series: [
        {
          name: "退款券数",
          type: "bar",
          barWidth: 18,
          barCategoryGap: "44%",
          itemStyle: { borderRadius: [0, 7, 7, 0] },
          data: refundRows.map((row) => row.refundCount)
        }
      ]
    };

    return {
      funnelOption,
      topShareOption,
      bubbleOption,
      conversionHeatmapOption,
      refundRankOption
    };
  }, []);

  return (
    <section aria-label="生意经7月13日数据看板" className="presale-board business-board">
      <div className="presale-board__header">
        <div>
          <span className="presale-board__date">{selectedPeriod}</span>
          <h3>生意经 7日表现</h3>
          <p>
            {hasSelectedDateData
              ? "整合 2026-07-13 抖音生活服务生意经数据，按曝光、访问、成交券、退款和新客转化统一展示。"
              : "当前日期还没有生意经数据，切回有数据日期后会恢复图表和商品明细。"}
          </p>
        </div>
        <div className="presale-board__actions">
          <DataDateFilter label="选择生意经数据日期" onChange={setSelectedDate} value={selectedDate} />
          <span className="presale-board__badge">
            <CheckCircle2 aria-hidden="true" size={16} />
            {hasSelectedDateData ? "已记录 29 条商品" : "等待数据"}
          </span>
        </div>
      </div>

      {hasSelectedDateData ? (
        <>
      <div aria-label="生意经核心指标" className="presale-metric-grid business-metric-grid">
        <article className="presale-metric">
          <span>商品曝光次数合计</span>
          <strong>{numberFormatter.format(businessSummary.exposures)}</strong>
          <small>{businessSummary.activeProducts} 个商品有曝光、访问或退款记录</small>
        </article>
        <article className="presale-metric">
          <span>商品访问人数合计</span>
          <strong>{numberFormatter.format(businessSummary.visits)}</strong>
          <small>曝光到访问 {visitRate.toFixed(2)}%</small>
        </article>
        <article className="presale-metric">
          <span>成交券数合计</span>
          <strong>{numberFormatter.format(businessSummary.saleCount)}</strong>
          <small>{businessSummary.tradedProducts} 个商品有成交</small>
        </article>
        <article className="presale-metric">
          <span>整体转化率</span>
          <strong>{businessSummary.conversionRate.toFixed(2)}%</strong>
          <small>成交券数 / 商品曝光次数</small>
        </article>
        <article className="presale-metric">
          <span>商品退款券数合计</span>
          <strong>{numberFormatter.format(businessSummary.refundCount)}</strong>
          <small>退款金额 ¥{currencyFormatter.format(businessSummary.refundAmount)}</small>
        </article>
        <article className="presale-metric">
          <span>新客成交人数合计</span>
          <strong>{numberFormatter.format(businessSummary.newCustomerBuyers)}</strong>
          <small>占成交人数 {newCustomerShare.toFixed(2)}%</small>
        </article>
      </div>

      <div className="presale-block-heading">
        <h4>分析结论</h4>
        <span>曝光、访问、成交与退款联动读</span>
      </div>
      <div aria-label="生意经分析结论" className="presale-analysis-grid">
        {analysisCards.map((card) => (
          <article className="presale-analysis-card" key={card.label}>
            <span>{card.label}</span>
            <strong>{card.value}</strong>
            <p>{card.note}</p>
          </article>
        ))}
      </div>

      <div className="presale-block-heading">
        <h4>可视化拆解</h4>
        <span>漏斗、环图、气泡、热力、横条</span>
      </div>
      <div className="presale-visual-grid">
        <ChartTile option={charts.funnelOption} title="曝光成交漏斗" subtitle="曝光、访问、成交与退款全链路" />
        <ChartTile option={charts.topShareOption} title="成交券数占比" subtitle="4 个有成交商品贡献结构" />
        <ChartTile option={charts.bubbleOption} title="曝光成交气泡矩阵" subtitle="气泡大小映射退款压力" wide />
        <ChartTile option={charts.conversionHeatmapOption} title="转化率热力图" subtitle="逐商品新转化率一一对应" />
        <ChartTile
          option={charts.refundRankOption}
          title="退款券数排行"
          subtitle="含未成交但有退款的长尾商品"
          variant="ranking"
        />
      </div>

      <div className="presale-block-heading">
        <h4>有成交商品明细</h4>
        <span>{businessSummary.tradedProducts} 个商品有成交，按成交券数排序</span>
      </div>
      <div aria-label="生意经有成交商品明细" className="business-product-list">
        {soldProductRows
          .map((row) => {
            const width = maxSaleCount ? `${(row.saleCount / maxSaleCount) * 100}%` : "0%";

            return (
              <article className="business-product-row" key={row.name}>
                <div className="business-product-row__name">
                  <strong>{row.name}</strong>
                  <span>新转化率 {row.conversionRate.toFixed(2)}%</span>
                </div>
                <div>
                  <span>访问人数</span>
                  <strong>{numberFormatter.format(row.visits)}</strong>
                </div>
                <div>
                  <span>商品曝光次数</span>
                  <strong>{numberFormatter.format(row.exposures)}</strong>
                </div>
                <div>
                  <span>成交券数</span>
                  <strong>{numberFormatter.format(row.saleCount)}</strong>
                </div>
                <div>
                  <span>成交人数</span>
                  <strong>{numberFormatter.format(row.buyers)}</strong>
                </div>
                <div>
                  <span>新客成交人数</span>
                  <strong>{numberFormatter.format(row.newCustomerBuyers)}</strong>
                </div>
                <div>
                  <span>退款券数</span>
                  <strong>{numberFormatter.format(row.refundCount)}</strong>
                </div>
                <div>
                  <span>退款金额</span>
                  <strong>¥{currencyFormatter.format(row.refundAmount)}</strong>
                </div>
                <div className="presale-scheme-row__bar" aria-hidden="true">
                  <span style={{ "--presale-row-value": width } as CSSProperties} />
                </div>
              </article>
            );
          })}
      </div>
        </>
      ) : (
        <DataEmptyState
          description="请选择已有生意经记录的日期，或导入当天数据后再查看对应图表。"
          title={`暂无 ${selectedDateLabel} 的生意经数据`}
        />
      )}
    </section>
  );
}

function withSafeChartLayout(option: EChartsOption): EChartsOption {
  const tooltip = option.tooltip;
  const grid = option.grid;
  const legend = option.legend;
  const withSafeTooltipCss = (item: Record<string, unknown>) => ({
    ...item,
    confine: true,
    extraCssText: [typeof item.extraCssText === "string" ? item.extraCssText : "", safeTooltipCss].filter(Boolean).join("; ")
  });
  const withSafeLegend = (item: Record<string, unknown>) => ({
    ...item,
    type: item.type ?? "scroll",
    top: item.top ?? 6,
    left: item.left ?? 8,
    right: item.right ?? 8,
    itemGap: item.itemGap ?? 14,
    itemWidth: item.itemWidth ?? 18,
    itemHeight: item.itemHeight ?? 10,
    textStyle: {
      color: "#345f57",
      fontSize: 11,
      fontWeight: 700,
      width: 96,
      overflow: "truncate",
      ...((item.textStyle as Record<string, unknown> | undefined) ?? {})
    }
  });
  const withSafeAxis = (axis: unknown) => {
    const normalizeAxis = (item: Record<string, unknown>) => ({
      ...item,
      nameGap: item.nameGap ?? 18,
      axisLabel: {
        color: "#5e7f77",
        fontSize: 11,
        margin: 10,
        hideOverlap: true,
        overflow: "truncate",
        width: 76,
        ...((item.axisLabel as Record<string, unknown> | undefined) ?? {})
      }
    });
    return Array.isArray(axis)
      ? axis.map((item) => normalizeAxis(item as Record<string, unknown>))
      : axis && typeof axis === "object"
        ? normalizeAxis(axis as Record<string, unknown>)
        : axis;
  };
  const optionWithSafeTooltip: EChartsOption = {
    ...option,
    tooltip: Array.isArray(tooltip)
      ? (tooltip.map((item) => withSafeTooltipCss(item as Record<string, unknown>)) as EChartsOption["tooltip"])
      : (withSafeTooltipCss((tooltip ?? {}) as Record<string, unknown>) as EChartsOption["tooltip"]),
    legend: Array.isArray(legend)
      ? (legend.map((item) => withSafeLegend(item as Record<string, unknown>)) as EChartsOption["legend"])
      : legend
        ? (withSafeLegend(legend as Record<string, unknown>) as EChartsOption["legend"])
        : legend,
    xAxis: withSafeAxis(option.xAxis) as EChartsOption["xAxis"],
    yAxis: withSafeAxis(option.yAxis) as EChartsOption["yAxis"]
  };

  if (Array.isArray(grid)) {
    return {
      ...optionWithSafeTooltip,
      grid: grid.map((item) => ({ top: 64, right: 28, bottom: 34, left: 42, ...item, containLabel: true }))
    };
  }

  if (grid && typeof grid === "object") {
    return {
      ...optionWithSafeTooltip,
      grid: {
        top: 64,
        right: 28,
        bottom: 34,
        left: 42,
        ...grid,
        containLabel: true
      }
    };
  }

  return optionWithSafeTooltip;
}

function ChartTile({
  title,
  subtitle,
  option,
  variant,
  wide = false,
  footnote
}: {
  title: string;
  subtitle: string;
  option: EChartsOption;
  variant?: "ranking";
  wide?: boolean;
  footnote?: string;
}) {
  const tileClassName = [
    "presale-chart-tile",
    wide ? "presale-chart-tile--wide" : "",
    variant ? `presale-chart-tile--${variant}` : ""
  ]
    .filter(Boolean)
    .join(" ");
  const chartClassName = ["presale-chart", variant ? `presale-chart--${variant}` : ""].filter(Boolean).join(" ");
  const chartStyle = variant === "ranking" ? ({ height: 320 } as CSSProperties) : undefined;
  const chartOption = useMemo(() => withSafeChartLayout(option), [option]);

  return (
    <article className={tileClassName}>
      <div className="presale-chart-tile__heading">
        <strong>{title}</strong>
        <span>{subtitle}</span>
      </div>
      <ReactECharts option={chartOption} notMerge lazyUpdate className={chartClassName} style={chartStyle} />
      {footnote ? <p className="presale-chart-tile__footnote">{footnote}</p> : null}
    </article>
  );
}

function CompetitorVisualization({
  competitors
}: {
  competitors: CompetitorSlot[];
}) {
  const sorted = [...competitors]
    .filter((c) => typeof c.price === "number")
    .sort((a, b) => (b.price ?? 0) - (a.price ?? 0));

  const scatterOption: EChartsOption = {
    tooltip: { trigger: "item", formatter: (p: any) => `${p.data.name}<br/>价格 ¥${p.data.value[0]}<br/>${p.data.value[1]}` },
    grid: { left: 10, right: 10, top: 24, bottom: 36, containLabel: true },
    xAxis: { type: "value", name: "价格(元)", nameTextStyle: { fontSize: 10, color: "#547069" }, axisLabel: { fontSize: 10, color: "#547069" }, splitLine: { lineStyle: { color: "#e8f5f0" } } },
    yAxis: { type: "category", data: sorted.map((c) => c.name), axisLabel: { fontSize: 9, color: "#173934" }, axisTick: { show: false } },
    color: ["#74d8c5"],
    series: [{
      type: "bar",
      barWidth: 12,
      itemStyle: { borderRadius: [0, 6, 6, 0] },
      label: { show: true, position: "right", formatter: "¥{c}", fontSize: 10, color: "#173934" },
      data: sorted.map((c) => c.price ?? 0)
    }]
  };

  return (
    <article className="competitor-visualization">
      <div className="competitor-visualization__head">
        <strong>价格分布</strong>
        <span>共 {sorted.length} 款已验证商品</span>
      </div>
      <ReactECharts option={withSafeChartLayout(scatterOption)} notMerge lazyUpdate style={{ height: 240 }} />
    </article>
  );
}

function CompetitorCard({
  competitor,
  index,
  maxPrice
}: {
  competitor: CompetitorSlot;
  index: number;
  maxPrice: number;
}) {
  const pricePct = competitor.price ? Math.max(8, Math.round((competitor.price / maxPrice) * 100)) : 0;

  return (
    <article className="competitor-slot" key={competitor.name}>
      <header className="competitor-slot__head">
        <div className="competitor-slot__mark">{String(index + 1).padStart(2, "0")}</div>
        <div className="competitor-slot__title">
          <strong>{competitor.name}</strong>
          <span>{competitor.category}</span>
        </div>
        {competitor.rating ? (
          <span className="competitor-slot__rating">{competitor.rating}</span>
        ) : null}
      </header>

      {competitor.price ? (
        <div className="competitor-slot__pricing">
          <div className="competitor-slot__price-wrap">
            <strong className="competitor-slot__price">¥{competitor.price}</strong>
            {competitor.originalPrice ? (
              <span className="competitor-slot__original-price">¥{competitor.originalPrice}</span>
            ) : null}
          </div>
          {competitor.discount ? (
            <span className="competitor-slot__discount">{competitor.discount}</span>
          ) : null}
        </div>
      ) : null}

      <div className="competitor-slot__stats">
        {competitor.salesVolume ? (
          <div className="competitor-slot__stat">
            <ShoppingCart size={12} aria-hidden="true" />
            <span>{competitor.salesVolume}</span>
          </div>
        ) : null}
        {competitor.storeCount ? (
          <div className="competitor-slot__stat">
            <MapPin size={12} aria-hidden="true" />
            <span>{competitor.storeCount}家门店</span>
          </div>
        ) : null}
      </div>

      {competitor.price ? (
        <div className="competitor-slot__bar" aria-hidden="true">
          <span style={{ width: `${pricePct}%` }} />
        </div>
      ) : null}

      {competitor.flavor || competitor.volume ? (
        <div className="competitor-slot__spec">
          {competitor.flavor ? <span className="competitor-slot__flavor">口味：{competitor.flavor}</span> : null}
          {competitor.volume ? <span className="competitor-slot__volume">容量：{competitor.volume}</span> : null}
        </div>
      ) : null}

      {competitor.sellingPoints?.length ? (
        <div className="competitor-slot__tags">
          {competitor.sellingPoints.map((tag) => (
            <span className="competitor-slot__tag" key={tag}>{tag}</span>
          ))}
        </div>
      ) : null}

      <p className="competitor-slot__note">{competitor.note}</p>

      {competitor.features?.length ? (
        <div className="competitor-slot__features">
          {competitor.features.map((f) => (
            <span className="competitor-slot__feature" key={f}>
              <Check size={10} aria-hidden="true" />
              {f}
            </span>
          ))}
        </div>
      ) : null}

      <small className="competitor-slot__source">{competitor.source}</small>
    </article>
  );
}

function CompetitorsSection({ report }: { report: ProductReport }) {
  const competitorAnalysis = report.competitorAnalysis;

  if (!competitorAnalysis) {
    return null;
  }

  const maxPrice = Math.max(...competitorAnalysis.competitors.map((c) => c.price ?? 0), 1);

  return (
    <div className="competitor-layout">
      <section className="competitor-board">
        <div className="section-heading">
          <h3>竞品池</h3>
          <p>基于2026年6月抖音平台数据，已收录 12 款乳酸菌/益生菌热销商品。</p>
        </div>
        <div className="competitor-pool">
          {competitorAnalysis.competitors.map((competitor, index) => (
            <CompetitorCard
              key={competitor.name}
              competitor={competitor}
              index={index}
              maxPrice={maxPrice}
            />
          ))}
        </div>
      </section>

      <section className="competitor-overview">
        <div className="section-heading">
          <h3>竞品总览</h3>
          <p>用图表把价格分布、品类结构和销量排行放到一起。</p>
        </div>
        <div className="competitor-overview__grid">
          <CompetitorVisualization competitors={competitorAnalysis.competitors} />
          <article className="competitor-overview__category">
            <strong>品类分布</strong>
            <ul>
              {Object.entries(
                competitorAnalysis.competitors.reduce<Record<string, number>>((acc, c) => {
                  acc[c.category] = (acc[c.category] ?? 0) + 1;
                  return acc;
                }, {})
              )
                .sort((a, b) => b[1] - a[1])
                .map(([cat, count]) => (
                  <li key={cat}>
                    <span>{cat}</span>
                    <em>{count} 款</em>
                  </li>
                ))}
            </ul>
          </article>
        </div>
      </section>

      <section className="opportunity-panel">
        <div className="opportunity-panel__heading">
          <Target aria-hidden="true" size={20} />
          <h3>差异机会</h3>
        </div>
        <div className="opportunity-grid">
          {competitorAnalysis.opportunities.map((opportunity) => (
            <article className="opportunity-card" key={opportunity.title}>
              <strong>{opportunity.title}</strong>
              <span className={`deployment-status deployment-status--${opportunity.status}`}>
                {metricStatusText[opportunity.status]}
              </span>
              <p>{opportunity.description}</p>
              <small>需要：{opportunity.inputNeeded}</small>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

function KnowledgeSectionView({
  report,
  onSelectKnowledge
}: {
  report: ProductReport;
  onSelectKnowledge: (entry: KnowledgeEntry) => void;
}) {
  return (
    <div className="knowledge-layout">
      <section className="knowledge-grid">
        {report.knowledgeBase.entries.map((entry) => (
          <button
            aria-label={`查看${entry.title}`}
            className="knowledge-card knowledge-topic-card"
            key={`${entry.category}-${entry.title}`}
            onClick={() => onSelectKnowledge(entry)}
            type="button"
          >
            <span className="knowledge-card-category">{entry.category}</span>
            <strong>{entry.title}</strong>
            <p>{entry.summary}</p>
            {entry.tags?.length ? (
              <div className="knowledge-card-tags" aria-label={`${entry.title}关键词`}>
                {entry.tags.slice(0, 3).map((tag) => (
                  <span className="knowledge-card-tag" key={tag}>
                    {tag}
                  </span>
                ))}
              </div>
            ) : null}
            <small>点击展开资料</small>
          </button>
        ))}
      </section>
    </div>
  );
}

function KnowledgeDialog({ entry, onClose }: { entry: KnowledgeEntry; onClose: () => void }) {
  return (
    <div className="knowledge-dialog-backdrop" onClick={onClose}>
      <section
        aria-labelledby="knowledge-dialog-title"
        aria-modal="true"
        className="knowledge-dialog"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
      >
        <div className="knowledge-dialog__header">
          <div>
            <span>{entry.category}</span>
            <h3 id="knowledge-dialog-title">{entry.title}</h3>
            <p>{entry.summary}</p>
          </div>
          <button aria-label="关闭知识详情" className="comparison-dialog__close" onClick={onClose} type="button">
            <X aria-hidden="true" size={18} />
          </button>
        </div>
        <div className="knowledge-dialog__body">
          {entry.tags?.length ? (
            <div className="knowledge-tag-list" aria-label={`${entry.title}关键词`}>
              {entry.tags.map((tag) => (
                <span className="knowledge-tag" key={tag}>
                  {tag}
                </span>
              ))}
            </div>
          ) : null}

          {entry.sections?.length ? (
            <div className="knowledge-dialog-section-list">
              {entry.sections.map((section) => (
                <article className="knowledge-dialog-section" key={section.title}>
                  <h4>{section.title}</h4>
                  <ul>
                    {section.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          ) : (
            <div className="knowledge-point-list">
              {entry.points.map((point) => (
                <article className="knowledge-point" key={point}>
                  <span aria-hidden="true" />
                  <p>{point}</p>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default App;









