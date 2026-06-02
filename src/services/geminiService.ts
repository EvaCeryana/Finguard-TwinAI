import type {
  AbuseScenario,
  AffectedStakeholder,
  ComplianceConcern,
  ControlAction,
  FalsePositiveScenario,
  OutputLanguage,
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
import { validateRiskOutput } from "../utils/validateRiskOutput";
import { runFallbackRiskEngine } from "./fallbackRiskEngine";
import { detectInputLanguage, getGeminiLanguageInstruction } from "../utils/languageDetection";

// Use Flash Lite for demo stability, lower token usage, and faster structured JSON output.
const GEMINI_MODEL = "gemini-2.5-flash-lite";
const BACKEND_ENDPOINT = import.meta.env.VITE_GEMINI_BACKEND_URL as string | undefined;
const USE_BACKEND_GEMINI = import.meta.env.VITE_USE_BACKEND_GEMINI === "true";

const REQUIRED_CATEGORIES: RiskCategory[] = [
  "fraud",
  "compliance",
  "false_positive",
  "user_harm",
  "operational",
  "reputation",
];

function createId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
}

function extractJson(text: string): unknown {
  const cleaned = text
    .trim()
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```$/i, "")
    .trim();

  const firstBrace = cleaned.indexOf("{");
  const lastBrace = cleaned.lastIndexOf("}");

  if (firstBrace === -1 || lastBrace === -1) {
    throw new Error("Gemini response did not contain JSON object");
  }

  const jsonText = cleaned.slice(firstBrace, lastBrace + 1);
  return JSON.parse(jsonText);
}

function asArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

function hasText(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function buildGeminiResponseSchema() {
  return {
    type: "OBJECT",
    properties: {
      id: { type: "STRING" },
      createdAt: { type: "STRING" },
      decisionInput: { type: "STRING" },
      decisionSummary: { type: "STRING" },
      overallRiskScore: { type: "NUMBER" },
      overallRiskLevel: { type: "STRING", enum: ["critical", "high", "medium", "low"] },
      internalRiskScore: { type: "NUMBER" },
      mainConcern: { type: "STRING" },
      launchRecommendation: { type: "STRING" },
      engineUsed: { type: "STRING", enum: ["gemini"] },
      affectedStakeholders: {
        type: "ARRAY",
        items: {
          type: "OBJECT",
          properties: {
            role: { type: "STRING" },
            impact: { type: "STRING" },
          },
          required: ["role", "impact"],
        },
      },
      riskMatrix: {
        type: "ARRAY",
        items: {
          type: "OBJECT",
          properties: {
            id: { type: "STRING" },
            riskName: { type: "STRING" },
            category: { type: "STRING", enum: REQUIRED_CATEGORIES },
            likelihood: { type: "STRING", enum: ["very_high", "high", "medium", "low"] },
            impact: { type: "STRING", enum: ["critical", "high", "medium", "low"] },
            riskLevel: { type: "STRING", enum: ["critical", "high", "medium", "low"] },
            mitigated: { type: "BOOLEAN" },
            probabilityScore: { type: "NUMBER" },
            impactScore: { type: "NUMBER" },
            controlGapScore: { type: "NUMBER" },
            severityScore: { type: "NUMBER" },
          },
          required: ["id", "riskName", "category", "likelihood", "impact", "riskLevel", "mitigated"],
        },
      },
      abuseScenarios: {
        type: "ARRAY",
        items: {
          type: "OBJECT",
          properties: {
            id: { type: "STRING" },
            actor: { type: "STRING" },
            method: { type: "STRING" },
            impact: { type: "STRING" },
            severity: { type: "STRING", enum: ["critical", "high", "medium", "low"] },
          },
          required: ["id", "actor", "method", "impact", "severity"],
        },
      },
      falsePositiveScenarios: {
        type: "ARRAY",
        items: {
          type: "OBJECT",
          properties: {
            id: { type: "STRING" },
            affectedSegment: { type: "STRING" },
            trigger: { type: "STRING" },
            userImpact: { type: "STRING" },
            severity: { type: "STRING", enum: ["critical", "high", "medium", "low"] },
          },
          required: ["id", "affectedSegment", "trigger", "userImpact", "severity"],
        },
      },
      complianceConcerns: {
        type: "ARRAY",
        items: {
          type: "OBJECT",
          properties: {
            id: { type: "STRING" },
            regulation: { type: "STRING" },
            concern: { type: "STRING" },
            severity: { type: "STRING", enum: ["critical", "high", "medium", "low"] },
          },
          required: ["id", "regulation", "concern", "severity"],
        },
      },
      operationalRisks: { type: "ARRAY", items: { type: "STRING" } },
      reputationRisks: { type: "ARRAY", items: { type: "STRING" } },
      controlPlan: {
        type: "ARRAY",
        items: {
          type: "OBJECT",
          properties: {
            id: { type: "STRING" },
            control: { type: "STRING" },
            type: { type: "STRING", enum: ["preventive", "detective", "corrective"] },
            owner: { type: "STRING" },
            priority: { type: "STRING", enum: ["immediate", "short_term", "ongoing"] },
          },
          required: ["id", "control", "type", "owner", "priority"],
        },
      },
      saferAlternative: {
        type: "OBJECT",
        properties: {
          title: { type: "STRING" },
          description: { type: "STRING" },
          keyChanges: { type: "ARRAY", items: { type: "STRING" } },
        },
        required: ["title", "description", "keyChanges"],
      },
    },
    required: [
      "decisionSummary",
      "mainConcern",
      "launchRecommendation",
      "affectedStakeholders",
      "riskMatrix",
      "abuseScenarios",
      "falsePositiveScenarios",
      "complianceConcerns",
      "operationalRisks",
      "reputationRisks",
      "controlPlan",
      "saferAlternative",
    ],
  };
}

function buildPrompt(input: SimulationInput, outputLanguage: OutputLanguage): string {
  const languageInstruction = getGeminiLanguageInstruction(outputLanguage);

  return `
You are a fintech pre-launch risk analyst for FinGuard Twin AI.

Assess this fintech decision before launch.

Decision:
${input.decisionText}

Context:
- Decision type: ${input.decisionType || "Not specified"}
- Company type: ${input.companyType || "Not specified"}
- Market / regulatory context: ${input.marketContext || "Not specified"}
- Additional notes: ${input.additionalNotes || "None"}

Language rule:
- ${languageInstruction}
- The user's decision input language is the preferred output language.
- Do not default to English when the user writes in Chinese, Indonesian, or Malay.

Strict rules:
- Return JSON only.
- No markdown.
- No generic security advice.
- Use exact lowercase enum values for category, likelihood, impact, riskLevel, type, and priority.
- Keep content concise but specific.
- Include all 6 risk categories in riskMatrix: fraud, compliance, false_positive, user_harm, operational, reputation.
- Put the 3-4 most urgent control actions first in controlPlan. Remaining controls can be lower priority and displayed under Show More.

Each risk should make clear:
- what can go wrong
- who may exploit it
- who may be harmed
- why this decision enables the risk
- what control reduces it

Content minimums:
- affectedStakeholders: at least 4
- riskMatrix: exactly 6 or more, must include all 6 categories
- abuseScenarios: at least 2
- falsePositiveScenarios: at least 2
- complianceConcerns: at least 1
- operationalRisks: at least 2
- reputationRisks: at least 2
- controlPlan: at least 6, with the most important controls first
- saferAlternative.keyChanges: at least 3
`.trim();
}

function softRecoverAssessment(raw: Partial<RiskAssessment>, input: SimulationInput, outputLanguage: OutputLanguage): RiskAssessment {
  const fallback = runFallbackRiskEngine(input);
  const recoveryNotes: string[] = [];

  const rawRiskMatrix = asArray<RiskMatrixEntry>(raw.riskMatrix).filter((risk) =>
    hasText(risk?.riskName) && REQUIRED_CATEGORIES.includes(risk.category)
  );

  const missingCategories = REQUIRED_CATEGORIES.filter(
    (category) => !rawRiskMatrix.some((risk) => risk.category === category)
  );

  if (missingCategories.length > 0) {
    recoveryNotes.push(`Filled missing risk categories: ${missingCategories.join(", ")}`);
  }

  const recoveredRiskMatrix = [
    ...rawRiskMatrix,
    ...fallback.riskMatrix.filter((risk) => missingCategories.includes(risk.category)),
  ];

  const recoveredStakeholders = asArray<AffectedStakeholder>(raw.affectedStakeholders).filter(
    (item) => hasText(item?.role) && hasText(item?.impact)
  );
  if (recoveredStakeholders.length < 4) {
    recoveryNotes.push("Filled missing affected stakeholder entries.");
  }

  const recoveredAbuse = asArray<AbuseScenario>(raw.abuseScenarios).filter(
    (item) => hasText(item?.actor) && hasText(item?.method) && hasText(item?.impact)
  );
  if (recoveredAbuse.length < 2) recoveryNotes.push("Filled missing abuse scenarios.");

  const recoveredFalsePositive = asArray<FalsePositiveScenario>(raw.falsePositiveScenarios).filter(
    (item) => hasText(item?.affectedSegment) && hasText(item?.trigger) && hasText(item?.userImpact)
  );
  if (recoveredFalsePositive.length < 2) recoveryNotes.push("Filled missing false positive scenarios.");

  const recoveredCompliance = asArray<ComplianceConcern>(raw.complianceConcerns).filter(
    (item) => hasText(item?.regulation) && hasText(item?.concern)
  );
  if (recoveredCompliance.length < 1) recoveryNotes.push("Filled missing compliance concern.");

  const recoveredControls = asArray<ControlAction>(raw.controlPlan).filter(
    (item) => hasText(item?.control) && hasText(item?.owner)
  );
  if (recoveredControls.length < 6) recoveryNotes.push("Filled missing control plan items.");

  const saferAlternative = raw.saferAlternative && hasText(raw.saferAlternative.title)
    ? {
        title: raw.saferAlternative.title,
        description: hasText(raw.saferAlternative.description)
          ? raw.saferAlternative.description
          : fallback.saferAlternative.description,
        keyChanges: asArray<string>(raw.saferAlternative.keyChanges).filter(hasText).length >= 3
          ? asArray<string>(raw.saferAlternative.keyChanges).filter(hasText)
          : fallback.saferAlternative.keyChanges,
      }
    : fallback.saferAlternative;

  if (!raw.saferAlternative || !hasText(raw.saferAlternative.title)) {
    recoveryNotes.push("Filled missing safer alternative.");
  }

  const assessment: RiskAssessment = {
    ...fallback,
    ...raw,
    id: createId("gemini"),
    createdAt: new Date().toISOString(),
    decisionInput: input.decisionText,
    decisionSummary: hasText(raw.decisionSummary) ? raw.decisionSummary : fallback.decisionSummary,
    mainConcern: hasText(raw.mainConcern) ? raw.mainConcern : fallback.mainConcern,
    launchRecommendation: hasText(raw.launchRecommendation) ? raw.launchRecommendation : fallback.launchRecommendation,
    affectedStakeholders: [
      ...recoveredStakeholders,
      ...fallback.affectedStakeholders,
    ].filter((item, index, array) => array.findIndex((candidate) => candidate.role === item.role) === index).slice(0, 8),
    riskMatrix: recoveredRiskMatrix.slice(0, 10),
    abuseScenarios: [...recoveredAbuse, ...fallback.abuseScenarios].slice(0, 4),
    falsePositiveScenarios: [...recoveredFalsePositive, ...fallback.falsePositiveScenarios].slice(0, 4),
    complianceConcerns: [...recoveredCompliance, ...fallback.complianceConcerns].slice(0, 4),
    operationalRisks: asArray<string>(raw.operationalRisks).filter(hasText).length >= 2
      ? asArray<string>(raw.operationalRisks).filter(hasText)
      : fallback.operationalRisks,
    reputationRisks: asArray<string>(raw.reputationRisks).filter(hasText).length >= 2
      ? asArray<string>(raw.reputationRisks).filter(hasText)
      : fallback.reputationRisks,
    controlPlan: [...recoveredControls, ...fallback.controlPlan]
      .filter((item, index, array) => array.findIndex((candidate) => candidate.control === item.control) === index)
      .slice(0, 8),
    saferAlternative,
    engineUsed: "gemini",
    outputLanguage,
    recoveryNotes,
  };

  return assessment;
}

function normalizeGeminiAssessment(raw: Partial<RiskAssessment>, input: SimulationInput, outputLanguage: OutputLanguage): RiskAssessment {
  const recovered = softRecoverAssessment(raw, input, outputLanguage);
  const enrichedMatrix = enrichRiskMatrix(recovered.riskMatrix);

  const internalRiskScore = calculateInternalRiskScore(enrichedMatrix);
  const displayScore = normalizeToDisplayScore(internalRiskScore);
  const overallRiskLevel = getOverallRiskLevel(displayScore, enrichedMatrix);

  return {
    ...recovered,
    riskMatrix: enrichedMatrix,
    internalRiskScore,
    overallRiskScore: displayScore,
    overallRiskLevel,
    launchRecommendation: recovered.launchRecommendation?.trim() || getLaunchRecommendation(overallRiskLevel),
    engineUsed: "gemini",
    outputLanguage,
  };
}

async function runGeminiThroughBackend(input: SimulationInput, outputLanguage: OutputLanguage): Promise<RiskAssessment> {
  if (!BACKEND_ENDPOINT) {
    throw new Error("VITE_GEMINI_BACKEND_URL is not configured");
  }

  const response = await fetch(BACKEND_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ input, outputLanguage }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Backend Gemini route failed: ${response.status} ${errorText}`);
  }

  const parsed = await response.json();
  const normalized = normalizeGeminiAssessment(parsed, input, outputLanguage);
  validateRiskOutput(normalized);
  return normalized;
}

async function runGeminiDirectPrototype(input: SimulationInput, outputLanguage: OutputLanguage): Promise<RiskAssessment> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY as string | undefined;

  if (!apiKey) {
    throw new Error("Missing VITE_GEMINI_API_KEY");
  }

  if (import.meta.env.PROD) {
    console.warn(
      "Prototype mode warning: direct browser Gemini calls can expose the API key. Configure VITE_USE_BACKEND_GEMINI=true and VITE_GEMINI_BACKEND_URL for production."
    );
  }

  const prompt = buildPrompt(input, outputLanguage);

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 8192,
          responseMimeType: "application/json",
          responseSchema: buildGeminiResponseSchema(),
        },
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini API failed: ${response.status} ${errorText}`);
  }

  const data = await response.json();

  const text =
    data?.candidates?.[0]?.content?.parts
      ?.map((part: { text?: string }) => part.text ?? "")
      .join("") ?? "";

  if (!text.trim()) {
    throw new Error("Gemini returned empty response");
  }

  const parsed = extractJson(text) as Partial<RiskAssessment>;
  const normalized = normalizeGeminiAssessment(parsed, input, outputLanguage);

  validateRiskOutput(normalized);

  return normalized;
}

export async function runGeminiRiskAssessment(input: SimulationInput): Promise<RiskAssessment> {
  const outputLanguage = detectInputLanguage([
    input.decisionText,
    input.marketContext,
    input.additionalNotes,
  ].filter(Boolean).join(" "));

  if (USE_BACKEND_GEMINI || BACKEND_ENDPOINT) {
    return runGeminiThroughBackend(input, outputLanguage);
  }

  return runGeminiDirectPrototype(input, outputLanguage);
}
