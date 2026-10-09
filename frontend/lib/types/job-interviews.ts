import type { JobApplication } from "./job-applications";

export interface JobInterview {
  id: number;
  job_application_id: number;
  interview_type: string | null;
  round_name: string | null;
  scheduled_at: string | null;
  duration: number | null;
  location: string | null;
  meeting_url: string | null;
  interviewer_name: string | null;
  notes: string | null;
  outcome: string | null;
  job_application: JobApplication;
}
