import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ChevronDown, ChevronUp, Download, Cpu } from "lucide-react";
import { PageHeader } from "../components/PageHeader";
import { MetricCard } from "../components/MetricCard";
import { RiskRatingBadge } from "../components/RiskRatingBadge";
import { RiskMatrixTable } from "../components/RiskMatrixTable";
import { AbuseScenarioCard, FalsePositiveCard } from "../components/ScenarioCard";
import { ControlPlanTable } from "../components/ControlPlanTable";
import { AlternativeDecisionBox } from "../components/AlternativeDecisionBox";
import { getLatestAssessment } from "../services/simulationService";
import { sampleAssessment } from "../data/sampleAssessment";
import { exportAssessmentReport } from "../utils/exportReport";

type AppLanguage = "en" | "zh" | "id" | "ms";

const TEXT: Record<AppLanguage, Record<string, string>> = {
  en: {
    allSimulations: "All Simulations",
    sampleData: "Sample data — run a simulation to generate a live report",
    exportReport: "Export Report",
    downloadTitle: "Download .txt risk report",
    reportTitle: "Risk Assessment Report",
    riskScore: "Risk Score (0–100)",
    displayScore: "Display score",
    criticalRisks: "Critical Risks",
    criticalSub: "Require immediate action",
    highRisks: "High Risks",
    highSub: "Require control plan",
    controlsRecommended: "Controls Recommended",
    controlsSub: "Across all risk areas",
    finalRiskRating: "Final Risk Rating",
    internalScore: "Internal model score",
    decisionInput: "Decision Input",
    mainConcern: "Main Concern",
    launchRecommendation: "Launch Recommendation",
    affectedStakeholders: "Affected Stakeholders",
    riskMatrix: "Risk Matrix",
    showMore: "Show detailed analysis",
    showLess: "Hide detailed analysis",
    showMoreHint: "Open the supporting sections only when you need presentation details.",
    fraudAbuse: "Fraud Abuse Scenarios",
    fraudSub: "How a bad actor could exploit this decision if deployed as-is.",
    falsePositive: "False Positive Impact",
    falsePositiveSub: "Legitimate users who could be incorrectly blocked or degraded.",
    compliance: "Compliance Concerns",
    operational: "Operational Risks",
    reputation: "Reputation Risks",
    controlPlan: "Recommended Control Plan",
    controlPlanSub: "Prioritised actions to bring this decision to an acceptable risk level.",
    saferAlternative: "Safer Alternative",
  },
  zh: {
    allSimulations: "所有模拟",
    sampleData: "示例数据 — 运行模拟后会生成实时报告",
    exportReport: "导出报告",
    downloadTitle: "下载 .txt 风险报告",
    reportTitle: "风险评估报告",
    riskScore: "风险分数（0–100）",
    displayScore: "展示分数",
    criticalRisks: "严重风险",
    criticalSub: "需要立即处理",
    highRisks: "高风险",
    highSub: "需要控制方案",
    controlsRecommended: "建议控制措施",
    controlsSub: "覆盖所有风险区域",
    finalRiskRating: "最终风险等级",
    internalScore: "内部模型分数",
    decisionInput: "决策输入",
    mainConcern: "主要担忧",
    launchRecommendation: "上线建议",
    affectedStakeholders: "受影响对象",
    riskMatrix: "风险矩阵",
    showMore: "显示详细分析",
    showLess: "收起详细分析",
    showMoreHint: "汇报时先看核心内容，需要时再展开补充材料。",
    fraudAbuse: "欺诈滥用场景",
    fraudSub: "说明不加控制上线时，坏人可能如何利用这个决策。",
    falsePositive: "误伤影响",
    falsePositiveSub: "可能被错误拦截、延迟或降低体验的正常用户。",
    compliance: "合规担忧",
    operational: "运营风险",
    reputation: "声誉风险",
    controlPlan: "建议控制方案",
    controlPlanSub: "按优先级列出把风险降到可接受水平的行动。",
    saferAlternative: "更安全替代方案",
  },
  id: {
    allSimulations: "Semua Simulasi",
    sampleData: "Data contoh — jalankan simulasi untuk membuat laporan langsung",
    exportReport: "Ekspor Laporan",
    downloadTitle: "Unduh laporan risiko .txt",
    reportTitle: "Laporan Penilaian Risiko",
    riskScore: "Skor Risiko (0–100)",
    displayScore: "Skor tampilan",
    criticalRisks: "Risiko Kritis",
    criticalSub: "Perlu tindakan segera",
    highRisks: "Risiko Tinggi",
    highSub: "Perlu rencana kontrol",
    controlsRecommended: "Kontrol Disarankan",
    controlsSub: "Di seluruh area risiko",
    finalRiskRating: "Peringkat Risiko Akhir",
    internalScore: "Skor model internal",
    decisionInput: "Input Keputusan",
    mainConcern: "Kekhawatiran Utama",
    launchRecommendation: "Rekomendasi Peluncuran",
    affectedStakeholders: "Pemangku Kepentingan Terdampak",
    riskMatrix: "Matriks Risiko",
    showMore: "Tampilkan analisis detail",
    showLess: "Sembunyikan analisis detail",
    showMoreHint: "Buka bagian pendukung hanya saat membutuhkan detail presentasi.",
    fraudAbuse: "Skenario Penyalahgunaan Fraud",
    fraudSub: "Bagaimana aktor jahat dapat mengeksploitasi keputusan ini jika langsung diluncurkan.",
    falsePositive: "Dampak False Positive",
    falsePositiveSub: "Pengguna sah yang mungkin salah diblokir atau terganggu.",
    compliance: "Kekhawatiran Kepatuhan",
    operational: "Risiko Operasional",
    reputation: "Risiko Reputasi",
    controlPlan: "Rencana Kontrol yang Disarankan",
    controlPlanSub: "Tindakan prioritas untuk menurunkan risiko ke level yang dapat diterima.",
    saferAlternative: "Alternatif Lebih Aman",
  },
  ms: {
    allSimulations: "Semua Simulasi",
    sampleData: "Data contoh — jalankan simulasi untuk menjana laporan langsung",
    exportReport: "Eksport Laporan",
    downloadTitle: "Muat turun laporan risiko .txt",
    reportTitle: "Laporan Penilaian Risiko",
    riskScore: "Skor Risiko (0–100)",
    displayScore: "Skor paparan",
    criticalRisks: "Risiko Kritikal",
    criticalSub: "Memerlukan tindakan segera",
    highRisks: "Risiko Tinggi",
    highSub: "Memerlukan pelan kawalan",
    controlsRecommended: "Kawalan Disyorkan",
    controlsSub: "Merentas semua kawasan risiko",
    finalRiskRating: "Penarafan Risiko Akhir",
    internalScore: "Skor model dalaman",
    decisionInput: "Input Keputusan",
    mainConcern: "Kebimbangan Utama",
    launchRecommendation: "Cadangan Pelancaran",
    affectedStakeholders: "Pihak Berkepentingan Terjejas",
    riskMatrix: "Matriks Risiko",
    showMore: "Tunjukkan analisis terperinci",
    showLess: "Sembunyikan analisis terperinci",
    showMoreHint: "Buka bahagian sokongan hanya apabila memerlukan butiran pembentangan.",
    fraudAbuse: "Senario Penyalahgunaan Fraud",
    fraudSub: "Bagaimana pelaku jahat boleh mengeksploitasi keputusan ini jika dilancarkan terus.",
    falsePositive: "Kesan False Positive",
    falsePositiveSub: "Pengguna sah yang mungkin tersalah disekat atau terjejas.",
    compliance: "Kebimbangan Pematuhan",
    operational: "Risiko Operasi",
    reputation: "Risiko Reputasi",
    controlPlan: "Pelan Kawalan Disyorkan",
    controlPlanSub: "Tindakan keutamaan untuk mengurangkan risiko ke tahap boleh diterima.",
    saferAlternative: "Alternatif Lebih Selamat",
  },
};

// Humanise raw enum fragments that may appear in Gemini / fallback output
function humanizeRecommendation(text: string): string {
  return text
    .replace(/\bgo-with-mitigation\b/gi, "Launch with mitigation")
    .replace(/\bno-go\b/gi, "Do not launch")
    .replace(/\bproceed\b(?!\s+with)/gi, "Proceed with monitoring");
}

function getSavedLanguage(): AppLanguage {
  const saved = localStorage.getItem("finguard-language") as AppLanguage | null;
  if (saved === "zh" || saved === "id" || saved === "ms") return saved;
  return "en";
}

export function RiskDashboard() {
  const [language, setLanguage] = useState<AppLanguage>(getSavedLanguage);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    const handleLanguageChange = (event: Event) => {
      const customEvent = event as CustomEvent<AppLanguage>;
      setLanguage(customEvent.detail ?? getSavedLanguage());
    };

    window.addEventListener("finguard-language-change", handleLanguageChange);
    window.addEventListener("storage", () => setLanguage(getSavedLanguage()));

    return () => {
      window.removeEventListener("finguard-language-change", handleLanguageChange);
    };
  }, []);

  const t = TEXT[language];

  const latest = getLatestAssessment();
  const assessment = latest ?? sampleAssessment;
  const isLiveResult = latest !== null;

  const criticalCount = assessment.riskMatrix.filter((r) => r.riskLevel === "critical").length;
  const highCount = assessment.riskMatrix.filter((r) => r.riskLevel === "high").length;

  const recommendation = assessment.launchRecommendation
    ? humanizeRecommendation(assessment.launchRecommendation)
    : undefined;

  const isCritical = assessment.overallRiskLevel === "critical";

  // Engine badge
  const engineLabel =
    assessment.engineUsed === "gemini" ? "Gemini AI" : "Fallback Engine";

  return (
    <div className="page-dashboard">

      {/* ── Topbar ─────────────────────────────────────────────────────── */}
      <div className="dashboard-topbar">
        <Link to="/history" className="back-link">
          <ArrowLeft size={14} /> {t.allSimulations}
        </Link>

        <div className="dashboard-topbar-right">
          {!isLiveResult && (
            <span className="demo-banner">
              {t.sampleData}
            </span>
          )}

          {assessment.engineUsed && (
            <span className="engine-badge">
              <Cpu size={11} />
              {engineLabel}
            </span>
          )}

          <button
            className="btn btn--ghost btn--sm"
            onClick={() => exportAssessmentReport(assessment)}
            title={t.downloadTitle}
          >
            <Download size={14} />
            {t.exportReport}
          </button>
        </div>
      </div>

      {/* ── Page Header ────────────────────────────────────────────────── */}
      <PageHeader
        badge={`Simulation · ${assessment.id}`}
        title={t.reportTitle}
        subtitle={assessment.decisionSummary}
      />

      {/* ── Block 1: Summary Metrics ────────────────────────────────────── */}
      <div className="metric-row">
        <MetricCard
          label={t.riskScore}
          value={`${assessment.overallRiskScore} / 100`}
          sub={t.displayScore}
          accent="amber"
        />
        <MetricCard
          label={t.criticalRisks}
          value={criticalCount}
          sub={t.criticalSub}
          accent="red"
        />
        <MetricCard
          label={t.highRisks}
          value={highCount}
          sub={t.highSub}
          accent="amber"
        />
        <MetricCard
          label={t.controlsRecommended}
          value={assessment.controlPlan.length}
          sub={t.controlsSub}
          accent="cyan"
        />
      </div>

      {/* ── Block 2: Final Risk Rating ──────────────────────────────────── */}
      <div className="rating-banner">
        <div className="rating-banner-left">
          <p className="rating-banner-label">{t.finalRiskRating}</p>
          <RiskRatingBadge
            level={assessment.overallRiskLevel}
            score={assessment.overallRiskScore}
            size="lg"
          />
          {assessment.internalRiskScore !== undefined && (
            <p className="internal-score-note">
              <Cpu size={11} />
              {t.internalScore}: {assessment.internalRiskScore} / 125
            </p>
          )}
        </div>

        <div className="rating-banner-right">
          <p className="rating-banner-label">{t.decisionInput}</p>
          <p className="rating-banner-decision">{assessment.decisionInput}</p>
        </div>
      </div>

      {/* ── Block 3: Main Concern + Launch Recommendation ──────────────── */}
      {(assessment.mainConcern || recommendation) && (
        <section className="dashboard-section">
          <div className="concern-row">
            {assessment.mainConcern && (
              <div className="concern-card concern-card--main">
                <p className="concern-label">{t.mainConcern}</p>
                <p className="concern-text">{assessment.mainConcern}</p>
              </div>
            )}

            {recommendation && (
              <div
                className={`concern-card ${
                  isCritical
                    ? "concern-card--launch-critical"
                    : "concern-card--launch"
                }`}
              >
                <p className="concern-label">{t.launchRecommendation}</p>
                <p className="concern-text">{recommendation}</p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── Block 4: Affected Stakeholders ─────────────────────────────── */}
      <section className="dashboard-section">
        <h2 className="section-title">{t.affectedStakeholders}</h2>
        <div className="stakeholder-grid">
          {assessment.affectedStakeholders.map((s) => (
            <div key={s.role} className="stakeholder-card">
              <p className="stakeholder-role">{s.role}</p>
              <p className="stakeholder-impact">{s.impact}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Block 5: Risk Matrix ────────────────────────────────────────── */}
      <section className="dashboard-section">
        <h2 className="section-title">{t.riskMatrix}</h2>
        <RiskMatrixTable entries={assessment.riskMatrix} />
      </section>

      {/* ── Presentation control: detailed supporting sections ─────────── */}
      <div className="show-more-panel">
        <div>
          <p className="show-more-title">{t.showMore}</p>
          <p className="show-more-copy">{t.showMoreHint}</p>
        </div>
        <button
          type="button"
          className="btn btn--ghost btn--sm show-more-btn"
          onClick={() => setShowDetails((current) => !current)}
        >
          {showDetails ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          {showDetails ? t.showLess : t.showMore}
        </button>
      </div>

      {showDetails && (
        <div className="details-panel">
          {/* ── Block 6: Fraud Abuse Scenarios ─────────────────────────────── */}
          <section className="dashboard-section">
            <h2 className="section-title">{t.fraudAbuse}</h2>
            <p className="section-sub">
              {t.fraudSub}
            </p>
            <div className="scenario-grid">
              {assessment.abuseScenarios.map((s, i) => (
                <AbuseScenarioCard key={s.id} scenario={s} index={i} />
              ))}
            </div>
          </section>

          {/* ── Block 7: False Positive Impact ─────────────────────────────── */}
          <section className="dashboard-section">
            <h2 className="section-title">{t.falsePositive}</h2>
            <p className="section-sub">
              {t.falsePositiveSub}
            </p>
            <div className="scenario-grid">
              {assessment.falsePositiveScenarios.map((s, i) => (
                <FalsePositiveCard key={s.id} scenario={s} index={i} />
              ))}
            </div>
          </section>

          {/* ── Block 8: Compliance Concerns ───────────────────────────────── */}
          <section className="dashboard-section">
            <h2 className="section-title">{t.compliance}</h2>
            <div className="compliance-list">
              {assessment.complianceConcerns.map((c) => (
                <div
                  key={c.id}
                  className={`compliance-item compliance-item--${c.severity}`}
                >
                  <div className="compliance-item-header">
                    <span className="compliance-regulation">{c.regulation}</span>
                    <RiskRatingBadge level={c.severity} size="sm" />
                  </div>
                  <p className="compliance-concern">{c.concern}</p>
                </div>
              ))}
            </div>
          </section>

          {/* ── Block 9: Operational + Reputation ─────────────────────────── */}
          <section className="dashboard-section">
            <div className="risk-lists-row">
              <div className="risk-list-col">
                <h2 className="section-title">{t.operational}</h2>
                <ul className="risk-bullet-list">
                  {assessment.operationalRisks.map((r) => (
                    <li key={r}>{r}</li>
                  ))}
                </ul>
              </div>
              <div className="risk-list-col">
                <h2 className="section-title">{t.reputation}</h2>
                <ul className="risk-bullet-list">
                  {assessment.reputationRisks.map((r) => (
                    <li key={r}>{r}</li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          {/* ── Block 10: Control Plan ─────────────────────────────────────── */}
          <section className="dashboard-section">
            <h2 className="section-title">{t.controlPlan}</h2>
            <p className="section-sub">
              {t.controlPlanSub}
            </p>
            <ControlPlanTable controls={assessment.controlPlan} />
          </section>

          {/* ── Block 11: Safer Alternative ────────────────────────────────── */}
          <section className="dashboard-section">
            <h2 className="section-title">{t.saferAlternative}</h2>
            <AlternativeDecisionBox alternative={assessment.saferAlternative} />
          </section>
        </div>
      )}
    </div>
  );
}
