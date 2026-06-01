import type { ControlAction } from "../types/risk";

interface ControlPlanTableProps {
  controls: ControlAction[];
}

const PRIORITY_CLASS: Record<ControlAction["priority"], string> = {
  immediate: "priority--immediate",
  short_term: "priority--short",
  ongoing: "priority--ongoing",
};

const PRIORITY_LABEL: Record<ControlAction["priority"], string> = {
  immediate: "Immediate",
  short_term: "Short-term",
  ongoing: "Ongoing",
};

const TYPE_CLASS: Record<ControlAction["type"], string> = {
  preventive: "control-type--preventive",
  detective: "control-type--detective",
  corrective: "control-type--corrective",
};

export function ControlPlanTable({ controls }: ControlPlanTableProps) {
  return (
    <div className="control-plan-table">
      <div className="control-plan-header">
        <span>Control</span>
        <span>Type</span>
        <span>Owner</span>
        <span>Priority</span>
      </div>
      {controls.map((c, i) => (
        <div key={c.id} className="control-plan-row">
          <div className="control-index">{String(i + 1).padStart(2, "0")}</div>
          <p className="control-text">{c.control}</p>
          <span className={`control-type ${TYPE_CLASS[c.type]}`}>{c.type}</span>
          <span className="control-owner">{c.owner}</span>
          <span className={`control-priority ${PRIORITY_CLASS[c.priority]}`}>
            {PRIORITY_LABEL[c.priority]}
          </span>
        </div>
      ))}
    </div>
  );
}
