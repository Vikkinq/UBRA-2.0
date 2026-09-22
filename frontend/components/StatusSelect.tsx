"use client";

import { Loader2 } from "lucide-react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getStatusColorClasses } from "@/lib/status-colors";
import { cn } from "@/lib/utils";
import type { FilterOption } from "@/lib/types/job-applications";

/* -------------------------------------------------------------------------- */
/*  StatusSelect: an inline, editable version of StatusBadge.                  */
/*                                                                            */
/*  Looks exactly like the pill from StatusBadge until hovered or focused,     */
/*  when a chevron appears to hint it's interactive. Colors come from          */
/*  getStatusColorClasses, so it always matches the read-only badge.           */
/*  Generic: works for any FilterOption list, not just job application        */
/*  statuses, as long as the caller supplies the right options.                */
/* -------------------------------------------------------------------------- */

interface StatusSelectProps {
  /** Current status id, as a string (FilterOption.value is numeric, Select works in strings). */
  value: string;
  /** Current status name, used to look up the pill color. */
  label: string;
  options: FilterOption[];
  onChange: (option: FilterOption) => void;
  /** True while a change is being saved. Disables the select and shows a spinner instead of the chevron. */
  isSaving?: boolean;
  className?: string;
}

export function StatusSelect({
  value,
  label,
  options,
  onChange,
  isSaving = false,
  className,
}: StatusSelectProps) {
  return (
    <Select
      items={options.map((o) => ({
        label: o.label ?? "Untitled",
        value: String(o.value),
      }))}
      value={value}
      onValueChange={(next) => {
        const option = options.find((o) => String(o.value) === next);
        if (option && String(option.value) !== value)
          onChange(option);
      }}
      disabled={isSaving}
    >
      <SelectTrigger
        aria-label={`Change status, currently ${label}`}
        className={cn(
          // Reset the default select-trigger chrome so it reads as a plain badge at rest.
          "h-auto w-fit gap-1 rounded-full border-0 px-2.5 py-1 text-xs font-medium shadow-none",
          "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
          "data-[state=open]:ring-2 data-[state=open]:ring-ring data-[state=open]:ring-offset-1",
          // The chevron (rendered by SelectTrigger itself) only shows up on hover/focus/open/saving,
          // so the table looks calm until the user's attention is actually on this cell.
          "[&>svg]:opacity-0 [&>svg]:transition-opacity hover:[&>svg]:opacity-60 focus-visible:[&>svg]:opacity-60 data-[state=open]:[&>svg]:opacity-60",
          getStatusColorClasses(label),
          isSaving && "cursor-wait opacity-80",
          className,
        )}
      >
        {isSaving ? (
          <span className="flex items-center gap-1.5">
            <SelectValue>{label}</SelectValue>
            <Loader2
              className="size-3 shrink-0 animate-spin"
              aria-hidden="true"
            />
          </span>
        ) : (
          <SelectValue>{label}</SelectValue>
        )}
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.value} value={String(option.value)}>
            <span
              className={cn(
                "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
                getStatusColorClasses(option.label ?? ""),
              )}
            >
              {option.label ?? "Untitled"}
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
