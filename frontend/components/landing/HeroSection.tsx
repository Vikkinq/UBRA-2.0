import { Button, buttonVariants } from "@/components/ui/button";
import { DotGridBackground } from "@/components/DotGridBackground";
import { cn } from "@/lib/utils";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden px-6 pb-24 pt-28 sm:pb-32 sm:pt-36">
      <DotGridBackground />

      <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
        {/* Eyebrow */}
        <span className="rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary">
          Built for job seekers, not spreadsheets
        </span>

        {/* Headline */}
        <h1 className="mt-6 max-w-2xl text-4xl font-semibold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
          Stop losing track of your job hunt.
        </h1>

        {/* Subheadline */}
        <p className="mt-6 max-w-xl text-lg text-muted-foreground">
          UBRA keeps every application, status, and interview in one place, so you always know exactly where you stand.
        </p>

        {/* CTAs */}
        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <Button size="lg" className="px-8">
            Get started
          </Button>
          <a href="#video" className={cn(buttonVariants({ size: "lg", variant: "outline" }), "px-8")}>
            See how it works
          </a>
        </div>
      </div>

      {/* Dashboard preview with a glow hugging its shape */}
      <div className="relative mx-auto mt-20 max-w-4xl">
        <PreviewGlow />
        <DashboardPreview />
      </div>
    </section>
  );
}

function PreviewGlow() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute -inset-6 -z-10 rounded-[2rem] bg-primary/25 blur-2xl sm:-inset-10"
    />
  );
}

function DashboardPreview() {
  const rows = [
    { company: "Northwind Labs", role: "Frontend Engineer", status: "Interviewing", tone: "primary" },
    { company: "Solace Health", role: "Product Designer", status: "Applied", tone: "muted" },
    { company: "Fenwick & Co.", role: "Backend Engineer", status: "Offer", tone: "success" },
    { company: "Ridgeline", role: "QA Analyst", status: "Applied", tone: "muted" },
  ] as const;

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-2xl shadow-primary/10">
      {/* Window chrome */}
      <div className="flex items-center gap-1.5 border-b border-border px-4 py-3">
        <span className="h-2.5 w-2.5 rounded-full bg-muted-foreground/20" />
        <span className="h-2.5 w-2.5 rounded-full bg-muted-foreground/20" />
        <span className="h-2.5 w-2.5 rounded-full bg-muted-foreground/20" />
      </div>

      <div className="flex">
        {/* Mini sidebar */}
        <div className="hidden w-40 shrink-0 border-r border-border p-4 sm:block">
          <div className="mb-6 h-3 w-20 rounded bg-foreground/80" />
          <div className="space-y-3">
            <div className="h-2.5 w-24 rounded bg-primary/80" />
            <div className="h-2.5 w-20 rounded bg-muted-foreground/25" />
            <div className="h-2.5 w-16 rounded bg-muted-foreground/25" />
            <div className="h-2.5 w-24 rounded bg-muted-foreground/25" />
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 p-4 sm:p-6">
          <div className="mb-4 h-3 w-32 rounded bg-foreground/70" />
          <div className="space-y-2">
            {rows.map((row) => (
              <div
                key={row.company}
                className="flex items-center justify-between rounded-lg border border-border/60 px-3 py-2.5 text-left"
              >
                <div>
                  <p className="text-sm font-medium text-foreground">{row.company}</p>
                  <p className="text-xs text-muted-foreground">{row.role}</p>
                </div>
                <StatusPill tone={row.tone} label={row.status} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusPill({ tone, label }: { tone: "primary" | "muted" | "success"; label: string }) {
  const toneClasses = {
    primary: "bg-primary/10 text-primary",
    muted: "bg-muted-foreground/10 text-muted-foreground",
    success: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  } as const;

  return <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${toneClasses[tone]}`}>{label}</span>;
}
