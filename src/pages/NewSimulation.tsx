import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, PlayCircle } from "lucide-react";
import { PageHeader } from "../components/PageHeader";
import { runRiskSimulation } from "../services/simulationService";
import type { CompanyType, DecisionType, SimulationInput } from "../types/risk";
import { useLanguage } from "../context/LanguageContext";

type FormState = {
  decisionText: string;
  decisionType: DecisionType;
  companyType: CompanyType;
  marketContext: string;
  additionalNotes: string;
};

const initialForm: FormState = {
  decisionText: "",
  decisionType: "",
  companyType: "",
  marketContext: "",
  additionalNotes: "",
};

const demoScenarios: Array<{
  label: string;
  decisionText: string;
  decisionType: DecisionType;
  companyType: CompanyType;
  marketContext: string;
  additionalNotes: string;
}> = [
  {
    label: "Increase instant transfer limit for newly registered users from RM500 to RM5,000.",
    decisionText:
      "Increase instant transfer limit for newly registered users from RM500 to RM5,000.",
    decisionType: "Transfer Limit Change",
    companyType: "E-Wallet",
    marketContext: "Malaysia, BNM-regulated e-wallet, new registered users.",
    additionalNotes:
      "Focus on mule account abuse, account takeover, AML/CFT reporting, false positives, and customer support workload.",
  },
  {
    label: "Use AI to automatically approve small personal loans without manual review.",
    decisionText:
      "Use AI to automatically approve small personal loans without manual review.",
    decisionType: "Credit / Loan Policy Change",
    companyType: "Loan Platform",
    marketContext: "Malaysia fintech lending context.",
    additionalNotes:
      "Focus on responsible lending, explainability, vulnerable users, synthetic identity fraud, and appeal handling.",
  },
  {
    label: "Automatically block transactions that look similar to scam payments.",
    decisionText:
      "Automatically block transactions that look similar to scam payments.",
    decisionType: "Fraud Rule Update",
    companyType: "Payment Gateway",
    marketContext: "Malaysia payment and consumer protection context.",
    additionalNotes:
      "Focus on scam prevention, false positives, appeal path, user trust, and operational escalation.",
  },
];

const decisionTypes: DecisionType[] = [
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

const companyTypes: CompanyType[] = [
  "Digital Bank",
  "E-Wallet",
  "Payment Gateway",
  "Loan Platform",
  "Buy Now Pay Later",
  "Crypto Exchange",
  "Insurance Tech",
  "Other Fintech",
];

export function NewSimulation() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const [form, setForm] = useState<FormState>(initialForm);
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Only decision text is required.
  // User does NOT need to select demo scenario / decision type / company type.
  const canSubmit = useMemo(() => {
    return form.decisionText.trim().length >= 5;
  }, [form.decisionText]);

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  }

  function applyDemoScenario(scenario: (typeof demoScenarios)[number]) {
    setForm({
      decisionText: scenario.decisionText,
      decisionType: scenario.decisionType,
      companyType: scenario.companyType,
      marketContext: scenario.marketContext,
      additionalNotes: scenario.additionalNotes,
    });
    setError(null);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!canSubmit || isRunning) return;

    setIsRunning(true);
    setError(null);

    try {
      const payload: SimulationInput = {
        decisionText: form.decisionText.trim(),

        // These two are optional for user.
        // If user does not select, we still allow simulation.
        decisionType: form.decisionType || "Other",
        companyType: form.companyType || "Other Fintech",

        marketContext: form.marketContext.trim(),
        additionalNotes: form.additionalNotes.trim(),
      };

      await runRiskSimulation(payload);
      navigate("/dashboard");
    } catch (err) {
      console.error("Simulation failed:", err);
      setError(t("simulationFailed") || "Simulation failed. Please try again.");
    } finally {
      setIsRunning(false);
    }
  }

  return (
    <div className="page-new-simulation">
      <PageHeader
        badge={t("newSimulation")}
        title={t("defineDecision")}
        subtitle={t("defineDecisionSubtitle")}
      />

      <section className="dashboard-section">
        <h2 className="section-title">{t("demoScenarios")}</h2>

        <div className="demo-scenario-row">
          {demoScenarios.map((scenario) => (
            <button
              key={scenario.label}
              type="button"
              className="demo-scenario-chip"
              onClick={() => applyDemoScenario(scenario)}
            >
              {scenario.label}
            </button>
          ))}
        </div>
      </section>

      <form className="simulation-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="decisionText">
            {t("decisionDescription")} <span className="required">*</span>
          </label>

          <textarea
            id="decisionText"
            value={form.decisionText}
            onChange={(event) => updateField("decisionText", event.target.value)}
            placeholder={t("decisionPlaceholder")}
            rows={6}
            required
          />

          <p className="form-hint">{t("decisionHint")}</p>
        </div>

        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="decisionType">{t("decisionType")}</label>

            <select
              id="decisionType"
              value={form.decisionType}
              onChange={(event) =>
                updateField("decisionType", event.target.value as DecisionType)
              }
            >
              <option value="">{t("selectType")}</option>
              {decisionTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="companyType">{t("companyType")}</label>

            <select
              id="companyType"
              value={form.companyType}
              onChange={(event) =>
                updateField("companyType", event.target.value as CompanyType)
              }
            >
              <option value="">{t("selectType")}</option>
              {companyTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="marketContext">
            {t("marketContext")} <span className="optional">({t("optional")})</span>
          </label>

          <input
            id="marketContext"
            value={form.marketContext}
            onChange={(event) => updateField("marketContext", event.target.value)}
            placeholder={t("marketPlaceholder")}
          />
        </div>

        <div className="form-group">
          <label htmlFor="additionalNotes">
            {t("additionalContext")}{" "}
            <span className="optional">({t("optional")})</span>
          </label>

          <textarea
            id="additionalNotes"
            value={form.additionalNotes}
            onChange={(event) => updateField("additionalNotes", event.target.value)}
            placeholder={t("additionalPlaceholder")}
            rows={5}
          />
        </div>

        {error && <p className="form-error">{error}</p>}

        <div className="form-actions">
          <button
            type="submit"
            className="btn btn--primary"
            disabled={!canSubmit || isRunning}
          >
            {isRunning ? (
              <>
                <Loader2 size={16} className="spin" />
                {t("buildingRiskSimulation")}
              </>
            ) : (
              <>
                <PlayCircle size={16} />
                {t("runRiskSimulation")}
              </>
            )}
          </button>

          <p className="simulation-hint">
            {canSubmit
              ? "Ready to run. Decision type and company type are optional."
              : "Type at least 5 characters to run a simulation."}
          </p>
        </div>
      </form>
    </div>
  );
}
