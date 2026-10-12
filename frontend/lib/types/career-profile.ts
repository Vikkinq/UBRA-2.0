export interface CareerSkill {
  id: number;
  name: string;
  sort_order: number;
}

export interface CareerExperience {
  id: number;
  job_title: string;
  company_name: string;
  location: string | null;
  employment_type_id: number | null;
  employment_type: { id: number; name: string } | null;
  start_date: string;
  end_date: string | null;
  is_current: boolean;
  description: string | null;
  sort_order: number;
}

export interface CareerEducation {
  id: number;
  education_level: string;
  institution_name: string;
  degree: string | null;
  field_of_study: string | null;
  location: string | null;
  start_date: string | null;
  end_date: string | null;
  is_currently_enrolled: boolean;
  description: string | null;
  sort_order: number;
}

export interface CareerProfile {
  id: number;
  professional_title: string | null;
  summary: string | null;
  phone: string | null;
  location: string | null;
  linkedin_url: string | null;
  github_url: string | null;
  portfolio_url: string | null;
  facebook_url: string | null;
  photo_url: string | null;
  skills: CareerSkill[];
  experiences: CareerExperience[];
  educations: CareerEducation[];
}

export interface CurrentUser {
  name: string;
  email: string;
}

export interface CareerProfileFields {
  professional_title: string;
  summary: string;
  phone: string;
  location: string;
  linkedin_url: string;
  github_url: string;
  portfolio_url: string;
  facebook_url: string;
}

export interface CareerExperienceFields {
  id?: number;
  job_title: string;
  company_name: string;
  location: string;
  employment_type_id: number | null;
  start_date: string;
  end_date: string;
  is_current: boolean;
  description: string;
}

export interface CareerEducationFields {
  id?: number;
  education_level: string;
  institution_name: string;
  degree: string;
  field_of_study: string;
  location: string;
  start_date: string;
  end_date: string;
  is_currently_enrolled: boolean;
  description: string;
}

export type CareerProfileSocialField = Exclude<keyof CareerProfileFields, "professional_title" | "summary" | "phone" | "location">;
