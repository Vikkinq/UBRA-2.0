"use client";

import { useEffect, useState } from "react";
import {
  Search,
  SlidersHorizontal,
  Plus,
  Inbox,
  ChevronLeft,
  ChevronRight,
  Eye,
  Pencil,
  Trash2,
} from "lucide-react";

import { AppHeader } from "@/components/AppHeader";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type {
  JobApplication,
  PaginationMeta,
} from "@/lib/types/job-applications";
import {
  getCompanyDisplayName,
  formatSalaryRange,
  formatAppliedDate,
} from "@/lib/format";
import { api } from "@/lib/api";
import { notify, getApiErrorMessage } from "@/components/Toast";

import { FormModal } from "@/components/FormModal";
import {
  ApplicationFormFields,
  emptyApplicationFormValues,
  type ApplicationFormValues,
} from "@/components/app/applications/ApplicationFormFields";
import { ApplicationQuickView } from "@/components/app/applications/ApplicationQuickView";
import { StatusSelect } from "@/components/StatusSelect";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import {
  getApplicationItemName,
  getApplicationSummaryFields,
} from "@/components/app/applications/ApplicationConfirm";
import type {
  FilterOption,
  CompanyOption,
} from "@/lib/types/job-applications";

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<JobApplication[]>(
    [],
  );
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [statusOptions, setStatusOptions] = useState<FilterOption[]>(
    [],
  );
  const [employmentTypeOptions, setEmploymentTypeOptions] = useState<
    FilterOption[]
  >([]);
  const [sourceOptions, setSourceOptions] = useState<FilterOption[]>(
    [],
  );
  const [companyOptions, setCompanyOptions] = useState<
    CompanyOption[]
  >([]);
  const [industryOptions, setIndustryOptions] = useState<
    FilterOption[]
  >([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formValues, setFormValues] = useState<ApplicationFormValues>(
    emptyApplicationFormValues,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  // null = the modal is in "Add" mode, a number = we're editing that application
  const [editingId, setEditingId] = useState<number | null>(null);
  // true when the edit was started from the QuickView drawer, so we can go back to it afterwards
  const [returnToQuickView, setReturnToQuickView] = useState(false);

  // Delete confirmation. The target is kept after closing so the dialog content
  // doesn't disappear mid close-animation.
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] =
    useState<JobApplication | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  // true when the delete was started from the QuickView drawer, so Cancel can go back to it
  const [deleteFromQuickView, setDeleteFromQuickView] =
    useState(false);

  // Row ids with a status change in flight, so their select can show a spinner
  // and reject further changes while saving.
  const [savingStatusIds, setSavingStatusIds] = useState<Set<number>>(
    new Set(),
  );
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // QuickView: we only store the id; the application itself is derived from the loaded list.
  const [quickViewId, setQuickViewId] = useState<number | null>(null);

  const quickViewIndex = applications.findIndex(
    (application) => application.id === quickViewId,
  );
  const quickViewApplication =
    quickViewIndex >= 0 ? applications[quickViewIndex] : null;

  const quickViewNav = quickViewApplication
    ? {
        index: quickViewIndex,
        total: applications.length,
        onPrev: () =>
          setQuickViewId(applications[quickViewIndex - 1].id),
        onNext: () =>
          setQuickViewId(applications[quickViewIndex + 1].id),
      }
    : undefined;

  function buildApplicationPayload(values: ApplicationFormValues) {
    return {
      company_id:
        values.companyMode === "existing" && values.companyId
          ? Number(values.companyId)
          : null,
      company_name:
        values.companyMode === "new"
          ? values.companyName || null
          : null,
      industry_id:
        values.companyMode === "new" && values.industryId
          ? Number(values.industryId)
          : null,
      status_id: values.statusId ? Number(values.statusId) : null,
      employment_type_id: values.employmentTypeId
        ? Number(values.employmentTypeId)
        : null,
      source_id: values.sourceId ? Number(values.sourceId) : null,
      job_title: values.jobTitle,
      job_url: values.jobUrl || null,
      location: values.location || null,
      salary_min: values.salaryMin ? Number(values.salaryMin) : null,
      salary_max: values.salaryMax ? Number(values.salaryMax) : null,
      salary_currency: values.salaryCurrency || null,
      applied_at: values.appliedAt || null,
      notes: values.notes || null,
    };
  }

  // Maps a saved application back into the form's shape (the reverse of buildApplicationPayload).
  function buildFormValues(
    application: JobApplication,
  ): ApplicationFormValues {
    const hasCompany = application.company !== null;

    return {
      ...emptyApplicationFormValues,
      companyMode: hasCompany ? "existing" : "new",
      companyId: application.company
        ? String(application.company.id)
        : "",
      companyName: hasCompany ? "" : (application.company_name ?? ""),
      industryId: "",
      statusId: String(application.status.id),
      employmentTypeId: application.employment_type
        ? String(application.employment_type.id)
        : "",
      sourceId: application.source
        ? String(application.source.id)
        : "",
      jobTitle: application.job_title,
      jobUrl: application.job_url ?? "",
      location: application.location ?? "",
      salaryMin: application.salary_min
        ? String(Number(application.salary_min))
        : "",
      salaryMax: application.salary_max
        ? String(Number(application.salary_max))
        : "",
      salaryCurrency:
        application.salary_currency ??
        emptyApplicationFormValues.salaryCurrency,
      // <input type="date"> needs YYYY-MM-DD, even if the API returns a full datetime
      appliedAt: application.applied_at
        ? application.applied_at.slice(0, 10)
        : "",
      notes: application.notes ?? "",
    };
  }

  function openCreateModal() {
    setEditingId(null);
    setFormValues(emptyApplicationFormValues);
    setIsModalOpen(true);
  }

  function openEditModal(
    application: JobApplication,
    fromQuickView = false,
  ) {
    setEditingId(application.id);
    setReturnToQuickView(fromQuickView);
    setFormValues(buildFormValues(application));
    setQuickViewId(null); // the drawer closes while the modal is open
    setIsModalOpen(true);
  }

  // Runs on Cancel, Esc, X, and after a successful save. If the edit started from
  // the QuickView, it brings the drawer back so the user lands where they started.
  function handleModalOpenChange(open: boolean) {
    setIsModalOpen(open);

    if (!open && editingId !== null) {
      if (returnToQuickView) setQuickViewId(editingId);
      setEditingId(null);
      setReturnToQuickView(false);
    }
  }

  async function handleStatusChange(
    application: JobApplication,
    option: FilterOption,
  ) {
    const previousStatus = application.status;
    const optimisticStatus = {
      id: option.value,
      name: option.label ?? previousStatus.name,
    };

    setSavingStatusIds((ids) => new Set(ids).add(application.id));
    setApplications((rows) =>
      rows.map((row) =>
        row.id === application.id
          ? { ...row, status: optimisticStatus }
          : row,
      ),
    );

    try {
      const res = await api.patch(
        `/job-applications/${application.id}/status`,
        { status_id: option.value },
      );
      const saved: JobApplication | undefined =
        res.data?.data ?? res.data;

      // Reconcile with the server's copy in case its name/casing differs from the option label.
      if (saved?.status) {
        setApplications((rows) =>
          rows.map((row) =>
            row.id === application.id
              ? { ...row, status: saved.status }
              : row,
          ),
        );
      }

      notify.edit("Status Updated", {
        itemName: getApplicationItemName(application),
        description: `moved to ${optimisticStatus.name}.`,
      });
    } catch (err) {
      console.error(err);
      // Roll back: the request failed, so the row shouldn't keep showing the new status.
      setApplications((rows) =>
        rows.map((row) =>
          row.id === application.id
            ? { ...row, status: previousStatus }
            : row,
        ),
      );
      notify.error("Status Change Failed", {
        itemName: getApplicationItemName(application),
        description: getApiErrorMessage(err),
      });
    } finally {
      setSavingStatusIds((ids) => {
        const next = new Set(ids);
        next.delete(application.id);
        return next;
      });
    }
  }

  function openDeleteDialog(
    application: JobApplication,
    fromQuickView = false,
  ) {
    setDeleteTarget(application);
    setDeleteFromQuickView(fromQuickView);
    setDeleteError(null);
    setQuickViewId(null); // the drawer closes while the dialog is open
    setIsDeleteOpen(true);
  }

  // Runs on Cancel, Esc and X (not after a successful delete). If the delete started
  // from the drawer, go back to it.
  function handleDeleteOpenChange(open: boolean) {
    setIsDeleteOpen(open);

    if (!open && deleteTarget && deleteFromQuickView) {
      setQuickViewId(deleteTarget.id);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;

    setIsDeleting(true);
    setDeleteError(null);

    try {
      const itemName = getApplicationItemName(deleteTarget);

      await api.delete(`/job-applications/${deleteTarget.id}`);

      setIsDeleteOpen(false);
      notify.delete("Successfully Deleted!", {
        itemName,
        description: "has been permanently removed.",
      });

      // Deleting the last item on a page beyond the first would leave an empty page.
      // Changing `page` already triggers a refetch, so only refresh manually otherwise.
      if (applications.length === 1 && page > 1) {
        setPage((p) => p - 1);
      } else {
        setRefreshKey((k) => k + 1);
      }
    } catch (err) {
      console.error(err);
      setDeleteError(
        `Couldn't delete this application. ${getApiErrorMessage(err)}`,
      );
    } finally {
      setIsDeleting(false);
    }
  }

  // Name for the toast when a save fails: built from what's in the form,
  // since there is no saved record to read it from.
  function getDraftName(
    values: ApplicationFormValues,
  ): string | null {
    const title = values.jobTitle.trim();
    if (!title) return null;

    const company =
      values.companyMode === "existing"
        ? companyOptions.find(
            (c) => String(c.id) === values.companyId,
          )?.name
        : values.companyName.trim();

    return company ? `${title} at ${company}` : title;
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();
    setIsSubmitting(true);

    const isEdit = editingId !== null;
    const draftName = getDraftName(formValues) ?? "Your application";

    try {
      const payload = buildApplicationPayload(formValues);

      // store() / update() return the saved application (or { data } if we move to a Resource).
      const res = isEdit
        ? await api.put(`/job-applications/${editingId}`, payload)
        : await api.post("/job-applications", payload);
      const saved: JobApplication | undefined =
        res.data?.data ?? res.data;
      const itemName = saved?.job_title
        ? getApplicationItemName(saved)
        : draftName;

      if (!isEdit) setPage(1); // new items show up on page 1; edits stay on the current page

      handleModalOpenChange(false);
      setRefreshKey((k) => k + 1);

      if (isEdit) {
        notify.edit("Successfully Updated!", {
          itemName,
          description: "has been updated.",
        });
      } else {
        notify.create("Successfully Created!", {
          itemName,
          description: "has been added to your applications.",
        });
      }
    } catch (err) {
      console.error(err);
      // Interim: shows the first validation error. Per-field errors in the form come later.
      notify.error(isEdit ? "Update Failed" : "Creation Failed", {
        itemName: draftName,
        description: `couldn't be ${isEdit ? "updated" : "added"}. ${getApiErrorMessage(err)}`,
      });
    } finally {
      setIsSubmitting(false);
    }
  }
  // Debounce: only update debouncedSearch 350ms after typing stops
  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 350);

    return () => clearTimeout(timeout);
  }, [search]);

  useEffect(() => {
    let cancelled = false;

    async function loadApplications() {
      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams({
          page: String(page),
          ...(debouncedSearch && { search: debouncedSearch }),
        });

        const { data: res } = await api.get(
          `/job-applications?${params.toString()}`,
        );

        if (!cancelled) {
          setApplications(res.data);
          setMeta(res.meta);
          setStatusOptions(res.statuses);
          setEmploymentTypeOptions(res.employmentTypes);
          setSourceOptions(res.sources);
          setCompanyOptions(res.companies);
          setIndustryOptions(res.industries);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Failed to load applications.",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadApplications();

    return () => {
      cancelled = true;
    };
  }, [page, debouncedSearch, refreshKey]);

  const pages = meta
    ? Array.from({ length: meta.lastPage }, (_, i) => i + 1)
    : [];

  return (
    <div className="flex flex-col gap-6">
      <AppHeader
        title="Job Applications"
        description="Track and manage every application you've submitted."
      />

      <div className="overflow-hidden rounded-lg border border-border">
        {/* Toolbar */}
        <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 items-center gap-2">
            <div className="relative w-full sm:max-w-xs">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search applications..."
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <Button variant="outline" className="gap-2">
              <SlidersHorizontal className="size-4" />
              Filters
            </Button>
          </div>

          <Button className="gap-2" onClick={openCreateModal}>
            <Plus className="size-4" />
            Add Application
          </Button>
        </div>

        <div className="border-t border-border" />

        {error && (
          <div className="px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center px-6 py-16 text-sm text-muted-foreground">
            Loading applications...
          </div>
        ) : applications.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-muted">
              <Inbox className="size-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">
                No applications yet
              </p>
              <p className="mt-1 max-w-xs text-sm text-muted-foreground">
                Start tracking your job search by adding your first
                application.
              </p>
            </div>
            <Button className="mt-2 gap-2" onClick={openCreateModal}>
              <Plus className="size-4" />
              Add Application
            </Button>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Applied Date</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Job Position</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Employment Type</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Salary</TableHead>
                <TableHead>Notes</TableHead>
                <TableHead className="w-32">
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {applications.map((application) => (
                <TableRow
                  key={application.id}
                  data-state={
                    application.id === quickViewId
                      ? "selected"
                      : undefined
                  }
                >
                  <TableCell className="text-muted-foreground">
                    {formatAppliedDate(application.applied_at)}
                  </TableCell>
                  <TableCell className="font-medium text-foreground">
                    {getCompanyDisplayName(application)}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {application.job_title}
                  </TableCell>
                  <TableCell>
                    <StatusSelect
                      value={String(application.status.id)}
                      label={application.status.name}
                      options={statusOptions}
                      isSaving={savingStatusIds.has(application.id)}
                      onChange={(option) =>
                        handleStatusChange(application, option)
                      }
                    />
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {application.employment_type?.name ?? "—"}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {application.location ?? "—"}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatSalaryRange(application)}
                  </TableCell>
                  <TableCell className="max-w-48 truncate text-muted-foreground">
                    {application.notes ?? "—"}
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8"
                        aria-label={`Quick view ${application.job_title}`}
                        onClick={() => setQuickViewId(application.id)}
                      >
                        <Eye className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8"
                        aria-label={`Edit ${application.job_title}`}
                        onClick={() => openEditModal(application)}
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 text-muted-foreground hover:text-destructive"
                        aria-label={`Delete ${application.job_title}`}
                        onClick={() => openDeleteDialog(application)}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        {/* Pagination */}
        {!loading && applications.length > 0 && meta && (
          <div className="flex flex-col items-center justify-between gap-3 border-t border-border px-4 py-3 sm:flex-row">
            <p className="text-sm text-muted-foreground">
              Showing {meta.from ?? 0}-{meta.to ?? 0} of {meta.total}{" "}
              applications
            </p>

            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                className="size-8"
                disabled={meta.currentPage <= 1}
                onClick={() => setPage((p) => p - 1)}
                aria-label="Previous page"
              >
                <ChevronLeft className="size-4" />
              </Button>

              {pages.map((p) => (
                <Button
                  key={p}
                  variant={
                    p === meta.currentPage ? "default" : "outline"
                  }
                  size="icon"
                  className="size-8"
                  onClick={() => setPage(p)}
                >
                  {p}
                </Button>
              ))}

              <Button
                variant="outline"
                size="icon"
                className="size-8"
                disabled={meta.currentPage >= meta.lastPage}
                onClick={() => setPage((p) => p + 1)}
                aria-label="Next page"
              >
                <ChevronRight className="size-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      <FormModal
        open={isModalOpen}
        onOpenChange={handleModalOpenChange}
        title={
          editingId !== null ? "Edit Application" : "Add Application"
        }
        description={
          editingId !== null
            ? "Update the details of this application."
            : "Track a new job application."
        }
        submitLabel={editingId !== null ? "Save Changes" : "Save"}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      >
        <ApplicationFormFields
          values={formValues}
          onChange={setFormValues}
          statusOptions={statusOptions}
          employmentTypeOptions={employmentTypeOptions}
          sourceOptions={sourceOptions}
          companyOptions={companyOptions}
          industryOptions={industryOptions}
        />
      </FormModal>

      {/* QuickView Drawer */}
      <ApplicationQuickView
        application={quickViewApplication}
        statusOptions={statusOptions}
        nav={quickViewNav}
        onClose={() => setQuickViewId(null)}
        onEdit={(application) => openEditModal(application, true)}
        onDelete={(application) =>
          openDeleteDialog(application, true)
        }
      />

      {/* Delete confirmation */}
      {deleteTarget && (
        <ConfirmDialog
          open={isDeleteOpen}
          onOpenChange={handleDeleteOpenChange}
          type="delete"
          entity="Job Application"
          itemName={getApplicationItemName(deleteTarget)}
          fields={getApplicationSummaryFields(deleteTarget)}
          onConfirm={handleDelete}
          isLoading={isDeleting}
          error={deleteError}
        />
      )}
    </div>
  );
}
