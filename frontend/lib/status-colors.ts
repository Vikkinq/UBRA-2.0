type StatusColorKey = "gray" | "blue" | "purple" | "green" | "red" | "amber";

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

const colorClasses: Record<StatusColorKey, string> = {
  gray: "bg-muted text-muted-foreground",
  blue: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  purple: "bg-primary/10 text-primary",
  green: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  red: "bg-red-500/10 text-red-600 dark:text-red-400",
  amber: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
};

export function getStatusColorClasses(statusName: string): string {
  const normalized = statusName.toLowerCase().trim();
  const key = statusColorMap[normalized] ?? "gray";
  return colorClasses[key];
}
