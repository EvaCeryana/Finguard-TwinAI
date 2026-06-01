import { Link } from "react-router-dom";
import { ArrowLeft, Download, Cpu } from "lucide-react";
import { PageHeader } from "../components/PageHeader";
import { MetricCard } from "../components/MetricCard";
import { RiskRatingBadge } from "../components/RiskRatingBadge";
import { RiskMatrixTable } from "../components/RiskMatrixTable";
import { AbuseScenarioCard, FalsePositiveCard } from "../components/ScenarioCard";
import { ControlPlanTable } from "../components/ControlPlanTable";
import { AlternativeDecisionBox } from "../components/AlternativeDecisionBox";
import { getLatestAssessment } from "../services/simulationService";
import { sampleAssessment } from "../data/sampleAssessment";
import { exportAssessmentReport } from "../utils/exportReport";

// Humanise raw enum fragments that may appear in Gemini / fallback output
function humanizeRecommendation(text: string): string {
  return text
    .replace(/\bgo-with-mitigation\b/gi, "Launch with mitigation")
    .replace(/\bno-go\b/gi, "Do not launch")
    .replace(/\bproceed\b(?!\s+with)/gi, "Proceed with monitoring");
}

export function RiskDashboard() {
  const latest = getLatestAssessment();
  const assessment = latest ?? sampleAssessment;
  const isLiveResult = latest !== null;

  const criticalCount = assessment.riskMatrix.filter((r) => r.riskLevel === "critical").length;
  const highCount     = assessment.riskMatrix.filter((r) => r.riskLevel === "high").length;

  const recommendation = assessment.launchRecommendation
    ? humanizeRecommendation(assessment.launchRecommendation)
    : undefined;

  const isCritical = assessment.overallRiskLevel === "critical";

  // Engine badge
  const engineLabel =
    assessment.engineUsed === "gemini" ? "Gemini AI" : "Fallback Engine";

  return (
    <div className="page-dashboard">

      {/* ── Topbar ─────────────────────────────────────────────────────── */}
      <div className="dashboard-topbar">
        <Link to="/history" className="back-link">
          <ArrowLeft size={14} /> All Simulations
        </Link>

        <div className="dashboard-topbar-right">
          {!isLiveResult && (
            <span className="demo-banner">
              Sample data — run a simulation to generate a live report
            </span>
          )}

          {assessment.engineUsed && (
            <span className="engine-badge">
              <Cpu size={11} />
              {engineLabel}
            </span>
          )}

          <button
            className="btn btn--ghost btn--sm"
            onClick={() => exportAssessmentReport(assessment)}
            title="Download .txt risk report"
          >
            <Download size={14} />
            Export Report
          </button>
        </div>
      </div>

      {/* ── Page Header ────────────────────────────────────────────────── */}
      <PageHeader
        badge={`Simulation · ${assessment.id}`}
        title="Risk Assessment Report"
        subtitle={assessment.decisionSummary}
      />

      {/* ── Block 1: Summary Metrics ────────────────────────────────────── */}
      <div className="metric-row">
        <MetricCard
          label="Risk Score (0–100)"
          value={`${assessment.overallRiskScore} / 100`}
          sub="Display score"
          accent="amber"
        />
        <MetricCard
          label="Critical Risks"
          value={criticalCount}
          sub="Require immediate action"
          accent="red"
        />
        <MetricCard
          label="High Risks"
          value={highCount}
          sub="Require control plan"
          accent="amber"
        />
        <MetricCard
          label="Controls Recommended"
          value={assessment.controlPlan.length}
          sub="Across all risk areas"
          accent="cyan"
        />
      </div>

      {/* ── Block 2: Final Risk Rating ──────────────────────────────────── */}
      <div className="rating-banner">
        <div className="rating-banner-left">
          <p className="rating-banner-label">Final Risk Rating</p>
          <RiskRatingBadge
            level={assessment.overallRiskLevel}
            score={assessment.overallRiskScore}
            size="lg"
          />
          {assessment.internalRiskScore !== undefined && (
            <p className="internal-score-note">
              <Cpu size={11} />
              Internal model score: {assessment.internalRiskScore} / 125
            </p>
          )}
        </div>

        <div className="rating-banner-right">
          <p className="rating-banner-label">Decision Input</p>
          <p className="rating-banner-decision">{assessment.decisionInput}</p>
        </div>
      </div>

      {/* ── Block 3: Main Concern + Launch Recommendation ──────────────── */}
      {(assessment.mainConcern || recommendation) && (
        <section className="dashboard-section">
          <div className="concern-row">
            {assessment.mainConcern && (
              <div className="concern-card concern-card--main">
                <p className="concern-label">Main Concern</p>
                <p className="concern-text">{assessment.mainConcern}</p>
              </div>
            )}

            {recommendation && (
              <div
                className={`concern-card ${
                  isCritical
                    ? "concern-card--launch-critical"
                    : "concern-card--launch"
                }`}
              >
                <p className="concern-label">Launch Recommendation</p>
                <p className="concern-text">{recommendation}</p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── Block 4: Affected Stakeholders ─────────────────────────────── */}
      <section className="dashboard-section">
        <h2 className="section-title">Affected Stakeholders</h2>
        <div className="stakeholder-grid">
          {assessment.affectedStakeholders.map((s) => (
            <div key={s.role} className="stakeholder-card">
              <p className="stakeholder-role">{s.role}</p>
              <p className="stakeholder-impact">{s.impact}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Block 5: Risk Matrix ────────────────────────────────────────── */}
      <section className="dashboard-section">
        <h2 className="section-title">Risk Matrix</h2>
        <RiskMatrixTable entries={assessment.riskMatrix} />
      </section>

      {/* ── Block 6: Fraud Abuse Scenarios ─────────────────────────────── */}
      <section className="dashboard-section">
        <h2 className="section-title">Fraud Abuse Scenarios</h2>
        <p className="section-sub">
          How a bad actor could exploit this decision if deployed as-is.
        </p>
        <div className="scenario-grid">
          {assessment.abuseScenarios.map((s, i) => (
            <AbuseScenarioCard key={s.id} scenario={s} index={i} />
          ))}
        </div>
      </section>

      {/* ── Block 7: False Positive Impact ─────────────────────────────── */}
      <section className="dashboard-section">
        <h2 className="section-title">False Positive Impact</h2>
        <p className="section-sub">
          Legitimate users who could be incorrectly blocked or degraded.
        </p>
        <div className="scenario-grid">
          {assessment.falsePositiveScenarios.map((s, i) => (
            <FalsePositiveCard key={s.id} scenario={s} index={i} />
          ))}
        </div>
      </section>

      {/* ── Block 8: Compliance Concerns ───────────────────────────────── */}
      <section className="dashboard-section">
        <h2 className="section-title">Compliance Concerns</h2>
        <div className="compliance-list">
          {assessment.complianceConcerns.map((c) => (
            <div
              key={c.id}
              className={`compliance-item compliance-item--${c.severity}`}
            >
              <div className="compliance-item-header">
                <span className="compliance-regulation">{c.regulation}</span>
                <RiskRatingBadge level={c.severity} size="sm" />
              </div>
              <p className="compliance-concern">{c.concern}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Block 9: Operational + Reputation ─────────────────────────── */}
      <section className="dashboard-section">
        <div className="risk-lists-row">
          <div className="risk-list-col">
            <h2 className="section-title">Operational Risks</h2>
            <ul className="risk-bullet-list">
              {assessment.operationalRisks.map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>
          </div>
          <div className="risk-list-col">
            <h2 className="section-title">Reputation Risks</h2>
            <ul className="risk-bullet-list">
              {assessment.reputationRisks.map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ── Block 10: Control Plan ─────────────────────────────────────── */}
      <section className="dashboard-section">
        <h2 className="section-title">Recommended Control Plan</h2>
        <p className="section-sub">
          Prioritised actions to bring this decision to an acceptable risk level.
        </p>
        <ControlPlanTable controls={assessment.controlPlan} />
      </section>

      {/* ── Block 11: Safer Alternative ────────────────────────────────── */}
      <section className="dashboard-section">
        <h2 className="section-title">Safer Alternative</h2>
        <AlternativeDecisionBox alternative={assessment.saferAlternative} />
      </section>

    </div>
  );
}
