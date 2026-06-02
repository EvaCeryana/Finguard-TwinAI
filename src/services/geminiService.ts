import type { RiskAssessment, SimulationInput } from "../types/risk";
import {
  calculateInternalRiskScore,
  enrichRiskMatrix,
  getLaunchRecommendation,
  getOverallRiskLevel,
  normalizeToDisplayScore,
} from "../utils/riskScoring";
import { validateRiskOutput } from "../utils/validateRiskOutput";
import { detectInputLanguage } from "../utils/languageDetection";

// Use Flash Lite for demo stability, lower token usage, and faster JSON output.
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
    console.error("Gemini raw response without JSON:", text);
    throw new Error("Gemini response did not contain a JSON object.");
  }

  const jsonText = cleaned.slice(firstBrace, lastBrace + 1);

  try {
    return JSON.parse(jsonText);
  } catch (error) {
    console.error("Gemini JSON parse failed. Extracted JSON:", jsonText);
    throw error;
  }
}

function getLanguageInstruction(input: SimulationInput): string {
  const detected = detectInputLanguage(
    `${input.decisionText} ${input.marketContext ?? ""} ${input.additionalNotes ?? ""}`
  );

  if (detected === "zh") {
    return [
      "Respond entirely in Simplified Chinese.",
      "Keep fintech terms professional.",
      "You may keep industry terms such as KYC, AML/CFT, STR, OTP, API, velocity rules, shadow mode, and fraud scoring in English where appropriate.",
      "All JSON string values should be Chinese where possible.",
    ].join(" ");
  }

  if (detected === "id") {
    return [
      "Respond entirely in Indonesian.",
      "Use professional fintech risk language.",
      "Keep industry terms such as KYC, AML/CFT, STR, OTP, API, velocity rules, shadow mode, and fraud scoring where appropriate.",
      "All JSON string values should be Indonesian where possible.",
    ].join(" ");
  }

  if (detected === "ms") {
    return [
      "Respond entirely in Malay.",
      "Use professional fintech risk language.",
      "Keep industry terms such as KYC, AML/CFT, STR, OTP, API, velocity rules, shadow mode, and fraud scoring where appropriate.",
      "All JSON string values should be Malay where possible.",
    ].join(" ");
  }

  return [
    "Respond entirely in English.",
    "Use professional fintech risk language.",
    "Keep the response suitable for a fintech risk, compliance, fraud, and product team.",
  ].join(" ");
}

function buildPrompt(input: SimulationInput): string {
  const languageInstruction = getLanguageInstruction(input);

  return `
You are FinGuard Twin AI, a fintech pre-launch risk simulator.

Your job:
Assess the proposed fintech decision before launch. Produce a practical risk assessment for fraud, compliance, false positive, user harm, operational, and reputation risk.

Language rule:
${languageInstruction}

User decision:
${input.decisionText}

Context:
- Decision type: ${input.decisionType || "Other"}
- Company type: ${input.companyType || "Other Fintech"}
- Market / regulatory context: ${input.marketContext || "Not specified"}
- Additional notes: ${input.additionalNotes || "None"}

Strict output rules:
- Return JSON only.
- Do not include markdown.
- Do not include explanation outside JSON.
- Use exact lowercase enum values.
- Do not invent laws. If regulation is unclear, use general compliance wording.
- Keep output specific to the user's decision.
- Do not give generic cybersecurity advice.
- Include all 6 categories in riskMatrix:
  fraud, compliance, false_positive, user_harm, operational, reputation.

Important product expectation:
- The recommended control plan should be priority-based.
- The first 3-4 controls must be the most important.
- Remaining controls can be shown under "show more" by the UI.
- Affected stakeholders should be specific, for example: New Registered Users, Fraud & Risk Team, Compliance / AML Team, Customer Support, Engineering / Platform.

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
  "launchRecommendation": "go-with-mitigation",
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
      "riskName": "specific fraud risk",
      "category": "fraud",
      "likelihood": "high",
      "impact": "critical",
      "riskLevel": "critical",
      "mitigated": false,
      "probabilityScore": 4,
      "impactScore": 5,
      "controlGapScore": 4,
      "severityScore": 80
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
      "control": "highest priority preventive control",
      "type": "preventive",
      "owner": "Risk Team",
      "priority": "immediate"
    },
    {
      "id": "cp-02",
      "control": "highest priority detective control",
      "type": "detective",
      "owner": "Engineering",
      "priority": "immediate"
    },
    {
      "id": "cp-03",
      "control": "customer or compliance protection control",
      "type": "corrective",
      "owner": "Customer Support",
      "priority": "short_term"
    },
    {
      "id": "cp-04",
      "control": "ongoing monitoring control",
      "type": "detective",
      "owner": "Compliance",
      "priority": "ongoing"
    }
  ],
  "saferAlternative": {
    "title": "safer decision title",
    "description": "how this alternative reduces risk while preserving business objective",
    "keyChanges": [
      "specific policy change",
      "specific policy change",
      "specific policy change"
    ]
  }
}

Minimum requirements:
- affectedStakeholders: at least 4
- riskMatrix: at least 6, must include all 6 categories
- abuseScenarios: at least 2
- falsePositiveScenarios: at least 2
- complianceConcerns: at least 1
- operationalRisks: at least 2
- reputationRisks: at least 2
- controlPlan: at least 4
- saferAlternative.keyChanges: at least 3
`.trim();
}

function ensureString(value: unknown, fallback: string): string {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function ensureArray<T>(value: unknown, fallback: T[]): T[] {
  return Array.isArray(value) ? (value as T[]) : fallback;
}

function normalizeGeminiAssessment(
  rawUnknown: unknown,
  input: SimulationInput
): RiskAssessment {
  const raw = rawUnknown as Partial<RiskAssessment>;

  const baseRiskMatrix = ensureArray(raw.riskMatrix, []);
  const enrichedMatrix = enrichRiskMatrix(baseRiskMatrix);

  const internalRiskScore = calculateInternalRiskScore(enrichedMatrix);
  const displayScore = normalizeToDisplayScore(internalRiskScore);
  const overallRiskLevel = getOverallRiskLevel(displayScore, enrichedMatrix);

  const assessment: RiskAssessment = {
    id: createId("gemini"),
    createdAt: new Date().toISOString(),
    decisionInput: input.decisionText,
    decisionSummary: ensureString(
      raw.decisionSummary,
      "The proposed fintech decision creates pre-launch risk exposure that requires structured controls before rollout."
    ),
    overallRiskScore: displayScore,
    overallRiskLevel,
    internalRiskScore,
    mainConcern: ensureString(
      raw.mainConcern,
      "The decision may increase exposure faster than current controls can safely manage."
    ),
    launchRecommendation:
      typeof raw.launchRecommendation === "string"
        ? raw.launchRecommendation
        : getLaunchRecommendation(overallRiskLevel),
    engineUsed: "gemini",

    affectedStakeholders: ensureArray(raw.affectedStakeholders, [
      {
        role: "End Users",
        impact:
          "May experience better access but could face additional verification, delay, or incorrect blocking.",
      },
      {
        role: "Fraud & Risk Team",
        impact:
          "Needs to monitor abuse patterns and investigate suspicious activity after launch.",
      },
      {
        role: "Compliance / AML Team",
        impact:
          "Needs to review monitoring, audit trail, and reporting obligations.",
      },
      {
        role: "Engineering / Platform",
        impact:
          "Needs to implement event logging, rule monitoring, and rollback controls.",
      },
    ]),

    riskMatrix: enrichedMatrix,

    abuseScenarios: ensureArray(raw.abuseScenarios, [
      {
        id: "as-default-01",
        actor: "Opportunistic Fraudster",
        method:
          "Tests the new policy to identify weaker checks, faster approval, or higher exposure limits.",
        impact:
          "Fraud patterns may emerge after launch if monitoring and rollback controls are not ready.",
        severity: "high",
      },
      {
        id: "as-default-02",
        actor: "Coordinated Abuse Group",
        method:
          "Uses multiple accounts, devices, or identities to exploit the decision repeatedly.",
        impact:
          "Small individual events can become a material portfolio-level loss.",
        severity: "high",
      },
    ]),

    falsePositiveScenarios: ensureArray(raw.falsePositiveScenarios, [
      {
        id: "fp-default-01",
        affectedSegment: "Legitimate users with unusual but valid behaviour",
        trigger:
          "New controls classify uncommon but valid behaviour as suspicious.",
        userImpact:
          "Users may face unnecessary friction, payment delay, or extra verification.",
        severity: "medium",
      },
      {
        id: "fp-default-02",
        affectedSegment: "Small business or high-activity users",
        trigger:
          "Higher activity volume is misread as fraud or policy abuse.",
        userImpact:
          "Important transactions or approvals may be delayed.",
        severity: "medium",
      },
    ]),

    complianceConcerns: ensureArray(raw.complianceConcerns, [
      {
        id: "cc-default-01",
        regulation: "AML/CFT and consumer protection review",
        concern:
          "The decision should be reviewed for monitoring, audit trail, fair treatment, and escalation obligations before launch.",
        severity: "high",
      },
    ]),

    operationalRisks: ensureArray(raw.operationalRisks, [
      "Monitoring dashboards, reason codes, and rollback thresholds must be ready before launch.",
      "Customer support needs clear scripts for delayed, blocked, rejected, or reviewed user actions.",
    ]),

    reputationRisks: ensureArray(raw.reputationRisks, [
      "Poorly explained controls may reduce customer trust in the platform.",
      "Unexpected fraud, unfair outcomes, or user friction may create negative social media attention.",
    ]),

    controlPlan: ensureArray(raw.controlPlan, [
      {
        id: "cp-default-01",
        control:
          "Launch first as a limited pilot with exposure caps, monitoring thresholds, and rollback criteria.",
        type: "preventive",
        owner: "Product & Risk",
        priority: "immediate",
      },
      {
        id: "cp-default-02",
        control:
          "Add event logging, reason codes, and dashboard monitoring for all high-risk outcomes.",
        type: "detective",
        owner: "Engineering",
        priority: "immediate",
      },
      {
        id: "cp-default-03",
        control:
          "Prepare customer support escalation scripts for blocked, delayed, reviewed, or disputed cases.",
        type: "corrective",
        owner: "Customer Support",
        priority: "short_term",
      },
      {
        id: "cp-default-04",
        control:
          "Review policy with compliance before launch and document risk acceptance decision.",
        type: "corrective",
        owner: "Compliance",
        priority: "short_term",
      },
    ]),

    saferAlternative:
      raw.saferAlternative &&
      typeof raw.saferAlternative === "object" &&
      Array.isArray(raw.saferAlternative.keyChanges)
        ? raw.saferAlternative
        : {
            title: "Controlled Pilot with Guardrails",
            description:
              "Release the decision to a limited segment first, monitor risk indicators, and expand only after fraud, false positive, complaint, and operational metrics remain within tolerance.",
            keyChanges: [
              "Start with limited user exposure.",
              "Set transaction, approval, or feature caps.",
              "Monitor fraud, complaints, and false positives.",
              "Define rollback thresholds before launch.",
            ],
          },
  };

  return assessment;
}

async function callGeminiDirect(input: SimulationInput): Promise<RiskAssessment> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY as string | undefined;

  if (!apiKey) {
    throw new Error(
      "Missing VITE_GEMINI_API_KEY. Add it in Vercel Environment Variables and local .env."
    );
  }

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`;

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      generationConfig: {
        temperature: 0.2,
        topP: 0.8,
        maxOutputTokens: 8192,
        responseMimeType: "application/json",
      },
      contents: [
        {
          role: "user",
          parts: [{ text: buildPrompt(input) }],
        },
      ],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Gemini API HTTP error:", response.status, errorText);
    throw new Error(`Gemini API failed with status ${response.status}`);
  }

  const data = await response.json();

  const text =
    data?.candidates?.[0]?.content?.parts?.[0]?.text ??
    data?.candidates?.[0]?.content?.parts
      ?.map((part: { text?: string }) => part.text ?? "")
      .join("");

  if (!text) {
    console.error("Gemini response missing text:", data);
    throw new Error("Gemini response was empty.");
  }

  const parsed = extractJson(text);
  const assessment = normalizeGeminiAssessment(parsed, input);

  validateRiskOutput(assessment);

  return assessment;
}

async function callGeminiBackend(input: SimulationInput): Promise<RiskAssessment> {
  const backendUrl = import.meta.env.VITE_GEMINI_BACKEND_URL as string | undefined;

  if (!backendUrl) {
    throw new Error("Missing VITE_GEMINI_BACKEND_URL.");
  }

  const response = await fetch(backendUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Backend Gemini route failed:", response.status, errorText);
    throw new Error(`Backend Gemini route failed with status ${response.status}`);
  }

  const raw = await response.json();
  const assessment = normalizeGeminiAssessment(raw, input);

  validateRiskOutput(assessment);

  return assessment;
}

export async function runGeminiRiskAssessment(
  input: SimulationInput
): Promise<RiskAssessment> {
  const useBackend =
    (import.meta.env.VITE_USE_BACKEND_GEMINI as string | undefined) === "true";

  try {
    if (useBackend) {
      return await callGeminiBackend(input);
    }

    // Prototype mode: direct Gemini call.
    // For production, move this into backend route to protect the API key.
    if (import.meta.env.PROD) {
      console.warn(
        "FinGuard is using direct browser Gemini mode in production. Move Gemini calls to a backend route before real deployment."
      );
    }

    return await callGeminiDirect(input);
  } catch (error) {
    console.error("Gemini assessment failed, simulationService will fallback:", error);
    throw error;
  }
}
