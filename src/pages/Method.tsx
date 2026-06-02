import {
  ArrowRightLeft,
  FileCheck,
  ScanSearch,
  ShieldAlert,
  Wrench,
} from "lucide-react";

import { PageHeader } from "../components/PageHeader";
import { useLanguage } from "../context/LanguageContext";

const riskDimensions = [
  {
    label: "Fraud Risk",
    description:
      "Looks at how bad actors may exploit a product decision, such as mule accounts, account takeover, scam activity, or coordinated abuse.",
  },
  {
    label: "Compliance Risk",
    description:
      "Checks whether the decision may create gaps in AML/CFT, e-money rules, data protection, audit trail, or fair treatment obligations.",
  },
  {
    label: "False Positive Risk",
    description:
      "Reviews which legitimate users may be blocked, delayed, rejected, or sent for unnecessary review because of the new rule.",
  },
  {
    label: "User Harm Risk",
    description:
      "Considers whether users may face financial loss, unfair denial, delayed access to funds, or unsafe financial outcomes.",
  },
  {
    label: "Operational Risk",
    description:
      "Estimates the pressure on internal teams, including support tickets, review queues, rule tuning, and escalation workflows.",
  },
  {
    label: "Reputation Risk",
    description:
      "Considers public trust, complaints, regulator attention, and brand damage if the decision causes visible user harm.",
  },
];

const assessmentSteps = [
  {
    icon: ScanSearch,
    step: "01",
    title: "Decision Parsing",
    description:
      "The system reads the proposed fintech decision and identifies what is changing, who is affected, and where the exposure may increase.",
  },
  {
    icon: ShieldAlert,
    step: "02",
    title: "Fraud Vector Review",
    description:
      "It checks how fraudsters, mule account operators, account takeover attackers, or scammers could take advantage of the change.",
  },
  {
    icon: ScanSearch,
    step: "03",
    title: "False Positive Review",
    description:
      "It checks which normal users may be wrongly blocked or delayed when stricter rules are applied.",
  },
  {
    icon: FileCheck,
    step: "04",
    title: "Compliance Mapping",
    description:
      "The decision is compared against relevant compliance areas such as BNM AML/CFT, e-money controls, PDPA, and fair treatment expectations.",
  },
  {
    icon: Wrench,
    step: "05",
    title: "Control Plan",
    description:
      "The report suggests preventive, detective, and corrective controls, with owners and priority levels.",
  },
  {
    icon: ArrowRightLeft,
    step: "06",
    title: "Safer Alternative",
    description:
      "The system proposes a safer version of the decision that keeps the business goal but reduces the main risk exposure.",
  },
];

const scoringRows = [
  {
    range: "0 – 30",
    levelKey: "low",
    description: "Minimal risk. Standard controls are usually enough.",
    className: "low",
  },
  {
    range: "31 – 55",
    levelKey: "medium",
    description:
      "Moderate risk. A pilot launch and closer monitoring are recommended.",
    className: "medium",
  },
  {
    range: "56 – 84",
    levelKey: "high",
    description:
      "Significant risk. A control plan should be prepared before launch.",
    className: "high",
  },
  {
    range: "85 – 100",
    levelKey: "critical",
    description:
      "Unacceptable risk. The decision should be redesigned before launch.",
    className: "critical",
  },
];

function formatStepNumber(index: number) {
  return String(index + 1).padStart(2, "0");
}

export function Method() {
  const { t, tx } = useLanguage();

  return (
    <div className="page-method">
      <PageHeader
        badge={t("assessmentFramework")}
        title={t("methodTitle")}
        subtitle={t("methodSubtitle")}
      />

      <section className="method-section">
        <h2 className="section-title">{t("sixRiskDimensions")}</h2>

        <p className="method-body">
          {t("sixRiskDimensionsDesc")}
        </p>

        <div className="dimension-grid dimension-grid--6">
          {riskDimensions.map((dimension, index) => (
            <div key={dimension.label} className="dimension-card">
              <span className="dimension-num">
                {formatStepNumber(index)}
              </span>

              <h3 className="dimension-label">
                {tx(dimension.label)}
              </h3>

              <p className="dimension-desc">
                {tx(dimension.description)}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="method-section">
        <h2 className="section-title">{t("assessmentPipeline")}</h2>

        <div className="framework-steps">
          {assessmentSteps.map((item) => {
            const StepIcon = item.icon;

            return (
              <div key={item.step} className="framework-step">
                <div className="step-header">
                  <div className="step-icon" aria-hidden="true">
                    <StepIcon size={16} />
                  </div>

                  <span className="step-num">{item.step}</span>
                </div>

                <h3 className="step-title">
                  {tx(item.title)}
                </h3>

                <p className="step-desc">
                  {tx(item.description)}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="method-section">
        <h2 className="section-title">{t("riskScoringModel")}</h2>

        <div className="scoring-formula-box">
          <p className="scoring-formula-label">
            {t("internalScoreFormula")}
          </p>

          <p className="scoring-formula">
            {t("formulaText")}
          </p>

          <p className="scoring-formula-note">
            {t("formulaNote")}
          </p>
        </div>

        <div className="scoring-table">
          {scoringRows.map((row) => (
            <div
              key={row.range}
              className={`scoring-row scoring-row--${row.className}`}
            >
              <span className="scoring-range">{row.range}</span>

              <span className={`scoring-level badge--${row.className}`}>
                {t(row.levelKey)}
              </span>

              <p className="scoring-desc">
                {tx(row.description)}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="method-section">
        <div className="disclaimer-box">
          <h3 className="disclaimer-title">
            {t("scopeLimitations")}
          </h3>

          <p className="disclaimer-body">
            {t("disclaimerText")}
          </p>
        </div>
      </section>
    </div>
  );
}
