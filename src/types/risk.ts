// ─── Core Enums ────────────────────────────────────────────────────────────

export type RiskLevel = "critical" | "high" | "medium" | "low";

export type RiskCategory =
  | "fraud"
  | "compliance"
  | "operational"
  | "reputation"
  | "false_positive"
  | "user_harm";

export type LikelihoodLevel = "very_high" | "high" | "medium" | "low";
export type ImpactLevel = "critical" | "high" | "medium" | "low";

export type DecisionType =
  | "Transfer Limit Change"
  | "KYC Rule Modification"
  | "New Product / Feature Launch"
  | "Fraud Rule Update"
  | "Merchant Onboarding Policy"
  | "Credit / Loan Policy Change"
  | "Fee / Pricing Change"
  | "Authentication Requirement Change"
  | "Other"
  | "";

export type CompanyType =
  | "Digital Bank"
  | "E-Wallet"
  | "Payment Gateway"
  | "Loan Platform"
  | "Buy Now Pay Later"
  | "Crypto Exchange"
  | "Insurance Tech"
  | "Other Fintech"
  | "";

// ─── Simulation Input ──────────────────────────────────────────────────────

export interface SimulationInput {
  decisionText: string;
  decisionType: DecisionType;
  companyType: CompanyType;
  marketContext?: string;
  additionalNotes?: string;
}

// ─── Risk Matrix Cell ──────────────────────────────────────────────────────

export interface RiskMatrixEntry {
  id: string;
  riskName: string;
  category: RiskCategory;
  likelihood: LikelihoodLevel;
  impact: ImpactLevel;
  riskLevel: RiskLevel;
  mitigated: boolean;

  // Leo engine scoring fields
  probabilityScore?: number; // 1–5
  impactScore?: number;      // 1–5
  controlGapScore?: number;  // 1–5
  severityScore?: number;    // probability × impact × controlGap
}

// ─── Abuse Scenario ────────────────────────────────────────────────────────

export interface AbuseScenario {
  id: string;
  actor: string;
  method: string;
  impact: string;
  severity: RiskLevel;
}

// ─── False Positive Scenario ───────────────────────────────────────────────

export interface FalsePositiveScenario {
  id: string;
  affectedSegment: string;
  trigger: string;
  userImpact: string;
  severity: RiskLevel;
}

// ─── Control Plan ──────────────────────────────────────────────────────────

export interface ControlAction {
  id: string;
  control: string;
  type: "preventive" | "detective" | "corrective";
  owner: string;
  priority: "immediate" | "short_term" | "ongoing";
}

// ─── Compliance ────────────────────────────────────────────────────────────

export interface ComplianceConcern {
  id: string;
  regulation: string;
  concern: string;
  severity: RiskLevel;
}

// ─── Stakeholder ───────────────────────────────────────────────────────────

export interface AffectedStakeholder {
  role: string;
  impact: string;
}

// ─── Safer Alternative ─────────────────────────────────────────────────────

export interface SaferAlternative {
  title: string;
  description: string;
  keyChanges: string[];
}

// ─── Main Risk Assessment ──────────────────────────────────────────────────

export interface RiskAssessment {
  id: string;
  createdAt: string; // ISO date string

  decisionInput: string;
  decisionSummary: string;

  // Dashboard display score
  overallRiskScore: number; // 0–100
  overallRiskLevel: RiskLevel;

  // Leo internal engine fields
  internalRiskScore?: number;         // 1–125
  mainConcern?: string;
  launchRecommendation?: string;
  engineUsed?: "fallback" | "gemini";

  affectedStakeholders: AffectedStakeholder[];

  riskMatrix: RiskMatrixEntry[];

  abuseScenarios: AbuseScenario[];

  falsePositiveScenarios: FalsePositiveScenario[];

  complianceConcerns: ComplianceConcern[];

  operationalRisks: string[];

  reputationRisks: string[];

  controlPlan: ControlAction[];

  saferAlternative: SaferAlternative;
}

// ─── History List Item ─────────────────────────────────────────────────────

export interface AssessmentSummary {
  id: string;
  createdAt: string;
  decisionInput: string;
  overallRiskLevel: RiskLevel;
  overallRiskScore: number;
}
