import { PageHeader } from "../components/PageHeader";
import { ShieldAlert, ScanSearch, FileCheck, Wrench, ArrowRightLeft } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

const FRAMEWORK_STEPS = [
  { icon: ScanSearch, step: "01", title: "Decision Parsing", desc: "The engine extracts the core policy change, identifies affected user segments, and maps the delta between current and proposed state." },
  { icon: ShieldAlert, step: "02", title: "Fraud Vector Simulation", desc: "Using a structured abuse pattern library, the engine models how adversarial actors — mule operators, ATO attackers, social engineers — could exploit the change." },
  { icon: ScanSearch, step: "03", title: "False Positive Modelling", desc: "Identifies which legitimate user segments would be caught by increased controls or velocity rules triggered by the new policy." },
  { icon: FileCheck, step: "04", title: "Compliance Mapping", desc: "Cross-references the decision against relevant regulatory frameworks: BNM AML/CFT, E-Money Guidelines, PDPA, and international standards where applicable." },
  { icon: Wrench, step: "05", title: "Control Plan Synthesis", desc: "Generates preventive, detective, and corrective controls with assigned ownership and priority levels — structured for immediate action." },
  { icon: ArrowRightLeft, step: "06", title: "Alternative Decision Generation", desc: "Proposes a safer variant of the decision that achieves the business objective while materially reducing the identified risk exposure." },
];

const RISK_DIMENSIONS = [
  { label: "Fraud Risk", desc: "Exploitation by external bad actors including mule operators, account takeover attackers, and social engineers." },
  { label: "Compliance Risk", desc: "Regulatory obligation violations across AML/CFT, e-money guidelines, data protection, and fair treatment requirements." },
  { label: "False Positive Risk", desc: "Legitimate users incorrectly blocked, delayed, or degraded by controls triggered by the new policy." },
  { label: "User Harm Risk", desc: "Checks whether a decision may expose real users to financial loss, unfair denial, delayed access to funds, or unsafe financial behaviour." },
  { label: "Operational Risk", desc: "Internal capacity and process strain — support queue overload, miscalibrated rules, and review workflow failures." },
  { label: "Reputation Risk", desc: "Public trust and brand exposure from adverse media, user complaints, or regulator scrutiny." },
];

export function Method() {
  const { t, tx } = useLanguage();

  return (
    <div className="page-method">
      <PageHeader badge={t("assessmentFramework")} title={t("methodTitle")} subtitle={t("methodSubtitle")} />

      <section className="method-section">
        <h2 className="section-title">{t("sixRiskDimensions")}</h2>
        <p className="method-body">{t("sixRiskDimensionsDesc")}</p>
        <div className="dimension-grid dimension-grid--6">
          {RISK_DIMENSIONS.map((dimension, index) => (
            <div key={dimension.label} className="dimension-card">
              <span className="dimension-num">{String(index + 1).padStart(2, "0")}</span>
              <h3 className="dimension-label">{tx(dimension.label)}</h3>
              <p className="dimension-desc">{tx(dimension.desc)}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="method-section">
        <h2 className="section-title">{t("assessmentPipeline")}</h2>
        <div className="framework-steps">
          {FRAMEWORK_STEPS.map(({ icon: Icon, step, title, desc }) => (
            <div key={step} className="framework-step">
              <div className="step-header">
                <div className="step-icon"><Icon size={16} /></div>
                <span className="step-num">{step}</span>
              </div>
              <h3 className="step-title">{tx(title)}</h3>
              <p className="step-desc">{tx(desc)}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="method-section">
        <h2 className="section-title">{t("riskScoringModel")}</h2>
        <div className="scoring-formula-box">
          <p className="scoring-formula-label">{t("internalScoreFormula")}</p>
          <p className="scoring-formula">{t("formulaText")}</p>
          <p className="scoring-formula-note">{t("formulaNote")}</p>
        </div>

        <div className="scoring-table">
          {[
            { range: "0 – 30", levelKey: "low", desc: "Minimal risk. Standard controls sufficient.", cls: "low" },
            { range: "31 – 55", levelKey: "medium", desc: "Moderate risk. Enhanced monitoring and pilot approach recommended.", cls: "medium" },
            { range: "56 – 84", levelKey: "high", desc: "Significant risk. Control plan required before launch.", cls: "high" },
            { range: "85 – 100", levelKey: "critical", desc: "Unacceptable risk. Do not launch without major redesign and senior approval.", cls: "critical" },
          ].map((row) => (
            <div key={row.range} className={`scoring-row scoring-row--${row.cls}`}>
              <span className="scoring-range">{row.range}</span>
              <span className={`scoring-level badge--${row.cls}`}>{t(row.levelKey)}</span>
              <p className="scoring-desc">{tx(row.desc)}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="method-section">
        <div className="disclaimer-box">
          <h3 className="disclaimer-title">{t("scopeLimitations")}</h3>
          <p className="disclaimer-body">{t("disclaimerText")}</p>
        </div>
      </section>
    </div>
  );
}
