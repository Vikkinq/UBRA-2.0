import type {
  CareerEducation,
  CareerEducationFields,
  CareerExperience,
  CareerExperienceFields,
  CareerProfile,
  CareerProfileFields,
  CareerProfileSocialField,
} from "@/lib/types/career-profile";

export const CAREER_PROFILE_SKILL_LIMIT = 100;

export const EMPTY_CAREER_PROFILE_FIELDS: CareerProfileFields = {
  professional_title: "",
  summary: "",
  phone: "",
  location: "",
  linkedin_url: "",
  github_url: "",
  portfolio_url: "",
  facebook_url: "",
};

export const EMPTY_CAREER_EXPERIENCE_FIELDS: CareerExperienceFields = {
  job_title: "",
  company_name: "",
  location: "",
  employment_type_id: null,
  start_date: "",
  end_date: "",
  is_current: false,
  description: "",
};

export const EMPTY_CAREER_EDUCATION_FIELDS: CareerEducationFields = {
  education_level: "",
  institution_name: "",
  degree: "",
  field_of_study: "",
  location: "",
  start_date: "",
  end_date: "",
  is_currently_enrolled: false,
  description: "",
};

export const CAREER_PROFILE_SOCIAL_FIELDS: { field: CareerProfileSocialField; label: string }[] = [
  { field: "linkedin_url", label: "LinkedIn URL" },
  { field: "github_url", label: "GitHub URL" },
  { field: "portfolio_url", label: "Portfolio URL" },
  { field: "facebook_url", label: "Facebook URL" },
];

const CAREER_PROFILE_SOCIAL_LINKS: { field: CareerProfileSocialField; label: string }[] = [
  { field: "linkedin_url", label: "LinkedIn" },
  { field: "github_url", label: "GitHub" },
  { field: "portfolio_url", label: "Portfolio" },
  { field: "facebook_url", label: "Facebook" },
];

export function toCareerProfileFields(profile: CareerProfile): CareerProfileFields {
  return {
    professional_title: profile.professional_title ?? "",
    summary: profile.summary ?? "",
    phone: profile.phone ?? "",
    location: profile.location ?? "",
    linkedin_url: profile.linkedin_url ?? "",
    github_url: profile.github_url ?? "",
    portfolio_url: profile.portfolio_url ?? "",
    facebook_url: profile.facebook_url ?? "",
  };
}

export function toCareerExperienceFields(experience: CareerExperience): CareerExperienceFields {
  return {
    id: experience.id,
    job_title: experience.job_title,
    company_name: experience.company_name,
    location: experience.location ?? "",
    employment_type_id: experience.employment_type_id,
    start_date: experience.start_date?.slice(0, 10) ?? "",
    end_date: experience.end_date?.slice(0, 10) ?? "",
    is_current: experience.is_current,
    description: experience.description ?? "",
  };
}

export function toCareerEducationFields(education: CareerEducation): CareerEducationFields {
  return {
    id: education.id,
    education_level: education.education_level,
    institution_name: education.institution_name,
    degree: education.degree ?? "",
    field_of_study: education.field_of_study ?? "",
    location: education.location ?? "",
    start_date: education.start_date?.slice(0, 10) ?? "",
    end_date: education.end_date?.slice(0, 10) ?? "",
    is_currently_enrolled: education.is_currently_enrolled,
    description: education.description ?? "",
  };
}

export function formatCareerDateRange(start: string | null, end: string | null, isCurrent: boolean): string {
  const formatMonthYear = (value: string | null) => {
    if (!value) return null;
    const date = new Date(`${value.slice(0, 10)}T12:00:00`);
    if (Number.isNaN(date.getTime())) return null;
    return new Intl.DateTimeFormat(undefined, { month: "short", year: "numeric" }).format(date);
  };

  const formattedStart = formatMonthYear(start);
  const formattedEnd = isCurrent ? "Present" : formatMonthYear(end);
  if (formattedStart && formattedEnd) return `${formattedStart} – ${formattedEnd}`;
  return formattedStart ?? formattedEnd ?? "Dates not specified";
}

export function getCareerProfileSocialLinks(profile: CareerProfile): { label: string; value: string }[] {
  return CAREER_PROFILE_SOCIAL_LINKS.flatMap(({ field, label }) => {
    const value = profile[field];
    return value ? [{ label, value }] : [];
  });
}

export function getUserInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function normalizeSkillName(name: string): string {
  return name.trim().toLowerCase();
}
