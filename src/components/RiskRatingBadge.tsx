import type { RiskLevel } from "../types/risk";

type BadgeSize = "sm" | "md" | "lg";

type RiskRatingBadgeProps = {
  level: RiskLevel;
  score?: number;
  size?: BadgeSize;
};

type RiskBadgeConfig = {
  text: string;
  className: string;
};

const riskBadgeConfig: Record<RiskLevel, RiskBadgeConfig> = {
  critical: {
    text: "CRITICAL",
    className: "badge--critical",
  },
  high: {
    text: "HIGH",
    className: "badge--high",
  },
  medium: {
    text: "MEDIUM",
    className: "badge--medium",
  },
  low: {
    text: "LOW",
    className: "badge--low",
  },
};

function getBadgeText(level: RiskLevel, score?: number) {
  const label = riskBadgeConfig[level].text;

  if (score === undefined) {
    return label;
  }

  return `${label} · ${score}`;
}

export function RiskRatingBadge(props: RiskRatingBadgeProps) {
  const { level, score, size = "md" } = props;

  const config = riskBadgeConfig[level];
  const badgeClassName = `risk-badge risk-badge--${size} ${config.className}`;
  const badgeText = getBadgeText(level, score);

  return (
    <span className={badgeClassName} aria-label={`Risk rating: ${badgeText}`}>
      <span className="badge-dot" aria-hidden="true" />
      {badgeText}
    </span>
  );
}
