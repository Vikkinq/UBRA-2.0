import type { ConfirmField } from "@/components/ConfirmDialog";
import { formatDate, formatTime } from "@/lib/format";
import type { JobInterview } from "@/lib/types/job-interviews";

export function getInterviewSummaryFields(interview: JobInterview): ConfirmField[] {
  return [
    {
      label: "Scheduled",
      value: interview.scheduled_at ? `${formatDate(interview.scheduled_at)} · ${formatTime(interview.scheduled_at)}` : "Unscheduled",
    },
    { label: "Round", value: interview.round_name },
    { label: "Type", value: interview.interview_type },
  ];
}
