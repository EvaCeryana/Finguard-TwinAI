import type { ControlAction } from "../types/risk";

type ControlPlanTableProps = {
  controls: ControlAction[];
};

const priorityStyleMap: Record<ControlAction["priority"], string> = {
  immediate: "priority--immediate",
  short_term: "priority--short",
  ongoing: "priority--ongoing",
};

const priorityTextMap: Record<ControlAction["priority"], string> = {
  immediate: "Immediate",
  short_term: "Short-term",
  ongoing: "Ongoing",
};

const controlTypeStyleMap: Record<ControlAction["type"], string> = {
  preventive: "control-type--preventive",
  detective: "control-type--detective",
  corrective: "control-type--corrective",
};

function getRowNumber(index: number) {
  return String(index + 1).padStart(2, "0");
}

export function ControlPlanTable(props: ControlPlanTableProps) {
  const { controls } = props;

  if (!controls.length) {
    return (
      <div className="control-plan-table">
        <p className="empty-state-text">No control actions available yet.</p>
      </div>
    );
  }

  return (
    <section className="control-plan-table" aria-label="Control plan">
      <div className="control-plan-header">
        <span>Control</span>
        <span>Type</span>
        <span>Owner</span>
        <span>Priority</span>
      </div>

      {controls.map((controlItem, index) => {
        const priorityClass = priorityStyleMap[controlItem.priority];
        const priorityLabel = priorityTextMap[controlItem.priority];
        const typeClass = controlTypeStyleMap[controlItem.type];

        return (
          <div key={controlItem.id} className="control-plan-row">
            <div className="control-index">{getRowNumber(index)}</div>

            <p className="control-text">{controlItem.control}</p>

            <span className={`control-type ${typeClass}`}>
              {controlItem.type}
            </span>

            <span className="control-owner">{controlItem.owner}</span>

            <span className={`control-priority ${priorityClass}`}>
              {priorityLabel}
            </span>
          </div>
        );
      })}
    </section>
  );
}
