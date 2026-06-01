interface MetricCardProps {
  label: string;
  value: string | number;
  sub?: string;
  accent?: "amber" | "red" | "cyan" | "neutral";
}

const ACCENT_CLASSES: Record<string, string> = {
  amber: "metric-card--amber",
  red: "metric-card--red",
  cyan: "metric-card--cyan",
  neutral: "metric-card--neutral",
};

export function MetricCard({ label, value, sub, accent = "neutral" }: MetricCardProps) {
  return (
    <div className={`metric-card ${ACCENT_CLASSES[accent]}`}>
      <span className="metric-label">{label}</span>
      <span className="metric-value">{value}</span>
      {sub && <span className="metric-sub">{sub}</span>}
    </div>
  );
}
