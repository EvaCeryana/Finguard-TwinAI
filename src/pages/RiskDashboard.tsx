import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Cpu,
  Download,
} from "lucide-react";

import { AlternativeDecisionBox } from "../components/AlternativeDecisionBox";
import { ControlPlanTable } from "../components/ControlPlanTable";
import { MetricCard } from "../components/MetricCard";
import { PageHeader } from "../components/PageHeader";
import { RiskMatrixTable } from "../components/RiskMatrixTable";
import { RiskRatingBadge } from "../components/RiskRatingBadge";
import {
  AbuseScenarioCard,
  FalsePositiveCard,
} from "../components/ScenarioCard";

import { useLanguage } from "../context/LanguageContext";
import { sampleAssessment } from "../data/sampleAssessment";
import { getLatestAssessment } from "../services/simulationService";
import { exportAssessmentReport } from "../utils/exportReport";

function formatRecommendation(value?: string) {
  if (!value) {
    return undefined;
  }

  return value
    .replace(/\bgo-with-mitigation\b/gi, "Launch with mitigation")
    .replace(/\bno-go\b/gi, "Do not launch")
    .replace(/\bproceed\b(?!\s+with)/gi, "Proceed with monitoring");
}

function getEngineName(engineUsed?: string) {
  if (engineUsed === "gemini") {
    return "Gemini AI";
  }

  if (engineUsed === "fallback") {
    return "Fallback Engine";
  }

  return undefined;
}

export function RiskDashboard() {
  const { t, tx } = useLanguage();

  const [showDetailedReport, setShowDetailedReport] = useState(false);
  const [showAllStakeholders, setShowAllStakeholders] = useState(false);
  const [showAllControls, setShowAllControls] = useState(false);

  const savedAssessment = getLatestAssessment();
  const assessment = savedAssessment ?? sampleAssessment;
  const usingSampleData = savedAssessment === null;

  const criticalRiskCount = assessment.riskMatrix.filter(
    (risk) => risk.riskLevel === "critical"
  ).length;

  const highRiskCount = assessment.riskMatrix.filter(
    (risk) => risk.riskLevel === "high"
  ).length;

  const recommendation = formatRecommendation(assessment.launchRecommendation);
  const engineName = getEngineName(assessment.engineUsed);

  const isCriticalRisk = assessment.overallRiskLevel === "critical";

  const immediateControls = assessment.controlPlan.filter(
    (control) => control.priority === "immediate"
  );

  const mainControls =
    immediateControls.length > 0
      ? immediateControls.slice(0, 4)
      : assessment.controlPlan.slice(0, 4);

  const extraControls = assessment.controlPlan.filter(
    (control) => !mainControls.some((mainControl) => mainControl.id === control.id)
  );

  const controlsToShow = showAllControls
    ? [...mainControls, ...extraControls]
    : mainControls;

  const stakeholdersToShow = showAllStakeholders
    ? assessment.affectedStakeholders
    : assessment.affectedStakeholders.slice(0, 5);

  const remainingStakeholderCount = Math.max(
    assessment.affectedStakeholders.length - stakeholdersToShow.length,
    0
  );

  return (
    <div className="page-dashboard">
      <div className="dashboard-topbar">
        <Link to="/history" className="back-link">
          <ArrowLeft size={14} />
          {t("allSimulations")}
        </Link>

        <div className="dashboard-topbar-right">
          {usingSampleData ? (
            <span className="demo-banner">{t("sampleData")}</span>
          ) : null}

          {engineName ? (
            <span className="engine-badge">
              <Cpu size={11} />
              {tx(engineName)}
            </span>
          ) : null}

          <button
            type="button"
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
        <MetricCard
          label={t("riskScore")}
          value={`${assessment.overallRiskScore} / 100`}
          sub={t("displayScore")}
          accent="amber"
        />

        <MetricCard
          label={t("criticalRisks")}
          value={criticalRiskCount}
          sub={t("requireImmediateAction")}
          accent="red"
        />

        <MetricCard
          label={t("highRisks")}
          value={highRiskCount}
          sub={t("requireControlPlan")}
          accent="amber"
        />

        <MetricCard
          label={t("controlsRecommended")}
          value={assessment.controlPlan.length}
          sub={t("acrossAllRiskAreas")}
          accent="cyan"
        />
      </div>

      <div className="rating-banner">
        <div className="rating-banner-left">
          <p className="rating-banner-label">{t("finalRiskRating")}</p>

          <RiskRatingBadge
            level={assessment.overallRiskLevel}
            score={assessment.overallRiskScore}
            size="lg"
          />

          {assessment.internalRiskScore !== undefined ? (
            <p className="internal-score-note">
              <Cpu size={11} />
              {t("internalModelScore")}: {assessment.internalRiskScore} / 125
            </p>
          ) : null}
        </div>

        <div className="rating-banner-right">
          <p className="rating-banner-label">{t("decisionInput")}</p>
          <p className="rating-banner-decision">
            {tx(assessment.decisionInput)}
          </p>
        </div>
      </div>

      {assessment.mainConcern || recommendation ? (
        <section className="dashboard-section">
          <div className="concern-row">
            {assessment.mainConcern ? (
              <div className="concern-card concern-card--main">
                <p className="concern-label">{t("mainConcern")}</p>
                <p className="concern-text">{tx(assessment.mainConcern)}</p>
              </div>
            ) : null}

            {recommendation ? (
              <div
                className={
                  isCriticalRisk
                    ? "concern-card concern-card--launch-critical"
                    : "concern-card concern-card--launch"
                }
              >
                <p className="concern-label">{t("launchRecommendation")}</p>
                <p className="concern-text">{tx(recommendation)}</p>
              </div>
            ) : null}
          </div>
        </section>
      ) : null}

      <section className="dashboard-section">
        <div className="section-header-row">
          <div>
            <h2 className="section-title">{t("recommendedControlPlan")}</h2>
            <p className="section-sub">{t("controlPlanSub")}</p>
          </div>

          {extraControls.length > 0 ? (
            <button
              type="button"
              className="btn btn--ghost btn--sm"
              onClick={() => setShowAllControls((current) => !current)}
            >
              {showAllControls ? (
                <ChevronUp size={14} />
              ) : (
                <ChevronDown size={14} />
              )}
              {showAllControls ? t("showLess") : t("showMore")}
            </button>
          ) : null}
        </div>

        <ControlPlanTable controls={controlsToShow} />
      </section>

      <section className="dashboard-section">
        <h2 className="section-title">{t("affectedStakeholders")}</h2>

        <div className="stakeholder-grid">
          {stakeholdersToShow.map((stakeholder) => (
            <div key={stakeholder.role} className="stakeholder-card">
              <p className="stakeholder-role">{tx(stakeholder.role)}</p>
              <p className="stakeholder-impact">{tx(stakeholder.impact)}</p>
            </div>
          ))}
        </div>

        {assessment.affectedStakeholders.length > 5 ? (
          <button
            type="button"
            className="btn btn--ghost btn--sm"
            onClick={() => setShowAllStakeholders((current) => !current)}
          >
            {showAllStakeholders ? (
              <ChevronUp size={14} />
            ) : (
              <ChevronDown size={14} />
            )}

            {showAllStakeholders
              ? t("showLess")
              : `${t("showMore")} ${
                  remainingStakeholderCount > 0
                    ? `(${remainingStakeholderCount})`
                    : ""
                }`}
          </button>
        ) : null}
      </section>

      <section className="dashboard-section">
        <h2 className="section-title">{t("riskMatrix")}</h2>
        <RiskMatrixTable entries={assessment.riskMatrix} />
      </section>

      <section className="dashboard-section details-toggle-section">
        <div className="details-toggle-card">
          <div>
            <p className="section-eyebrow">{t("detailedAnalysis")}</p>
            <p className="details-toggle-hint">
              {t("detailedAnalysisHint")}
            </p>
          </div>

          <button
            type="button"
            className="btn btn--ghost btn--sm"
            onClick={() => setShowDetailedReport((current) => !current)}
          >
            {showDetailedReport ? (
              <ChevronUp size={14} />
            ) : (
              <ChevronDown size={14} />
            )}
            {showDetailedReport
              ? t("hideDetailedAnalysis")
              : t("showDetailedAnalysis")}
          </button>
        </div>
      </section>

      {showDetailedReport ? (
        <div className="details-panel">
          <section className="dashboard-section">
            <h2 className="section-title">{t("fraudAbuseScenarios")}</h2>
            <p className="section-sub">{t("fraudAbuseSub")}</p>

            <div className="scenario-grid">
              {assessment.abuseScenarios.map((scenario, index) => (
                <AbuseScenarioCard
                  key={scenario.id}
                  scenario={scenario}
                  index={index}
                />
              ))}
            </div>
          </section>

          <section className="dashboard-section">
            <h2 className="section-title">{t("falsePositiveImpact")}</h2>
            <p className="section-sub">{t("falsePositiveSub")}</p>

            <div className="scenario-grid">
              {assessment.falsePositiveScenarios.map((scenario, index) => (
                <FalsePositiveCard
                  key={scenario.id}
                  scenario={scenario}
                  index={index}
                />
              ))}
            </div>
          </section>

          <section className="dashboard-section">
            <h2 className="section-title">{t("complianceConcerns")}</h2>

            <div className="compliance-list">
              {assessment.complianceConcerns.map((concern) => (
                <div
                  key={concern.id}
                  className={`compliance-item compliance-item--${concern.severity}`}
                >
                  <div className="compliance-item-header">
                    <span className="compliance-regulation">
                      {tx(concern.regulation)}
                    </span>

                    <RiskRatingBadge level={concern.severity} size="sm" />
                  </div>

                  <p className="compliance-concern">
                    {tx(concern.concern)}
                  </p>
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
            <h2 className="section-title">{t("saferAlternative")}</h2>
            <AlternativeDecisionBox alternative={assessment.saferAlternative} />
          </section>
        </div>
      ) : null}
    </div>
  );
}
