import type { RiskMatrixEntry, LikelihoodLevel, ImpactLevel } from "../types/risk";

interface RiskMatrixTableProps {
  entries: RiskMatrixEntry[];
}

const LIKELIHOOD_LABELS: LikelihoodLevel[] = ["very_high", "high", "medium", "low"];
const IMPACT_LABELS: ImpactLevel[] = ["low", "medium", "high", "critical"];

const LIKELIHOOD_DISPLAY: Record<LikelihoodLevel, string> = {
  very_high: "Very High",
  high: "High",
  medium: "Medium",
  low: "Low",
};

const IMPACT_DISPLAY: Record<ImpactLevel, string> = {
  critical: "Critical",
  high: "High",
  medium: "Medium",
  low: "Low",
};

// Derive cell risk level from likelihood + impact
function cellRisk(likelihood: LikelihoodLevel, impact: ImpactLevel): string {
  const lScore = { very_high: 4, high: 3, medium: 2, low: 1 }[likelihood];
  const iScore = { critical: 4, high: 3, medium: 2, low: 1 }[impact];
  const product = lScore * iScore;
  if (product >= 12) return "cell--critical";
  if (product >= 6) return "cell--high";
  if (product >= 3) return "cell--medium";
  return "cell--low";
}

export function RiskMatrixTable({ entries }: RiskMatrixTableProps) {
  // Map entries into a lookup: likelihood + impact → names[]
  const lookup: Record<string, string[]> = {};
  for (const entry of entries) {
    const key = `${entry.likelihood}:${entry.impact}`;
    if (!lookup[key]) lookup[key] = [];
    lookup[key].push(entry.riskName);
  }

  return (
    <div className="matrix-wrapper">
      <div className="matrix-y-label">LIKELIHOOD →</div>
      <table className="risk-matrix-table">
        <thead>
          <tr>
            <th className="matrix-corner">
              <span>Likelihood</span>
              <span className="corner-slash">/</span>
              <span>Impact</span>
            </th>
            {IMPACT_LABELS.map((imp) => (
              <th key={imp} className="matrix-col-head">
                {IMPACT_DISPLAY[imp]}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {LIKELIHOOD_LABELS.map((lh) => (
            <tr key={lh}>
              <td className="matrix-row-head">{LIKELIHOOD_DISPLAY[lh]}</td>
              {IMPACT_LABELS.map((imp) => {
                const key = `${lh}:${imp}`;
                const names = lookup[key] ?? [];
                return (
                  <td key={imp} className={`matrix-cell ${cellRisk(lh, imp)}`}>
                    {names.map((n) => (
                      <span key={n} className="matrix-risk-name">
                        {n}
                      </span>
                    ))}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
