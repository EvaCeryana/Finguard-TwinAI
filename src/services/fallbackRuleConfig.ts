import type {
  ImpactLevel,
  LikelihoodLevel,
  RiskCategory,
  RiskLevel,
} from "../types/risk";

export type FallbackCategoryRule = {
  id: string;
  category: RiskCategory;
  riskName: string;
  likelihood: LikelihoodLevel;
  impact: ImpactLevel;
  riskLevel: RiskLevel;
  controlGapScore: number;
};

type CategoryRuleMap = Record<RiskCategory, FallbackCategoryRule>;

const sharedControlGapScore = 4;

export const defaultCategoryRules: CategoryRuleMap = {
  fraud: {
    id: "rm-general-01",
    category: "fraud",
    riskName: "Fraud Exploitation of Policy Gap",
    likelihood: "medium",
    impact: "high",
    riskLevel: "high",
    controlGapScore: sharedControlGapScore,
  },

  compliance: {
    id: "rm-general-02",
    category: "compliance",
    riskName: "Compliance Review Gap",
    likelihood: "medium",
    impact: "high",
    riskLevel: "high",
    controlGapScore: sharedControlGapScore,
  },

  false_positive: {
    id: "rm-general-03",
    category: "false_positive",
    riskName: "Legitimate Users Affected by Control Rules",
    likelihood: "medium",
    impact: "medium",
    riskLevel: "medium",
    controlGapScore: sharedControlGapScore,
  },

  user_harm: {
    id: "rm-general-04",
    category: "user_harm",
    riskName: "User Harm from Incorrect or Delayed Outcome",
    likelihood: "medium",
    impact: "high",
    riskLevel: "high",
    controlGapScore: sharedControlGapScore,
  },

  operational: {
    id: "rm-general-05",
    category: "operational",
    riskName: "Operational Workload Increase",
    likelihood: "medium",
    impact: "medium",
    riskLevel: "medium",
    controlGapScore: sharedControlGapScore,
  },

  reputation: {
    id: "rm-general-06",
    category: "reputation",
    riskName: "Reputation Exposure from Poor Rollout",
    likelihood: "low",
    impact: "high",
    riskLevel: "medium",
    controlGapScore: sharedControlGapScore,
  },
};

export const fallbackEngineNotes = [
  "Keep keyword signals in a separate rule file later.",
  "Add Malaysia-specific and Singapore-specific regulatory rules.",
  "Test the fallback rules separately from the assessment builder.",
];
