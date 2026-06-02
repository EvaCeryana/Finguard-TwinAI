import { Link } from "react-router-dom";
import {
  ArrowRight,
  Scale,
  ShieldCheck,
  Users,
  Zap,
} from "lucide-react";

import { PageHeader } from "../components/PageHeader";
import { RiskRatingBadge } from "../components/RiskRatingBadge";
import { useLanguage } from "../context/LanguageContext";
import { sampleHistory } from "../data/sampleAssessment";

const homeCapabilities = [
  {
    icon: Zap,
    titleKey: "fraudVectorModelling",
    descKey: "fraudVectorModellingDesc",
  },
  {
    icon: Users,
    titleKey: "falsePositiveAnalysis",
    descKey: "falsePositiveAnalysisDesc",
  },
  {
    icon: Scale,
    titleKey: "compliancePrecheck",
    descKey: "compliancePrecheckDesc",
  },
  {
    icon: ShieldCheck,
    titleKey: "controlPlanGeneration",
    descKey: "controlPlanGenerationDesc",
  },
];

function formatHistoryDate(dateValue: string) {
  return new Date(dateValue).toLocaleDateString("en-MY", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function Home() {
  const { t, tx } = useLanguage();

  const recentItems = sampleHistory.slice(0, 3);

  return (
    <div className="page-home">
      <PageHeader
        badge={t("riskSimulationPlatform")}
        title={t("homeTitle")}
        subtitle={t("homeSubtitle")}
      />

      <div className="home-hero">
        <p className="home-hero-tagline">{t("homeTagline")}</p>

        <Link to="/simulate" className="btn btn--primary btn--lg">
          {t("runNewSimulation")}
          <ArrowRight size={16} />
        </Link>
      </div>

      <section className="home-section">
        <p className="section-eyebrow">{t("whatEngineAssesses")}</p>

        <div className="capability-grid">
          {homeCapabilities.map((item) => {
            const CapabilityIcon = item.icon;

            return (
              <div key={item.titleKey} className="capability-card">
                <div className="capability-icon" aria-hidden="true">
                  <CapabilityIcon size={18} />
                </div>

                <h3 className="capability-title">
                  {t(item.titleKey)}
                </h3>

                <p className="capability-desc">
                  {t(item.descKey)}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="home-section">
        <div className="section-row">
          <p className="section-eyebrow">{t("recentSimulations")}</p>

          <Link to="/history" className="link-subtle">
            {t("viewAll")}
            <ArrowRight size={12} />
          </Link>
        </div>

        <div className="recent-list">
          {recentItems.map((item) => (
            <Link
              key={item.id}
              to={`/dashboard/${item.id}`}
              className="recent-item"
            >
              <div className="recent-item-left">
                <p className="recent-decision">
                  {tx(item.decisionInput)}
                </p>

                <span className="recent-date">
                  {formatHistoryDate(item.createdAt)}
                </span>
              </div>

              <RiskRatingBadge
                level={item.overallRiskLevel}
                score={item.overallRiskScore}
                size="sm"
              />
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
