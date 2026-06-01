import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Download, Cpu, ChevronDown, ChevronUp } from "lucide-react";
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
import { useLanguage } from "../context/LanguageContext";

function humanizeRecommendation(text: string): string {
  return text
    .replace(/\bgo-with-mitigation\b/gi, "Launch with mitigation")
    .replace(/\bno-go\b/gi, "Do not launch")
    .replace(/\bproceed\b(?!\s+with)/gi, "Proceed with monitoring");
}

export function RiskDashboard() {
  const { t, tx } = useLanguage();
  const [showDetails, setShowDetails] = useState(false);

  const latest = getLatestAssessment();
  const assessment = latest ?? sampleAssessment;
  const isLiveResult = latest !== null;

  const criticalCount = assessment.riskMatrix.filter((r) => r.riskLevel === "critical").length;
  const highCount = assessment.riskMatrix.filter((r) => r.riskLevel === "high").length;

  const recommendation = assessment.launchRecommendation
    ? humanizeRecommendation(assessment.launchRecommendation)
    : undefined;

  const isCritical = assessment.overallRiskLevel === "critical";
  const engineLabel = assessment.engineUsed === "gemini" ? "Gemini AI" : "Fallback Engine";

  return (
    <div className="page-dashboard">
      <div className="dashboard-topbar">
        <Link to="/history" className="back-link">
          <ArrowLeft size={14} /> {t("allSimulations")}
        </Link>

        <div className="dashboard-topbar-right">
          {!isLiveResult && <span className="demo-banner">{t("sampleData")}</span>}

          {assessment.engineUsed && (
            <span className="engine-badge">
              <Cpu size={11} />
              {tx(engineLabel)}
            </span>
          )}

          <button
            className="btn btn--ghost btn--sm"
            onClick={() => exportAssessmentReport(assessment)}
            title={t("exportReport")}
          >
            <Download size={14} />
            {t("exportReport")}
          </button>
        </div>
      </div>

      <PageHeader
        badge={`Simulation · ${assessment.id}`}
        title={t("riskAssessmentReport")}
        subtitle={tx(assessment.decisionSummary)}
      />

      <div className="metric-row">
        <MetricCard label={t("riskScore")} value={`${assessment.overallRiskScore} / 100`} sub={t("displayScore")} accent="amber" />
        <MetricCard label={t("criticalRisks")} value={criticalCount} sub={t("requireImmediateAction")} accent="red" />
        <MetricCard label={t("highRisks")} value={highCount} sub={t("requireControlPlan")} accent="amber" />
        <MetricCard label={t("controlsRecommended")} value={assessment.controlPlan.length} sub={t("acrossAllRiskAreas")} accent="cyan" />
      </div>

      <div className="rating-banner">
        <div className="rating-banner-left">
          <p className="rating-banner-label">{t("finalRiskRating")}</p>
          <RiskRatingBadge level={assessment.overallRiskLevel} score={assessment.overallRiskScore} size="lg" />
          {assessment.internalRiskScore !== undefined && (
            <p className="internal-score-note">
              <Cpu size={11} />
              {t("internalModelScore")}: {assessment.internalRiskScore} / 125
            </p>
          )}
        </div>

        <div className="rating-banner-right">
          <p className="rating-banner-label">{t("decisionInput")}</p>
          <p className="rating-banner-decision">{tx(assessment.decisionInput)}</p>
        </div>
      </div>

      {(assessment.mainConcern || recommendation) && (
        <section className="dashboard-section">
          <div className="concern-row">
            {assessment.mainConcern && (
              <div className="concern-card concern-card--main">
                <p className="concern-label">{t("mainConcern")}</p>
                <p className="concern-text">{tx(assessment.mainConcern)}</p>
              </div>
            )}

            {recommendation && (
              <div className={`concern-card ${isCritical ? "concern-card--launch-critical" : "concern-card--launch"}`}>
                <p className="concern-label">{t("launchRecommendation")}</p>
                <p className="concern-text">{tx(recommendation)}</p>
              </div>
            )}
          </div>
        </section>
      )}

      <section className="dashboard-section">
        <h2 className="section-title">{t("affectedStakeholders")}</h2>
        <div className="stakeholder-grid">
          {assessment.affectedStakeholders.map((stakeholder) => (
            <div key={stakeholder.role} className="stakeholder-card">
              <p className="stakeholder-role">{tx(stakeholder.role)}</p>
              <p className="stakeholder-impact">{tx(stakeholder.impact)}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="dashboard-section">
        <h2 className="section-title">{t("riskMatrix")}</h2>
        <RiskMatrixTable entries={assessment.riskMatrix} />
      </section>

      <section className="dashboard-section details-toggle-section">
        <div className="details-toggle-card">
          <div>
            <p className="section-eyebrow">{t("detailedAnalysis")}</p>
            <p className="details-toggle-hint">{t("detailedAnalysisHint")}</p>
          </div>
          <button className="btn btn--ghost btn--sm" type="button" onClick={() => setShowDetails((current) => !current)}>
            {showDetails ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            {showDetails ? t("hideDetailedAnalysis") : t("showDetailedAnalysis")}
          </button>
        </div>
      </section>

      {showDetails && (
        <div className="details-panel">
          <section className="dashboard-section">
            <h2 className="section-title">{t("fraudAbuseScenarios")}</h2>
            <p className="section-sub">{t("fraudAbuseSub")}</p>
            <div className="scenario-grid">
              {assessment.abuseScenarios.map((scenario, index) => (
                <AbuseScenarioCard key={scenario.id} scenario={scenario} index={index} />
              ))}
            </div>
          </section>

          <section className="dashboard-section">
            <h2 className="section-title">{t("falsePositiveImpact")}</h2>
            <p className="section-sub">{t("falsePositiveSub")}</p>
            <div className="scenario-grid">
              {assessment.falsePositiveScenarios.map((scenario, index) => (
                <FalsePositiveCard key={scenario.id} scenario={scenario} index={index} />
              ))}
            </div>
          </section>

          <section className="dashboard-section">
            <h2 className="section-title">{t("complianceConcerns")}</h2>
            <div className="compliance-list">
              {assessment.complianceConcerns.map((concern) => (
                <div key={concern.id} className={`compliance-item compliance-item--${concern.severity}`}>
                  <div className="compliance-item-header">
                    <span className="compliance-regulation">{tx(concern.regulation)}</span>
                    <RiskRatingBadge level={concern.severity} size="sm" />
                  </div>
                  <p className="compliance-concern">{tx(concern.concern)}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="dashboard-section">
            <div className="risk-lists-row">
              <div className="risk-list-col">
                <h2 className="section-title">{t("operationalRisks")}</h2>
                <ul className="risk-bullet-list">
                  {assessment.operationalRisks.map((risk) => (
                    <li key={risk}>{tx(risk)}</li>
                  ))}
                </ul>
              </div>
              <div className="risk-list-col">
                <h2 className="section-title">{t("reputationRisks")}</h2>
                <ul className="risk-bullet-list">
                  {assessment.reputationRisks.map((risk) => (
                    <li key={risk}>{tx(risk)}</li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          <section className="dashboard-section">
            <h2 className="section-title">{t("recommendedControlPlan")}</h2>
            <p className="section-sub">{t("controlPlanSub")}</p>
            <ControlPlanTable controls={assessment.controlPlan} />
          </section>

          <section className="dashboard-section">
            <h2 className="section-title">{t("saferAlternative")}</h2>
            <AlternativeDecisionBox alternative={assessment.saferAlternative} />
          </section>
        </div>
      )}
    </div>
  );
}
