import type {
  AffectedStakeholder,
  AbuseScenario,
  ComplianceConcern,
  ControlAction,
  FalsePositiveScenario,
  RiskAssessment,
  RiskCategory,
  RiskMatrixEntry,
  SimulationInput,
} from "../types/risk";

import {
  calculateInternalRiskScore,
  enrichRiskMatrix,
  getLaunchRecommendation,
  getOverallRiskLevel,
  normalizeToDisplayScore,
} from "../utils/riskScoring";

import { DEFAULT_CATEGORY_RULES } from "./fallbackRuleConfig";

type DetectedSignals = {
  transferLimit: boolean;
  loanAutomation: boolean;
  scamBlocking: boolean;
  kycReduction: boolean;
  withdrawal: boolean;
  merchantOnboarding: boolean;
  newUser: boolean;
  highValue: boolean;
  malaysiaContext: boolean;
};

type RiskPatternBuilder = (signals: DetectedSignals) => RiskMatrixEntry[];

const defaultControlGapScore = 4;

function createId(prefix: string): string {
  const randomPart = Math.random().toString(16).slice(2, 8);
  return `${prefix}-${Date.now()}-${randomPart}`;
}

function normaliseText(input: SimulationInput): string {
  const inputParts = [
    input.decisionText,
    input.decisionType,
    input.companyType,
    input.marketContext,
    input.additionalNotes,
  ];

  return inputParts.filter(Boolean).join(" ").toLowerCase();
}

function hasAny(text: string, keywords: string[]): boolean {
  return keywords.some((keyword) => text.includes(keyword));
}

function uniqueBy<T>(items: T[], getKey: (item: T) => string): T[] {
  const seenKeys = new Set<string>();

  return items.filter((item) => {
    const key = getKey(item);

    if (seenKeys.has(key)) {
      return false;
    }

    seenKeys.add(key);
    return true;
  });
}

function makeRisk(
  id: string,
  riskName: string,
  category: RiskCategory,
  likelihood: RiskMatrixEntry["likelihood"],
  impact: RiskMatrixEntry["impact"],
  riskLevel: RiskMatrixEntry["riskLevel"],
  controlGapScore = defaultControlGapScore
): RiskMatrixEntry {
  return {
    id,
    riskName,
    category,
    likelihood,
    impact,
    riskLevel,
    mitigated: false,
    controlGapScore,
  };
}

function detectSignals(input: SimulationInput): DetectedSignals {
  const text = normaliseText(input);

  const transferLimit =
    input.decisionType === "Transfer Limit Change" ||
    hasAny(text, [
      "transfer limit",
      "instant transfer",
      "increase transfer",
      "higher transfer",
      "new recipient",
      "recipient transfer",
      "rm500",
      "rm5,000",
      "rm 5000",
      "limit increase",
      "transaction limit",
    ]);

  const loanAutomation =
    input.decisionType === "Credit / Loan Policy Change" ||
    hasAny(text, [
      "loan",
      "credit",
      "lending",
      "borrower",
      "approve loan",
      "loan approval",
      "auto approve",
      "auto-approve",
      "automated approval",
      "ai approve",
      "ai approval",
      "credit scoring",
      "affordability",
    ]);

  const scamBlocking =
    input.decisionType === "Fraud Rule Update" ||
    hasAny(text, [
      "block transaction",
      "blocked transaction",
      "auto block",
      "automatically block",
      "scam",
      "fraud rule",
      "fraud detection",
      "suspicious payment",
      "high risk payment",
      "payment blocking",
    ]);

  const kycReduction =
    input.decisionType === "KYC Rule Modification" ||
    input.decisionType === "Authentication Requirement Change" ||
    hasAny(text, [
      "remove kyc",
      "reduce kyc",
      "skip kyc",
      "without kyc",
      "no kyc",
      "ekyc",
      "e-kyc",
      "selfie",
      "remove selfie",
      "skip selfie",
      "identity verification",
      "verification requirement",
      "authentication requirement",
      "otp",
      "passwordless",
    ]);

  const withdrawal = hasAny(text, [
    "withdrawal",
    "withdraw",
    "cash out",
    "cash-out",
    "payout",
    "bank transfer out",
    "withdraw limit",
    "withdrawal limit",
    "instant payout",
    "wallet to bank",
  ]);

  const merchantOnboarding =
    input.decisionType === "Merchant Onboarding Policy" ||
    hasAny(text, [
      "merchant onboarding",
      "merchant approval",
      "auto approve merchant",
      "seller onboarding",
      "merchant verification",
      "merchant account",
      "payment gateway merchant",
      "chargeback",
      "settlement",
    ]);

  const newUser = hasAny(text, [
    "new user",
    "newly registered",
    "new account",
    "first 7 days",
    "first week",
    "new customer",
    "newly onboarded",
  ]);

  const highValue = hasAny(text, [
    "rm5,000",
    "rm 5000",
    "5000",
    "high value",
    "large transfer",
    "higher limit",
    "increase limit",
    "instant payout",
  ]);

  const malaysiaContext = hasAny(text, [
    "malaysia",
    "bnm",
    "bank negara",
    "e-wallet",
    "ewallet",
    "pdpa",
    "aml/cft",
    "aml",
  ]);

  return {
    transferLimit,
    loanAutomation,
    scamBlocking,
    kycReduction,
    withdrawal,
    merchantOnboarding,
    newUser,
    highValue,
    malaysiaContext,
  };
}

function transferLimitRisks(signals: DetectedSignals): RiskMatrixEntry[] {
  const isNewHighValueUser = signals.newUser || signals.highValue;

  return [
    makeRisk(
      "rm-transfer-01",
      signals.newUser
        ? "Mule Account Abuse by Newly Registered Users"
        : "Mule Account Abuse",
      "fraud",
      signals.newUser ? "very_high" : "high",
      signals.highValue ? "critical" : "high",
      isNewHighValueUser ? "critical" : "high"
    ),
    makeRisk(
      "rm-transfer-02",
      "Account Takeover Exploitation",
      "fraud",
      "high",
      signals.highValue ? "critical" : "high",
      signals.highValue ? "critical" : "high"
    ),
    makeRisk(
      "rm-transfer-03",
      "Weak KYC Exposure on Higher Transfer Limit",
      "compliance",
      signals.kycReduction ? "very_high" : "high",
      "high",
      signals.kycReduction ? "critical" : "high"
    ),
    makeRisk(
      "rm-transfer-04",
      "Legitimate High-Value Transfers Blocked",
      "false_positive",
      "medium",
      "high",
      "high"
    ),
    makeRisk(
      "rm-transfer-05",
      "User Financial Harm from Faster Fund Movement",
      "user_harm",
      "high",
      "high",
      "high"
    ),
    makeRisk(
      "rm-transfer-06",
      "Manual Review and Support Queue Spike",
      "operational",
      "high",
      "medium",
      "medium"
    ),
    makeRisk(
      "rm-transfer-07",
      "Public Trust Erosion After Scam Incident",
      "reputation",
      "medium",
      "high",
      "high"
    ),
  ];
}

function loanAutomationRisks(): RiskMatrixEntry[] {
  return [
    makeRisk(
      "rm-loan-01",
      "Synthetic Identity Loan Fraud",
      "fraud",
      "high",
      "high",
      "high"
    ),
    makeRisk(
      "rm-loan-02",
      "AI Model Bias and Fair Lending Exposure",
      "compliance",
      "high",
      "critical",
      "critical"
    ),
    makeRisk(
      "rm-loan-03",
      "False Rejection of Creditworthy Borrowers",
      "false_positive",
      "medium",
      "high",
      "high"
    ),
    makeRisk(
      "rm-loan-04",
      "Unaffordable Lending to Vulnerable Users",
      "user_harm",
      "high",
      "critical",
      "critical"
    ),
    makeRisk(
      "rm-loan-05",
      "Appeals and Complaint Handling Overload",
      "operational",
      "medium",
      "medium",
      "medium"
    ),
    makeRisk(
      "rm-loan-06",
      "Reputation Damage from Unfair AI Decisions",
      "reputation",
      "medium",
      "high",
      "high"
    ),
  ];
}

function scamBlockingRisks(): RiskMatrixEntry[] {
  return [
    makeRisk(
      "rm-block-01",
      "Scam Payment Leakage Through Rule Evasion",
      "fraud",
      "medium",
      "critical",
      "high"
    ),
    makeRisk(
      "rm-block-02",
      "Consumer Protection and Explanation Gap",
      "compliance",
      "medium",
      "high",
      "high"
    ),
    makeRisk(
      "rm-block-03",
      "Legitimate Urgent Payments Blocked",
      "false_positive",
      "high",
      "high",
      "high"
    ),
    makeRisk(
      "rm-block-04",
      "User Harm from Delayed Access to Funds",
      "user_harm",
      "medium",
      "high",
      "high"
    ),
    makeRisk(
      "rm-block-05",
      "Appeal Queue Overload",
      "operational",
      "high",
      "medium",
      "medium"
    ),
    makeRisk(
      "rm-block-06",
      "Trust Damage from Unexplained Blocks",
      "reputation",
      "medium",
      "high",
      "high"
    ),
  ];
}

function kycReductionRisks(signals: DetectedSignals): RiskMatrixEntry[] {
  return [
    makeRisk(
      "rm-kyc-01",
      "Synthetic Identity and Stolen Identity Onboarding",
      "fraud",
      "very_high",
      signals.highValue ? "critical" : "high",
      signals.highValue ? "critical" : "high"
    ),
    makeRisk(
      "rm-kyc-02",
      "AML / CFT Due Diligence Gap",
      "compliance",
      "high",
      "critical",
      "critical"
    ),
    makeRisk(
      "rm-kyc-03",
      "Legitimate Users Challenged Later After Weak Initial Verification",
      "false_positive",
      "medium",
      "medium",
      "medium"
    ),
    makeRisk(
      "rm-kyc-04",
      "User Harm from Account Recovery and Fraud Disputes",
      "user_harm",
      "medium",
      "high",
      "high"
    ),
    makeRisk(
      "rm-kyc-05",
      "Investigation Cost Increase from Weak Identity Evidence",
      "operational",
      "high",
      "medium",
      "medium"
    ),
    makeRisk(
      "rm-kyc-06",
      "Regulator and Public Trust Concern Over Weak Verification",
      "reputation",
      "medium",
      "high",
      "high"
    ),
  ];
}

function withdrawalRisks(signals: DetectedSignals): RiskMatrixEntry[] {
  return [
    makeRisk(
      "rm-withdraw-01",
      "Rapid Cash-Out After Account Takeover",
      "fraud",
      "high",
      signals.highValue ? "critical" : "high",
      signals.highValue ? "critical" : "high"
    ),
    makeRisk(
      "rm-withdraw-02",
      "Money Movement and AML Monitoring Exposure",
      "compliance",
      "high",
      "high",
      "high"
    ),
    makeRisk(
      "rm-withdraw-03",
      "Legitimate Withdrawals Held for Review",
      "false_positive",
      "medium",
      "high",
      "high"
    ),
    makeRisk(
      "rm-withdraw-04",
      "User Financial Loss from Irreversible Withdrawals",
      "user_harm",
      "high",
      "critical",
      "critical"
    ),
    makeRisk(
      "rm-withdraw-05",
      "Liquidity, Review, and Support Pressure",
      "operational",
      "medium",
      "medium",
      "medium"
    ),
    makeRisk(
      "rm-withdraw-06",
      "Trust Damage if Users Lose Funds Quickly",
      "reputation",
      "medium",
      "high",
      "high"
    ),
  ];
}

function merchantOnboardingRisks(): RiskMatrixEntry[] {
  return [
    makeRisk(
      "rm-merchant-01",
      "Fake Merchant and Transaction Laundering Abuse",
      "fraud",
      "high",
      "critical",
      "critical"
    ),
    makeRisk(
      "rm-merchant-02",
      "Merchant Due Diligence and AML Gap",
      "compliance",
      "high",
      "critical",
      "critical"
    ),
    makeRisk(
      "rm-merchant-03",
      "Legitimate Small Merchants Delayed or Rejected",
      "false_positive",
      "medium",
      "high",
      "high"
    ),
    makeRisk(
      "rm-merchant-04",
      "Consumer Harm from Fraudulent Merchants",
      "user_harm",
      "medium",
      "high",
      "high"
    ),
    makeRisk(
      "rm-merchant-05",
      "Chargeback and Settlement Dispute Spike",
      "operational",
      "high",
      "medium",
      "medium"
    ),
    makeRisk(
      "rm-merchant-06",
      "Brand Damage from Scam Merchant Activity",
      "reputation",
      "medium",
      "high",
      "high"
    ),
  ];
}

function genericRisks(): RiskMatrixEntry[] {
  return Object.values(DEFAULT_CATEGORY_RULES).map((rule) =>
    makeRisk(
      rule.id,
      rule.riskName,
      rule.category,
      rule.likelihood,
      rule.impact,
      rule.riskLevel,
      rule.controlGapScore
    )
  );
}

function addMissingCategoryRisks(risks: RiskMatrixEntry[]): RiskMatrixEntry[] {
  const completedRisks = [...risks];
  const existingCategories = new Set(completedRisks.map((risk) => risk.category));

  for (const category of Object.keys(DEFAULT_CATEGORY_RULES) as RiskCategory[]) {
    if (existingCategories.has(category)) {
      continue;
    }

    const rule = DEFAULT_CATEGORY_RULES[category];

    completedRisks.push(
      makeRisk(
        rule.id,
        rule.riskName,
        rule.category,
        rule.likelihood,
        rule.impact,
        rule.riskLevel,
        rule.controlGapScore
      )
    );
  }

  return completedRisks;
}

function buildRiskMatrix(signals: DetectedSignals): RiskMatrixEntry[] {
  const builders: RiskPatternBuilder[] = [];

  if (signals.transferLimit) {
    builders.push(transferLimitRisks);
  }

  if (signals.loanAutomation) {
    builders.push(() => loanAutomationRisks());
  }

  if (signals.scamBlocking) {
    builders.push(() => scamBlockingRisks());
  }

  if (signals.kycReduction) {
    builders.push(kycReductionRisks);
  }

  if (signals.withdrawal) {
    builders.push(withdrawalRisks);
  }

  if (signals.merchantOnboarding) {
    builders.push(() => merchantOnboardingRisks());
  }

  const matchedRisks = builders.flatMap((buildRisks) => buildRisks(signals));
  const baseRisks = matchedRisks.length > 0 ? matchedRisks : genericRisks();

  const uniqueRisks = uniqueBy(
    baseRisks,
    (risk) => `${risk.category}-${risk.riskName}`
  );

  return addMissingCategoryRisks(uniqueRisks).slice(0, 10);
}

function buildDecisionSummary(signals: DetectedSignals): string {
  const topics: string[] = [];

  if (signals.transferLimit) {
    topics.push("higher transfer exposure");
  }

  if (signals.loanAutomation) {
    topics.push("automated credit decisioning");
  }

  if (signals.scamBlocking) {
    topics.push("transaction blocking logic");
  }

  if (signals.kycReduction) {
    topics.push("weaker identity or authentication controls");
  }

  if (signals.withdrawal) {
    topics.push("faster withdrawal or cash-out movement");
  }

  if (signals.merchantOnboarding) {
    topics.push("merchant onboarding exposure");
  }

  if (topics.length === 0) {
    return "The proposed fintech decision changes user, transaction, or platform risk exposure before launch. It should be checked against fraud, compliance, false positive, user harm, operational, and reputation risks before rollout.";
  }

  return `The proposed decision introduces ${topics.join(
    ", "
  )} before the related controls are fully proven. This creates pre-launch exposure across fraud, compliance, user harm, operational workload, and customer trust.`;
}

function buildMainConcern(signals: DetectedSignals): string {
  if (signals.transferLimit && signals.kycReduction) {
    return "Higher transaction exposure is being combined with weaker identity assurance, creating strong mule-account and AML risk.";
  }

  if (signals.loanAutomation) {
    return "Automated approval may create unfair, unaffordable, or easily exploited lending outcomes without human review and explanation controls.";
  }

  if (signals.scamBlocking) {
    return "Aggressive transaction blocking may reduce scam losses but wrongly stop legitimate urgent payments without a clear appeal path.";
  }

  if (signals.withdrawal) {
    return "Faster cash-out can reduce the recovery window after fraud, account takeover, or social engineering incidents.";
  }

  if (signals.merchantOnboarding) {
    return "Weak merchant approval can allow fake merchants, transaction laundering, chargebacks, and consumer harm to enter the platform.";
  }

  if (signals.kycReduction) {
    return "Reduced verification may increase synthetic identity, stolen identity, and compliance exposure.";
  }

  return "The decision may increase risk exposure faster than the platform's current controls can safely manage.";
}

function buildStakeholders(signals: DetectedSignals): AffectedStakeholder[] {
  const stakeholders: AffectedStakeholder[] = [
    {
      role: "End Users",
      impact:
        "May receive faster or more convenient access, but may also face fraud loss, account review, payment delay, or unfair treatment.",
    },
    {
      role: "Fraud & Risk Team",
      impact:
        "Must monitor abuse patterns, tune rules, and investigate suspicious activity after launch.",
    },
    {
      role: "Compliance Team",
      impact:
        "Needs to confirm AML/CFT, consumer protection, audit trail, and fair treatment obligations.",
    },
    {
      role: "Customer Support",
      impact:
        "May face more tickets from blocked, delayed, rejected, or disputed user actions.",
    },
    {
      role: "Product & Engineering",
      impact:
        "Must implement controls, reason logging, monitoring events, and rollback conditions.",
    },
  ];

  if (signals.loanAutomation) {
    stakeholders.push({
      role: "Credit Risk / Underwriting Team",
      impact:
        "Needs to monitor approval quality, model drift, defaults, appeals, and affordability outcomes.",
    });
  }

  if (signals.merchantOnboarding) {
    stakeholders.push({
      role: "Merchants",
      impact:
        "Legitimate merchants may benefit from faster onboarding but may also face extra checks if risk controls tighten.",
    });
  }

  return uniqueBy(stakeholders, (stakeholder) => stakeholder.role);
}

function buildAbuseScenarios(signals: DetectedSignals): AbuseScenario[] {
  const scenarios: AbuseScenario[] = [];

  if (signals.transferLimit || signals.kycReduction || signals.newUser) {
    scenarios.push({
      id: "as-mule-01",
      actor: "Mule Account Operator",
      method:
        "Registers or acquires multiple accounts, then rapidly moves funds before the platform has enough behaviour history to detect coordinated abuse.",
      impact:
        "Stolen or scam-related funds can move through the platform quickly, increasing AML and fraud loss exposure.",
      severity: signals.highValue || signals.kycReduction ? "critical" : "high",
    });
  }

  if (signals.withdrawal || signals.transferLimit) {
    scenarios.push({
      id: "as-ato-01",
      actor: "Account Takeover Attacker",
      method:
        "Compromises an account through phishing, credential stuffing, or SIM-swap, then uses faster transfer or withdrawal paths to remove funds.",
      impact:
        "The recovery window becomes shorter and the user may suffer immediate financial loss.",
      severity: "critical",
    });
  }

  if (signals.loanAutomation) {
    scenarios.push({
      id: "as-loan-01",
      actor: "Synthetic Identity Fraudster",
      method:
        "Submits fabricated identity and income signals designed to pass automated loan checks without human review.",
      impact:
        "Fraudulent loans may be approved at scale before manual teams identify the pattern.",
      severity: "high",
    });
  }

  if (signals.scamBlocking) {
    scenarios.push({
      id: "as-scam-01",
      actor: "Scam Ring",
      method:
        "Splits payments, changes transaction wording, or rotates recipients to evade static blocking rules.",
      impact:
        "Some scam payments may still continue while legitimate users may still be blocked.",
      severity: "high",
    });
  }

  if (signals.merchantOnboarding) {
    scenarios.push({
      id: "as-merchant-01",
      actor: "Fake Merchant Operator",
      method:
        "Creates a merchant account with weak verification, processes fraudulent payments, then exits before disputes and chargebacks arrive.",
      impact:
        "The platform faces chargebacks, settlement disputes, and consumer complaints.",
      severity: "critical",
    });
  }

  if (scenarios.length < 2) {
    scenarios.push(
      {
        id: "as-general-01",
        actor: "Opportunistic Fraudster",
        method:
          "Tests the new policy to find weaker checks, faster approval, or higher exposure limits.",
        impact:
          "Fraud patterns may emerge after launch if monitoring is not prepared.",
        severity: "high",
      },
      {
        id: "as-general-02",
        actor: "Coordinated Abuse Group",
        method:
          "Uses multiple accounts, devices, or identities to exploit the new policy repeatedly.",
        impact:
          "Small individual events can become a material portfolio-level loss.",
        severity: "high",
      }
    );
  }

  return uniqueBy(scenarios, (scenario) => scenario.id).slice(0, 4);
}

function buildFalsePositiveScenarios(
  signals: DetectedSignals
): FalsePositiveScenario[] {
  const scenarios: FalsePositiveScenario[] = [];

  if (signals.transferLimit || signals.withdrawal) {
    scenarios.push({
      id: "fp-payment-01",
      affectedSegment: "Genuine users making urgent high-value payments",
      trigger:
        "High-value transfer or withdrawal to a new recipient resembles mule or account takeover behaviour.",
      userImpact:
        "Payment may be blocked, delayed, or held for review, causing stress and possible churn.",
      severity: "high",
    });
  }

  if (signals.loanAutomation) {
    scenarios.push({
      id: "fp-loan-01",
      affectedSegment: "Thin-file but creditworthy borrowers",
      trigger:
        "Limited credit history or irregular income is interpreted by the model as high risk.",
      userImpact:
        "Legitimate users may be denied credit without a clear explanation or appeal path.",
      severity: "high",
    });
  }

  if (signals.scamBlocking) {
    scenarios.push({
      id: "fp-block-01",
      affectedSegment: "Users making urgent family, medical, or business payments",
      trigger:
        "Transaction wording, timing, new recipient, or amount resembles a scam pattern.",
      userImpact:
        "Legitimate payment is blocked when the user needs it most.",
      severity: "high",
    });
  }

  if (signals.merchantOnboarding) {
    scenarios.push({
      id: "fp-merchant-01",
      affectedSegment: "Legitimate small merchants",
      trigger:
        "New business, low operating history, or unusual transaction category resembles fake merchant behaviour.",
      userImpact:
        "Merchant onboarding is delayed, limiting business operations and trust.",
      severity: "medium",
    });
  }

  if (scenarios.length < 2) {
    scenarios.push(
      {
        id: "fp-general-01",
        affectedSegment: "Legitimate users with unusual but valid behaviour",
        trigger:
          "New rules classify uncommon but valid behaviour as suspicious.",
        userImpact:
          "Users may face unnecessary friction, delays, or additional verification.",
        severity: "medium",
      },
      {
        id: "fp-general-02",
        affectedSegment: "Small business or high-activity users",
        trigger:
          "Higher activity volume is misread as fraud or policy abuse.",
        userImpact:
          "Important transactions or approvals may be delayed.",
        severity: "medium",
      }
    );
  }

  return uniqueBy(scenarios, (scenario) => scenario.id).slice(0, 4);
}

function buildComplianceConcerns(signals: DetectedSignals): ComplianceConcern[] {
  const concerns: ComplianceConcern[] = [];

  if (
    signals.malaysiaContext ||
    signals.transferLimit ||
    signals.withdrawal ||
    signals.kycReduction
  ) {
    concerns.push({
      id: "cc-bnm-aml-01",
      regulation: "BNM AML/CFT Risk-Based Approach",
      concern:
        "Higher money movement or weaker verification requires stronger due diligence, monitoring, escalation, and suspicious transaction review.",
      severity: signals.kycReduction || signals.highValue ? "critical" : "high",
    });
  }

  if (signals.transferLimit || signals.withdrawal) {
    concerns.push({
      id: "cc-emoney-01",
      regulation: "BNM E-Money / Payment Controls",
      concern:
        "Limit changes and faster fund movement require review of transaction monitoring thresholds and control effectiveness.",
      severity: "high",
    });
  }

  if (signals.loanAutomation) {
    concerns.push({
      id: "cc-lending-01",
      regulation: "Responsible Lending / Fair Treatment",
      concern:
        "Automated credit decisions must be explainable, auditable, and monitored for unfair or harmful outcomes.",
      severity: "critical",
    });
  }

  if (signals.scamBlocking) {
    concerns.push({
      id: "cc-consumer-01",
      regulation: "Consumer Protection / Fair Treatment",
      concern:
        "Users need clear explanations, reason logging, and appeal paths when transactions are blocked or delayed.",
      severity: "high",
    });
  }

  if (signals.merchantOnboarding) {
    concerns.push({
      id: "cc-merchant-01",
      regulation: "Merchant Due Diligence / AML Monitoring",
      concern:
        "Faster merchant onboarding requires adequate verification, business legitimacy checks, and transaction laundering monitoring.",
      severity: "critical",
    });
  }

  concerns.push({
    id: "cc-pdpa-01",
    regulation: "PDPA / Data Governance",
    concern:
      "Additional risk checks, investigations, or automated decisions may require appropriate data minimisation, retention, and audit controls.",
    severity: "medium",
  });

  return uniqueBy(concerns, (concern) => concern.id).slice(0, 4);
}

function buildOperationalRisks(signals: DetectedSignals): string[] {
  const risks = [
    "Monitoring dashboards, reason codes, and rollback thresholds must be ready before launch.",
    "Customer support needs clear scripts for delayed, blocked, rejected, or reviewed user actions.",
  ];

  if (signals.transferLimit || signals.withdrawal) {
    risks.push(
      "Fraud review queues may increase due to high-value money movement alerts."
    );
    risks.push(
      "Existing velocity rules may be miscalibrated for the new exposure level."
    );
  }

  if (signals.loanAutomation) {
    risks.push(
      "Appeals and complaints may increase if users do not understand automated lending decisions."
    );
    risks.push(
      "Risk analytics must monitor approval drift, default rate, and segment-level decision quality."
    );
  }

  if (signals.scamBlocking) {
    risks.push(
      "Urgent payment escalation process is required for legitimate blocked transactions."
    );
  }

  if (signals.merchantOnboarding) {
    risks.push(
      "Chargeback, settlement dispute, and merchant investigation workloads may increase."
    );
  }

  return uniqueBy(risks, (risk) => risk).slice(0, 5);
}

function buildReputationRisks(signals: DetectedSignals): string[] {
  const risks = [
    "Poorly explained controls may reduce customer trust in the platform.",
    "Unexpected fraud, unfair outcomes, or user friction may create negative social media attention.",
  ];

  if (signals.transferLimit || signals.withdrawal) {
    risks.push(
      "A high-profile scam or account takeover case could damage confidence in wallet safety."
    );
  }

  if (signals.loanAutomation) {
    risks.push(
      "Users may accuse the platform of unfair or discriminatory AI decisioning."
    );
  }

  if (signals.scamBlocking) {
    risks.push(
      "Users may perceive the platform as unreliable if legitimate payments fail without clear explanation."
    );
  }

  if (signals.merchantOnboarding) {
    risks.push(
      "Association with scam merchants can damage platform credibility with both users and regulators."
    );
  }

  return uniqueBy(risks, (risk) => risk).slice(0, 5);
}

function buildControlPlan(signals: DetectedSignals): ControlAction[] {
  const controls: ControlAction[] = [
    {
      id: "cp-core-01",
      control:
        "Launch first as a limited pilot with exposure caps, monitoring thresholds, and rollback criteria.",
      type: "preventive",
      owner: "Product & Risk",
      priority: "immediate",
    },
    {
      id: "cp-core-02",
      control:
        "Add event logging, reason codes, and dashboard monitoring for all high-risk outcomes.",
      type: "detective",
      owner: "Engineering",
      priority: "immediate",
    },
    {
      id: "cp-core-03",
      control:
        "Prepare customer support escalation scripts for blocked, delayed, reviewed, or disputed cases.",
      type: "corrective",
      owner: "Customer Support",
      priority: "short_term",
    },
  ];

  if (signals.transferLimit || signals.withdrawal) {
    controls.push(
      {
        id: "cp-money-01",
        control:
          "Use progressive limits based on account age, completed KYC, clean behaviour, and recipient trust.",
        type: "preventive",
        owner: "Product & Risk",
        priority: "immediate",
      },
      {
        id: "cp-money-02",
        control:
          "Require step-up authentication for high-value transfers, withdrawals, or new-recipient payments.",
        type: "preventive",
        owner: "Engineering",
        priority: "immediate",
      }
    );
  }

  if (signals.kycReduction) {
    controls.push({
      id: "cp-kyc-01",
      control:
        "Do not remove identity verification for high-risk actions; use risk-based KYC tiers instead.",
      type: "preventive",
      owner: "Compliance",
      priority: "immediate",
    });
  }

  if (signals.loanAutomation) {
    controls.push(
      {
        id: "cp-loan-01",
        control:
          "Keep human review for borderline, vulnerable-user, high-value, or unusual applications.",
        type: "preventive",
        owner: "Credit Risk",
        priority: "immediate",
      },
      {
        id: "cp-loan-02",
        control:
          "Monitor approval rate, default rate, appeal rate, and rejection rate by user segment.",
        type: "detective",
        owner: "Risk Analytics",
        priority: "ongoing",
      }
    );
  }

  if (signals.scamBlocking) {
    controls.push({
      id: "cp-block-01",
      control:
        "Use warning screens and step-up verification before hard blocking medium-risk transactions.",
      type: "preventive",
      owner: "Fraud Team",
      priority: "immediate",
    });
  }

  if (signals.merchantOnboarding) {
    controls.push({
      id: "cp-merchant-01",
      control:
        "Require risk-based merchant verification, settlement holds, and early transaction monitoring.",
      type: "preventive",
      owner: "Merchant Risk",
      priority: "immediate",
    });
  }

  controls.push({
    id: "cp-compliance-01",
    control:
      "Review the policy with compliance before launch and document the risk acceptance decision.",
    type: "corrective",
    owner: "Compliance",
    priority: "short_term",
  });

  return uniqueBy(controls, (control) => control.id).slice(0, 7);
}

function buildSaferAlternative(
  signals: DetectedSignals
): RiskAssessment["saferAlternative"] {
  if (signals.transferLimit || signals.withdrawal) {
    return {
      title: "Progressive Trust and Risk-Based Limit Model",
      description:
        "Instead of increasing exposure immediately for all users, unlock higher transfer or withdrawal limits gradually based on verified identity, account age, clean behaviour, and recipient trust.",
      keyChanges: [
        "Keep low limits for new or weakly verified users.",
        "Unlock higher limits only after completed KYC and clean transaction history.",
        "Require step-up authentication for new recipients, high-value payments, and withdrawals.",
        "Run high-risk money movement through velocity, device, recipient, and account-age scoring.",
      ],
    };
  }

  if (signals.loanAutomation) {
    return {
      title: "Human-in-the-Loop AI Credit Decisioning",
      description:
        "Use AI for pre-screening and low-risk approvals, but keep human review, explainability, and appeal workflows for borderline or sensitive lending decisions.",
      keyChanges: [
        "Auto-approve only low-value, low-risk applications.",
        "Send borderline or vulnerable-user cases to manual review.",
        "Log decision reasons and provide an appeal path.",
        "Monitor fairness, default rate, and approval drift by segment.",
      ],
    };
  }

  if (signals.scamBlocking) {
    return {
      title: "Graduated Scam Intervention Model",
      description:
        "Replace flat blocking with a risk-based intervention ladder that balances scam prevention with legitimate user access.",
      keyChanges: [
        "Medium risk: warning screen.",
        "High risk: step-up verification.",
        "Critical risk: temporary block and review.",
        "Provide clear reason codes and fast appeal path.",
      ],
    };
  }

  if (signals.merchantOnboarding) {
    return {
      title: "Risk-Based Merchant Onboarding",
      description:
        "Approve low-risk merchants faster while keeping stronger verification, settlement controls, and monitoring for higher-risk merchant profiles.",
      keyChanges: [
        "Verify business identity and ownership before full activation.",
        "Use settlement holds for new or higher-risk merchants.",
        "Monitor early transaction, refund, and chargeback behaviour.",
        "Escalate suspicious merchant activity to manual review.",
      ],
    };
  }

  if (signals.kycReduction) {
    return {
      title: "Risk-Based KYC Tiering Instead of Verification Removal",
      description:
        "Reduce friction only for low-risk actions while keeping stronger identity checks for high-risk transactions, withdrawals, lending, and account recovery.",
      keyChanges: [
        "Allow lighter checks only for low-value, low-risk actions.",
        "Require full eKYC for higher exposure features.",
        "Use step-up verification when behaviour changes suddenly.",
        "Keep audit logs for verification decisions.",
      ],
    };
  }

  return {
    title: "Controlled Pilot with Guardrails",
    description:
      "Release the decision to a limited segment first, monitor risk indicators, and expand only after fraud, false positive, complaint, and operational metrics remain within tolerance.",
    keyChanges: [
      "Start with limited user exposure.",
      "Set transaction, approval, or feature caps.",
      "Monitor fraud, complaints, and false positives.",
      "Define rollback thresholds before launch.",
    ],
  };
}

function buildAssessment(input: SimulationInput): RiskAssessment {
  const signals = detectSignals(input);

  const riskMatrix = buildRiskMatrix(signals);
  const enrichedMatrix = enrichRiskMatrix(riskMatrix);

  const internalRiskScore = calculateInternalRiskScore(enrichedMatrix);
  const displayScore = normalizeToDisplayScore(internalRiskScore);
  const overallRiskLevel = getOverallRiskLevel(displayScore, enrichedMatrix);

  return {
    id: createId("fallback"),
    createdAt: new Date().toISOString(),
    decisionInput: input.decisionText,
    decisionSummary: buildDecisionSummary(signals),
    overallRiskScore: displayScore,
    overallRiskLevel,
    internalRiskScore,
    mainConcern: buildMainConcern(signals),
    launchRecommendation: getLaunchRecommendation(overallRiskLevel),
    affectedStakeholders: buildStakeholders(signals),
    riskMatrix: enrichedMatrix,
    abuseScenarios: buildAbuseScenarios(signals),
    falsePositiveScenarios: buildFalsePositiveScenarios(signals),
    complianceConcerns: buildComplianceConcerns(signals),
    operationalRisks: buildOperationalRisks(signals),
    reputationRisks: buildReputationRisks(signals),
    controlPlan: buildControlPlan(signals),
    saferAlternative: buildSaferAlternative(signals),
    engineUsed: "fallback",
  };
}

export function runFallbackRiskEngine(input: SimulationInput): RiskAssessment {
  return buildAssessment(input);
}
