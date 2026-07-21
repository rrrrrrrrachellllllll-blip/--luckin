import ReactECharts from "echarts-for-react";
import type { EChartsOption } from "echarts";
import { DatabaseZap } from "lucide-react";

interface ChartPanelProps {
  option: EChartsOption;
  title: string;
  description: string;
  isEmpty: boolean;
}

export function ChartPanel({ option, title, description, isEmpty }: ChartPanelProps) {
  return (
    <section className={`chart-panel ${isEmpty ? "chart-panel--empty" : ""}`}>
      <div className="chart-panel__heading">
        <strong>{title}</strong>
        <p>{description}</p>
      </div>
      {isEmpty ? (
        <div className="chart-empty">
          <DatabaseZap aria-hidden="true" size={24} />
          <strong>等待真实数据接入</strong>
          <span>接入后这里会自动生成图表。</span>
        </div>
      ) : (
        <ReactECharts option={option} notMerge lazyUpdate className="chart-panel__canvas" />
      )}
    </section>
  );
}
