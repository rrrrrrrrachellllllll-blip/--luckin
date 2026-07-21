import { CheckCircle2 } from "lucide-react";

interface InsightListProps {
  items: string[];
}

export function InsightList({ items }: InsightListProps) {
  return (
    <ul className="insight-list">
      {items.map((item) => (
        <li key={item}>
          <CheckCircle2 aria-hidden="true" size={18} />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

