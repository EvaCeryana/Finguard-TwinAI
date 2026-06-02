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

export type OutputLanguage = "en" | "zh" | "id" | "ms";

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

export type ControlType = "preventive" | "detective" | "corrective";

export type ControlPriority = "immediate" | "short_term" | "ongoing";

export type EngineUsed = "fallback" | "gemini";

export type SimulationInput = {
  decisionText: string;
  decisionType: DecisionType;
  companyType: CompanyType;
  marketContext?: string;
  additionalNotes?: string;
};

export type RiskMatrixEntry = {
  id: string;
  riskName: string;
  category: RiskCategory;
  likelihood: LikelihoodLevel;
  impact: ImpactLevel;
  riskLevel: RiskLevel;
  mitigated: boolean;

  probabilityScore?: number;
  impactScore?: number;
  controlGapScore?: number;
  severityScore?: number;
};

export type AbuseScenario = {
  id: string;
  actor: string;
  method: string;
  impact: string;
  severity: RiskLevel;
};

export type FalsePositiveScenario = {
  id: string;
  affectedSegment: string;
  trigger: string;
  userImpact: string;
  severity: RiskLevel;
};

export type ControlAction = {
  id: string;
  control: string;
  type: ControlType;
  owner: string;
  priority: ControlPriority;
};

export type ComplianceConcern = {
  id: string;
  regulation: string;
  concern: string;
  severity: RiskLevel;
};

export type AffectedStakeholder = {
  role: string;
  impact: string;
};

export type SaferAlternative = {
  title: string;
  description: string;
  keyChanges: string[];
};

export type RiskAssessment = {
  id: string;
  createdAt: string;

  decisionInput: string;
  decisionSummary: string;

  overallRiskScore: number;
  overallRiskLevel: RiskLevel;

  internalRiskScore?: number;
  mainConcern?: string;
  launchRecommendation?: string;
  engineUsed?: EngineUsed;
  outputLanguage?: OutputLanguage;
  recoveryNotes?: string[];

  affectedStakeholders: AffectedStakeholder[];
  riskMatrix: RiskMatrixEntry[];
  abuseScenarios: AbuseScenario[];
  falsePositiveScenarios: FalsePositiveScenario[];
  complianceConcerns: ComplianceConcern[];
  operationalRisks: string[];
  reputationRisks: string[];
  controlPlan: ControlAction[];
  saferAlternative: SaferAlternative;
};

export type AssessmentSummary = {
  id: string;
  createdAt: string;
  decisionInput: string;
  overallRiskLevel: RiskLevel;
  overallRiskScore: number;
  outputLanguage?: OutputLanguage;
};
