import { StatusBadge } from "@/components/StatusBadge";
import type { ConfirmField } from "@/components/ConfirmDialog";
import { formatAppliedDate, formatSalaryRange } from "@/lib/format";
import type { JobApplication } from "@/lib/types/job-applications";

// Adapters between a JobApplication and the generic ConfirmDialog.
// The edit diff (getApplicationChanges) will live here too once we add it.

/** "Frontend Engineer at Acme", or just the job title when there's no company. */
export function getApplicationItemName(application: JobApplication): string {
  const company = application.company?.name ?? application.company_name;
  return company ? `${application.job_title} at ${company}` : application.job_title;
}

/** What the record looks like. Empty values are null so the dialog can hide them. */
export function getApplicationSummaryFields(application: JobApplication): ConfirmField[] {
  const hasSalary = Boolean(application.salary_min || application.salary_max);

  return [
    { label: "Company", value: application.company?.name ?? application.company_name ?? null },
    { label: "Status", value: <StatusBadge status={application.status.name} /> },
    { label: "Employment", value: application.employment_type?.name ?? null },
    { label: "Location", value: application.location },
    { label: "Salary", value: hasSalary ? formatSalaryRange(application) : null },
    { label: "Applied", value: application.applied_at ? formatAppliedDate(application.applied_at) : null },
    { label: "Source", value: application.source?.name ?? null },
    {
      label: "Notes",
      value: application.notes ? <span className="line-clamp-3 whitespace-pre-wrap">{application.notes}</span> : null,
    },
  ];
}
