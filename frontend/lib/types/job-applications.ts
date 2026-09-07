export interface NamedRelation {
  id: number;
  name: string;
}

export interface JobApplication {
  id: number;
  job_title: string;
  job_url: string | null;
  location: string | null;
  applied_at: string | null;
  notes: string | null;
  salary_min: string | null;
  salary_max: string | null;
  salary_currency: string | null;
  company_name: string | null;
  company: NamedRelation | null;
  status: NamedRelation;
  employmentType: NamedRelation | null;
  source: NamedRelation | null;
}

export interface PaginationMeta {
  total: number;
  perPage: number;
  currentPage: number;
  lastPage: number;
  from: number | null;
  to: number | null;
}

export interface FilterOption {
  label: string;
  value: number;
}
