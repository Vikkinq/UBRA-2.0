"use client";

import { useEffect, useState } from "react";
import {
  Banknote,
  Briefcase,
  CalendarDays,
  Check,
  Copy,
  ExternalLink,
  Globe,
  Link2,
  MapPin,
  Pencil,
  Trash2,
} from "lucide-react";

import { StatusBadge } from "@/components/StatusBadge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { QuickView, QuickViewFact, QuickViewFacts, QuickViewSection, type QuickViewNav } from "@/components/QuickView";
import {
  getCompanyDisplayName,
  formatSalaryRange,
  formatAppliedDate,
  formatRelativeDate,
  getHostname,
} from "@/lib/format";
import { cn } from "@/lib/utils";
import type { FilterOption, JobApplication } from "@/lib/types/job-applications";

// Statuses that are outcomes, not steps. Adjust to match your md_application_statuses names.
const OFF_PIPELINE_STATUSES = ["rejected", "withdrawn", "declined", "ghosted"];

const COMING_SOON_TABS = [
  { value: "interviews", label: "Interviews", hint: "Schedule and track each interview round for this application." },
  { value: "documents", label: "Documents", hint: "Keep the resume and cover letter you sent in one place." },
  { value: "history", label: "History", hint: "See every status change and edit over time." },
];

function StatusProgress({
  statuses,
  currentId,
  currentName,
}: {
  statuses: FilterOption[];
  currentId: number;
  currentName: string;
}) {
  const pipeline = statuses.filter((status) => !OFF_PIPELINE_STATUSES.includes((status.label ?? "").toLowerCase()));
  const currentIndex = pipeline.findIndex((status) => status.value === currentId);

  // Rejected / withdrawn / unknown statuses have no place on the pipeline, so skip the strip.
  if (currentIndex === -1) return null;

  return (
    <div className="space-y-2">
      <div
        className="flex gap-1.5"
        role="img"
        aria-label={`Stage ${currentIndex + 1} of ${pipeline.length}: ${currentName}`}
      >
        {pipeline.map((status, i) => (
          <div
            key={status.value}
            title={status.label ?? undefined}
            className={cn(
              "h-1.5 flex-1 rounded-full transition-colors",
              i < currentIndex && "bg-primary/50",
              i === currentIndex && "bg-primary",
              i > currentIndex && "bg-muted",
            )}
          />
        ))}
      </div>
      <p className="text-xs text-muted-foreground">
        Stage {currentIndex + 1} of {pipeline.length}:{" "}
        <span className="font-medium text-foreground">{currentName}</span>
      </p>
    </div>
  );
}

function ComingSoon({ hint }: { hint: string }) {
  return (
    <div className="flex flex-col items-center gap-1 rounded-lg border border-dashed border-border px-6 py-10 text-center">
      <p className="text-sm font-medium text-foreground">Coming soon</p>
      <p className="max-w-xs text-sm text-muted-foreground">{hint}</p>
    </div>
  );
}

interface ApplicationQuickViewProps {
  /** The application to show. Pass null to close the drawer. */
  application: JobApplication | null;
  statusOptions: FilterOption[];
  nav?: QuickViewNav;
  onClose: () => void;
  onEdit?: (application: JobApplication) => void;
  onDelete?: (application: JobApplication) => void;
}

export function ApplicationQuickView({
  application,
  statusOptions,
  nav,
  onClose,
  onEdit,
  onDelete,
}: ApplicationQuickViewProps) {
  // Keep the last application around so the content doesn't vanish mid close-animation.
  const [lastApplication, setLastApplication] = useState<JobApplication | null>(application);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (application) setLastApplication(application);
  }, [application]);

  useEffect(() => {
    if (!copied) return;
    const timeout = setTimeout(() => setCopied(false), 1500);
    return () => clearTimeout(timeout);
  }, [copied]);

  const data = application ?? lastApplication;
  if (!data) return null;

  const company = getCompanyDisplayName(data);
  const relativeApplied = formatRelativeDate(data.applied_at);

  async function copyJobUrl() {
    if (!data?.job_url) return;
    try {
      await navigator.clipboard.writeText(data.job_url);
      setCopied(true);
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <QuickView
      open={application !== null}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      title={data.job_title}
      avatarLabel={company}
      subtitle={
        <span className="flex flex-wrap items-center gap-x-3 gap-y-0.5">
          <span className="font-medium text-foreground">{company}</span>
          {data.location && (
            <span className="inline-flex items-center gap-1">
              <MapPin className="size-3.5" />
              {data.location}
            </span>
          )}
        </span>
      }
      badge={<StatusBadge status={data.status.name} />}
      nav={nav}
      footer={
        onEdit || onDelete ? (
          <div className="flex gap-2">
            {onEdit && (
              <Button className="flex-1 gap-2" onClick={() => onEdit(data)}>
                <Pencil className="size-4" />
                Edit Application
              </Button>
            )}
            {onDelete && (
              <Button
                variant="outline"
                className="gap-2 text-destructive hover:text-destructive"
                onClick={() => onDelete(data)}
              >
                <Trash2 className="size-4" />
                Delete
              </Button>
            )}
          </div>
        ) : undefined
      }
    >
      <Tabs defaultValue="overview">
        <TabsList className="w-full">
          <TabsTrigger value="overview" className="flex-1">
            Overview
          </TabsTrigger>
          {COMING_SOON_TABS.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value} className="flex-1">
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="overview" className="mt-5 space-y-6">
          <StatusProgress statuses={statusOptions} currentId={data.status.id} currentName={data.status.name} />

          <QuickViewFacts>
            <QuickViewFact icon={CalendarDays} label="Applied">
              {formatAppliedDate(data.applied_at)}
              {relativeApplied && (
                <span className="block text-xs font-normal text-muted-foreground">{relativeApplied}</span>
              )}
            </QuickViewFact>
            <QuickViewFact icon={Banknote} label="Salary">
              {formatSalaryRange(data)}
            </QuickViewFact>
            <QuickViewFact icon={Briefcase} label="Employment type">
              {data.employment_type?.name ?? "—"}
            </QuickViewFact>
            <QuickViewFact icon={Globe} label="Source">
              {data.source?.name ?? "—"}
            </QuickViewFact>
          </QuickViewFacts>

          {data.job_url && (
            <div className="flex items-center gap-2 rounded-lg border border-border p-2 pl-3">
              <Link2 className="size-4 shrink-0 text-muted-foreground" />
              <span className="min-w-0 flex-1 truncate text-sm text-muted-foreground">{getHostname(data.job_url)}</span>
              <Button variant="ghost" size="icon" className="size-8" onClick={copyJobUrl} aria-label="Copy job link">
                {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
              </Button>
              <a
                href={data.job_url}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(buttonVariants({ variant: "outline", size: "sm" }), "gap-1.5")}
              >
                Open posting
                <ExternalLink className="size-3.5" />
              </a>
            </div>
          )}

          <QuickViewSection title="Notes">
            {data.notes ? (
              <p className="whitespace-pre-wrap rounded-lg bg-muted/40 p-3 text-sm leading-relaxed text-foreground">
                {data.notes}
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">
                No notes yet. You can add some when you edit this application.
              </p>
            )}
          </QuickViewSection>
        </TabsContent>

        {COMING_SOON_TABS.map((tab) => (
          <TabsContent key={tab.value} value={tab.value} className="mt-5">
            <ComingSoon hint={tab.hint} />
          </TabsContent>
        ))}
      </Tabs>
    </QuickView>
  );
}
