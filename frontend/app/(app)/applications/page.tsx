"use client";

import { useEffect, useState } from "react";
import { Search, SlidersHorizontal, Plus, Inbox, ChevronLeft, ChevronRight } from "lucide-react";

import { AppHeader } from "@/components/AppHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { JobApplication, PaginationMeta } from "@/lib/types/job-applications";
import { getCompanyDisplayName, formatSalaryRange, formatAppliedDate } from "@/lib/format";
import { apiFetch } from "@/lib/api-fetch";

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

        const res = await apiFetch(`/job-applications?${params.toString()}`);

        if (!cancelled) {
          setApplications(res.data);
          setMeta(res.meta);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load applications.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadApplications();

    return () => {
      cancelled = true;
    };
  }, [page, debouncedSearch]);

  const pages = meta ? Array.from({ length: meta.lastPage }, (_, i) => i + 1) : [];

  return (
    <div className="flex flex-col gap-6">
      <AppHeader title="Job Applications" description="Track and manage every application you've submitted." />

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

          <Button className="gap-2">
            <Plus className="size-4" />
            Add Application
          </Button>
        </div>

        <div className="border-t border-border" />

        {error && <div className="px-4 py-3 text-sm text-destructive">{error}</div>}

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
              <p className="text-sm font-medium text-foreground">No applications yet</p>
              <p className="mt-1 max-w-xs text-sm text-muted-foreground">
                Start tracking your job search by adding your first application.
              </p>
            </div>
            <Button className="mt-2 gap-2">
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
              </TableRow>
            </TableHeader>
            <TableBody>
              {applications.map((application) => (
                <TableRow
                  key={application.id}
                  onClick={() => {
                    // TODO: open QuickView drawer once it's built
                    console.log("Open drawer for application", application.id);
                  }}
                  className="cursor-pointer"
                >
                  <TableCell className="text-muted-foreground">{formatAppliedDate(application.applied_at)}</TableCell>
                  <TableCell className="font-medium text-foreground">{getCompanyDisplayName(application)}</TableCell>
                  <TableCell className="text-muted-foreground">{application.job_title}</TableCell>
                  <TableCell>
                    <StatusBadge status={application.status.name} />
                  </TableCell>
                  <TableCell className="text-muted-foreground">{application.employmentType?.name ?? "—"}</TableCell>
                  <TableCell className="text-muted-foreground">{application.location ?? "—"}</TableCell>
                  <TableCell className="text-muted-foreground">{formatSalaryRange(application)}</TableCell>
                  <TableCell className="max-w-48 truncate text-muted-foreground">{application.notes ?? "—"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        {/* Pagination */}
        {!loading && applications.length > 0 && meta && (
          <div className="flex flex-col items-center justify-between gap-3 border-t border-border px-4 py-3 sm:flex-row">
            <p className="text-sm text-muted-foreground">
              Showing {meta.from ?? 0}-{meta.to ?? 0} of {meta.total} applications
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
                  variant={p === meta.currentPage ? "default" : "outline"}
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
    </div>
  );
}
