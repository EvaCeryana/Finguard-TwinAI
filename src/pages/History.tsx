import { Link } from "react-router-dom";
import { ArrowRight, Plus } from "lucide-react";
import { PageHeader } from "../components/PageHeader";
import { RiskRatingBadge } from "../components/RiskRatingBadge";
import { EmptyState } from "../components/LoadingSimulationState";
import { getAssessmentHistory } from "../services/simulationService";
import { useLanguage } from "../context/LanguageContext";

export function History() {
  const history = getAssessmentHistory();
  const { t, tx } = useLanguage();

  return (
    <div className="page-history">
      <PageHeader
        badge={t("assessmentHistory")}
        title={t("pastSimulations")}
        subtitle={history.length > 0 ? `${history.length} ${t("assessmentsInWorkspace")}` : t("noSimulationsYet")}
        actions={
          <Link to="/simulate" className="btn btn--primary btn--sm">
            <Plus size={14} /> {t("newSimulationShort")}
          </Link>
        }
      />

      {history.length === 0 ? (
        <EmptyState
          title={t("noSimulationsYet")}
          description={t("noSimulationsDesc")}
          action={<Link to="/simulate" className="btn btn--primary">{t("startNewSimulation")}</Link>}
        />
      ) : (
        <div className="history-table">
          <div className="history-table-header">
            <span>{t("decision")}</span>
            <span>{t("date")}</span>
            <span>{t("riskRating")}</span>
            <span />
          </div>

          {history.map((item, index) => (
            <Link key={item.id} to="/dashboard" className="history-row">
              <div className="history-row-decision">
                <span className="history-index">{String(index + 1).padStart(2, "0")}</span>
                <p>{tx(item.decisionInput)}</p>
              </div>
              <span className="history-date">
                {new Date(item.createdAt).toLocaleDateString("en-MY", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </span>
              <RiskRatingBadge level={item.overallRiskLevel} score={item.overallRiskScore} size="sm" />
              <ArrowRight size={14} className="history-arrow" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

