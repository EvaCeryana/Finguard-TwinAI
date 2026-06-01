import type {
  RiskAssessment,
  RiskLevel,
  RiskCategory,
  LikelihoodLevel,
  ImpactLevel,
} from "../types/risk";

const riskLevels: RiskLevel[] = ["critical", "high", "medium", "low"];

const riskCategories: RiskCategory[] = [
  "fraud",
  "compliance",
  "operational",
  "reputation",
  "false_positive",
  "user_harm",
];

const likelihoodLevels: LikelihoodLevel[] = ["very_high", "high", "medium", "low"];
const impactLevels: ImpactLevel[] = ["critical", "high", "medium", "low"];

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every(isString);
}

function assert(condition: boolean, message: string): asserts condition {
  if (!condition) throw new Error(`Invalid Gemini output: ${message}`);
}

export function validateRiskOutput(output: unknown): asserts output is RiskAssessment {
  assert(isObject(output), "output must be an object");

  assert(isString(output.id), "missing id");
  assert(isString(output.createdAt), "missing createdAt");
  assert(isString(output.decisionInput), "missing decisionInput");
  assert(isString(output.decisionSummary), "missing decisionSummary");

  assert(isNumber(output.overallRiskScore), "missing overallRiskScore");
  assert(output.overallRiskScore >= 0 && output.overallRiskScore <= 100, "overallRiskScore must be 0-100");

  assert(riskLevels.includes(output.overallRiskLevel as RiskLevel), "invalid overallRiskLevel");

  assert(isNumber(output.internalRiskScore), "missing internalRiskScore");
  assert(output.internalRiskScore >= 1 && output.internalRiskScore <= 125, "internalRiskScore must be 1-125");

  assert(isString(output.mainConcern), "missing mainConcern");
  assert(isString(output.launchRecommendation), "missing launchRecommendation");

  assert(output.engineUsed === "gemini" || output.engineUsed === "fallback", "invalid engineUsed");

  assert(Array.isArray(output.affectedStakeholders), "affectedStakeholders must be array");
  assert(output.affectedStakeholders.length >= 3, "affectedStakeholders needs at least 3 items");

  for (const stakeholder of output.affectedStakeholders) {
    assert(isObject(stakeholder), "stakeholder must be object");
    assert(isString(stakeholder.role), "stakeholder missing role");
    assert(isString(stakeholder.impact), "stakeholder missing impact");
  }

  assert(Array.isArray(output.riskMatrix), "riskMatrix must be array");
  assert(output.riskMatrix.length >= 6, "riskMatrix needs at least 6 risks");

  for (const risk of output.riskMatrix) {
    assert(isObject(risk), "riskMatrix item must be object");
    assert(isString(risk.id), "risk missing id");
    assert(isString(risk.riskName), "risk missing riskName");
    assert(riskCategories.includes(risk.category as RiskCategory), "invalid risk category");
    assert(likelihoodLevels.includes(risk.likelihood as LikelihoodLevel), "invalid likelihood");
    assert(impactLevels.includes(risk.impact as ImpactLevel), "invalid impact");
    assert(riskLevels.includes(risk.riskLevel as RiskLevel), "invalid riskLevel");
    assert(typeof risk.mitigated === "boolean", "risk missing mitigated boolean");
  }

  const categories = new Set(output.riskMatrix.map((risk) => risk.category));
  for (const category of riskCategories) {
    assert(categories.has(category), `riskMatrix must include ${category}`);
  }

  assert(Array.isArray(output.abuseScenarios), "abuseScenarios must be array");
  assert(output.abuseScenarios.length >= 2, "abuseScenarios needs at least 2 items");

  for (const scenario of output.abuseScenarios) {
    assert(isObject(scenario), "abuseScenario item must be object");
    assert(isString(scenario.id), "abuseScenario missing id");
    assert(isString(scenario.actor), "abuseScenario missing actor");
    assert(isString(scenario.method), "abuseScenario missing method");
    assert(isString(scenario.impact), "abuseScenario missing impact");
    assert(riskLevels.includes(scenario.severity as RiskLevel), "invalid abuseScenario severity");
  }

  assert(Array.isArray(output.falsePositiveScenarios), "falsePositiveScenarios must be array");
  assert(output.falsePositiveScenarios.length >= 2, "falsePositiveScenarios needs at least 2 items");

  for (const scenario of output.falsePositiveScenarios) {
    assert(isObject(scenario), "falsePositiveScenario item must be object");
    assert(isString(scenario.id), "falsePositiveScenario missing id");
    assert(isString(scenario.affectedSegment), "falsePositiveScenario missing affectedSegment");
    assert(isString(scenario.trigger), "falsePositiveScenario missing trigger");
    assert(isString(scenario.userImpact), "falsePositiveScenario missing userImpact");
    assert(riskLevels.includes(scenario.severity as RiskLevel), "invalid falsePositiveScenario severity");
  }

  assert(Array.isArray(output.complianceConcerns), "complianceConcerns must be array");
  assert(output.complianceConcerns.length >= 1, "complianceConcerns needs at least 1 item");

  for (const concern of output.complianceConcerns) {
    assert(isObject(concern), "complianceConcern item must be object");
    assert(isString(concern.id), "complianceConcern missing id");
    assert(isString(concern.regulation), "complianceConcern missing regulation");
    assert(isString(concern.concern), "complianceConcern missing concern");
    assert(riskLevels.includes(concern.severity as RiskLevel), "invalid complianceConcern severity");
  }

  assert(isStringArray(output.operationalRisks), "operationalRisks must be string array");
  assert(output.operationalRisks.length >= 2, "operationalRisks needs at least 2 items");

  assert(isStringArray(output.reputationRisks), "reputationRisks must be string array");
  assert(output.reputationRisks.length >= 2, "reputationRisks needs at least 2 items");

  assert(Array.isArray(output.controlPlan), "controlPlan must be array");
  assert(output.controlPlan.length >= 3, "controlPlan needs at least 3 items");

  for (const control of output.controlPlan) {
    assert(isObject(control), "controlPlan item must be object");
    assert(isString(control.id), "control missing id");
    assert(isString(control.control), "control missing control text");
    assert(
      control.type === "preventive" ||
        control.type === "detective" ||
        control.type === "corrective",
      "invalid control type"
    );
    assert(isString(control.owner), "control missing owner");
    assert(
      control.priority === "immediate" ||
        control.priority === "short_term" ||
        control.priority === "ongoing",
      "invalid control priority"
    );
  }

  assert(isObject(output.saferAlternative), "saferAlternative must be object");
  assert(isString(output.saferAlternative.title), "saferAlternative missing title");
  assert(isString(output.saferAlternative.description), "saferAlternative missing description");
  assert(isStringArray(output.saferAlternative.keyChanges), "saferAlternative.keyChanges must be string array");
  assert(output.saferAlternative.keyChanges.length >= 3, "saferAlternative needs at least 3 keyChanges");
}
