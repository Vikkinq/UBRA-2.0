"use client";

import { CircleAlert, CircleCheck, Info, Pencil, Plus, Trash2, TriangleAlert, X, type LucideIcon } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/* -------------------------------------------------------------------------- */
/*  Toast: a fully custom card rendered through Sonner's toast.custom().        */
/*                                                                            */
/*  Sonner still handles stacking, timing, swipe-to-dismiss and hover-pause.   */
/*  This file only controls what the card looks like. Mount <Toaster /> once   */
/*  in the root layout, then call `notify.create(...)`, `notify.delete(...)`   */
/*  and friends from anywhere.                                                 */
/*                                                                            */
/*  Each type gets three touches of color, never a fully colored card:         */
/*    1. a thin accent bar on the left edge                                    */
/*    2. a soft color wash that fades out toward the middle                    */
/*    3. a tinted icon circle                                                  */
/*  create / edit / delete use the same icons as ConfirmDialog.                */
/* -------------------------------------------------------------------------- */

export type ToastVariant = "create" | "edit" | "delete" | "success" | "error" | "info" | "warning";

interface VariantStyle {
  icon: LucideIcon;
  /** Tinted circle behind the icon. */
  iconClassName: string;
  /** Thin bar on the left edge. */
  accentClassName: string;
  /** Start color of the wash that fades to transparent. */
  tint: string;
}

const VARIANTS: Record<ToastVariant, VariantStyle> = {
  create: {
    icon: Plus,
    iconClassName: "bg-emerald-500/15 text-emerald-600 ring-1 ring-inset ring-emerald-500/25 dark:text-emerald-400",
    accentClassName: "bg-emerald-500",
    tint: "rgb(16 185 129 / 0.12)",
  },
  edit: {
    icon: Pencil,
    iconClassName: "bg-amber-500/15 text-amber-600 ring-1 ring-inset ring-amber-500/25 dark:text-amber-400",
    accentClassName: "bg-amber-500",
    tint: "rgb(245 158 11 / 0.12)",
  },
  delete: {
    icon: Trash2,
    iconClassName: "bg-red-500/15 text-red-600 ring-1 ring-inset ring-red-500/25 dark:text-red-400",
    accentClassName: "bg-red-500",
    tint: "rgb(239 68 68 / 0.12)",
  },
  success: {
    icon: CircleCheck,
    iconClassName: "bg-emerald-500/15 text-emerald-600 ring-1 ring-inset ring-emerald-500/25 dark:text-emerald-400",
    accentClassName: "bg-emerald-500",
    tint: "rgb(16 185 129 / 0.12)",
  },
  error: {
    icon: CircleAlert,
    iconClassName: "bg-red-500/15 text-red-600 ring-1 ring-inset ring-red-500/25 dark:text-red-400",
    accentClassName: "bg-red-500",
    tint: "rgb(239 68 68 / 0.12)",
  },
  info: {
    icon: Info,
    iconClassName: "bg-sky-500/15 text-sky-600 ring-1 ring-inset ring-sky-500/25 dark:text-sky-400",
    accentClassName: "bg-sky-500",
    tint: "rgb(14 165 233 / 0.12)",
  },
  warning: {
    icon: TriangleAlert,
    iconClassName: "bg-orange-500/15 text-orange-600 ring-1 ring-inset ring-orange-500/25 dark:text-orange-400",
    accentClassName: "bg-orange-500",
    tint: "rgb(249 115 22 / 0.12)",
  },
};

export interface ToastAction {
  label: string;
  onClick: () => void;
}

interface ToastCardProps {
  id: string | number;
  variant: ToastVariant;
  title: string;
  description?: string;
  action?: ToastAction;
}

export function ToastCard({ id, variant, title, description, action }: ToastCardProps) {
  const { icon: Icon, iconClassName, accentClassName, tint } = VARIANTS[variant];

  return (
    <div className="relative w-[356px] max-w-[calc(100vw-2rem)] overflow-hidden rounded-xl border border-border bg-popover p-4 text-popover-foreground shadow-lg">
      {/* Color layers: a wash that fades out by the middle, and a thin bar on the left edge. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{ background: `linear-gradient(90deg, ${tint} 0%, transparent 60%)` }}
      />
      <div aria-hidden="true" className={cn("absolute inset-y-0 left-0 w-1", accentClassName)} />

      {/* Content sits above the color layers. */}
      <div className="relative flex items-start gap-3">
        <div
          className={cn("flex size-9 shrink-0 items-center justify-center rounded-full", iconClassName)}
          aria-hidden="true"
        >
          <Icon className="size-[18px]" />
        </div>

        <div className="min-w-0 flex-1 space-y-0.5 pr-5">
          <p className="text-sm font-medium leading-snug text-foreground">{title}</p>
          {description && <p className="text-sm leading-snug text-muted-foreground">{description}</p>}

          {action && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-2 h-7"
              onClick={() => {
                action.onClick();
                toast.dismiss(id);
              }}
            >
              {action.label}
            </Button>
          )}
        </div>
      </div>

      <button
        type="button"
        aria-label="Dismiss notification"
        onClick={() => toast.dismiss(id)}
        className="absolute right-2 top-2 rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      >
        <X className="size-3.5" />
      </button>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  notify: the API the rest of the app uses                                   */
/* -------------------------------------------------------------------------- */

export interface NotifyOptions {
  description?: string;
  action?: ToastAction;
  /** Milliseconds. Defaults to Sonner's default, and a bit longer for errors. */
  duration?: number;
}

function show(variant: ToastVariant, title: string, options?: string | NotifyOptions) {
  // A plain string is shorthand for { description }.
  const { description, action, duration }: NotifyOptions =
    typeof options === "string" ? { description: options } : (options ?? {});

  return toast.custom(
    (id) => <ToastCard id={id} variant={variant} title={title} description={description} action={action} />,
    { duration: duration ?? (variant === "error" ? 6000 : undefined) },
  );
}

type NotifyFn = (title: string, options?: string | NotifyOptions) => string | number;

export const notify: Record<ToastVariant, NotifyFn> = {
  create: (title, options) => show("create", title, options),
  edit: (title, options) => show("edit", title, options),
  delete: (title, options) => show("delete", title, options),
  success: (title, options) => show("success", title, options),
  error: (title, options) => show("error", title, options),
  info: (title, options) => show("info", title, options),
  warning: (title, options) => show("warning", title, options),
};

/** Pulls Laravel's `message` out of an axios error, or returns the fallback. */
export function getApiErrorMessage(error: unknown, fallback = "Something went wrong. Please try again."): string {
  const message = (error as { response?: { data?: { message?: unknown } } })?.response?.data?.message;
  return typeof message === "string" && message ? message : fallback;
}
