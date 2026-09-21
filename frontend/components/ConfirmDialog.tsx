"use client";

import type { ReactNode } from "react";
import { Pencil, Plus, Trash2, type LucideIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

/* -------------------------------------------------------------------------- */
/*  ConfirmDialog: one dialog for confirming create, edit and delete.          */
/*                                                                            */
/*  It knows nothing about any module. The caller passes:                      */
/*    - `fields`  (create / delete): what the record looks like                */
/*    - `changes` (edit): before / after pairs of what is about to change      */
/*  Values are ReactNodes, so callers can pass badges, formatted salaries...   */
/*  A value of null / undefined / "" counts as empty.                          */
/* -------------------------------------------------------------------------- */

export type ConfirmType = "create" | "edit" | "delete";

export interface ConfirmField {
  label: string;
  value: ReactNode;
}

export interface ConfirmChange {
  label: string;
  before: ReactNode;
  after: ReactNode;
}

const TYPE_CONFIG: Record<
  ConfirmType,
  {
    icon: LucideIcon;
    verb: string;
    description: string;
    confirmLabel: string;
    loadingLabel: string;
    cancelLabel: string;
    iconClassName: string;
    destructive: boolean;
  }
> = {
  create: {
    icon: Plus,
    verb: "Create",
    description: "Review the details before saving.",
    confirmLabel: "Create",
    loadingLabel: "Creating...",
    cancelLabel: "Cancel",
    iconClassName: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
    destructive: false,
  },
  edit: {
    icon: Pencil,
    verb: "Edit",
    description: "", // built from the number of changes
    confirmLabel: "Save Changes",
    loadingLabel: "Saving...",
    cancelLabel: "Back to editing",
    iconClassName: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
    destructive: false,
  },
  delete: {
    icon: Trash2,
    verb: "Delete",
    description: "This action cannot be undone.",
    confirmLabel: "Delete",
    loadingLabel: "Deleting...",
    cancelLabel: "Cancel",
    iconClassName: "bg-destructive/10 text-destructive",
    destructive: true,
  },
};

function isEmpty(value: ReactNode) {
  return value === null || value === undefined || value === false || value === "";
}

function pluralizeFields(count: number) {
  return `${count} ${count === 1 ? "field" : "fields"}`;
}

function FieldRow({ label, value }: ConfirmField) {
  return (
    <div className="grid grid-cols-[6.5rem_1fr] gap-3 px-3 py-2 text-sm">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="min-w-0 break-words font-medium text-foreground">{value}</dd>
    </div>
  );
}

function FieldsCard({ fields, tone }: { fields: ConfirmField[]; tone: "neutral" | "danger" }) {
  const filled = fields.filter((field) => !isEmpty(field.value));
  const emptyCount = fields.length - filled.length;

  return (
    <div className="space-y-2">
      <dl
        className={cn(
          "max-h-64 divide-y overflow-y-auto rounded-lg border",
          tone === "danger"
            ? "divide-destructive/15 border-destructive/30 bg-destructive/5"
            : "divide-border border-border bg-muted/30",
        )}
      >
        {filled.map((field) => (
          <FieldRow key={field.label} {...field} />
        ))}
      </dl>
      {emptyCount > 0 && (
        <p className="text-xs text-muted-foreground">{pluralizeFields(emptyCount)} empty, not shown</p>
      )}
    </div>
  );
}

function ChangesList({ changes, unchanged }: { changes: ConfirmChange[]; unchanged?: ConfirmField[] }) {
  return (
    <div className="max-h-[55vh] space-y-4 overflow-y-auto pr-1">
      {changes.map((change) => (
        <div key={change.label} className="space-y-1.5">
          <p className="text-sm font-medium text-foreground">{change.label}</p>

          <div className="grid gap-2 sm:grid-cols-2">
            <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-3 text-sm">
              <span className="mb-1 block text-xs text-muted-foreground">Before</span>
              <div
                className={cn(
                  "break-words text-muted-foreground",
                  typeof change.before === "string" && change.before !== "" && "line-through decoration-red-500/50",
                )}
              >
                {isEmpty(change.before) ? <span className="italic">Empty</span> : change.before}
              </div>
            </div>

            <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3 text-sm">
              <span className="mb-1 block text-xs text-muted-foreground">After</span>
              <div className="break-words text-foreground">
                {isEmpty(change.after) ? <span className="italic text-muted-foreground">Empty</span> : change.after}
              </div>
            </div>
          </div>
        </div>
      ))}

      {unchanged && unchanged.length > 0 && (
        <details className="rounded-lg border border-border">
          <summary className="cursor-pointer px-3 py-2 text-sm text-muted-foreground">
            {pluralizeFields(unchanged.length)} unchanged
          </summary>
          <dl className="divide-y divide-border border-t border-border">
            {unchanged
              .filter((field) => !isEmpty(field.value))
              .map((field) => (
                <FieldRow key={field.label} {...field} />
              ))}
          </dl>
        </details>
      )}
    </div>
  );
}

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: ConfirmType;
  /** What kind of record this is, e.g. "Job Application". Becomes part of the header. */
  entity: string;
  /** The specific record, e.g. "Frontend Engineer at Acme". */
  itemName?: string;
  /** Overrides the default line under the header. */
  description?: string;
  /** create / delete: what the record looks like. */
  fields?: ConfirmField[];
  /** edit: what is about to change. */
  changes?: ConfirmChange[];
  /** edit: fields that stay the same, shown collapsed. */
  unchanged?: ConfirmField[];
  onConfirm: () => void;
  isLoading?: boolean;
  error?: string | null;
  confirmLabel?: string;
  cancelLabel?: string;
}

export function ConfirmDialog({
  open,
  onOpenChange,
  type,
  entity,
  itemName,
  description,
  fields = [],
  changes = [],
  unchanged,
  onConfirm,
  isLoading = false,
  error,
  confirmLabel,
  cancelLabel,
}: ConfirmDialogProps) {
  const config = TYPE_CONFIG[type];
  const Icon = config.icon;

  const headerDescription =
    description ?? (type === "edit" ? `${pluralizeFields(changes.length)} will be updated.` : config.description);

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        // Don't let Esc / outside clicks interrupt a request in flight.
        if (!isLoading) onOpenChange(next);
      }}
    >
      <DialogContent className={cn(type === "edit" ? "sm:max-w-2xl" : "sm:max-w-md")}>
        <DialogHeader>
          <div className="flex items-start gap-3">
            <div
              className={cn("flex size-10 shrink-0 items-center justify-center rounded-full", config.iconClassName)}
              aria-hidden="true"
            >
              <Icon className="size-5" />
            </div>

            <div className="min-w-0 space-y-1 text-left">
              <DialogTitle>
                {config.verb} {entity}
              </DialogTitle>
              {itemName && <p className="break-words text-sm font-medium text-foreground">{itemName}</p>}
              <DialogDescription>{headerDescription}</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {type === "edit" ? (
          <ChangesList changes={changes} unchanged={unchanged} />
        ) : (
          <FieldsCard fields={fields} tone={type === "delete" ? "danger" : "neutral"} />
        )}

        {error && (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}

        <DialogFooter>
          <Button type="button" variant="outline" disabled={isLoading} onClick={() => onOpenChange(false)}>
            {cancelLabel ?? config.cancelLabel}
          </Button>
          <Button
            type="button"
            variant={config.destructive ? "destructive" : "default"}
            disabled={isLoading}
            onClick={onConfirm}
          >
            {isLoading ? config.loadingLabel : (confirmLabel ?? config.confirmLabel)}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
