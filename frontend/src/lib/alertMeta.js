// Central status/priority metadata, shared by every dashboard page.
// Keep this as the single source of truth: if you ever add a new status
// or priority level, update it here AND in globals.css's color tokens --
// nowhere else needs to change.

export const STATUS_META = {
  active: {
    label: "Active",
    className: "status-active",
    dot: "dot-active",
  },
  acknowledged: {
    label: "Acknowledged",
    className: "status-acknowledged",
    dot: "dot-acknowledged",
  },
  investigating: {
    label: "Investigating",
    className: "status-investigating",
    dot: "dot-investigating",
  },
  resolved: {
    label: "Resolved",
    className: "status-resolved",
    dot: "dot-resolved",
  },
  false_report: {
    label: "False report",
    className: "status-false_report",
    dot: "dot-false_report",
  },
};

export const PRIORITY_META = {
  critical: {
    label: "Critical",
    className: "priority-pill priority-pill-critical",
  },
  high: { label: "High", className: "priority-pill priority-pill-high" },
  medium: { label: "Medium", className: "priority-pill priority-pill-medium" },
  low: { label: "Low", className: "priority-pill priority-pill-low" },
};

export const TYPE_META = {
  Fire: { label: "Fire", className: "type-fire", spine: "type-Fire" },
  Medical: {
    label: "Medical",
    className: "type-medical",
    spine: "type-Medical",
  },
  Safety: { label: "Safety", className: "type-safety", spine: "type-Safety" },
};
