import type { RiskMatrixEntry, LikelihoodLevel, ImpactLevel } from "../types/risk";
import { useLanguage } from "../context/LanguageContext";

interface RiskMatrixTableProps {
  entries: RiskMatrixEntry[];
}

const LIKELIHOOD_LABELS: LikelihoodLevel[] = ["very_high", "high", "medium", "low"];
const IMPACT_LABELS: ImpactLevel[] = ["low", "medium", "high", "critical"];

function cellRisk(likelihood: LikelihoodLevel, impact: ImpactLevel): string {
  const lScore = { very_high: 4, high: 3, medium: 2, low: 1 }[likelihood];
  const iScore = { critical: 4, high: 3, medium: 2, low: 1 }[impact];
  const product = lScore * iScore;
  if (product >= 12) return "cell--critical";
  if (product >= 6) return "cell--high";
  if (product >= 3) return "cell--medium";
  return "cell--low";
}

function labelKey(value: string) {
  if (value === "very_high") return "veryHigh";
  return value;
}

export function RiskMatrixTable({ entries }: RiskMatrixTableProps) {
  const { t, tx } = useLanguage();
  const lookup: Record<string, string[]> = {};

  for (const entry of entries) {
    const key = `${entry.likelihood}:${entry.impact}`;
    if (!lookup[key]) lookup[key] = [];
    lookup[key].push(entry.riskName);
  }

  return (
    <div className="matrix-wrapper">
      <div className="matrix-y-label">{t("likelihood")} →</div>
      <table className="risk-matrix-table">
        <thead>
          <tr>
            <th className="matrix-corner">
              <span>{t("likelihood")}</span>
              <span className="corner-slash">/</span>
              <span>{t("impact")}</span>
            </th>
            {IMPACT_LABELS.map((impact) => (
              <th key={impact} className="matrix-col-head">
                {t(labelKey(impact))}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {LIKELIHOOD_LABELS.map((likelihood) => (
            <tr key={likelihood}>
              <td className="matrix-row-head">{t(labelKey(likelihood))}</td>
              {IMPACT_LABELS.map((impact) => {
                const key = `${likelihood}:${impact}`;
                const names = lookup[key] ?? [];
                return (
                  <td key={impact} className={`matrix-cell ${cellRisk(likelihood, impact)}`}>
                    {names.map((name) => (
                      <span key={name} className="matrix-risk-name" title={name}>
                        {tx(name)}
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
