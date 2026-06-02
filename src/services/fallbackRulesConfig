import type { ImpactLevel, LikelihoodLevel, RiskCategory, RiskLevel } from "../types/risk";

export interface FallbackCategoryRule {
  id: string;
  category: RiskCategory;
  riskName: string;
  likelihood: LikelihoodLevel;
  impact: ImpactLevel;
  riskLevel: RiskLevel;
  controlGapScore: number;
}

// Phase-1 maintainability refactor: category-level defaults are now data-driven.
// New regional or vertical rules can be added here first, then promoted into JSON
// once a backend build pipeline is available.
export const DEFAULT_CATEGORY_RULES: Record<RiskCategory, FallbackCategoryRule> = {
  fraud: {
    id: "rm-general-01",
    category: "fraud",
    riskName: "Fraud Exploitation of New Policy Gap",
    likelihood: "medium",
    impact: "high",
    riskLevel: "high",
    controlGapScore: 4,
  },
  compliance: {
    id: "rm-general-02",
    category: "compliance",
    riskName: "Compliance Review Gap",
    likelihood: "medium",
    impact: "high",
    riskLevel: "high",
    controlGapScore: 4,
  },
  false_positive: {
    id: "rm-general-03",
    category: "false_positive",
    riskName: "False Positive Friction for Legitimate Users",
    likelihood: "medium",
    impact: "medium",
    riskLevel: "medium",
    controlGapScore: 4,
  },
  user_harm: {
    id: "rm-general-04",
    category: "user_harm",
    riskName: "User Harm from Incorrect or Delayed Outcome",
    likelihood: "medium",
    impact: "high",
    riskLevel: "high",
    controlGapScore: 4,
  },
  operational: {
    id: "rm-general-05",
    category: "operational",
    riskName: "Operational Load Increase",
    likelihood: "medium",
    impact: "medium",
    riskLevel: "medium",
    controlGapScore: 4,
  },
  reputation: {
    id: "rm-general-06",
    category: "reputation",
    riskName: "Reputation Exposure from Poor Rollout",
    likelihood: "low",
    impact: "high",
    riskLevel: "medium",
    controlGapScore: 4,
  },
};

export const FALLBACK_ENGINE_ROADMAP = [
  "Move scenario-specific keyword signals into rule configuration files.",
  "Add jurisdiction packs for BNM, MAS, SEC, and other regulatory contexts.",
  "Unit-test each risk rule independently from the assessment builder.",
];
