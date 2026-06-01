import { ArrowRight, CheckCircle2 } from "lucide-react";
import type { RiskAssessment } from "../types/risk";

interface AlternativeDecisionBoxProps {
  alternative: RiskAssessment["saferAlternative"];
}

export function AlternativeDecisionBox({ alternative }: AlternativeDecisionBoxProps) {
  return (
    <div className="alternative-box">
      <div className="alternative-header">
        <div className="alternative-icon">
          <ArrowRight size={16} />
        </div>
        <div>
          <p className="alternative-eyebrow">Safer Alternative</p>
          <h3 className="alternative-title">{alternative.title}</h3>
        </div>
      </div>
      <p className="alternative-description">{alternative.description}</p>
      <ul className="alternative-changes">
        {alternative.keyChanges.map((change, i) => (
          <li key={i} className="alternative-change-item">
            <CheckCircle2 size={14} className="change-icon" />
            <span>{change}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
