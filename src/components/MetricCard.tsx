type MetricAccent = "amber" | "red" | "cyan" | "neutral";

type MetricCardProps = {
  label: string;
  value: string | number;
  sub?: string;
  accent?: MetricAccent;
};

const metricAccentClass: Record<MetricAccent, string> = {
  amber: "metric-card--amber",
  red: "metric-card--red",
  cyan: "metric-card--cyan",
  neutral: "metric-card--neutral",
};

function getMetricAccentClass(accent: MetricAccent) {
  return metricAccentClass[accent] ?? metricAccentClass.neutral;
}

export function MetricCard(props: MetricCardProps) {
  const { label, value, sub, accent = "neutral" } = props;

  const cardClassName = `metric-card ${getMetricAccentClass(accent)}`;

  return (
    <section className={cardClassName} aria-label={label}>
      <span className="metric-label">{label}</span>

      <span className="metric-value">
        {value}
      </span>

      {sub ? (
        <span className="metric-sub">
          {sub}
        </span>
      ) : null}
    </section>
  );
}
