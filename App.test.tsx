import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, test, vi } from "vitest";
import App from "./App";

vi.mock("echarts-for-react", () => ({
  default: ({
    option
  }: {
    option: {
      title?: { text?: string };
      grid?: { containLabel?: boolean } | { containLabel?: boolean }[];
      tooltip?: { confine?: boolean; extraCssText?: string } | { confine?: boolean; extraCssText?: string }[];
    };
  }) => {
    const tooltips = Array.isArray(option.tooltip) ? option.tooltip : [option.tooltip];
    const grids = Array.isArray(option.grid) ? option.grid : option.grid ? [option.grid] : [];
    const isTooltipConfined = tooltips.length > 0 && tooltips.every((tooltip) => tooltip?.confine === true);
    const doesTooltipWrap = tooltips.every((tooltip) => {
      const extraCssText = tooltip?.extraCssText ?? "";
      return extraCssText.includes("max-width") && extraCssText.includes("white-space: normal");
    });
    const isGridLabelContained = grids.length === 0 || grids.every((grid) => grid?.containLabel === true);

    return (
      <div
        data-testid="chart"
        data-grid-label-contained={String(isGridLabelContained)}
        data-tooltip-confine={String(isTooltipConfined)}
        data-tooltip-wrap={String(doesTooltipWrap)}
      >
        {option.title?.text}
      </div>
    );
  }
}));

const mockReport = {
  dataProvenance: {
    status: "unverified",
    summary: "当前仅包含用户指定商品名称和本地报告结构，尚未接入真实销售、舆情或官方商品数据。",
    disclaimer: "未标注来源的数据不会展示为结论。",
    sources: [
      { name: "用户输入", status: "available", note: "商品名称来自用户。" },
      {
        name: "官方商品资料",
        status: "missing",
        note: "尚未接入瑞幸官方商品页、配料、价格、上市时间等资料。",
        images: [
          { src: "/images/luckin-probiotic-coffee-hero.png", alt: "乳酸菌美式商品主图", caption: "商品主图" },
          { src: "/images/luckin-site-background.jpg", alt: "乳酸菌美式资料页图片", caption: "资料页" },
          { src: "/images/luckin-duolingo-background.png", alt: "乳酸菌美式传播素材图", caption: "传播素材" }
        ]
      },
      {
        name: "销售与复购数据",
        status: "missing",
        note: "尚未接入订单、门店、渠道、复购或价格数据。",
        visualization: {
          title: "销售与复购可视化",
          points: [
            { label: "订单", value: null },
            { label: "门店", value: null },
            { label: "渠道", value: null },
            { label: "复购", value: null }
          ]
        }
      },
      { name: "舆情与评价数据", status: "missing", note: "尚未接入。" }
    ]
  },
  product: {
    name: "【含百亿活菌吸管】乳酸菌美式",
    brand: "瑞幸咖啡",
    category: "功能型咖啡饮品",
    launchContext: "",
    heroTagline: "",
    imageUrl: "/images/luckin-probiotic-coffee.png"
  },
  productDetail: {
    status: "unverified",
    summary: "当前仅记录用户指定的商品名称和品牌归属。",
    facts: [
      { label: "商品名称", value: "【含百亿活菌吸管】乳酸菌美式", status: "known", source: "用户输入" },
      { label: "品牌", value: "瑞幸咖啡", status: "known", source: "用户输入" },
      { label: "配方与菌株", value: "待接入", status: "pending", source: "需接入官方资料" }
    ],
    deploymentItems: [
      {
        title: "商品页资料区",
        status: "pending",
        description: "用于展示官方商品名、卖点、规格、价格、配料和图片。",
        inputNeeded: "官方商品页"
      },
      {
        title: "合规审核区",
        status: "pending",
        description: "用于标记健康相关表达是否可进入正式报告。",
        inputNeeded: "人工审核结论"
      }
    ],
    reviewNote: "未接入的数据不会展示成结论。"
  },
  executiveSummary: [
    "当前报告不展示市场关注度、复购、用户占比等结论性指标。",
    "请先接入官方商品资料、销售数据、舆情数据或人工审核材料。"
  ],
  keyMetrics: [
    { label: "市场关注度", value: null, unit: "", trend: "", status: "pending", source: "未接入真实数据" }
  ],
  audienceSegments: [{ name: "目标人群", share: null, insight: "待接入订单、人群画像或调研数据后生成。" }],
  sellingPoints: [{ title: "卖点判断", detail: "待接入官方商品信息或人工确认后生成。", strength: null }],
  coreInsights: {
    userPersonas: [
      {
        name: "目标用户画像",
        status: "pending",
        source: "未接入订单、会员、人群画像或调研数据",
        insight: "待接入真实用户数据后生成。"
      },
      {
        name: "消费场景画像",
        status: "pending",
        source: "未接入门店时段、渠道、券包和消费路径数据",
        insight: "待接入真实场景数据后生成。"
      },
      {
        name: "敏感因素画像",
        status: "pending",
        source: "未接入价格、优惠、评价和复购数据",
        insight: "待接入真实转化数据后生成。"
      }
    ],
    hotWordCloud: [{ label: "搜索词待接入", status: "pending", source: "未接入搜索热度数据", weight: null }],
    popularContents: [
      {
        channel: "社媒内容",
        title: "待接入热门内容标题",
        status: "pending",
        source: "未接入社媒内容数据",
        reason: "接入后展示真实标题、互动量、发布时间、链接和内容主题。"
      },
      {
        channel: "用户评价",
        title: "待接入高频评价样本",
        status: "pending",
        source: "未接入评价数据",
        reason: "接入后展示真实评价样本，并标注来源和情绪倾向。"
      },
      {
        channel: "官方素材",
        title: "待接入官方传播素材",
        status: "pending",
        source: "未接入官方素材",
        reason: "接入后展示真实素材信息。"
      }
    ]
  },
  competitorAnalysis: {
    status: "unverified",
    summary: "当前尚未接入真实竞品名单和竞品商品资料，因此只展示分析框架。",
    competitors: [
      {
        name: "竞品 01 待接入",
        category: "同品类或同场景商品",
        status: "pending",
        source: "未接入真实竞品名单",
        note: "需要通过官方菜单、渠道销售、社媒内容或人工确认建立竞品池。"
      }
    ],
    dimensions: [
      {
        label: "商品定位",
        currentProduct: "待接入官方商品资料",
        competitorPool: "待接入竞品商品资料",
        status: "pending",
        source: "未接入官方商品页、菜单或人工审核"
      }
    ],
    opportunities: [
      {
        title: "差异化卖点机会",
        status: "pending",
        description: "需要在真实竞品卖点和本品官方资料接入后生成。",
        inputNeeded: "本品官方资料、竞品商品页、合规审核结论"
      }
    ],
    methodology: ["先确认竞品池来源，不把猜测商品写成竞品结论。"]
  },
  knowledgeBase: {
    disclaimer: "以下内容是通用知识普及，不构成对【含百亿活菌吸管】乳酸菌美式的功效确认。",
    entries: [
      {
        category: "益生菌基础",
        title: "益生菌不能只看热词",
        summary: "具体商品需要看菌株、添加量、存活条件和证据。",
        points: ["确认是否宣称活菌。", "确认具体菌株名称。"],
        tags: ["菌株", "活菌量"],
        sections: [
          {
            title: "判断口径",
            items: ["确认是否宣称活菌。", "确认具体菌株名称。"]
          }
        ],
        source: "通用科普，正式报告需补充来源"
      }
    ]
  },
  riskSignals: [{ title: "功效感知门槛", level: "medium", mitigation: "避免过度功效承诺。" }],
  visualizations: { sentiment: [], purchaseDrivers: [], trend: [] },
  ai: {
    provider: "zhipu",
    status: "reserved",
    endpointHint: "/api/ai/zhipu/analyze",
    note: "智谱 AI API 已预留，当前展示 JSON 静态分析结果。"
  }
};

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe("App", () => {
  test("renders integrated core insights first and removes separate detail and risk tabs", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify(mockReport), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      })
    );

    render(<App />);

    expect(await screen.findByRole("heading", { name: "【含百亿活菌吸管】乳酸菌美式" })).toBeInTheDocument();
    expect(screen.queryByText("AI商品洞察展示平台")).not.toBeInTheDocument();
    const hero = screen.getByLabelText("【含百亿活菌吸管】乳酸菌美式 商品摘要");
    expect(hero).toHaveClass("report-hero--with-image");
    expect(hero).toHaveStyle("--hero-image: url(/images/luckin-probiotic-coffee.png)");
    expect(screen.queryByText("功能型咖啡饮品")).not.toBeInTheDocument();
    expect(screen.queryByText("等待真实数据接入后生成商品洞察")).not.toBeInTheDocument();
    expect(screen.queryByText("当前尚未接入公开资料或业务数据。")).not.toBeInTheDocument();
    expect(screen.getAllByText("瑞幸咖啡").length).toBeGreaterThan(0);
    expect(screen.queryByRole("button", { name: /商品详情/ })).not.toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "商品详情" })).not.toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "商品资料" })).not.toBeInTheDocument();
    expect(screen.queryByText("商品页资料区")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /^来源与风险/ })).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "核心洞察" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "用户画像" })).toBeInTheDocument();
    expect(screen.queryByLabelText("用户画像饼状图")).not.toBeInTheDocument();
    expect(screen.queryByText("用户画像结构")).not.toBeInTheDocument();
    expect(screen.getByLabelText("目标用户画像饼状图")).toBeInTheDocument();
    expect(screen.getByLabelText("消费场景画像饼状图")).toBeInTheDocument();
    expect(screen.getByLabelText("敏感因素画像饼状图")).toBeInTheDocument();
    expect(screen.queryByText("目标用户画像结构")).not.toBeInTheDocument();
    expect(screen.getByLabelText("目标用户画像年龄层饼状图")).toBeInTheDocument();
    expect(screen.getByLabelText("目标用户画像城市层级饼状图")).toBeInTheDocument();
    expect(screen.getByLabelText("目标用户画像消费频次饼状图")).toBeInTheDocument();
    expect(screen.getByLabelText("目标用户画像购买动机饼状图")).toBeInTheDocument();
    expect(screen.getByText("目标用户画像")).toBeInTheDocument();
    expect(screen.getByText("消费场景画像")).toBeInTheDocument();
    expect(screen.getByText("敏感因素画像")).toBeInTheDocument();
    expect(screen.queryByText(mockReport.coreInsights.userPersonas[0].insight)).not.toBeInTheDocument();
    expect(screen.queryByText(mockReport.coreInsights.userPersonas[1].insight)).not.toBeInTheDocument();
    expect(screen.queryByText(mockReport.coreInsights.userPersonas[2].insight)).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "热点词云" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "热门内容" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "用户画像可用性" })).not.toBeInTheDocument();
    expect(screen.queryByLabelText("详情页画像状态可视化")).not.toBeInTheDocument();
    expect(screen.queryByText("人数小于100，无法展示详细分析")).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "AI摘要词云" })).toBeInTheDocument();
    expect(screen.getByText("平台推荐")).toBeInTheDocument();
    expect(screen.getByText("直播上涨")).toBeInTheDocument();
    expect(screen.getByText("短视频上涨")).toBeInTheDocument();
    expect(screen.getByLabelText("社媒内容词云")).toBeInTheDocument();
    expect(screen.getByLabelText("用户评价词云")).toBeInTheDocument();
    expect(screen.getByText("互动量")).toBeInTheDocument();
    expect(screen.getByText("情绪倾向")).toBeInTheDocument();
    expect(screen.queryByText(mockReport.coreInsights.popularContents[0].reason)).not.toBeInTheDocument();
    expect(screen.queryByText(mockReport.coreInsights.popularContents[1].reason)).not.toBeInTheDocument();
    expect(screen.queryByText("官方素材")).not.toBeInTheDocument();
    expect(screen.queryByText("待接入官方传播素材")).not.toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "来源与风险" })).not.toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "数据来源与边界" })).not.toBeInTheDocument();
    expect(screen.queryByText(mockReport.dataProvenance.summary)).not.toBeInTheDocument();
    expect(screen.queryByText(mockReport.dataProvenance.sources[0].name)).not.toBeInTheDocument();
    expect(screen.queryByText(mockReport.dataProvenance.sources[0].note)).not.toBeInTheDocument();
    expect(screen.queryByText(mockReport.dataProvenance.sources[1].name)).not.toBeInTheDocument();
    expect(screen.queryByLabelText("官方商品资料图片资料")).not.toBeInTheDocument();
    expect(screen.queryByRole("img", { name: "乳酸菌美式商品主图" })).not.toBeInTheDocument();
    expect(screen.queryByRole("img", { name: "乳酸菌美式资料页图片" })).not.toBeInTheDocument();
    expect(screen.queryByRole("img", { name: "乳酸菌美式传播素材图" })).not.toBeInTheDocument();
    expect(screen.queryByLabelText("销售与复购数据可视化")).not.toBeInTheDocument();
    expect(screen.queryByText("销售与复购可视化")).not.toBeInTheDocument();
    expect(screen.queryByText("订单")).not.toBeInTheDocument();
    expect(screen.queryByText("复购")).not.toBeInTheDocument();
    expect(screen.queryByText(mockReport.riskSignals[0].title)).not.toBeInTheDocument();
    expect(screen.queryByText(mockReport.riskSignals[0].mitigation)).not.toBeInTheDocument();
    expect(screen.queryByText(mockReport.ai.note)).not.toBeInTheDocument();
    expect(screen.queryByText(mockReport.ai.endpointHint)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/AI/)).not.toBeInTheDocument();
    expect(screen.queryByText("报告概览")).not.toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "执行摘要" })).not.toBeInTheDocument();
    expect(screen.queryByText("综合洞察指数")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /数据看板/ }));

    expect(screen.getByRole("heading", { name: "数据看板" })).toBeInTheDocument();
    expect(screen.getByLabelText("抖音整体数据总览")).toBeInTheDocument();
    const douyinEntry = screen.getByRole("button", { name: "打开抖音整体数据面板" });
    expect(douyinEntry).toBeInTheDocument();
    expect(screen.getByText("抖音整体成交券数")).toBeInTheDocument();
    expect(screen.getByLabelText("抖音整体转换率")).toBeInTheDocument();
    expect(screen.queryByLabelText("生意经7月13日数据看板")).not.toBeInTheDocument();

    vi.useFakeTimers();
    fireEvent.click(douyinEntry);
    const douyinPage = screen.getByRole("region", { name: "抖音整体数据看板" });
    expect(douyinPage).toBeInTheDocument();
    expect(screen.queryByRole("dialog", { name: "抖音整体数据看板" })).not.toBeInTheDocument();
    expect(within(douyinPage).getByText("抖音整体下钻看板")).toBeInTheDocument();
    expect(within(douyinPage).queryByText("抖音整体原始数据")).not.toBeInTheDocument();
    expect(within(douyinPage).queryByText("转化率参考链路")).not.toBeInTheDocument();
    expect(within(douyinPage).getByText("全量 Excel 明细")).toBeInTheDocument();
    expect(within(douyinPage).getAllByText("POI").length).toBeGreaterThan(0);
    expect(within(douyinPage).getAllByText("直播").length).toBeGreaterThan(0);
    expect(within(douyinPage).getByText("渠道间数据可视化对比")).toBeInTheDocument();
    expect(within(douyinPage).queryByText("链路转化一眼看")).not.toBeInTheDocument();
    expect(screen.queryByText("POI 与直播板块已在当前页面铺开")).not.toBeInTheDocument();
    expect(within(douyinPage).getAllByTestId("chart").every((chart) => chart.dataset.tooltipConfine === "true")).toBe(true);
    expect(within(douyinPage).getAllByTestId("chart").every((chart) => chart.dataset.tooltipWrap === "true")).toBe(true);
    expect(within(douyinPage).getAllByTestId("chart").every((chart) => chart.dataset.gridLabelContained === "true")).toBe(true);
    act(() => {
      vi.advanceTimersByTime(260);
    });
    fireEvent.click(within(douyinPage).getByRole("button", { name: "查看 POI 板块详情" }));
    expect(within(douyinPage).getAllByText("商品曝光次数").length).toBeGreaterThan(0);
    expect(within(douyinPage).getByText("PV 漏斗")).toBeInTheDocument();
    expect(within(douyinPage).getByText("UV 漏斗")).toBeInTheDocument();
    expect(within(douyinPage).getByText(/转化率 = 下层数据/)).toBeInTheDocument();
    fireEvent.click(within(douyinPage).getByRole("button", { name: "返回上一级" }));
    fireEvent.click(within(douyinPage).getByRole("button", { name: "查看 直播 板块详情" }));
    expect(within(douyinPage).getAllByText("官号+团购").length).toBeGreaterThan(0);
    expect(within(douyinPage).getAllByText("KOL达人").length).toBeGreaterThan(0);
    expect(within(douyinPage).getAllByText("矩阵号").length).toBeGreaterThan(0);
    fireEvent.click(screen.getByRole("button", { name: "返回数据看板" }));
    expect(screen.queryByRole("region", { name: "抖音整体数据看板" })).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "数据看板" })).toBeInTheDocument();
    vi.useRealTimers();

    fireEvent.click(screen.getByRole("button", { name: /知识库/ }));

    expect(screen.queryByRole("heading", { name: "知识库" })).not.toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "知识普及知识库" })).not.toBeInTheDocument();
    expect(screen.getByText("益生菌不能只看热词")).toBeInTheDocument();
    expect(screen.queryByText(mockReport.knowledgeBase.disclaimer)).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /竞品分析/ }));

    expect(screen.getByRole("heading", { name: "竞品分析" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "竞品分析工作台" })).not.toBeInTheDocument();
    expect(screen.queryByText(mockReport.competitorAnalysis.summary)).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "竞品池" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "差异机会" })).toBeInTheDocument();
    expect(screen.getAllByText("待接入").length).toBeGreaterThan(0);
    expect(screen.getByText("竞品 01 待接入")).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "对比维度" })).not.toBeInTheDocument();

    expect(screen.queryByRole("button", { name: "查看竞品 01 待接入 的对比维度" })).not.toBeInTheDocument();
    expect(screen.queryByRole("dialog", { name: "竞品 01 待接入 对比维度" })).not.toBeInTheDocument();
  });

  test("plays a product image click animation on the hero image area", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify(mockReport), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      })
    );

    render(<App />);

    const hero = await screen.findByLabelText("【含百亿活菌吸管】乳酸菌美式 商品摘要");

    vi.useFakeTimers();
    fireEvent.click(hero);

    expect(hero).toHaveClass("report-hero--image-clicked");

    act(() => {
      vi.advanceTimersByTime(260);
    });

    expect(hero).not.toHaveClass("report-hero--image-clicked");
  });

  test("opens a knowledge topic detail dialog from the knowledge library", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify(mockReport), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      })
    );

    render(<App />);

    await screen.findByRole("heading", { name: "【含百亿活菌吸管】乳酸菌美式" });

    fireEvent.click(screen.getByRole("button", { name: /知识库/ }));

    expect(screen.queryByRole("dialog", { name: "益生菌不能只看热词" })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "查看益生菌不能只看热词" }));

    expect(screen.getByRole("dialog", { name: "益生菌不能只看热词" })).toBeInTheDocument();
    expect(screen.getByText("判断口径")).toBeInTheDocument();
    expect(screen.getByText("确认是否宣称活菌。")).toBeInTheDocument();
    expect(screen.queryByText("资料来源与边界")).not.toBeInTheDocument();
    expect(screen.queryByText("通用科普，正式报告需补充来源")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "关闭知识详情" }));

    expect(screen.queryByRole("dialog", { name: "益生菌不能只看热词" })).not.toBeInTheDocument();
  });
});




