"use client";

import { useEffect, useState } from "react";
import { CalendarClock, Clock3, MapPin, Pencil, Trash2, UserRound, Video } from "lucide-react";

import { Button } from "@/components/ui/button";
import { QuickView, QuickViewFact, QuickViewFacts, QuickViewSection } from "@/components/QuickView";
import { formatDate, formatTime, getCompanyDisplayName } from "@/lib/format";
import type { JobInterview } from "@/lib/types/job-interviews";

interface InterviewQuickViewProps {
  interview: JobInterview | null;
  onClose: () => void;
  onEdit: (interview: JobInterview) => void;
  onDelete: (interview: JobInterview) => void;
}

export function InterviewQuickView({ interview, onClose, onEdit, onDelete }: InterviewQuickViewProps) {
  const [lastInterview, setLastInterview] = useState<JobInterview | null>(interview);

  useEffect(() => {
    if (interview) setLastInterview(interview);
  }, [interview]);

  const data = interview ?? lastInterview;
  if (!data) return null;

  const company = getCompanyDisplayName(data.job_application);
  const scheduledAt = data.scheduled_at;

  return (
    <QuickView
      open={interview !== null}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      title={data.round_name || data.interview_type || "Interview"}
      avatarLabel={company}
      subtitle={
        <span className="flex flex-wrap items-center gap-x-2">
          <span className="font-medium text-foreground">{company}</span>
          <span>·</span>
          <span>{data.job_application.job_title}</span>
        </span>
      }
      footer={
        <div className="flex gap-2">
          <Button className="flex-1 gap-2" onClick={() => onEdit(data)}>
            <Pencil className="size-4" /> Edit interview
          </Button>
          <Button variant="outline" className="gap-2 text-destructive hover:text-destructive" onClick={() => onDelete(data)}>
            <Trash2 className="size-4" /> Delete
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        <QuickViewFacts>
          <QuickViewFact icon={CalendarClock} label="Scheduled">
            {formatDate(scheduledAt, "No date set")}
            {scheduledAt && <span className="mt-0.5 block text-xs font-normal text-muted-foreground">{formatTime(scheduledAt)}</span>}
          </QuickViewFact>
          <QuickViewFact icon={Clock3} label="Duration">
            {data.duration ? `${data.duration} minutes` : "—"}
          </QuickViewFact>
          <QuickViewFact icon={UserRound} label="Interviewer">
            {data.interviewer_name || "—"}
          </QuickViewFact>
          <QuickViewFact icon={Video} label="Interview type">
            {data.interview_type || "—"}
          </QuickViewFact>
        </QuickViewFacts>

        {(data.location || data.meeting_url) && (
          <QuickViewSection title="Location">
            <div className="space-y-2 rounded-lg border border-border bg-muted/30 p-3 text-sm">
              {data.location && (
                <p className="flex items-start gap-2">
                  <MapPin className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                  {data.location}
                </p>
              )}
              {data.meeting_url && (
                <a
                  href={data.meeting_url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 break-all font-medium text-primary hover:underline"
                >
                  <Video className="size-4 shrink-0" />
                  {data.meeting_url}
                </a>
              )}
            </div>
          </QuickViewSection>
        )}

        <QuickViewSection title="Notes">
          {data.notes ? (
            <p className="whitespace-pre-wrap rounded-lg bg-muted/40 p-3 text-sm leading-relaxed text-foreground">{data.notes}</p>
          ) : (
            <p className="text-sm text-muted-foreground">No notes for this interview.</p>
          )}
        </QuickViewSection>

        {data.outcome && (
          <QuickViewSection title="Outcome">
            <p className="rounded-lg border border-border bg-muted/30 p-3 text-sm">{data.outcome}</p>
          </QuickViewSection>
        )}
      </div>
    </QuickView>
  );
}
