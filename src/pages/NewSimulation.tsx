import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown, Info } from "lucide-react";
import { PageHeader } from "../components/PageHeader";
import { runRiskSimulation } from "../services/simulationService";
import type { DecisionType, CompanyType, SimulationInput } from "../types/risk";

// ─── Constants ──────────────────────────────────────────────────────────────

const DECISION_TYPES: DecisionType[] = [
  "Transfer Limit Change",
  "KYC Rule Modification",
  "New Product / Feature Launch",
  "Fraud Rule Update",
  "Merchant Onboarding Policy",
  "Credit / Loan Policy Change",
  "Fee / Pricing Change",
  "Authentication Requirement Change",
  "Other",
];

const COMPANY_TYPES: CompanyType[] = [
  "Digital Bank",
  "E-Wallet",
  "Payment Gateway",
  "Loan Platform",
  "Buy Now Pay Later",
  "Crypto Exchange",
  "Insurance Tech",
  "Other Fintech",
];

// Required order: main demo scenario first
const DEMO_DECISIONS = [
  "Increase instant transfer limit for newly registered users from RM500 to RM5,000.",
  "Use AI to automatically approve small personal loans without manual review.",
  "Automatically block transactions that look similar to scam payments.",
];

const LOADING_MESSAGES = [
  "Building risk simulation...",
  "Mapping fraud scenarios...",
  "Estimating false positive impact...",
  "Generating control plan...",
  "Preparing safer alternative...",
];

// ─── Component ──────────────────────────────────────────────────────────────

export function NewSimulation() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    decisionText: "",
    decisionType: "" as DecisionType,
    companyType: "" as CompanyType,
    marketContext: "",
    additionalNotes: "",
  });

  const [isRunning, setIsRunning] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Cycle through loading messages while simulation runs
  useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(() => {
      setLoadingStep((prev) => (prev + 1) % LOADING_MESSAGES.length);
    }, 600);
    return () => clearInterval(interval);
  }, [isRunning]);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError(null);
  }

  function fillDemo(text: string) {
    setForm((prev) => ({ ...prev, decisionText: text }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isReady || isRunning) return;

    setIsRunning(true);
    setLoadingStep(0);
    setError(null);

    try {
      const input: SimulationInput = {
        decisionText: form.decisionText.trim(),
        decisionType: form.decisionType,
        companyType: form.companyType,
        marketContext: form.marketContext.trim() || undefined,
        additionalNotes: form.additionalNotes.trim() || undefined,
      };

      await runRiskSimulation(input);
      navigate("/dashboard");
    } catch (err) {
      setError("Simulation failed. Please try again.");
      setIsRunning(false);
    }
  }

  const isReady = form.decisionText.trim().length > 20 && !isRunning;

  return (
    <div className="page-simulate">
      <PageHeader
        badge="New Simulation"
        title="Define the Decision"
        subtitle="Describe the fintech policy or product change you want to stress-test."
      />

      {/* Demo scenario chips */}
      <div className="example-prompts">
        <span className="example-label">
          <Info size={12} /> Demo scenarios
        </span>
        <div className="example-chips">
          {DEMO_DECISIONS.map((ex) => (
            <button
              key={ex}
              className="example-chip"
              onClick={() => fillDemo(ex)}
              disabled={isRunning}
            >
              {ex}
            </button>
          ))}
        </div>
      </div>

      <form className="sim-form" onSubmit={handleSubmit}>
        {/* Primary: decision text */}
        <div className="form-field form-field--primary">
          <label className="form-label" htmlFor="decisionText">
            Decision Description <span className="form-required">*</span>
          </label>
          <textarea
            id="decisionText"
            name="decisionText"
            className="form-textarea"
            rows={5}
            placeholder="Describe the specific policy, rule, or product change you want to simulate..."
            value={form.decisionText}
            onChange={handleChange}
            disabled={isRunning}
          />
          <span className="form-hint">
            Be specific — include current state, proposed state, and affected user segment if known.
          </span>
        </div>

        {/* Decision type + company type */}
        <div className="form-row">
          <div className="form-field">
            <label className="form-label" htmlFor="decisionType">
              Decision Type
            </label>
            <div className="select-wrapper">
              <select
                id="decisionType"
                name="decisionType"
                className="form-select"
                value={form.decisionType}
                onChange={handleChange}
                disabled={isRunning}
              >
                <option value="">Select type...</option>
                {DECISION_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
              <ChevronDown size={14} className="select-icon" />
            </div>
          </div>

          <div className="form-field">
            <label className="form-label" htmlFor="companyType">
              Company Type
            </label>
            <div className="select-wrapper">
              <select
                id="companyType"
                name="companyType"
                className="form-select"
                value={form.companyType}
                onChange={handleChange}
                disabled={isRunning}
              >
                <option value="">Select type...</option>
                {COMPANY_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
              <ChevronDown size={14} className="select-icon" />
            </div>
          </div>
        </div>

        {/* Market context */}
        <div className="form-field">
          <label className="form-label" htmlFor="marketContext">
            Market / Regulatory Context{" "}
            <span className="form-optional">(optional)</span>
          </label>
          <input
            id="marketContext"
            name="marketContext"
            type="text"
            className="form-input"
            placeholder="e.g. Malaysia, BNM-licensed e-wallet, Tier 2 KYC users only"
            value={form.marketContext}
            onChange={handleChange}
            disabled={isRunning}
          />
        </div>

        {/* Additional notes */}
        <div className="form-field">
          <label className="form-label" htmlFor="additionalNotes">
            Additional Context{" "}
            <span className="form-optional">(optional)</span>
          </label>
          <textarea
            id="additionalNotes"
            name="additionalNotes"
            className="form-textarea"
            rows={3}
            placeholder="Business justification, constraints, or specific risk areas to focus on..."
            value={form.additionalNotes}
            onChange={handleChange}
            disabled={isRunning}
          />
        </div>

        {/* Submit row */}
        <div className="form-actions">
          <button
            type="submit"
            className={`btn btn--primary ${!isReady ? "btn--disabled" : ""} ${isRunning ? "btn--loading" : ""}`}
            disabled={!isReady}
          >
            {isRunning ? LOADING_MESSAGES[loadingStep] : "Run Risk Simulation"}
          </button>
          {!isRunning && (
            <p className="form-action-hint">
              Simulation completes in seconds. No API key required.
            </p>
          )}
        </div>

        {/* Error */}
        {error && <p className="form-error">{error}</p>}
      </form>
    </div>
  );
}
