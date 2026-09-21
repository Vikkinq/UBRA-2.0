import type { JobApplication } from "./types/job-applications";

/* -------------------------------------------------------------------------- */
/*  Generic helpers                                                            */
/*  No domain types in here, so any module (companies, interviews, ...) can    */
/*  use them.                                                                  */
/* -------------------------------------------------------------------------- */

const EMPTY = "—";

export function formatDateTime(date: string | null): string {
  if (!date) return "-";

  return new Date(date).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

/** "Sep 21, 2026". Returns the fallback for empty or invalid dates. */
export function formatDate(value: string | null | undefined, fallback: string = EMPTY): string {
  if (!value) return fallback;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return fallback;

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/** "Today", "Yesterday", "12 days ago", "3 months ago"... Returns null for empty, invalid or future dates. */
export function formatRelativeDate(value: string | null | undefined): string | null {
  if (!value) return null;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  const days = Math.floor((Date.now() - date.getTime()) / 86_400_000);
  if (days < 0) return null;
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 30) return `${days} days ago`;

  const months = Math.floor(days / 30);
  if (months < 12) return `${months} ${months === 1 ? "month" : "months"} ago`;

  const years = Math.floor(days / 365);
  return `${years} ${years === 1 ? "year" : "years"} ago`;
}

interface MoneyRange {
  min: string | number | null | undefined;
  max: string | number | null | undefined;
  currency?: string | null;
}

/** "PHP 30,000 – PHP 50,000", "From PHP 30,000", "Up to PHP 50,000", or "—". */
export function formatMoneyRange({ min, max, currency }: MoneyRange): string {
  if (!min && !max) return EMPTY;

  const prefix = currency ? `${currency} ` : "";
  const fmt = (value: string | number) => `${prefix}${Number(value).toLocaleString()}`;

  if (min && max) return `${fmt(min)} – ${fmt(max)}`;
  if (min) return `From ${fmt(min)}`;
  return `Up to ${fmt(max as string | number)}`;
}

/** "https://www.example.com/jobs/123" becomes "example.com". Falls back to the raw value. */
export function getHostname(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

/** "Acme Corp" becomes "AC", "Google" becomes "GO". */
export function getInitials(label: string): string {
  const parts = label.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

/* -------------------------------------------------------------------------- */
/*  Job Applications                                                           */
/*  Thin wrappers that map an application onto the generic helpers above.      */
/* -------------------------------------------------------------------------- */

export function getCompanyDisplayName(application: JobApplication): string {
  return application.company?.name ?? application.company_name ?? EMPTY;
}

export function formatSalaryRange(application: JobApplication): string {
  return formatMoneyRange({
    min: application.salary_min,
    max: application.salary_max,
    currency: application.salary_currency,
  });
}

export function formatAppliedDate(appliedAt: string | null): string {
  return formatDate(appliedAt);
}
