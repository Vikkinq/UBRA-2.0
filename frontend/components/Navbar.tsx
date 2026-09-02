import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { cn } from "@/lib/utils";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="text-lg font-semibold tracking-tight text-foreground">
          UBRA
        </Link>

        <div className="flex items-center gap-2">
          <ThemeToggle />

          <Link
            href="/login"
            className="px-3 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Login
          </Link>

          <Link href="/register" className={cn(buttonVariants({ size: "sm" }), "px-5")}>
            Get Started
          </Link>
        </div>
      </div>
    </header>
  );
}
