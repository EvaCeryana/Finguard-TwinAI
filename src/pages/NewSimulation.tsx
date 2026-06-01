import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown, Info } from "lucide-react";
import { PageHeader } from "../components/PageHeader";
import { runRiskSimulation } from "../services/simulationService";
import type { DecisionType, CompanyType, SimulationInput } from "../types/risk";
import { useLanguage } from "../context/LanguageContext";

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

const DEMO_DECISIONS = [
  "Increase instant transfer limit for newly registered users from RM500 to RM5,000.",
  "Use AI to automatically approve small personal loans without manual review.",
  "Automatically block transactions that look similar to scam payments.",
];

const LOADING_KEYS = [
  "buildingRiskSimulation",
  "mappingFraudScenarios",
  "estimatingFalsePositive",
  "generatingControlPlan",
  "preparingSaferAlternative",
];

export function NewSimulation() {
  const navigate = useNavigate();
  const { t, tx } = useLanguage();

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

  useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(() => {
      setLoadingStep((prev) => (prev + 1) % LOADING_KEYS.length);
    }, 600);
    return () => clearInterval(interval);
  }, [isRunning]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
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
      setError(t("simulationFailed"));
      setIsRunning(false);
    }
  }

  const isReady = form.decisionText.trim().length > 20 && !isRunning;

  return (
    <div className="page-simulate">
      <PageHeader
        badge={t("newSimulation")}
        title={t("defineDecision")}
        subtitle={t("defineDecisionSubtitle")}
      />

      <div className="example-prompts">
        <span className="example-label">
          <Info size={12} /> {t("demoScenarios")}
        </span>
        <div className="example-chips">
          {DEMO_DECISIONS.map((ex) => (
            <button key={ex} className="example-chip" onClick={() => fillDemo(ex)} disabled={isRunning}>
              {tx(ex)}
            </button>
          ))}
        </div>
      </div>

      <form className="sim-form" onSubmit={handleSubmit}>
        <div className="form-field form-field--primary">
          <label className="form-label" htmlFor="decisionText">
            {t("decisionDescription")} <span className="form-required">*</span>
          </label>
          <textarea
            id="decisionText"
            name="decisionText"
            className="form-textarea"
            rows={5}
            placeholder={t("decisionPlaceholder")}
            value={form.decisionText}
            onChange={handleChange}
            disabled={isRunning}
          />
          <span className="form-hint">{t("decisionHint")}</span>
        </div>

        <div className="form-row">
          <div className="form-field">
            <label className="form-label" htmlFor="decisionType">{t("decisionType")}</label>
            <div className="select-wrapper">
              <select id="decisionType" name="decisionType" className="form-select" value={form.decisionType} onChange={handleChange} disabled={isRunning}>
                <option value="">{t("selectType")}</option>
                {DECISION_TYPES.map((type) => (
                  <option key={type} value={type}>{tx(type)}</option>
                ))}
              </select>
              <ChevronDown size={14} className="select-icon" />
            </div>
          </div>

          <div className="form-field">
            <label className="form-label" htmlFor="companyType">{t("companyType")}</label>
            <div className="select-wrapper">
              <select id="companyType" name="companyType" className="form-select" value={form.companyType} onChange={handleChange} disabled={isRunning}>
                <option value="">{t("selectType")}</option>
                {COMPANY_TYPES.map((type) => (
                  <option key={type} value={type}>{tx(type)}</option>
                ))}
              </select>
              <ChevronDown size={14} className="select-icon" />
            </div>
          </div>
        </div>

        <div className="form-field">
          <label className="form-label" htmlFor="marketContext">
            {t("marketContext")} <span className="form-optional">({t("optional")})</span>
          </label>
          <input
            id="marketContext"
            name="marketContext"
            type="text"
            className="form-input"
            placeholder={t("marketPlaceholder")}
            value={form.marketContext}
            onChange={handleChange}
            disabled={isRunning}
          />
        </div>

        <div className="form-field">
          <label className="form-label" htmlFor="additionalNotes">
            {t("additionalContext")} <span className="form-optional">({t("optional")})</span>
          </label>
          <textarea
            id="additionalNotes"
            name="additionalNotes"
            className="form-textarea"
            rows={3}
            placeholder={t("additionalPlaceholder")}
            value={form.additionalNotes}
            onChange={handleChange}
            disabled={isRunning}
          />
        </div>

        <div className="form-actions">
          <button
            type="submit"
            className={`btn btn--primary ${!isReady ? "btn--disabled" : ""} ${isRunning ? "btn--loading" : ""}`}
            disabled={!isReady}
          >
            {isRunning ? t(LOADING_KEYS[loadingStep]) : t("runRiskSimulation")}
          </button>
          {!isRunning && <p className="form-action-hint">{t("simulationHint")}</p>}
        </div>

        {error && <p className="form-error">{error}</p>}
      </form>
    </div>
  );
}
