import { ArrowRight, CheckCircle2 } from "lucide-react";
import type { RiskAssessment } from "../types/risk";

type AlternativeDecisionBoxProps = {
  alternative: RiskAssessment["saferAlternative"];
};

export function AlternativeDecisionBox(props: AlternativeDecisionBoxProps) {
  const { alternative } = props;

  const changes = alternative.keyChanges ?? [];

  return (
    <section className="alternative-box" aria-label="Safer alternative decision">
      <div className="alternative-header">
        <div className="alternative-icon" aria-hidden="true">
          <ArrowRight size={16} />
        </div>

        <div>
          <p className="alternative-eyebrow">Safer Alternative</p>
          <h3 className="alternative-title">{alternative.title}</h3>
        </div>
      </div>

      <p className="alternative-description">
        {alternative.description}
      </p>

      {changes.length > 0 && (
        <ul className="alternative-changes">
          {changes.map((change) => (
            <li key={change} className="alternative-change-item">
              <CheckCircle2 size={14} className="change-icon" aria-hidden="true" />
              <span>{change}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
