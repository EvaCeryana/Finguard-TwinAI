import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, PlayCircle } from "lucide-react";

import { PageHeader } from "../components/PageHeader";
import { useLanguage } from "../context/LanguageContext";
import { runRiskSimulation } from "../services/simulationService";
import type { CompanyType, DecisionType, SimulationInput } from "../types/risk";

type SimulationForm = {
  decisionText: string;
  decisionType: DecisionType;
  companyType: CompanyType;
  marketContext: string;
  additionalNotes: string;
};

type DemoScenario = SimulationForm & {
  label: string;
};

const emptyForm: SimulationForm = {
  decisionText: "",
  decisionType: "",
  companyType: "",
  marketContext: "",
  additionalNotes: "",
};

const demoScenarios: DemoScenario[] = [
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

const decisionTypeOptions: DecisionType[] = [
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

const companyTypeOptions: CompanyType[] = [
  "Digital Bank",
  "E-Wallet",
  "Payment Gateway",
  "Loan Platform",
  "Buy Now Pay Later",
  "Crypto Exchange",
  "Insurance Tech",
  "Other Fintech",
];

function buildSimulationPayload(form: SimulationForm): SimulationInput {
  return {
    decisionText: form.decisionText.trim(),
    decisionType: form.decisionType || "Other",
    companyType: form.companyType || "Other Fintech",
    marketContext: form.marketContext.trim(),
    additionalNotes: form.additionalNotes.trim(),
  };
}

export function NewSimulation() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const [form, setForm] = useState<SimulationForm>(emptyForm);
  const [isRunning, setIsRunning] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const canRunSimulation = useMemo(() => {
    return form.decisionText.trim().length >= 5;
  }, [form.decisionText]);

  function updateFormField<K extends keyof SimulationForm>(
    field: K,
    value: SimulationForm[K]
  ) {
    setForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }));
  }

  function useDemoScenario(scenario: DemoScenario) {
    setForm({
      decisionText: scenario.decisionText,
      decisionType: scenario.decisionType,
      companyType: scenario.companyType,
      marketContext: scenario.marketContext,
      additionalNotes: scenario.additionalNotes,
    });

    setErrorMessage(null);
  }

  async function submitSimulation(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!canRunSimulation || isRunning) {
      return;
    }

    setIsRunning(true);
    setErrorMessage(null);

    try {
      const payload = buildSimulationPayload(form);

      await runRiskSimulation(payload);
      navigate("/dashboard");
    } catch (error) {
      console.error("Simulation failed:", error);
      setErrorMessage(t("simulationFailed") || "Simulation failed. Please try again.");
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
              onClick={() => useDemoScenario(scenario)}
            >
              {scenario.label}
            </button>
          ))}
        </div>
      </section>

      <form className="simulation-form" onSubmit={submitSimulation}>
        <div className="form-group">
          <label htmlFor="decisionText">
            {t("decisionDescription")} <span className="required">*</span>
          </label>

          <textarea
            id="decisionText"
            value={form.decisionText}
            onChange={(event) =>
              updateFormField("decisionText", event.target.value)
            }
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
                updateFormField("decisionType", event.target.value as DecisionType)
              }
            >
              <option value="">{t("selectType")}</option>

              {decisionTypeOptions.map((type) => (
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
                updateFormField("companyType", event.target.value as CompanyType)
              }
            >
              <option value="">{t("selectType")}</option>

              {companyTypeOptions.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="marketContext">
            {t("marketContext")}{" "}
            <span className="optional">({t("optional")})</span>
          </label>

          <input
            id="marketContext"
            value={form.marketContext}
            onChange={(event) =>
              updateFormField("marketContext", event.target.value)
            }
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
            onChange={(event) =>
              updateFormField("additionalNotes", event.target.value)
            }
            placeholder={t("additionalPlaceholder")}
            rows={5}
          />
        </div>

        {errorMessage ? <p className="form-error">{errorMessage}</p> : null}

        <div className="form-actions">
          <button
            type="submit"
            className="btn btn--primary"
            disabled={!canRunSimulation || isRunning}
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
            {canRunSimulation
              ? "Ready to run. Decision type and company type are optional."
              : "Type at least 5 characters to run a simulation."}
          </p>
        </div>
      </form>
    </div>
  );
}
