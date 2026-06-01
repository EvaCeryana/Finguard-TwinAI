import type { RiskAssessment, SimulationInput } from "../types/risk";
import {
  calculateInternalRiskScore,
  enrichRiskMatrix,
  getLaunchRecommendation,
  getOverallRiskLevel,
  normalizeToDisplayScore,
} from "../utils/riskScoring";
import { validateRiskOutput } from "../utils/validateRiskOutput";

// Use Flash Lite for demo stability, lower token usage, and faster structured JSON output.
const GEMINI_MODEL = "gemini-2.5-flash-lite";

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

function buildPrompt(input: SimulationInput): string {
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

Strict rules:
- Return JSON only.
- No markdown.
- No generic security advice.
- Use exact lowercase enum values.
- Keep content concise but specific.
- Include all 6 risk categories in riskMatrix:
  fraud, compliance, false_positive, user_harm, operational, reputation.

Each risk should make clear:
- what can go wrong
- who may exploit it
- who may be harmed
- why this decision enables the risk
- what control reduces it

Scoring:
- overallRiskScore: 0-100
- internalRiskScore: 1-125
- probabilityScore: 1-5
- impactScore: 1-5
- controlGapScore: 1-5
- severityScore = probabilityScore * impactScore * controlGapScore

Return exactly this JSON shape:

{
  "id": "sim-gemini",
  "createdAt": "ISO string",
  "decisionInput": "original decision text",
  "decisionSummary": "1-2 sentence concise summary",
  "overallRiskScore": 0,
  "overallRiskLevel": "low",
  "internalRiskScore": 1,
  "mainConcern": "absolute biggest risk",
  "launchRecommendation": "clear go / no-go / go-with-mitigation verdict",
  "engineUsed": "gemini",
  "affectedStakeholders": [
    {
      "role": "stakeholder role",
      "impact": "specific impact"
    }
  ],
  "riskMatrix": [
    {
      "id": "rm-01",
      "riskName": "specific risk name",
      "category": "fraud",
      "likelihood": "very_high",
      "impact": "critical",
      "riskLevel": "critical",
      "mitigated": false,
      "probabilityScore": 5,
      "impactScore": 5,
      "controlGapScore": 4,
      "severityScore": 100
    },
    {
      "id": "rm-02",
      "riskName": "specific compliance risk",
      "category": "compliance",
      "likelihood": "high",
      "impact": "high",
      "riskLevel": "high",
      "mitigated": false,
      "probabilityScore": 4,
      "impactScore": 4,
      "controlGapScore": 4,
      "severityScore": 64
    },
    {
      "id": "rm-03",
      "riskName": "specific false positive risk",
      "category": "false_positive",
      "likelihood": "medium",
      "impact": "high",
      "riskLevel": "high",
      "mitigated": false,
      "probabilityScore": 3,
      "impactScore": 4,
      "controlGapScore": 4,
      "severityScore": 48
    },
    {
      "id": "rm-04",
      "riskName": "specific user harm risk",
      "category": "user_harm",
      "likelihood": "medium",
      "impact": "high",
      "riskLevel": "high",
      "mitigated": false,
      "probabilityScore": 3,
      "impactScore": 4,
      "controlGapScore": 4,
      "severityScore": 48
    },
    {
      "id": "rm-05",
      "riskName": "specific operational risk",
      "category": "operational",
      "likelihood": "medium",
      "impact": "medium",
      "riskLevel": "medium",
      "mitigated": false,
      "probabilityScore": 3,
      "impactScore": 3,
      "controlGapScore": 4,
      "severityScore": 36
    },
    {
      "id": "rm-06",
      "riskName": "specific reputation risk",
      "category": "reputation",
      "likelihood": "medium",
      "impact": "high",
      "riskLevel": "high",
      "mitigated": false,
      "probabilityScore": 3,
      "impactScore": 4,
      "controlGapScore": 4,
      "severityScore": 48
    }
  ],
  "abuseScenarios": [
    {
      "id": "as-01",
      "actor": "specific bad actor",
      "method": "how they exploit this decision",
      "impact": "business/user/platform impact",
      "severity": "high"
    },
    {
      "id": "as-02",
      "actor": "specific bad actor",
      "method": "how they exploit this decision",
      "impact": "business/user/platform impact",
      "severity": "high"
    }
  ],
  "falsePositiveScenarios": [
    {
      "id": "fp-01",
      "affectedSegment": "legitimate user segment",
      "trigger": "what triggers the false positive",
      "userImpact": "how the legitimate user is harmed",
      "severity": "medium"
    },
    {
      "id": "fp-02",
      "affectedSegment": "legitimate user segment",
      "trigger": "what triggers the false positive",
      "userImpact": "how the legitimate user is harmed",
      "severity": "medium"
    }
  ],
  "complianceConcerns": [
    {
      "id": "cc-01",
      "regulation": "relevant framework or obligation",
      "concern": "specific compliance issue",
      "severity": "high"
    }
  ],
  "operationalRisks": [
    "specific operational risk",
    "specific operational risk"
  ],
  "reputationRisks": [
    "specific reputation risk",
    "specific reputation risk"
  ],
  "controlPlan": [
    {
      "id": "cp-01",
      "control": "specific preventive control",
      "type": "preventive",
      "owner": "Risk Team",
      "priority": "immediate"
    },
    {
      "id": "cp-02",
      "control": "specific detective control",
      "type": "detective",
      "owner": "Engineering",
      "priority": "immediate"
    },
    {
      "id": "cp-03",
      "control": "specific corrective control",
      "type": "corrective",
      "owner": "Customer Support",
      "priority": "short_term"
    },
    {
      "id": "cp-04",
      "control": "specific ongoing monitoring control",
      "type": "detective",
      "owner": "Compliance",
      "priority": "ongoing"
    }
  ],
  "saferAlternative": {
    "title": "safer decision title",
    "description": "how this alternative reduces risk while preserving the business objective",
    "keyChanges": [
      "specific policy change",
      "specific policy change",
      "specific policy change"
    ]
  }
}

Content minimums:
- affectedStakeholders: at least 4
- riskMatrix: exactly 6 or more, must include all 6 categories
- abuseScenarios: at least 2
- falsePositiveScenarios: at least 2
- complianceConcerns: at least 1
- operationalRisks: at least 2
- reputationRisks: at least 2
- controlPlan: at least 4
- saferAlternative.keyChanges: at least 3
`.trim();
}

function normalizeGeminiAssessment(raw: RiskAssessment, input: SimulationInput): RiskAssessment {
  const enrichedMatrix = enrichRiskMatrix(raw.riskMatrix);

  const internalRiskScore = calculateInternalRiskScore(enrichedMatrix);
  const displayScore = normalizeToDisplayScore(internalRiskScore);
  const overallRiskLevel = getOverallRiskLevel(displayScore, enrichedMatrix);

  return {
    ...raw,
    id: createId("gemini"),
    createdAt: new Date().toISOString(),
    decisionInput: input.decisionText,
    decisionSummary:
      raw.decisionSummary?.trim() ||
      "The proposed fintech decision creates pre-launch risk exposure that requires structured controls before rollout.",
    riskMatrix: enrichedMatrix,

    // Never fully trust Gemini scores. Recalculate internally.
    internalRiskScore,
    overallRiskScore: displayScore,
    overallRiskLevel,
    mainConcern:
      raw.mainConcern?.trim() ||
      "The decision may increase risk exposure faster than the platform's controls can safely manage.",
    launchRecommendation:
      raw.launchRecommendation?.trim() || getLaunchRecommendation(overallRiskLevel),

    engineUsed: "gemini",
  };
}

export async function runGeminiRiskAssessment(
  input: SimulationInput
): Promise<RiskAssessment> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY as string | undefined;

  if (!apiKey) {
    throw new Error("Missing VITE_GEMINI_API_KEY");
  }

  const prompt = buildPrompt(input);

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
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

  const parsed = extractJson(text);

  validateRiskOutput(parsed);

  const normalized = normalizeGeminiAssessment(parsed, input);

  validateRiskOutput(normalized);

  return normalized;
}