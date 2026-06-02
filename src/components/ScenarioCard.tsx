import { AlertTriangle, User } from "lucide-react";
import type { AbuseScenario, FalsePositiveScenario } from "../types/risk";
import { RiskRatingBadge } from "./RiskRatingBadge";

type AbuseScenarioCardProps = {
  scenario: AbuseScenario;
  index: number;
};

type FalsePositiveCardProps = {
  scenario: FalsePositiveScenario;
  index: number;
};

function formatScenarioNumber(prefix: string, index: number) {
  return `${prefix}${String(index + 1).padStart(2, "0")}`;
}

type ScenarioFieldProps = {
  label: string;
  value: string;
};

function ScenarioField(props: ScenarioFieldProps) {
  const { label, value } = props;

  return (
    <div className="scenario-field">
      <span className="scenario-field-label">{label}</span>
      <p className="scenario-field-value">{value}</p>
    </div>
  );
}

export function AbuseScenarioCard(props: AbuseScenarioCardProps) {
  const { scenario, index } = props;

  const scenarioNumber = formatScenarioNumber("A", index);
  const cardClassName = `scenario-card scenario-card--${scenario.severity}`;

  return (
    <article className={cardClassName} aria-label={`Abuse scenario ${scenarioNumber}`}>
      <div className="scenario-header">
        <div className="scenario-index">
          <AlertTriangle size={14} aria-hidden="true" />
          <span>{scenarioNumber}</span>
        </div>

        <RiskRatingBadge level={scenario.severity} size="sm" />
      </div>

      <h3 className="scenario-actor">{scenario.actor}</h3>

      <ScenarioField label="Method" value={scenario.method} />
      <ScenarioField label="Impact" value={scenario.impact} />
    </article>
  );
}

export function FalsePositiveCard(props: FalsePositiveCardProps) {
  const { scenario, index } = props;

  const scenarioNumber = formatScenarioNumber("FP", index);
  const cardClassName = `scenario-card scenario-card--fp scenario-card--${scenario.severity}`;

  return (
    <article
      className={cardClassName}
      aria-label={`False positive scenario ${scenarioNumber}`}
    >
      <div className="scenario-header">
        <div className="scenario-index">
          <User size={14} aria-hidden="true" />
          <span>{scenarioNumber}</span>
        </div>

        <RiskRatingBadge level={scenario.severity} size="sm" />
      </div>

      <h3 className="scenario-actor">{scenario.affectedSegment}</h3>

      <ScenarioField label="Trigger" value={scenario.trigger} />
      <ScenarioField label="User Impact" value={scenario.userImpact} />
    </article>
  );
}
