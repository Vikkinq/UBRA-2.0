"use client";

import { useEffect, type ReactNode } from "react";
import { ChevronDown, ChevronUp, type LucideIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { getInitials } from "@/lib/format";
import { cn } from "@/lib/utils";

/* -------------------------------------------------------------------------- */
/*  QuickView: a generic, reusable right-side drawer.                          */
/*                                                                            */
/*  It knows nothing about job applications. It only provides the chrome:      */
/*  accent line, prev/next navigation, avatar + title header, scrollable       */
/*  body, sticky footer, loading skeleton, and keyboard shortcuts.             */
/*  Each module (applications, companies, ...) builds its own wrapper that     */
/*  fills the slots. See ApplicationQuickView.tsx for an example.              */
/* -------------------------------------------------------------------------- */

const AVATAR_TINTS = [
  "bg-violet-500/15 text-violet-700 dark:text-violet-300",
  "bg-sky-500/15 text-sky-700 dark:text-sky-300",
  "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
  "bg-amber-500/15 text-amber-700 dark:text-amber-300",
  "bg-rose-500/15 text-rose-700 dark:text-rose-300",
  "bg-teal-500/15 text-teal-700 dark:text-teal-300",
];

function hashString(value: string) {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  }
  return hash;
}

export interface QuickViewNav {
  /** Zero-based index of the current item in the list being browsed. */
  index: number;
  total: number;
  onPrev: () => void;
  onNext: () => void;
}

export interface QuickViewProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  /** Line under the title (company, location, etc.). Renders inside a <p>, so use inline elements like <span> only. */
  subtitle?: ReactNode;
  /** Text used for the avatar initials and tint. Defaults to the title. */
  avatarLabel?: string;
  /** Sits under the subtitle, usually a status badge. */
  badge?: ReactNode;
  /** Tailwind class for the thin line on top of the drawer, e.g. "bg-emerald-500". */
  accentClassName?: string;
  loading?: boolean;
  /** Enables prev/next buttons and Up/Down arrow keys. */
  nav?: QuickViewNav;
  /** Sticky bottom area, usually the primary action. */
  footer?: ReactNode;
  children: ReactNode;
}

export function QuickView({
  open,
  onOpenChange,
  title,
  subtitle,
  avatarLabel,
  badge,
  accentClassName,
  loading = false,
  nav,
  footer,
  children,
}: QuickViewProps) {
  const hasPrev = !!nav && nav.index > 0;
  const hasNext = !!nav && nav.index < nav.total - 1;

  // Up / Down arrows browse through items while the drawer is open.
  useEffect(() => {
    if (!open || !nav) return;

    function handleKeyDown(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)) {
        return;
      }

      if (event.key === "ArrowDown" && hasNext) {
        event.preventDefault();
        nav?.onNext();
      } else if (event.key === "ArrowUp" && hasPrev) {
        event.preventDefault();
        nav?.onPrev();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, nav, hasPrev, hasNext]);

  const avatarSource = avatarLabel ?? title;
  const tint = AVATAR_TINTS[hashString(avatarSource) % AVATAR_TINTS.length];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      {/* To Change the Width of the Drawer or QuickView */}
      <SheetContent side="right" className="flex w-full flex-col gap-0 p-0 data-[side=right]:sm:max-w-[640px]">
        <div className={cn("h-1 w-full shrink-0", accentClassName ?? "bg-primary")} />

        {nav && (
          <div className="flex shrink-0 items-center gap-1 border-b border-border px-3 py-2 pr-12">
            <Button
              variant="ghost"
              size="icon"
              className="size-8"
              disabled={!hasPrev}
              onClick={nav.onPrev}
              aria-label="Previous item"
            >
              <ChevronUp className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="size-8"
              disabled={!hasNext}
              onClick={nav.onNext}
              aria-label="Next item"
            >
              <ChevronDown className="size-4" />
            </Button>
            <span className="ml-1 text-xs tabular-nums text-muted-foreground">
              {nav.index + 1} of {nav.total}
            </span>
          </div>
        )}

        {/* Header */}
        <div className="flex shrink-0 items-start gap-3 border-b border-border px-5 py-4 pr-12">
          {loading ? (
            <>
              <SheetTitle className="sr-only">Loading</SheetTitle>
              <div className="size-12 shrink-0 animate-pulse rounded-xl bg-muted" />
              <div className="flex-1 space-y-2 pt-1">
                <div className="h-5 w-3/4 animate-pulse rounded bg-muted" />
                <div className="h-4 w-1/2 animate-pulse rounded bg-muted" />
              </div>
            </>
          ) : (
            <>
              <div
                className={cn(
                  "flex size-12 shrink-0 items-center justify-center rounded-xl text-base font-semibold",
                  tint,
                )}
                aria-hidden="true"
              >
                {getInitials(avatarSource)}
              </div>
              <div className="min-w-0 flex-1">
                <SheetTitle className="text-lg leading-snug">{title}</SheetTitle>
                {subtitle && (
                  <SheetDescription className="mt-0.5 text-sm text-muted-foreground">{subtitle}</SheetDescription>
                )}
                {badge && <div className="mt-2">{badge}</div>}
              </div>
            </>
          )}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-5">
          {loading ? (
            <div className="space-y-4">
              <div className="h-2 w-full animate-pulse rounded bg-muted" />
              <div className="grid grid-cols-2 gap-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-16 animate-pulse rounded-lg bg-muted" />
                ))}
              </div>
              <div className="h-24 animate-pulse rounded-lg bg-muted" />
            </div>
          ) : (
            children
          )}
        </div>

        {/* Footer */}
        {footer && <div className="shrink-0 border-t border-border bg-background px-5 py-3">{footer}</div>}
      </SheetContent>
    </Sheet>
  );
}

/* -------------------------------------------------------------------------- */
/*  Building blocks for QuickView bodies                                       */
/* -------------------------------------------------------------------------- */

export function QuickViewSection({
  title,
  action,
  children,
  className,
}: {
  title: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-sm font-medium text-foreground">{title}</h3>
        {action}
      </div>
      {children}
    </section>
  );
}

export function QuickViewFacts({ children, className }: { children: ReactNode; className?: string }) {
  return <dl className={cn("grid grid-cols-2 gap-2", className)}>{children}</dl>;
}

export function QuickViewFact({
  icon: Icon,
  label,
  children,
  className,
}: {
  icon: LucideIcon;
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("min-w-0 rounded-lg border border-border bg-muted/30 p-3", className)}>
      <dt className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Icon className="size-3.5 shrink-0" />
        {label}
      </dt>
      <dd className="mt-1 break-words text-sm font-medium text-foreground">{children}</dd>
    </div>
  );
}
