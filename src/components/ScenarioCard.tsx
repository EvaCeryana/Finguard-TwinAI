import { AlertTriangle, User } from "lucide-react";
import type { AbuseScenario, FalsePositiveScenario } from "../types/risk";
import { RiskRatingBadge } from "./RiskRatingBadge";

// ─── Abuse Scenario ──────────────────────────────────────────────────────────

interface AbuseScenarioCardProps {
  scenario: AbuseScenario;
  index: number;
}

export function AbuseScenarioCard({ scenario, index }: AbuseScenarioCardProps) {
  return (
    <div className={`scenario-card scenario-card--${scenario.severity}`}>
      <div className="scenario-header">
        <div className="scenario-index">
          <AlertTriangle size={14} />
          <span>A{String(index + 1).padStart(2, "0")}</span>
        </div>
        <RiskRatingBadge level={scenario.severity} size="sm" />
      </div>
      <h3 className="scenario-actor">{scenario.actor}</h3>
      <div className="scenario-field">
        <span className="scenario-field-label">Method</span>
        <p className="scenario-field-value">{scenario.method}</p>
      </div>
      <div className="scenario-field">
        <span className="scenario-field-label">Impact</span>
        <p className="scenario-field-value">{scenario.impact}</p>
      </div>
    </div>
  );
}

// ─── False Positive Scenario ─────────────────────────────────────────────────

interface FalsePositiveCardProps {
  scenario: FalsePositiveScenario;
  index: number;
}

export function FalsePositiveCard({ scenario, index }: FalsePositiveCardProps) {
  return (
    <div className={`scenario-card scenario-card--fp scenario-card--${scenario.severity}`}>
      <div className="scenario-header">
        <div className="scenario-index">
          <User size={14} />
          <span>FP{String(index + 1).padStart(2, "0")}</span>
        </div>
        <RiskRatingBadge level={scenario.severity} size="sm" />
      </div>
      <h3 className="scenario-actor">{scenario.affectedSegment}</h3>
      <div className="scenario-field">
        <span className="scenario-field-label">Trigger</span>
        <p className="scenario-field-value">{scenario.trigger}</p>
      </div>
      <div className="scenario-field">
        <span className="scenario-field-label">User Impact</span>
        <p className="scenario-field-value">{scenario.userImpact}</p>
      </div>
    </div>
  );
}
