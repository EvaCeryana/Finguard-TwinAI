import type {
  ImpactLevel,
  LikelihoodLevel,
  RiskLevel,
  RiskMatrixEntry,
} from "../types/risk";

const likelihoodScoreMap: Record<LikelihoodLevel, number> = {
  very_high: 5,
  high: 4,
  medium: 3,
  low: 2,
};

const impactScoreMap: Record<ImpactLevel, number> = {
  critical: 5,
  high: 4,
  medium: 3,
  low: 2,
};

export function getLikelihoodScore(level: LikelihoodLevel): number {
  return likelihoodScoreMap[level];
}

export function getImpactScore(level: ImpactLevel): number {
  return impactScoreMap[level];
}

export function calculateSeverity(
  likelihood: LikelihoodLevel,
  impact: ImpactLevel,
  controlGapScore = 4
): number {
  return getLikelihoodScore(likelihood) * getImpactScore(impact) * controlGapScore;
}

export function calculateInternalRiskScore(entries: RiskMatrixEntry[]): number {
  if (entries.length === 0) return 0;

  const total = entries.reduce((sum, entry) => {
    const severity =
      entry.severityScore ??
      calculateSeverity(entry.likelihood, entry.impact, entry.controlGapScore ?? 4);

    return sum + severity;
  }, 0);

  return Math.round(total / entries.length);
}

export function normalizeToDisplayScore(internalScore: number): number {
  const maxInternalScore = 125;
  return Math.min(100, Math.max(0, Math.round((internalScore / maxInternalScore) * 100)));
}

export function getRiskLevelFromDisplayScore(score: number): RiskLevel {
  if (score >= 85) return "critical";
  if (score >= 56) return "high";
  if (score >= 31) return "medium";
  return "low";
}

/**
 * Kai Task 2 scoring override:
 * - If any critical risk exists → Overall Critical
 * - If high risk count >= 3 → Overall High
 * - If high risk count >= 1 and display score >= 50 → Overall High
 * - Else use display score threshold
 */
export function getOverallRiskLevel(
  displayScore: number,
  riskMatrix: RiskMatrixEntry[]
): RiskLevel {
  const hasCriticalRisk = riskMatrix.some((risk) => risk.riskLevel === "critical");
  const highRiskCount = riskMatrix.filter((risk) => risk.riskLevel === "high").length;

  if (hasCriticalRisk) return "critical";
  if (highRiskCount >= 3) return "high";
  if (highRiskCount >= 1 && displayScore >= 50) return "high";

  return getRiskLevelFromDisplayScore(displayScore);
}

export function getLaunchRecommendation(level: RiskLevel): string {
  switch (level) {
    case "critical":
      return "Do not launch as proposed. Proceed only after major mitigation and senior risk and compliance approval.";
    case "high":
      return "Launch only after mitigation controls, monitoring rules, and manual review capacity are ready.";
    case "medium":
      return "Pilot with limited exposure, active monitoring, and rollback conditions.";
    case "low":
      return "Proceed with standard monitoring and periodic risk review.";
    default:
      return "Further review required.";
  }
}

export function enrichRiskMatrix(entries: RiskMatrixEntry[]): RiskMatrixEntry[] {
  return entries.map((entry) => {
    const probabilityScore = getLikelihoodScore(entry.likelihood);
    const impactScore = getImpactScore(entry.impact);
    const controlGapScore = entry.controlGapScore ?? (entry.mitigated ? 2 : 4);
    const severityScore = probabilityScore * impactScore * controlGapScore;

    return {
      ...entry,
      probabilityScore,
      impactScore,
      controlGapScore,
      severityScore,
    };
  });
}
