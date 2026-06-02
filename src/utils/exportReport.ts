import type { RiskAssessment } from "../types/risk";

const riskLevelText: Record<string, string> = {
  critical: "CRITICAL",
  high: "HIGH",
  medium: "MEDIUM",
  low: "LOW",
};

const likelihoodText: Record<string, string> = {
  very_high: "Very High",
  high: "High",
  medium: "Medium",
  low: "Low",
};

const impactText: Record<string, string> = {
  critical: "Critical",
  high: "High",
  medium: "Medium",
  low: "Low",
};

const priorityText: Record<string, string> = {
  immediate: "Immediate",
  short_term: "Short-term",
  ongoing: "Ongoing",
};

function divider(char = "-", length = 72) {
  return char.repeat(length);
}

function addSection(lines: string[], title: string) {
  lines.push("");
  lines.push(divider());
  lines.push(title.toUpperCase());
  lines.push(divider());
}

function addBlank(lines: string[]) {
  lines.push("");
}

function addNumberedLine(lines: string[], index: number, text: string) {
  lines.push(`  ${String(index + 1).padStart(2, "0")}. ${text}`);
}

function getEngineLabel(engineUsed?: string) {
  if (engineUsed === "gemini") {
    return "Gemini AI";
  }

  if (engineUsed === "fallback") {
    return "Fallback Rule Engine";
  }

  return "Not specified";
}

function getCreatedAtText(createdAt: string) {
  return new Date(createdAt).toLocaleString("en-MY", {
    dateStyle: "long",
    timeStyle: "short",
  });
}

function shorten(text: string, maxLength: number) {
  if (text.length <= maxLength) {
    return text;
  }

  return `${text.slice(0, maxLength - 1)}…`;
}

function downloadTextFile(filename: string, content: string) {
  const blob = new Blob([content], {
    type: "text/plain;charset=utf-8",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;
  link.style.display = "none";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

function buildReportFilename(assessment: RiskAssessment) {
  const dateTag = new Date(assessment.createdAt).toISOString().slice(0, 10);
  return `finguard-risk-report-${assessment.id}-${dateTag}.txt`;
}

function addReportHeader(lines: string[], assessment: RiskAssessment) {
  lines.push(divider("="));
  lines.push("FinGuard Twin AI");
  lines.push("Risk Assessment Report");
  lines.push(divider("="));
  addBlank(lines);

  lines.push(`Simulation ID : ${assessment.id}`);
  lines.push(`Engine Used   : ${getEngineLabel(assessment.engineUsed)}`);
  lines.push(`Generated At  : ${getCreatedAtText(assessment.createdAt)}`);
}

function addDecisionSection(lines: string[], assessment: RiskAssessment) {
  addSection(lines, "Decision Under Assessment");

  lines.push("Decision Input:");
  lines.push(`  ${assessment.decisionInput}`);
  addBlank(lines);

  lines.push("Decision Summary:");
  lines.push(`  ${assessment.decisionSummary}`);
}

function addOverallRatingSection(lines: string[], assessment: RiskAssessment) {
  addSection(lines, "Overall Risk Rating");

  lines.push(
    `  Final Risk Rating : ${riskLevelText[assessment.overallRiskLevel]}`
  );
  lines.push(`  Display Score     : ${assessment.overallRiskScore} / 100`);

  if (assessment.internalRiskScore !== undefined) {
    lines.push(`  Internal Score    : ${assessment.internalRiskScore} / 125`);
  }

  if (assessment.mainConcern) {
    addBlank(lines);
    lines.push("Main Concern:");
    lines.push(`  ${assessment.mainConcern}`);
  }

  if (assessment.launchRecommendation) {
    addBlank(lines);
    lines.push("Launch Recommendation:");
    lines.push(`  ${assessment.launchRecommendation}`);
  }
}

function addStakeholderSection(lines: string[], assessment: RiskAssessment) {
  addSection(lines, "Affected Stakeholders");

  assessment.affectedStakeholders.forEach((stakeholder, index) => {
    addNumberedLine(lines, index, stakeholder.role);
    lines.push(`      Impact: ${stakeholder.impact}`);
    addBlank(lines);
  });
}

function addRiskMatrixSection(lines: string[], assessment: RiskAssessment) {
  addSection(lines, "Risk Matrix");

  const columnWidth = [4, 34, 16, 12, 12, 10];

  const header = [
    "#".padEnd(columnWidth[0]),
    "Risk Name".padEnd(columnWidth[1]),
    "Category".padEnd(columnWidth[2]),
    "Likelihood".padEnd(columnWidth[3]),
    "Impact".padEnd(columnWidth[4]),
    "Level",
  ].join("  ");

  lines.push(`  ${header}`);
  lines.push(`  ${divider("-", 72)}`);

  assessment.riskMatrix.forEach((risk, index) => {
    const row = [
      String(index + 1).padStart(2, "0").padEnd(columnWidth[0]),
      shorten(risk.riskName, 33).padEnd(columnWidth[1]),
      risk.category.padEnd(columnWidth[2]),
      likelihoodText[risk.likelihood].padEnd(columnWidth[3]),
      impactText[risk.impact].padEnd(columnWidth[4]),
      riskLevelText[risk.riskLevel],
    ].join("  ");

    lines.push(`  ${row}`);
  });
}

function addAbuseScenarioSection(lines: string[], assessment: RiskAssessment) {
  addSection(lines, "Fraud Abuse Scenarios");

  assessment.abuseScenarios.forEach((scenario, index) => {
    const scenarioCode = `A${String(index + 1).padStart(2, "0")}`;

    lines.push(
      `  [${scenarioCode}] ${scenario.actor} | Severity: ${
        riskLevelText[scenario.severity]
      }`
    );
    lines.push(`  Method: ${scenario.method}`);
    lines.push(`  Impact: ${scenario.impact}`);
    addBlank(lines);
  });
}

function addFalsePositiveSection(lines: string[], assessment: RiskAssessment) {
  addSection(lines, "False Positive Impact");

  assessment.falsePositiveScenarios.forEach((scenario, index) => {
    const scenarioCode = `FP${String(index + 1).padStart(2, "0")}`;

    lines.push(
      `  [${scenarioCode}] ${scenario.affectedSegment} | Severity: ${
        riskLevelText[scenario.severity]
      }`
    );
    lines.push(`  Trigger: ${scenario.trigger}`);
    lines.push(`  User Impact: ${scenario.userImpact}`);
    addBlank(lines);
  });
}

function addComplianceSection(lines: string[], assessment: RiskAssessment) {
  addSection(lines, "Compliance Concerns");

  assessment.complianceConcerns.forEach((concern, index) => {
    addNumberedLine(
      lines,
      index,
      `[${riskLevelText[concern.severity]}] ${concern.regulation}`
    );
    lines.push(`     ${concern.concern}`);
    addBlank(lines);
  });
}

function addRiskListSection(
  lines: string[],
  title: string,
  risks: string[]
) {
  addSection(lines, title);

  risks.forEach((risk, index) => {
    addNumberedLine(lines, index, risk);
  });
}

function addControlPlanSection(lines: string[], assessment: RiskAssessment) {
  addSection(lines, "Recommended Control Plan");

  assessment.controlPlan.forEach((control, index) => {
    const priority = priorityText[control.priority]?.toUpperCase();

    addNumberedLine(
      lines,
      index,
      `[${control.type.toUpperCase()}] Priority: ${priority}`
    );
    lines.push(`     ${control.control}`);
    lines.push(`     Owner: ${control.owner}`);
    addBlank(lines);
  });
}

function addSaferAlternativeSection(lines: string[], assessment: RiskAssessment) {
  addSection(lines, "Safer Alternative Decision");

  lines.push(`  Title: ${assessment.saferAlternative.title}`);
  addBlank(lines);

  lines.push(`  ${assessment.saferAlternative.description}`);
  addBlank(lines);

  lines.push("  Key Changes:");

  assessment.saferAlternative.keyChanges.forEach((change, index) => {
    lines.push(`    ${String(index + 1).padStart(2, "0")}. ${change}`);
  });
}

function addDisclaimer(lines: string[]) {
  addSection(lines, "Disclaimer");

  lines.push(
    "  FinGuard Twin AI is a decision-support simulation tool for demo and"
  );
  lines.push(
    "  pre-launch discussion. It does not process real customer financial data,"
  );
  lines.push(
    "  make credit decisions, or replace legal, compliance, and professional"
  );
  lines.push(
    "  risk review. The report should be used as a structured starting point"
  );
  lines.push("  for human judgement.");

  addBlank(lines);
  lines.push(divider("="));
  lines.push("End of Report");
  lines.push(divider("="));
}

function buildReportContent(assessment: RiskAssessment) {
  const lines: string[] = [];

  addReportHeader(lines, assessment);
  addDecisionSection(lines, assessment);
  addOverallRatingSection(lines, assessment);
  addStakeholderSection(lines, assessment);
  addRiskMatrixSection(lines, assessment);
  addAbuseScenarioSection(lines, assessment);
  addFalsePositiveSection(lines, assessment);
  addComplianceSection(lines, assessment);
  addRiskListSection(lines, "Operational Risks", assessment.operationalRisks);
  addRiskListSection(lines, "Reputation Risks", assessment.reputationRisks);
  addControlPlanSection(lines, assessment);
  addSaferAlternativeSection(lines, assessment);
  addDisclaimer(lines);

  return lines.join("\n");
}

export function exportAssessmentReport(assessment: RiskAssessment): void {
  const content = buildReportContent(assessment);
  const filename = buildReportFilename(assessment);

  downloadTextFile(filename, content);
}
