import type { AssessmentSummary, RiskAssessment, SimulationInput } from "../types/risk";
import { runFallbackRiskEngine } from "./fallbackRiskEngine";
import { runGeminiRiskAssessment } from "./geminiService";
import { validateRiskOutput } from "../utils/validateRiskOutput";

const LATEST_ASSESSMENT_KEY = "finguard.latestAssessment";
const HISTORY_KEY = "finguard.assessmentHistory";

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
        `${input.additionalNotes ?? ""}\nGemini unavailable or invalid. Fallback engine used.`,
    });

    validateRiskOutput(fallbackAssessment);

    saveLatestAssessment(fallbackAssessment);
    saveAssessmentToHistory(fallbackAssessment);

    return fallbackAssessment;
  }
}

export function saveLatestAssessment(assessment: RiskAssessment): void {
  localStorage.setItem(LATEST_ASSESSMENT_KEY, JSON.stringify(assessment));
}

export function getLatestAssessment(): RiskAssessment | null {
  const raw = localStorage.getItem(LATEST_ASSESSMENT_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as RiskAssessment;
  } catch {
    return null;
  }
}

export function saveAssessmentToHistory(assessment: RiskAssessment): void {
  const current = getAssessmentHistory();

  const summary: AssessmentSummary = {
    id: assessment.id,
    createdAt: assessment.createdAt,
    decisionInput: assessment.decisionInput,
    overallRiskLevel: assessment.overallRiskLevel,
    overallRiskScore: assessment.overallRiskScore,
  };

  const next = [
    summary,
    ...current.filter((item) => item.id !== assessment.id),
  ].slice(0, 20);

  localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
}

export function getAssessmentHistory(): AssessmentSummary[] {
  const raw = localStorage.getItem(HISTORY_KEY);
  if (!raw) return [];

  try {
    return JSON.parse(raw) as AssessmentSummary[];
  } catch {
    return [];
  }
}