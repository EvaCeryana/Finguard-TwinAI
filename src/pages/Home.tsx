import { Link } from "react-router-dom";
import { ArrowRight, ShieldCheck, Zap, Scale, Users } from "lucide-react";
import { PageHeader } from "../components/PageHeader";
import { sampleHistory } from "../data/sampleAssessment";
import { RiskRatingBadge } from "../components/RiskRatingBadge";
import { useLanguage } from "../context/LanguageContext";

const CAPABILITY_ITEMS = [
  { icon: Zap, titleKey: "fraudVectorModelling", descKey: "fraudVectorModellingDesc" },
  { icon: Users, titleKey: "falsePositiveAnalysis", descKey: "falsePositiveAnalysisDesc" },
  { icon: Scale, titleKey: "compliancePrecheck", descKey: "compliancePrecheckDesc" },
  { icon: ShieldCheck, titleKey: "controlPlanGeneration", descKey: "controlPlanGenerationDesc" },
];

export function Home() {
  const { t, tx } = useLanguage();

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
          {t("runNewSimulation")} <ArrowRight size={16} />
        </Link>
      </div>

      <section className="home-section">
        <p className="section-eyebrow">{t("whatEngineAssesses")}</p>
        <div className="capability-grid">
          {CAPABILITY_ITEMS.map(({ icon: Icon, titleKey, descKey }) => (
            <div key={titleKey} className="capability-card">
              <div className="capability-icon">
                <Icon size={18} />
              </div>
              <h3 className="capability-title">{t(titleKey)}</h3>
              <p className="capability-desc">{t(descKey)}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="home-section">
        <div className="section-row">
          <p className="section-eyebrow">{t("recentSimulations")}</p>
          <Link to="/history" className="link-subtle">
            {t("viewAll")} <ArrowRight size={12} />
          </Link>
        </div>
        <div className="recent-list">
          {sampleHistory.slice(0, 3).map((item) => (
            <Link key={item.id} to={`/dashboard/${item.id}`} className="recent-item">
              <div className="recent-item-left">
                <p className="recent-decision">{tx(item.decisionInput)}</p>
                <span className="recent-date">
                  {new Date(item.createdAt).toLocaleDateString("en-MY", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </div>
              <RiskRatingBadge level={item.overallRiskLevel} score={item.overallRiskScore} size="sm" />
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
