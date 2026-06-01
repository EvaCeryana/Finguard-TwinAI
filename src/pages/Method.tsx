import { PageHeader } from "../components/PageHeader";
import { ShieldAlert, ScanSearch, FileCheck, Wrench, ArrowRightLeft } from "lucide-react";

const FRAMEWORK_STEPS = [
  {
    icon: ScanSearch,
    step: "01",
    title: "Decision Parsing",
    desc: "The engine extracts the core policy change, identifies affected user segments, and maps the delta between current and proposed state.",
  },
  {
    icon: ShieldAlert,
    step: "02",
    title: "Fraud Vector Simulation",
    desc: "Using a structured abuse pattern library, the engine models how adversarial actors — mule operators, ATO attackers, social engineers — could exploit the change.",
  },
  {
    icon: ScanSearch,
    step: "03",
    title: "False Positive Modelling",
    desc: "Identifies which legitimate user segments would be caught by increased controls or velocity rules triggered by the new policy.",
  },
  {
    icon: FileCheck,
    step: "04",
    title: "Compliance Mapping",
    desc: "Cross-references the decision against relevant regulatory frameworks: BNM AML/CFT, E-Money Guidelines, PDPA, and international standards where applicable.",
  },
  {
    icon: Wrench,
    step: "05",
    title: "Control Plan Synthesis",
    desc: "Generates preventive, detective, and corrective controls with assigned ownership and priority levels — structured for immediate action.",
  },
  {
    icon: ArrowRightLeft,
    step: "06",
    title: "Alternative Decision Generation",
    desc: "Proposes a safer variant of the decision that achieves the business objective while materially reducing the identified risk exposure.",
  },
];

// Six dimensions — User Harm Risk added
const RISK_DIMENSIONS = [
  {
    label: "Fraud Risk",
    desc: "Exploitation by external bad actors including mule operators, account takeover attackers, and social engineers.",
  },
  {
    label: "Compliance Risk",
    desc: "Regulatory obligation violations across AML/CFT, e-money guidelines, data protection, and fair treatment requirements.",
  },
  {
    label: "False Positive Risk",
    desc: "Legitimate users incorrectly blocked, delayed, or degraded by controls triggered by the new policy.",
  },
  {
    label: "User Harm Risk",
    desc: "Checks whether a decision may expose real users to financial loss, unfair denial, delayed access to funds, or unsafe financial behaviour.",
  },
  {
    label: "Operational Risk",
    desc: "Internal capacity and process strain — support queue overload, miscalibrated rules, and review workflow failures.",
  },
  {
    label: "Reputation Risk",
    desc: "Public trust and brand exposure from adverse media, user complaints, or regulator scrutiny.",
  },
];

export function Method() {
  return (
    <div className="page-method">
      <PageHeader
        badge="Assessment Framework"
        title="How FinGuard Twin AI Works"
        subtitle="A structured, repeatable methodology for pre-launch risk assessment of fintech decisions."
      />

      {/* ── Six Risk Dimensions ─────────────────────────────────────────── */}
      <section className="method-section">
        <h2 className="section-title">Six Risk Dimensions</h2>
        <p className="method-body">
          Every simulation assesses the proposed decision across six structured dimensions,
          producing a composite risk score and per-dimension analysis.
        </p>
        <div className="dimension-grid dimension-grid--6">
          {RISK_DIMENSIONS.map((d, i) => (
            <div key={d.label} className="dimension-card">
              <span className="dimension-num">{String(i + 1).padStart(2, "0")}</span>
              <h3 className="dimension-label">{d.label}</h3>
              <p className="dimension-desc">{d.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Assessment Pipeline ─────────────────────────────────────────── */}
      <section className="method-section">
        <h2 className="section-title">Assessment Pipeline</h2>
        <div className="framework-steps">
          {FRAMEWORK_STEPS.map(({ icon: Icon, step, title, desc }) => (
            <div key={step} className="framework-step">
              <div className="step-header">
                <div className="step-icon">
                  <Icon size={16} />
                </div>
                <span className="step-num">{step}</span>
              </div>
              <h3 className="step-title">{title}</h3>
              <p className="step-desc">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Risk Scoring Model ──────────────────────────────────────────── */}
      <section className="method-section">
        <h2 className="section-title">Risk Scoring Model</h2>

        <div className="scoring-formula-box">
          <p className="scoring-formula-label">Internal score formula</p>
          <p className="scoring-formula">
            Internal Risk Score = Likelihood × Impact × Control Gap
          </p>
          <p className="scoring-formula-note">
            Each factor is scored from 1 to 5. Maximum internal score is 125.
            FinGuard Twin AI normalises this to a 0–100 display score for dashboard readability.
          </p>
        </div>

        <div className="scoring-table">
          {[
            {
              range: "0 – 30",
              level: "Low",
              desc: "Minimal risk. Standard controls sufficient.",
              cls: "low",
            },
            {
              range: "31 – 55",
              level: "Medium",
              desc: "Moderate risk. Enhanced monitoring and pilot approach recommended.",
              cls: "medium",
            },
            {
              range: "56 – 84",
              level: "High",
              desc: "Significant risk. Control plan required before launch.",
              cls: "high",
            },
            {
              range: "85 – 100",
              level: "Critical",
              desc: "Unacceptable risk. Do not launch without major redesign and senior approval.",
              cls: "critical",
            },
          ].map((row) => (
            <div key={row.range} className={`scoring-row scoring-row--${row.cls}`}>
              <span className="scoring-range">{row.range}</span>
              <span className={`scoring-level badge--${row.cls}`}>{row.level}</span>
              <p className="scoring-desc">{row.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Disclaimer ─────────────────────────────────────────────────── */}
      <section className="method-section">
        <div className="disclaimer-box">
          <h3 className="disclaimer-title">Scope & Limitations</h3>
          <p className="disclaimer-body">
            FinGuard Twin AI is a decision-support simulation tool. It does not process real
            customer financial data, does not make credit decisions, and does not replace legal,
            compliance, or professional risk review. Outputs are structured risk assessments
            intended to support — not replace — human compliance and fraud risk judgement.
            All simulations are based on the information provided and the engine's modelled risk patterns.
          </p>
        </div>
      </section>
    </div>
  );
}
