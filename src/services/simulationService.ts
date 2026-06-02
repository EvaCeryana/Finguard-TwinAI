import type { AssessmentSummary, RiskAssessment, SimulationInput } from "../types/risk";
import { runFallbackRiskEngine } from "./fallbackRiskEngine";
import { runGeminiRiskAssessment } from "./geminiService";
import { validateRiskOutput } from "../utils/validateRiskOutput";

const LATEST_ASSESSMENT_KEY = "finguard.latestAssessment";
const HISTORY_KEY = "finguard.assessmentHistory";
const HISTORY_LIMIT = 20;
const MAX_STORAGE_BYTES = 4_500_000;

function safeParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function safeSetItem(key: string, value: unknown): boolean {
  try {
    const serialized = JSON.stringify(value);
    if (serialized.length > MAX_STORAGE_BYTES) {
      console.warn(`Skipping ${key}: payload is too large for localStorage prototype mode.`);
      return false;
    }
    localStorage.setItem(key, serialized);
    return true;
  } catch (error) {
    console.warn(`Unable to save ${key} to localStorage:`, error);
    return false;
  }
}

export async function runRiskSimulation(input: SimulationInput): Promise<RiskAssessment> {
  try {
    const geminiAssessment = await runGeminiRiskAssessment(input);

    validateRiskOutput(geminiAssessment);

    saveLatestAssessment(geminiAssessment);
    saveAssessmentToHistory(geminiAssessment);

    return geminiAssessment;
  } catch (geminiError) {
    console.warn("Gemini failed. Falling back to local risk engine:", geminiError);

    const fallbackAssessment = runFallbackRiskEngine({
      ...input,
      additionalNotes:
        `${input.additionalNotes ?? ""}\nGemini unavailable, invalid, or unreachable. Fallback engine used.`,
    });

    validateRiskOutput(fallbackAssessment);

    saveLatestAssessment(fallbackAssessment);
    saveAssessmentToHistory(fallbackAssessment);

    return fallbackAssessment;
  }
}

export function saveLatestAssessment(assessment: RiskAssessment): void {
  safeSetItem(LATEST_ASSESSMENT_KEY, assessment);
}

export function getLatestAssessment(): RiskAssessment | null {
  return safeParse<RiskAssessment | null>(localStorage.getItem(LATEST_ASSESSMENT_KEY), null);
}

export function saveAssessmentToHistory(assessment: RiskAssessment): void {
  const current = getAssessmentHistory();

  const summary: AssessmentSummary = {
    id: assessment.id,
    createdAt: assessment.createdAt,
    decisionInput: assessment.decisionInput,
    overallRiskLevel: assessment.overallRiskLevel,
    overallRiskScore: assessment.overallRiskScore,
    outputLanguage: assessment.outputLanguage,
  };

  const next = [
    summary,
    ...current.filter((item) => item.id !== assessment.id),
  ].slice(0, HISTORY_LIMIT);

  safeSetItem(HISTORY_KEY, next);
}

export function getAssessmentHistory(): AssessmentSummary[] {
  const history = safeParse<AssessmentSummary[]>(localStorage.getItem(HISTORY_KEY), []);
  return Array.isArray(history) ? history.slice(0, HISTORY_LIMIT) : [];
}

// Production backend target:
// GET  /api/simulations?page=1&limit=10  -> paginated summary list
// GET  /api/simulations/:id              -> full assessment report
// POST /api/simulations                  -> validated request, server-side Gemini call, persisted report
