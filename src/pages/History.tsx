import { Link } from "react-router-dom";
import { ArrowRight, Plus } from "lucide-react";
import { PageHeader } from "../components/PageHeader";
import { RiskRatingBadge } from "../components/RiskRatingBadge";
import { EmptyState } from "../components/LoadingSimulationState";
import { getAssessmentHistory } from "../services/simulationService";

export function History() {
  const history = getAssessmentHistory();

  return (
    <div className="page-history">
      <PageHeader
        badge="Assessment History"
        title="Past Simulations"
        subtitle={
          history.length > 0
            ? `${history.length} assessment${history.length !== 1 ? "s" : ""} in this workspace`
            : "No simulations yet"
        }
        actions={
          <Link to="/simulate" className="btn btn--primary btn--sm">
            <Plus size={14} /> New Simulation
          </Link>
        }
      />

      {history.length === 0 ? (
        <EmptyState
          title="No simulations yet"
          description="Run your first fintech decision risk assessment to generate a dashboard."
          action={
            <Link to="/simulate" className="btn btn--primary">
              Start New Simulation
            </Link>
          }
        />
      ) : (
        <div className="history-table">
          <div className="history-table-header">
            <span>Decision</span>
            <span>Date</span>
            <span>Risk Rating</span>
            <span />
          </div>

          {history.map((item, i) => (
            <Link key={item.id} to="/dashboard" className="history-row">
              <div className="history-row-decision">
                <span className="history-index">{String(i + 1).padStart(2, "0")}</span>
                <p>{item.decisionInput}</p>
              </div>
              <span className="history-date">
                {new Date(item.createdAt).toLocaleDateString("en-MY", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </span>
              <RiskRatingBadge
                level={item.overallRiskLevel}
                score={item.overallRiskScore}
                size="sm"
              />
              <ArrowRight size={14} className="history-arrow" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
