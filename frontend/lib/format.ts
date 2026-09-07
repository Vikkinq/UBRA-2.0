import { JobApplication } from "./types/job-applications";

export function getCompanyDisplayName(application: JobApplication): string {
  return application.company?.name ?? application.company_name ?? "—";
}

export function formatSalaryRange(application: JobApplication): string {
  const { salary_min, salary_max, salary_currency } = application;
  if (!salary_min && !salary_max) return "—";

  const currency = salary_currency ? `${salary_currency} ` : "";
  const fmt = (value: string) => `${currency}${Number(value).toLocaleString()}`;

  if (salary_min && salary_max) return `${fmt(salary_min)} – ${fmt(salary_max)}`;
  if (salary_min) return `From ${fmt(salary_min)}`;
  return `Up to ${fmt(salary_max as string)}`;
}

export function formatAppliedDate(appliedAt: string | null): string {
  if (!appliedAt) return "—";
  return new Date(appliedAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
