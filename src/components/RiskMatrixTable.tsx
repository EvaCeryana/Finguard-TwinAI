import type {
  ImpactLevel,
  LikelihoodLevel,
  RiskMatrixEntry,
} from "../types/risk";
import { useLanguage } from "../context/LanguageContext";

type RiskMatrixTableProps = {
  entries: RiskMatrixEntry[];
};

const likelihoodRows: LikelihoodLevel[] = [
  "very_high",
  "high",
  "medium",
  "low",
];

const impactColumns: ImpactLevel[] = [
  "low",
  "medium",
  "high",
  "critical",
];

const likelihoodScore: Record<LikelihoodLevel, number> = {
  very_high: 4,
  high: 3,
  medium: 2,
  low: 1,
};

const impactScore: Record<ImpactLevel, number> = {
  critical: 4,
  high: 3,
  medium: 2,
  low: 1,
};

function getMatrixCellClass(
  likelihood: LikelihoodLevel,
  impact: ImpactLevel
) {
  const score = likelihoodScore[likelihood] * impactScore[impact];

  if (score >= 12) {
    return "cell--critical";
  }

  if (score >= 6) {
    return "cell--high";
  }

  if (score >= 3) {
    return "cell--medium";
  }

  return "cell--low";
}

function getTranslationKey(level: LikelihoodLevel | ImpactLevel) {
  return level === "very_high" ? "veryHigh" : level;
}

function groupRisksByMatrixCell(entries: RiskMatrixEntry[]) {
  const groupedRisks: Record<string, string[]> = {};

  entries.forEach((entry) => {
    const cellKey = `${entry.likelihood}:${entry.impact}`;

    if (!groupedRisks[cellKey]) {
      groupedRisks[cellKey] = [];
    }

    groupedRisks[cellKey].push(entry.riskName);
  });

  return groupedRisks;
}

export function RiskMatrixTable(props: RiskMatrixTableProps) {
  const { entries } = props;
  const { t, tx } = useLanguage();

  const risksByCell = groupRisksByMatrixCell(entries);

  return (
    <section className="matrix-wrapper" aria-label="Risk matrix">
      <div className="matrix-y-label">
        {t("likelihood")} →
      </div>

      <table className="risk-matrix-table">
        <thead>
          <tr>
            <th className="matrix-corner">
              <span>{t("likelihood")}</span>
              <span className="corner-slash">/</span>
              <span>{t("impact")}</span>
            </th>

            {impactColumns.map((impact) => (
              <th key={impact} className="matrix-col-head">
                {t(getTranslationKey(impact))}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {likelihoodRows.map((likelihood) => (
            <tr key={likelihood}>
              <td className="matrix-row-head">
                {t(getTranslationKey(likelihood))}
              </td>

              {impactColumns.map((impact) => {
                const cellKey = `${likelihood}:${impact}`;
                const risksInCell = risksByCell[cellKey] ?? [];
                const cellClassName = getMatrixCellClass(likelihood, impact);

                return (
                  <td
                    key={impact}
                    className={`matrix-cell ${cellClassName}`}
                  >
                    {risksInCell.map((riskName) => (
                      <span
                        key={riskName}
                        className="matrix-risk-name"
                        title={riskName}
                      >
                        {tx(riskName)}
                      </span>
                    ))}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
