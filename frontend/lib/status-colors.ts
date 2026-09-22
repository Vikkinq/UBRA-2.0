type StatusColorKey =
  | "gray"
  | "blue"
  | "purple"
  | "green"
  | "red"
  | "amber";

// Matched by keyword against the status name (lowercased). Extend this as
// you add more statuses in md_application_statuses. Falls back to gray.
const statusColorMap: Record<string, StatusColorKey> = {
  applied: "blue",
  screening: "amber",
  "phone screen": "amber",
  interviewing: "purple",
  interview: "purple",
  offer: "green",
  hired: "green",
  accepted: "green",
  rejected: "red",
  declined: "red",
  withdrawn: "gray",
  archived: "gray",
};

interface StatusColorSet {
  /** Solid badge, as used by the read-only StatusBadge: bg-x/10 text-x-600. */
  badge: string;
  /** Text color alone, for controls that supply their own background/border. */
  text: string;
  /** Solid dot, for status pickers and legends. */
  dot: string;
  /** Border at rest, for outlined controls like StatusSelect. */
  border: string;
  /** Border on hover/focus/open, a touch stronger than `border`. */
  borderHover: string;
}

const STATUS_COLORS: Record<StatusColorKey, StatusColorSet> = {
  gray: {
    badge: "bg-muted text-muted-foreground",
    text: "text-muted-foreground",
    dot: "bg-muted-foreground/50",
    border: "border-border",
    borderHover: "border-muted-foreground/40",
  },
  blue: {
    badge: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    text: "text-blue-600 dark:text-blue-400",
    dot: "bg-blue-500",
    border: "border-blue-500/25",
    borderHover: "border-blue-500/60",
  },
  purple: {
    badge: "bg-primary/10 text-primary",
    text: "text-primary",
    dot: "bg-primary",
    border: "border-primary/25",
    borderHover: "border-primary/60",
  },
  green: {
    badge: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    text: "text-emerald-600 dark:text-emerald-400",
    dot: "bg-emerald-500",
    border: "border-emerald-500/25",
    borderHover: "border-emerald-500/60",
  },
  red: {
    badge: "bg-red-500/10 text-red-600 dark:text-red-400",
    text: "text-red-600 dark:text-red-400",
    dot: "bg-red-500",
    border: "border-red-500/25",
    borderHover: "border-red-500/60",
  },
  amber: {
    badge: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    text: "text-amber-600 dark:text-amber-400",
    dot: "bg-amber-500",
    border: "border-amber-500/25",
    borderHover: "border-amber-500/60",
  },
};

function getStatusColorKey(statusName: string): StatusColorKey {
  const normalized = statusName.toLowerCase().trim();
  return statusColorMap[normalized] ?? "gray";
}

/** Unchanged signature — StatusBadge and any other existing caller keeps working as-is. */
export function getStatusColorClasses(statusName: string): string {
  return STATUS_COLORS[getStatusColorKey(statusName)].badge;
}

/** Text/dot/border pieces for controls that build their own layout, e.g. StatusSelect. */
export function getStatusColorSet(
  statusName: string,
): StatusColorSet {
  return STATUS_COLORS[getStatusColorKey(statusName)];
}

// Statuses that are outcomes rather than pipeline steps. Shared so the drawer's
// progress strip and the status picker's grouping never drift apart.
const OFF_PIPELINE_STATUSES = [
  "rejected",
  "declined",
  "withdrawn",
  "ghosted",
  "archived",
];

export function isOffPipelineStatus(statusName: string): boolean {
  return OFF_PIPELINE_STATUSES.includes(
    statusName.toLowerCase().trim(),
  );
}
