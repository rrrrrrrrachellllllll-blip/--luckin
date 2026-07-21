import { CircleDashed, TrendingUp } from "lucide-react";
import type { KeyMetric } from "../types/report";

interface MetricCardProps {
  metric: KeyMetric;
}

export function MetricCard({ metric }: MetricCardProps) {
  const hasValue = metric.value !== null;

  return (
    <article className={`metric-card ${hasValue ? "" : "metric-card--pending"}`}>
      <div className="metric-card__topline">
        <span className="metric-card__label">{metric.label}</span>
        {hasValue ? <TrendingUp aria-hidden="true" size={18} /> : <CircleDashed aria-hidden="true" size={18} />}
      </div>
      <span className={`metric-card__status ${hasValue ? "metric-card__status--verified" : ""}`}>
        {hasValue ? "已验证" : "待接入"}
      </span>
      {hasValue ? (
        <>
          <strong>
            {metric.value}
            <small>{metric.unit}</small>
          </strong>
          <span className="metric-card__trend">{metric.trend}</span>
        </>
      ) : (
        <>
          <strong className="metric-card__pending-value">待接入</strong>
          <span className="metric-card__source">{metric.source}</span>
        </>
      )}
    </article>
  );
}
