"use client";

import { useEffect, useMemo, useState } from "react";
import { Suspense } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, ArrowRight, CalendarDays, Clock3, Eye, Plus, RotateCcw } from "lucide-react";

import { AppHeader } from "@/components/AppHeader";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { FormModal } from "@/components/FormModal";
import { emptyInterviewFormValues, InterviewFormFields, type InterviewFormValues } from "@/components/app/interviews/InterviewFormFields";
import { getInterviewSummaryFields } from "@/components/app/interviews/InterviewConfirm";
import { InterviewQuickView } from "@/components/app/interviews/InterviewQuickView";
import { notify, getApiErrorMessage } from "@/components/Toast";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { api } from "@/lib/api";
import { formatDate, formatTime, getCompanyDisplayName, getLocalDateKey, getLocalDateTimeInputs } from "@/lib/format";
import type { JobApplication, PaginationMeta } from "@/lib/types/job-applications";
import type { JobInterview } from "@/lib/types/job-interviews";

interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

const INTERVIEWS_PER_PAGE = 15;

const weekdayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function getInterviewDateKey(value: string | null): string | null {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : getLocalDateKey(parsed);
}

function getCalendarDays(month: Date): Date[] {
  const first = new Date(month.getFullYear(), month.getMonth(), 1);
  const start = new Date(first);
  start.setDate(first.getDate() - first.getDay());
  const dayCount = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const totalCells = Math.ceil((first.getDay() + dayCount) / 7) * 7;

  return Array.from({ length: totalCells }, (_, index) => {
    const day = new Date(start);
    day.setDate(start.getDate() + index);
    return day;
  });
}

async function getAllPages<T>(path: string, filters: Record<string, string> = {}): Promise<T[]> {
  const firstParams = new URLSearchParams({ ...filters, page: "1", perPage: "100" });
  const first = await api.get<PaginatedResponse<T>>(`${path}?${firstParams.toString()}`);
  const firstPage = first.data;
  if (firstPage.meta.lastPage <= 1) return firstPage.data;

  const remainingPages = await Promise.all(
    Array.from({ length: firstPage.meta.lastPage - 1 }, (_, index) => {
      const params = new URLSearchParams({ ...filters, page: String(index + 2), perPage: "100" });
      return api.get<PaginatedResponse<T>>(`${path}?${params.toString()}`);
    }),
  );

  return [firstPage.data, ...remainingPages.map((response) => response.data.data)].flat();
}

export default function InterviewsPage() {
  return (
    <Suspense fallback={<div className="flex min-h-64 items-center justify-center text-sm text-muted-foreground">Loading interviews...</div>}>
      <InterviewsPageContent />
    </Suspense>
  );
}

function InterviewsPageContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const dateParam = searchParams.get("date");
  const parsedDateParam = dateParam ? new Date(`${dateParam}T12:00:00`) : null;
  const selectedDate = parsedDateParam && !Number.isNaN(parsedDateParam.getTime()) && getLocalDateKey(parsedDateParam) === dateParam ? dateParam : null;
  const [interviews, setInterviews] = useState<JobInterview[]>([]);
  const [calendarInterviews, setCalendarInterviews] = useState<JobInterview[]>([]);
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [applicationsError, setApplicationsError] = useState<string | null>(null);
  const [calendarLoading, setCalendarLoading] = useState(true);
  const [calendarError, setCalendarError] = useState<string | null>(null);
  const [listMeta, setListMeta] = useState<PaginationMeta | null>(null);
  const [listPage, setListPage] = useState(1);
  const [visibleMonth, setVisibleMonth] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formValues, setFormValues] = useState<InterviewFormValues>(emptyInterviewFormValues);
  const [formError, setFormError] = useState<string | null>(null);
  const [editingInterviewId, setEditingInterviewId] = useState<number | null>(null);
  const [quickViewId, setQuickViewId] = useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<JobInterview | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [restoreQuickViewAfterDelete, setRestoreQuickViewAfterDelete] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  function updateDateParam(date: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (date) params.set("date", date);
    else params.delete("date");
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }

  useEffect(() => {
    setListPage(1);
    if (!selectedDate) return;
    const [year, month] = selectedDate.split("-").map(Number);
    setVisibleMonth((current) => (current.getFullYear() === year && current.getMonth() === month - 1 ? current : new Date(year, month - 1, 1)));
  }, [selectedDate]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError(null);
        const params = new URLSearchParams({ page: String(listPage), perPage: String(INTERVIEWS_PER_PAGE) });
        if (selectedDate) params.set("scheduledDate", selectedDate);
        const response = await api.get<PaginatedResponse<JobInterview>>(`/job-interviews?${params.toString()}`);
        if (!cancelled) {
          setInterviews(response.data.data);
          setListMeta(response.data.meta);
        }
      } catch (err) {
        if (!cancelled) setError(getApiErrorMessage(err));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [refreshKey, selectedDate, listPage]);

  useEffect(() => {
    let cancelled = false;

    async function loadCalendarMonth() {
      setCalendarLoading(true);
      setCalendarError(null);
      setCalendarInterviews([]);
      const visibleDays = getCalendarDays(visibleMonth);
      const scheduledFrom = getLocalDateKey(visibleDays[0]);
      const scheduledTo = getLocalDateKey(visibleDays[visibleDays.length - 1]);

      try {
        const monthInterviews = await getAllPages<JobInterview>("/job-interviews", { scheduledFrom, scheduledTo });
        if (!cancelled) setCalendarInterviews(monthInterviews);
      } catch (err) {
        if (!cancelled) setCalendarError(getApiErrorMessage(err));
      } finally {
        if (!cancelled) setCalendarLoading(false);
      }
    }

    loadCalendarMonth();
    return () => {
      cancelled = true;
    };
  }, [visibleMonth, refreshKey]);

  useEffect(() => {
    let cancelled = false;

    async function loadApplications() {
      setApplicationsError(null);
      try {
        const loadedApplications = await getAllPages<JobApplication>("/job-applications");
        if (!cancelled) setApplications(loadedApplications);
      } catch (err) {
        if (!cancelled) setApplicationsError(getApiErrorMessage(err));
      }
    }

    loadApplications();
    return () => {
      cancelled = true;
    };
  }, []);

  const interviewsByDate = useMemo(() => {
    const grouped = new Map<string, JobInterview[]>();
    for (const interview of calendarInterviews) {
      const key = getInterviewDateKey(interview.scheduled_at);
      if (!key) continue;
      grouped.set(key, [...(grouped.get(key) ?? []), interview]);
    }
    return grouped;
  }, [calendarInterviews]);

  const displayedInterviews = interviews;

  const calendarDays = useMemo(() => getCalendarDays(visibleMonth), [visibleMonth]);
  const todayKey = getLocalDateKey(new Date());
  const quickViewInterview = interviews.find((interview) => interview.id === quickViewId) ?? null;

  function changeMonth(amount: number) {
    setVisibleMonth((month) => new Date(month.getFullYear(), month.getMonth() + amount, 1));
    if (selectedDate) updateDateParam(null);
    setListPage(1);
  }

  function openCreateModal() {
    const defaultDate = selectedDate ?? "";
    setFormValues({ ...emptyInterviewFormValues, jobApplicationId: applications[0] ? String(applications[0].id) : "", date: defaultDate });
    setFormError(null);
    setEditingInterviewId(null);
    setIsModalOpen(true);
  }

  function openEditModal(interview: JobInterview) {
    const scheduled = getLocalDateTimeInputs(interview.scheduled_at);
    setFormValues({
      jobApplicationId: String(interview.job_application_id),
      interviewType: interview.interview_type ?? "",
      roundName: interview.round_name ?? "",
      date: scheduled.date,
      time: scheduled.time,
      duration: interview.duration ? String(interview.duration) : "",
      location: interview.location ?? "",
      meetingUrl: interview.meeting_url ?? "",
      interviewerName: interview.interviewer_name ?? "",
      notes: interview.notes ?? "",
      outcome: interview.outcome ?? "",
    });
    setEditingInterviewId(interview.id);
    setQuickViewId(null);
    setFormError(null);
    setIsModalOpen(true);
  }

  function handleModalOpenChange(open: boolean) {
    setIsModalOpen(open);
    if (!open && editingInterviewId !== null) {
      setQuickViewId(editingInterviewId);
      setEditingInterviewId(null);
    }
  }

  function openDeleteDialog(interview: JobInterview) {
    setDeleteTarget(interview);
    setDeleteError(null);
    setRestoreQuickViewAfterDelete(true);
    setQuickViewId(null);
    setIsDeleteOpen(true);
  }

  function handleDeleteDialogOpenChange(open: boolean) {
    setIsDeleteOpen(open);
    if (!open && deleteTarget && restoreQuickViewAfterDelete) setQuickViewId(deleteTarget.id);
  }

  async function handleDeleteInterview() {
    if (!deleteTarget) return;
    setIsDeleting(true);
    setDeleteError(null);
    try {
      await api.delete(`/job-interviews/${deleteTarget.id}`);
      const itemName = `${getCompanyDisplayName(deleteTarget.job_application)} · ${deleteTarget.job_application.job_title}`;
      if (interviews.length === 1 && listPage > 1) setListPage((page) => page - 1);
      setRestoreQuickViewAfterDelete(false);
      setIsDeleteOpen(false);
      setDeleteTarget(null);
      setRefreshKey((key) => key + 1);
      notify.delete("Interview Deleted", { itemName, description: "has been removed from your schedule." });
    } catch (err) {
      setDeleteError(getApiErrorMessage(err));
    } finally {
      setIsDeleting(false);
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);

    if (Boolean(formValues.date) !== Boolean(formValues.time)) {
      setFormError("Enter both a date and time, or leave both blank for an unscheduled interview.");
      return;
    }

    setIsSubmitting(true);
    const application = applications.find((item) => String(item.id) === formValues.jobApplicationId);

    try {
      // Keep the selected wall-clock time intact. Laravel's datetime cast parses this in app timezone.
      const scheduledAt = formValues.date && formValues.time ? `${formValues.date} ${formValues.time}:00` : null;
      const payload = {
        interview_type: formValues.interviewType.trim() || null,
        round_name: formValues.roundName.trim() || null,
        scheduled_at: scheduledAt,
        duration: formValues.duration ? Number(formValues.duration) : null,
        location: formValues.location.trim() || null,
        meeting_url: formValues.meetingUrl.trim() || null,
        interviewer_name: formValues.interviewerName.trim() || null,
        notes: formValues.notes.trim() || null,
        outcome: formValues.outcome.trim() || null,
      };

      if (editingInterviewId !== null) {
        const interviewId = editingInterviewId;
        const response = await api.put(`/job-interviews/${interviewId}`, payload);
        const saved: JobInterview = response.data?.data ?? response.data;
        setInterviews((rows) => rows.map((interview) => (interview.id === interviewId ? saved : interview)));
        setEditingInterviewId(null);
        setIsModalOpen(false);
        setQuickViewId(interviewId);
        notify.edit("Interview Updated", {
          itemName: `${getCompanyDisplayName(saved.job_application)} · ${saved.job_application.job_title}`,
          description: "has been updated.",
        });
      } else {
        await api.post("/job-interviews", {
          ...payload,
          job_application_id: Number(formValues.jobApplicationId),
        });
        setIsModalOpen(false);
        setListPage(1);
        notify.create("Interview Added", {
          itemName: application ? `${getCompanyDisplayName(application)} · ${application.job_title}` : "Interview",
          description: "has been added to your interview schedule.",
        });
      }

      setRefreshKey((key) => key + 1);
    } catch (err) {
      setFormError(getApiErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <AppHeader
        title="Interviews"
        description="Keep track of interview schedules and details for your applications."
        action={
          <Button className="gap-2" onClick={openCreateModal} disabled={applications.length === 0}>
            <Plus className="size-4" />
            Add interview
          </Button>
        }
      />

      {(error || applicationsError) && (
        <div className="flex flex-col gap-3 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between">
          <p className="text-destructive">{error || applicationsError}</p>
          <Button variant="outline" size="sm" className="gap-2" onClick={() => setRefreshKey((key) => key + 1)}>
            <RotateCcw className="size-3.5" /> Retry
          </Button>
        </div>
      )}

      <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1.00fr)_minmax(0,0.95fr)]">
        <section className="overflow-hidden rounded-lg border border-border bg-card" aria-label="Interview calendar">
          <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3 sm:px-5">
            <div>
              <h2 className="text-sm font-semibold text-foreground">Calendar</h2>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {calendarLoading ? "Loading this month…" : calendarError || "Select a date to see its interviews."}
              </p>
            </div>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" className="size-8" onClick={() => changeMonth(-1)} aria-label="Previous month">
                <ArrowLeft className="size-4" />
              </Button>
              <p className="min-w-32 text-center text-sm font-medium">
                {new Intl.DateTimeFormat(undefined, { month: "long", year: "numeric" }).format(visibleMonth)}
              </p>
              <Button variant="ghost" size="icon" className="size-8" onClick={() => changeMonth(1)} aria-label="Next month">
                <ArrowRight className="size-4" />
              </Button>
            </div>
          </div>

          <div className="p-3 sm:p-5">
            <div className="grid grid-cols-7">
              {weekdayLabels.map((day) => (
                <div key={day} className="pb-2 text-center text-xs font-medium text-muted-foreground">
                  {day}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 overflow-hidden rounded-md border-l border-t border-border">
              {calendarDays.map((day) => {
                const key = getLocalDateKey(day);
                const isCurrentMonth = day.getMonth() === visibleMonth.getMonth();
                const isSelected = selectedDate === key;
                const dayInterviews = interviewsByDate.get(key) ?? [];

                return (
                  <button
                    key={key}
                    type="button"
                    aria-pressed={isSelected}
                    aria-label={`${new Intl.DateTimeFormat(undefined, { dateStyle: "full" }).format(day)}${dayInterviews.length ? `, ${dayInterviews.length} interview${dayInterviews.length === 1 ? "" : "s"}` : ""}`}
                    onClick={() => {
                      updateDateParam(selectedDate === key ? null : key);
                      setListPage(1);
                    }}
                    className={`group min-h-[76px] border-b border-r border-border p-1.5 text-left transition-colors sm:min-h-[100px] sm:p-2 ${isCurrentMonth ? "bg-card" : "bg-muted/30"} ${isSelected ? "bg-primary/5 ring-1 ring-inset ring-primary" : "hover:bg-muted/60"}`}
                  >
                    <span
                      className={`mx-auto flex size-7 items-center justify-center rounded-full text-xs ${key === todayKey ? "bg-primary font-semibold text-primary-foreground" : isSelected ? "font-semibold text-primary" : isCurrentMonth ? "text-foreground" : "text-muted-foreground/60"}`}
                    >
                      {day.getDate()}
                    </span>
                    <div className="mt-1 space-y-1">
                      {dayInterviews.slice(0, 2).map((interview) => (
                        <div
                          key={interview.id}
                          className={`truncate rounded px-1 py-0.5 text-[10px] leading-4 sm:text-xs ${isSelected ? "bg-primary/15 text-primary" : "bg-violet-500/10 text-violet-700 dark:text-violet-300"}`}
                        >
                          {interview.scheduled_at ? formatTime(interview.scheduled_at) : ""} {getCompanyDisplayName(interview.job_application)}
                        </div>
                      ))}
                      {dayInterviews.length > 2 && <p className="px-1 text-[10px] text-muted-foreground">+{dayInterviews.length - 2} more</p>}
                    </div>
                  </button>
                );
              })}
            </div>
            <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-violet-500" /> Interview scheduled
              </span>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs"
                onClick={() => {
                  setVisibleMonth(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
                  updateDateParam(null);
                  setListPage(1);
                }}
              >
                Today
              </Button>
            </div>
          </div>
        </section>

        <section className="overflow-hidden rounded-lg border border-border bg-card" aria-label="Interview list">
          <div className="flex min-h-[65px] items-center justify-between gap-3 border-b border-border px-4 py-3 sm:px-5">
            <div>
              <h2 className="text-sm font-semibold text-foreground">{selectedDate ? "Interviews on this day" : "All interviews"}</h2>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {selectedDate
                  ? `${new Intl.DateTimeFormat(undefined, { dateStyle: "full" }).format(new Date(`${selectedDate}T12:00:00`))} · ${listMeta?.total ?? 0} interview${listMeta?.total === 1 ? "" : "s"}`
                  : `${listMeta?.total ?? 0} interview${listMeta?.total === 1 ? "" : "s"} · earliest first`}
              </p>
            </div>
            {selectedDate && (
              <Button
                variant="ghost"
                size="sm"
                className="gap-1.5 text-muted-foreground"
                onClick={() => {
                  updateDateParam(null);
                  setListPage(1);
                }}
              >
                <RotateCcw className="size-3.5" /> All dates
              </Button>
            )}
          </div>

          {loading ? (
            <div className="flex min-h-64 items-center justify-center text-sm text-muted-foreground">Loading interviews...</div>
          ) : displayedInterviews.length === 0 ? (
            <div className="flex min-h-64 flex-col items-center justify-center gap-3 px-6 text-center">
              <div className="flex size-11 items-center justify-center rounded-full bg-muted">
                {selectedDate ? <CalendarDays className="size-5 text-muted-foreground" /> : <Clock3 className="size-5 text-muted-foreground" />}
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">{selectedDate ? "No interviews on this day" : "No interviews yet"}</p>
                <p className="mt-1 max-w-xs text-sm text-muted-foreground">
                  {selectedDate ? "Choose another date or add an interview for this day." : "Add an interview to keep your schedule and details in one place."}
                </p>
              </div>
              {applications.length > 0 && (
                <Button className="mt-1 gap-2" size="sm" onClick={openCreateModal}>
                  <Plus className="size-4" /> Add interview
                </Button>
              )}
              {applications.length === 0 && !selectedDate && (
                <p className="text-xs text-muted-foreground">Add a job application first to schedule an interview.</p>
              )}
            </div>
          ) : (
            <div className="max-h-[620px] overflow-auto">
              <Table className="min-w-[680px] table-fixed">
                <TableHeader className="sticky top-0 z-10 bg-card">
                  <TableRow>
                    <TableHead className="w-[22%]">Scheduled</TableHead>
                    <TableHead className="w-[26%]">Application</TableHead>
                    <TableHead className="w-[19%]">Round</TableHead>
                    <TableHead className="w-[19%]">Interview type</TableHead>
                    <TableHead className="w-[14%] text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {displayedInterviews.map((interview) => (
                    <TableRow key={interview.id}>
                      <TableCell className="align-top">
                        {interview.scheduled_at ? (
                          <>
                            <p className="whitespace-nowrap text-sm font-medium text-foreground">{formatDate(interview.scheduled_at)}</p>
                            <p className="mt-0.5 whitespace-nowrap text-xs text-muted-foreground">{formatTime(interview.scheduled_at)}</p>
                          </>
                        ) : (
                          <span className="text-xs text-muted-foreground">Unscheduled</span>
                        )}
                      </TableCell>
                      <TableCell className="min-w-0 align-top">
                        <p className="truncate text-sm font-medium text-foreground">{getCompanyDisplayName(interview.job_application)}</p>
                        <p className="mt-0.5 truncate text-xs text-muted-foreground">{interview.job_application.job_title}</p>
                      </TableCell>
                      <TableCell className="align-top">
                        <span className="line-clamp-2 text-sm text-foreground">{interview.round_name || <span className="text-muted-foreground">—</span>}</span>
                      </TableCell>
                      <TableCell className="align-top">
                        <span className="line-clamp-2 text-sm text-foreground">
                          {interview.interview_type || <span className="text-muted-foreground">—</span>}
                        </span>
                      </TableCell>
                      <TableCell className="align-top text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8"
                          aria-label={`View ${interview.round_name || "interview"}`}
                          onClick={() => setQuickViewId(interview.id)}
                        >
                          <Eye className="size-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {!selectedDate && interviews.some((interview) => !interview.scheduled_at) && (
                <p className="border-t border-border px-4 py-2 text-xs text-muted-foreground">Unscheduled interviews are listed after dated interviews.</p>
              )}
            </div>
          )}
          {!loading && listMeta && listMeta.lastPage > 1 && (
            <div className="flex items-center justify-between gap-3 border-t border-border px-4 py-3">
              <p className="text-xs text-muted-foreground">
                Showing {listMeta.from ?? 0}–{listMeta.to ?? 0} of {listMeta.total}
              </p>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" disabled={listPage <= 1} onClick={() => setListPage((page) => page - 1)}>
                  Previous
                </Button>
                <span className="text-xs tabular-nums text-muted-foreground">
                  {listMeta.currentPage} / {listMeta.lastPage}
                </span>
                <Button variant="outline" size="sm" disabled={listPage >= listMeta.lastPage} onClick={() => setListPage((page) => page + 1)}>
                  Next
                </Button>
              </div>
            </div>
          )}
        </section>
      </div>

      <FormModal
        open={isModalOpen}
        onOpenChange={handleModalOpenChange}
        title={editingInterviewId !== null ? "Edit interview" : "Add interview"}
        description={
          editingInterviewId !== null ? "Update the schedule and details for this interview." : "Add the schedule and details for an application interview."
        }
        submitLabel={editingInterviewId !== null ? "Save changes" : "Save interview"}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        className="max-h-[90svh] overflow-y-auto"
      >
        <InterviewFormFields
          values={formValues}
          onChange={setFormValues}
          applications={applications}
          isEditing={editingInterviewId !== null}
          error={formError}
        />
      </FormModal>

      <InterviewQuickView interview={quickViewInterview} onClose={() => setQuickViewId(null)} onEdit={openEditModal} onDelete={openDeleteDialog} />

      {deleteTarget && (
        <ConfirmDialog
          open={isDeleteOpen}
          onOpenChange={handleDeleteDialogOpenChange}
          type="delete"
          entity="Interview"
          itemName={`${getCompanyDisplayName(deleteTarget.job_application)} · ${deleteTarget.job_application.job_title}`}
          fields={getInterviewSummaryFields(deleteTarget)}
          onConfirm={handleDeleteInterview}
          isLoading={isDeleting}
          error={deleteError}
        />
      )}
    </div>
  );
}
