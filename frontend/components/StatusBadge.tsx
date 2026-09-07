import { getStatusColorClasses } from "@/lib/status-colors";

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium whitespace-nowrap ${getStatusColorClasses(status)}`}
    >
      {status}
    </span>
  );
}
