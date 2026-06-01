import { Loader2, FileSearch } from "lucide-react";

// ─── Loading ─────────────────────────────────────────────────────────────────

const LOADING_STEPS = [
  "Parsing decision context...",
  "Identifying stakeholder exposure...",
  "Modelling fraud abuse vectors...",
  "Assessing false positive risk...",
  "Reviewing compliance obligations...",
  "Generating control plan...",
  "Composing safer alternative...",
];

interface LoadingSimulationStateProps {
  currentStep?: number; // 0-based index into LOADING_STEPS
}

export function LoadingSimulationState({ currentStep = 0 }: LoadingSimulationStateProps) {
  return (
    <div className="loading-state">
      <div className="loading-spinner">
        <Loader2 size={32} className="spin" />
      </div>
      <p className="loading-headline">Running Risk Simulation</p>
      <div className="loading-steps">
        {LOADING_STEPS.map((step, i) => (
          <div
            key={i}
            className={`loading-step ${
              i < currentStep
                ? "loading-step--done"
                : i === currentStep
                ? "loading-step--active"
                : "loading-step--pending"
            }`}
          >
            <span className="loading-step-dot" />
            <span>{step}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Empty ───────────────────────────────────────────────────────────────────

interface EmptyStateProps {
  title: string;
  description: string;
  action?: React.ReactNode;
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="empty-state">
      <FileSearch size={40} className="empty-icon" />
      <h3 className="empty-title">{title}</h3>
      <p className="empty-description">{description}</p>
      {action && <div className="empty-action">{action}</div>}
    </div>
  );
}
