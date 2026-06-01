import type { RiskLevel } from "../types/risk";

interface RiskRatingBadgeProps {
  level: RiskLevel;
  score?: number;
  size?: "sm" | "md" | "lg";
}

const LEVEL_CONFIG: Record<RiskLevel, { label: string; className: string }> = {
  critical: { label: "CRITICAL", className: "badge--critical" },
  high: { label: "HIGH", className: "badge--high" },
  medium: { label: "MEDIUM", className: "badge--medium" },
  low: { label: "LOW", className: "badge--low" },
};

export function RiskRatingBadge({ level, score, size = "md" }: RiskRatingBadgeProps) {
  const { label, className } = LEVEL_CONFIG[level];

  return (
    <span className={`risk-badge risk-badge--${size} ${className}`}>
      <span className="badge-dot" />
      {score !== undefined ? `${label} · ${score}` : label}
    </span>
  );
}
