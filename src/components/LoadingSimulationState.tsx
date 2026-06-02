import { FileSearch, Loader2 } from "lucide-react";

const simulationProgressSteps = [
  "Parsing decision context...",
  "Identifying stakeholder exposure...",
  "Modelling fraud abuse vectors...",
  "Assessing false positive risk...",
  "Reviewing compliance obligations...",
  "Generating control plan...",
  "Composing safer alternative...",
];

type LoadingSimulationStateProps = {
  currentStep?: number;
};

function getStepStatus(stepIndex: number, currentStep: number) {
  if (stepIndex < currentStep) {
    return "loading-step--done";
  }

  if (stepIndex === currentStep) {
    return "loading-step--active";
  }

  return "loading-step--pending";
}

export function LoadingSimulationState(props: LoadingSimulationStateProps) {
  const { currentStep = 0 } = props;

  return (
    <section className="loading-state" aria-label="Risk simulation progress">
      <div className="loading-spinner" aria-hidden="true">
        <Loader2 size={32} className="spin" />
      </div>

      <p className="loading-headline">Running Risk Simulation</p>

      <div className="loading-steps">
        {simulationProgressSteps.map((stepText, index) => {
          const stepClassName = getStepStatus(index, currentStep);

          return (
            <div key={stepText} className={`loading-step ${stepClassName}`}>
              <span className="loading-step-dot" aria-hidden="true" />
              <span>{stepText}</span>
            </div>
          );
        })}
      </div>
    </section>
  );
}

type EmptyStateProps = {
  title: string;
  description: string;
  action?: React.ReactNode;
};

export function EmptyState(props: EmptyStateProps) {
  const { title, description, action } = props;

  return (
    <section className="empty-state" aria-label={title}>
      <FileSearch size={40} className="empty-icon" aria-hidden="true" />

      <h3 className="empty-title">{title}</h3>

      <p className="empty-description">
        {description}
      </p>

      {action ? <div className="empty-action">{action}</div> : null}
    </section>
  );
}
