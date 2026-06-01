import type { RiskAssessment } from "../types/risk";

const LEVEL_LABEL: Record<string, string> = {
  critical: "CRITICAL",
  high: "HIGH",
  medium: "MEDIUM",
  low: "LOW",
};

const LIKELIHOOD_LABEL: Record<string, string> = {
  very_high: "Very High",
  high: "High",
  medium: "Medium",
  low: "Low",
};

const IMPACT_LABEL: Record<string, string> = {
  critical: "Critical",
  high: "High",
  medium: "Medium",
  low: "Low",
};

const PRIORITY_LABEL: Record<string, string> = {
  immediate: "Immediate",
  short_term: "Short-term",
  ongoing: "Ongoing",
};

function hr(char = "─", len = 72): string {
  return char.repeat(len);
}

function section(title: string): string {
  return `\n${hr()}\n  ${title.toUpperCase()}\n${hr()}\n`;
}

export function exportAssessmentReport(assessment: RiskAssessment): void {
  const createdAt = new Date(assessment.createdAt).toLocaleString("en-MY", {
    dateStyle: "long",
    timeStyle: "short",
  });

  const engineLabel =
    assessment.engineUsed === "gemini"
      ? "Gemini AI (gemini-2.5-flash-lite)"
      : "Fallback Rule Engine";

  const lines: string[] = [];

  // ── Header ──────────────────────────────────────────────────────────────
  lines.push(hr("═"));
  lines.push("  FINGUARD TWIN AI");
  lines.push("  Risk Assessment Report");
  lines.push(hr("═"));
  lines.push("");
  lines.push(`  Simulation ID   : ${assessment.id}`);
  lines.push(`  Engine Used     : ${engineLabel}`);
  lines.push(`  Generated At    : ${createdAt}`);
  lines.push("");

  // ── Decision ────────────────────────────────────────────────────────────
  lines.push(section("Decision Under Assessment"));
  lines.push("Decision Input:");
  lines.push(`  ${assessment.decisionInput}`);
  lines.push("");
  lines.push("Decision Summary:");
  lines.push(`  ${assessment.decisionSummary}`);

  // ── Overall Rating ──────────────────────────────────────────────────────
  lines.push(section("Overall Risk Rating"));
  lines.push(`  Final Risk Rating  : ${LEVEL_LABEL[assessment.overallRiskLevel]}`);
  lines.push(`  Display Score      : ${assessment.overallRiskScore} / 100`);
  if (assessment.internalRiskScore !== undefined) {
    lines.push(`  Internal Score     : ${assessment.internalRiskScore} / 125`);
  }
  if (assessment.mainConcern) {
    lines.push("");
    lines.push("Main Concern:");
    lines.push(`  ${assessment.mainConcern}`);
  }
  if (assessment.launchRecommendation) {
    lines.push("");
    lines.push("Launch Recommendation:");
    lines.push(`  ${assessment.launchRecommendation}`);
  }

  // ── Affected Stakeholders ────────────────────────────────────────────────
  lines.push(section("Affected Stakeholders"));
  assessment.affectedStakeholders.forEach((s, i) => {
    lines.push(`  ${String(i + 1).padStart(2, "0")}. ${s.role}`);
    lines.push(`      Impact : ${s.impact}`);
    lines.push("");
  });

  // ── Risk Matrix ──────────────────────────────────────────────────────────
  lines.push(section("Risk Matrix"));
  const colW = [4, 34, 16, 12, 12, 10];
  const header = [
    "#".padEnd(colW[0]),
    "Risk Name".padEnd(colW[1]),
    "Category".padEnd(colW[2]),
    "Likelihood".padEnd(colW[3]),
    "Impact".padEnd(colW[4]),
    "Level",
  ].join("  ");
  lines.push(`  ${header}`);
  lines.push(`  ${hr("-", 72)}`);
  assessment.riskMatrix.forEach((r, i) => {
    const row = [
      String(i + 1).padStart(2, "0").padEnd(colW[0]),
      r.riskName.substring(0, 33).padEnd(colW[1]),
      r.category.padEnd(colW[2]),
      LIKELIHOOD_LABEL[r.likelihood].padEnd(colW[3]),
      IMPACT_LABEL[r.impact].padEnd(colW[4]),
      LEVEL_LABEL[r.riskLevel],
    ].join("  ");
    lines.push(`  ${row}`);
  });

  // ── Fraud Abuse Scenarios ────────────────────────────────────────────────
  lines.push(section("Fraud Abuse Scenarios"));
  assessment.abuseScenarios.forEach((s, i) => {
    lines.push(`  [A${String(i + 1).padStart(2, "0")}] ${s.actor}  ·  Severity: ${LEVEL_LABEL[s.severity]}`);
    lines.push(`  Method : ${s.method}`);
    lines.push(`  Impact : ${s.impact}`);
    lines.push("");
  });

  // ── False Positive Scenarios ─────────────────────────────────────────────
  lines.push(section("False Positive Impact"));
  assessment.falsePositiveScenarios.forEach((s, i) => {
    lines.push(`  [FP${String(i + 1).padStart(2, "0")}] ${s.affectedSegment}  ·  Severity: ${LEVEL_LABEL[s.severity]}`);
    lines.push(`  Trigger     : ${s.trigger}`);
    lines.push(`  User Impact : ${s.userImpact}`);
    lines.push("");
  });

  // ── Compliance Concerns ──────────────────────────────────────────────────
  lines.push(section("Compliance Concerns"));
  assessment.complianceConcerns.forEach((c, i) => {
    lines.push(`  ${String(i + 1).padStart(2, "0")}. [${LEVEL_LABEL[c.severity]}] ${c.regulation}`);
    lines.push(`     ${c.concern}`);
    lines.push("");
  });

  // ── Operational Risks ────────────────────────────────────────────────────
  lines.push(section("Operational Risks"));
  assessment.operationalRisks.forEach((r, i) => {
    lines.push(`  ${String(i + 1).padStart(2, "0")}. ${r}`);
  });

  // ── Reputation Risks ─────────────────────────────────────────────────────
  lines.push(section("Reputation Risks"));
  assessment.reputationRisks.forEach((r, i) => {
    lines.push(`  ${String(i + 1).padStart(2, "0")}. ${r}`);
  });

  // ── Control Plan ─────────────────────────────────────────────────────────
  lines.push(section("Recommended Control Plan"));
  assessment.controlPlan.forEach((c, i) => {
    lines.push(`  ${String(i + 1).padStart(2, "0")}. [${c.type.toUpperCase()}]  Priority: ${PRIORITY_LABEL[c.priority].toUpperCase()}`);
    lines.push(`     ${c.control}`);
    lines.push(`     Owner: ${c.owner}`);
    lines.push("");
  });

  // ── Safer Alternative ─────────────────────────────────────────────────────
  lines.push(section("Safer Alternative Decision"));
  lines.push(`  Title: ${assessment.saferAlternative.title}`);
  lines.push("");
  lines.push(`  ${assessment.saferAlternative.description}`);
  lines.push("");
  lines.push("  Key Changes:");
  assessment.saferAlternative.keyChanges.forEach((k, i) => {
    lines.push(`    ${String(i + 1).padStart(2, "0")}. ${k}`);
  });

  // ── Disclaimer ────────────────────────────────────────────────────────────
  lines.push(section("Disclaimer"));
  lines.push("  FinGuard Twin AI is a decision-support simulation tool. It does not process");
  lines.push("  real customer financial data, does not make credit decisions, and does not");
  lines.push("  replace legal, compliance, or professional risk review. Outputs are structured");
  lines.push("  risk assessments intended to support — not replace — human compliance and");
  lines.push("  fraud risk judgement.");
  lines.push("");
  lines.push(hr("═"));
  lines.push("  End of Report");
  lines.push(hr("═"));

  // ── Download ──────────────────────────────────────────────────────────────
  const content = lines.join("\n");
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);

  const dateTag = new Date(assessment.createdAt).toISOString().slice(0, 10);
  const filename = `finguard-risk-report-${assessment.id}-${dateTag}.txt`;

  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.style.display = "none";
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}
