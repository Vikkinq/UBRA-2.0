import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Breadcrumbs } from "@/components/app/Breadcrumbs";
import { LiveClock } from "@/components/LiveClock";

export function AppNavbar() {
  return (
    <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center justify-between gap-2 border-b border-border/60 bg-background/80 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <Breadcrumbs />

      <div className="flex items-center gap-3">
        <LiveClock />
        <ThemeToggle />
      </div>
    </header>
  );
}
