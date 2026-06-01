import type { RiskAssessment, AssessmentSummary } from "../types/risk";

export const sampleAssessment: RiskAssessment = {
  id: "sim-001",
  createdAt: "2026-05-28T09:14:00Z",
  decisionInput:
    "A digital wallet wants to increase instant transfer limit for newly registered users from RM500 to RM5,000.",
  decisionSummary:
    "Proposal to raise the instant transfer ceiling 10× for new accounts within the first 30 days of registration. This removes the progressive trust-building mechanism currently in place and applies the elevated limit uniformly to all new users regardless of KYC tier.",

  overallRiskScore: 78,
  overallRiskLevel: "high",

  affectedStakeholders: [
    {
      role: "New Registered Users",
      impact: "Higher transfer convenience, but increased friction from fraud flags",
    },
    {
      role: "Fraud & Risk Team",
      impact: "Significant increase in manual review workload",
    },
    {
      role: "Compliance / AML Team",
      impact: "Elevated STR filing obligations under BNM AML/CFT guidelines",
    },
    {
      role: "Customer Support",
      impact: "More escalations from blocked legitimate transfers",
    },
    {
      role: "Engineering / Platform",
      impact: "Velocity rule updates and monitoring infra required",
    },
  ],

  riskMatrix: [
    {
      id: "rm-01",
      riskName: "Mule Account Abuse",
      category: "fraud",
      likelihood: "very_high",
      impact: "critical",
      riskLevel: "critical",
      mitigated: false,
    },
    {
      id: "rm-02",
      riskName: "Account Takeover Exploitation",
      category: "fraud",
      likelihood: "high",
      impact: "critical",
      riskLevel: "critical",
      mitigated: false,
    },
    {
      id: "rm-03",
      riskName: "Weak KYC Amplification",
      category: "compliance",
      likelihood: "high",
      impact: "high",
      riskLevel: "high",
      mitigated: false,
    },
    {
      id: "rm-04",
      riskName: "False Positive — Legitimate Users Blocked",
      category: "false_positive",
      likelihood: "medium",
      impact: "high",
      riskLevel: "high",
      mitigated: false,
    },
    {
      id: "rm-05",
      riskName: "BNM AML/CFT Reporting Breach",
      category: "compliance",
      likelihood: "medium",
      impact: "critical",
      riskLevel: "high",
      mitigated: false,
    },
    {
      id: "rm-06",
      riskName: "Support Volume Spike",
      category: "operational",
      likelihood: "high",
      impact: "medium",
      riskLevel: "medium",
      mitigated: false,
    },
    {
      id: "rm-07",
      riskName: "Public Trust Erosion",
      category: "reputation",
      likelihood: "medium",
      impact: "high",
      riskLevel: "high",
      mitigated: false,
    },
    {
      id: "rm-08",
      riskName: "Investigation Cost Overrun",
      category: "operational",
      likelihood: "medium",
      impact: "medium",
      riskLevel: "medium",
      mitigated: false,
    },
  ],

  abuseScenarios: [
    {
      id: "as-01",
      actor: "Mule Account Operator",
      method:
        "Register new accounts with minimal KYC, immediately exploit RM5,000 limit to layer stolen funds across 10–20 accounts before detection.",
      impact:
        "Rapid fund movement through the platform within 24 hrs; RM50,000+ laundered per coordinated ring before any flag triggers.",
      severity: "critical",
    },
    {
      id: "as-02",
      actor: "Account Takeover Attacker",
      method:
        "Compromise newly registered accounts via credential stuffing or SIM swap. The RM5,000 limit means a single successful takeover drains the full available balance in one transaction.",
      impact: "Full account drain in a single transfer; victim has no recovery window.",
      severity: "critical",
    },
    {
      id: "as-03",
      actor: "Social Engineering Scammer",
      method:
        "Phone-based scams directing victims to transfer RM5,000 'for urgent bank verification'. Higher limit removes the natural friction that currently stops many scams at RM500.",
      impact: "Average victim loss increases 10× per incident.",
      severity: "high",
    },
  ],

  falsePositiveScenarios: [
    {
      id: "fp-01",
      affectedSegment: "Genuine high-income new users",
      trigger:
        "Velocity rules flag RM4,800 transfer on Day 2 — same pattern as mule test transaction.",
      userImpact:
        "Transfer frozen, account review pending 48–72 hrs. User churns to competitor.",
      severity: "high",
    },
    {
      id: "fp-02",
      affectedSegment: "Business owners transferring supplier payments",
      trigger: "Multiple recipients in short window triggers AML heuristic.",
      userImpact: "Business payment delayed, supplier relationship impacted.",
      severity: "medium",
    },
    {
      id: "fp-03",
      affectedSegment: "Users travelling or using VPN",
      trigger: "Geo-anomaly combined with high-value transfer flags risk score.",
      userImpact: "Transaction declined with no clear resolution path.",
      severity: "medium",
    },
  ],

  complianceConcerns: [
    {
      id: "cc-01",
      regulation: "BNM AML/CFT Policy Document",
      concern:
        "Raising limits for unverified new users without enhanced due diligence violates the risk-based approach required for high-risk customer segments.",
      severity: "critical",
    },
    {
      id: "cc-02",
      regulation: "BNM E-Money Guidelines",
      concern:
        "Transaction monitoring thresholds and STR obligations must be reviewed if average transaction size increases materially.",
      severity: "high",
    },
    {
      id: "cc-03",
      regulation: "PDPA (Malaysia)",
      concern:
        "Expanded fraud investigation scope may require broader user data processing; DPA review needed.",
      severity: "medium",
    },
  ],

  operationalRisks: [
    "Fraud investigation queue may increase 3–5× in the first 30 days post-launch.",
    "Customer support tickets related to blocked transfers projected to double.",
    "Manual review SLAs cannot be met without additional headcount or automation.",
    "Existing velocity rules were calibrated for RM500 limit — all thresholds need recalibration.",
  ],

  reputationRisks: [
    "A single high-profile scam case involving a new user could generate negative press.",
    "Regulator scrutiny increases if STR volumes spike without corresponding controls.",
    "Social media amplification of fraud complaints from users who were not adequately warned.",
  ],

  controlPlan: [
    {
      id: "cp-01",
      control: "Maintain RM500 limit for first 7 days; graduate to RM2,000 after verified behaviour.",
      type: "preventive",
      owner: "Product & Risk",
      priority: "immediate",
    },
    {
      id: "cp-02",
      control: "Require step-up authentication (OTP + selfie) for any transfer above RM1,000 for new users.",
      type: "preventive",
      owner: "Engineering",
      priority: "immediate",
    },
    {
      id: "cp-03",
      control: "Flag all new-account transfers to new recipients above RM2,000 for automated scoring.",
      type: "detective",
      owner: "Fraud & Risk Team",
      priority: "immediate",
    },
    {
      id: "cp-04",
      control: "Recalibrate velocity rules to new limit scenario; run shadow mode for 2 weeks before go-live.",
      type: "detective",
      owner: "Engineering",
      priority: "short_term",
    },
    {
      id: "cp-05",
      control: "Brief compliance team on STR threshold review and update internal AML procedures.",
      type: "corrective",
      owner: "Compliance",
      priority: "short_term",
    },
    {
      id: "cp-06",
      control: "Publish clear in-app messaging on limit increases and fraud education for new users.",
      type: "preventive",
      owner: "Product & CX",
      priority: "ongoing",
    },
  ],

  saferAlternative: {
    title: "Progressive Trust Model with Behavioural Gates",
    description:
      "Instead of a flat limit increase for all new users, implement a tiered trust progression. Users earn higher limits by demonstrating verified behaviour over time — not just by registering.",
    keyChanges: [
      "Day 0–7: RM500 limit (unchanged). Observe first-week behaviour patterns.",
      "Day 8–30: RM2,000 limit unlocked automatically after 3+ successful lower-value transfers with no flags.",
      "Day 31+: RM5,000 limit available after full eKYC completion and 30-day clean record.",
      "Any new recipient above RM1,000: Always requires step-up auth regardless of account age.",
      "Fraud ring detection: Cross-account graph analysis to identify coordinated new-account activity.",
    ],
  },
};

// ─── Sample History ─────────────────────────────────────────────────────────

export const sampleHistory: AssessmentSummary[] = [
  {
    id: "sim-001",
    createdAt: "2026-05-28T09:14:00Z",
    decisionInput:
      "Increase instant transfer limit for new users from RM500 to RM5,000.",
    overallRiskLevel: "high",
    overallRiskScore: 78,
  },
  {
    id: "sim-002",
    createdAt: "2026-05-27T14:32:00Z",
    decisionInput:
      "Remove mandatory selfie verification for transactions below RM200.",
    overallRiskLevel: "medium",
    overallRiskScore: 52,
  },
  {
    id: "sim-003",
    createdAt: "2026-05-26T11:05:00Z",
    decisionInput:
      "Allow buy-now-pay-later for users with less than 6 months of account history.",
    overallRiskLevel: "critical",
    overallRiskScore: 91,
  },
  {
    id: "sim-004",
    createdAt: "2026-05-24T08:50:00Z",
    decisionInput:
      "Introduce auto-approval for merchant onboarding under RM10,000 monthly volume.",
    overallRiskLevel: "medium",
    overallRiskScore: 44,
  },
];
