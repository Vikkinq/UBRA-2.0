import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getCompanyDisplayName } from "@/lib/format";
import type { JobApplication } from "@/lib/types/job-applications";

export interface InterviewFormValues {
  jobApplicationId: string;
  interviewType: string;
  roundName: string;
  date: string;
  time: string;
  duration: string;
  location: string;
  meetingUrl: string;
  interviewerName: string;
  notes: string;
  outcome: string;
}

interface InterviewFormFieldsProps {
  values: InterviewFormValues;
  onChange: (values: InterviewFormValues) => void;
  applications: JobApplication[];
  isEditing: boolean;
  error: string | null;
}

export const emptyInterviewFormValues: InterviewFormValues = {
  jobApplicationId: "",
  interviewType: "",
  roundName: "",
  date: "",
  time: "",
  duration: "",
  location: "",
  meetingUrl: "",
  interviewerName: "",
  notes: "",
  outcome: "",
};

export function InterviewFormFields({ values, onChange, applications, isEditing, error }: InterviewFormFieldsProps) {
  const update = <K extends keyof InterviewFormValues>(key: K, value: InterviewFormValues[K]) => {
    onChange({ ...values, [key]: value });
  };

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="flex flex-col gap-2 sm:col-span-2">
        <Label htmlFor="interview-application">
          Job application <span className="text-destructive">*</span>
        </Label>
        <select
          id="interview-application"
          required
          disabled={isEditing}
          value={values.jobApplicationId}
          onChange={(event) => update("jobApplicationId", event.target.value)}
          className="h-9 w-full rounded-lg border border-input bg-transparent px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
        >
          <option value="" disabled>
            Select an application
          </option>
          {applications.map((application) => (
            <option key={application.id} value={application.id}>
              {getCompanyDisplayName(application)} — {application.job_title}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="interview-round">Round name</Label>
        <Input
          id="interview-round"
          placeholder="e.g. Technical interview"
          value={values.roundName}
          onChange={(event) => update("roundName", event.target.value)}
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="interview-type">Interview type</Label>
        <Input
          id="interview-type"
          placeholder="e.g. Video call"
          value={values.interviewType}
          onChange={(event) => update("interviewType", event.target.value)}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="interview-date">Date</Label>
        <Input
          id="interview-date"
          type="date"
          value={values.date}
          onChange={(event) => onChange({ ...values, date: event.target.value, time: event.target.value ? values.time : "" })}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-2">
          <Label htmlFor="interview-time">Time</Label>
          <Input id="interview-time" type="time" disabled={!values.date} value={values.time} onChange={(event) => update("time", event.target.value)} />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="interview-duration">Duration</Label>
          <Input
            id="interview-duration"
            type="number"
            min="1"
            placeholder="Min"
            value={values.duration}
            onChange={(event) => update("duration", event.target.value)}
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="interview-interviewer">Interviewer</Label>
        <Input
          id="interview-interviewer"
          placeholder="Name"
          value={values.interviewerName}
          onChange={(event) => update("interviewerName", event.target.value)}
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="interview-location">Location</Label>
        <Input id="interview-location" placeholder="Office or city" value={values.location} onChange={(event) => update("location", event.target.value)} />
      </div>

      <div className="flex flex-col gap-2 sm:col-span-2">
        <Label htmlFor="interview-meeting-url">Meeting link</Label>
        <Input
          id="interview-meeting-url"
          type="url"
          placeholder="https://"
          value={values.meetingUrl}
          onChange={(event) => update("meetingUrl", event.target.value)}
        />
        <p className="text-xs text-muted-foreground">Optional. Leave this blank for an onsite interview.</p>
      </div>
      <div className="flex flex-col gap-2 sm:col-span-2">
        <Label htmlFor="interview-notes">Notes</Label>
        <Textarea
          id="interview-notes"
          placeholder="Anything you want to remember before or after the interview..."
          value={values.notes}
          onChange={(event) => update("notes", event.target.value)}
        />
      </div>
      <div className="flex flex-col gap-2 sm:col-span-2">
        <Label htmlFor="interview-outcome">Outcome</Label>
        <Input id="interview-outcome" placeholder="Optional" value={values.outcome} onChange={(event) => update("outcome", event.target.value)} />
      </div>
      {error && (
        <p role="alert" className="text-sm text-destructive sm:col-span-2">
          {error}
        </p>
      )}
    </div>
  );
}
