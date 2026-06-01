import { Link } from "react-router-dom";
import { ArrowRight, ShieldCheck, Zap, Scale, Users } from "lucide-react";
import { PageHeader } from "../components/PageHeader";
import { sampleHistory } from "../data/sampleAssessment";
import { RiskRatingBadge } from "../components/RiskRatingBadge";

const CAPABILITY_ITEMS = [
  {
    icon: Zap,
    title: "Fraud Vector Modelling",
    desc: "Simulate how bad actors could exploit a new policy before it reaches production.",
  },
  {
    icon: Users,
    title: "False Positive Analysis",
    desc: "Identify which legitimate user segments would be blocked or degraded.",
  },
  {
    icon: Scale,
    title: "Compliance Pre-check",
    desc: "Surface BNM, AML/CFT, and PDPA obligations triggered by the decision.",
  },
  {
    icon: ShieldCheck,
    title: "Control Plan Generation",
    desc: "Receive actionable, prioritised controls with clear ownership.",
  },
];

export function Home() {
  return (
    <div className="page-home">
      <PageHeader
        badge="Risk Simulation Platform"
        title="FinGuard Twin AI"
        subtitle="Test fintech decisions against fraud, compliance, and operational risk — before they go live."
      />

      {/* Hero CTA */}
      <div className="home-hero">
        <p className="home-hero-tagline">
          Your next product decision has risk you haven't modelled yet.
        </p>
        <Link to="/simulate" className="btn btn--primary btn--lg">
          Run New Simulation <ArrowRight size={16} />
        </Link>
      </div>

      {/* Capabilities grid */}
      <section className="home-section">
        <p className="section-eyebrow">What the engine assesses</p>
        <div className="capability-grid">
          {CAPABILITY_ITEMS.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="capability-card">
              <div className="capability-icon">
                <Icon size={18} />
              </div>
              <h3 className="capability-title">{title}</h3>
              <p className="capability-desc">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Recent simulations */}
      <section className="home-section">
        <div className="section-row">
          <p className="section-eyebrow">Recent Simulations</p>
          <Link to="/history" className="link-subtle">
            View all <ArrowRight size={12} />
          </Link>
        </div>
        <div className="recent-list">
          {sampleHistory.slice(0, 3).map((item) => (
            <Link
              key={item.id}
              to={`/dashboard/${item.id}`}
              className="recent-item"
            >
              <div className="recent-item-left">
                <p className="recent-decision">{item.decisionInput}</p>
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
