import type { ReactNode } from "react";

import { CardHeader, CardTitle } from "@/components/ui/card";

interface CareerSectionHeaderProps {
  icon: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
}

export function CareerSectionHeader({ icon, title, description, action }: CareerSectionHeaderProps) {
  return (
    <CardHeader className="flex-row items-center justify-between gap-3 border-b border-border">
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">{icon}</div>
        <div className="min-w-0">
          <CardTitle>{title}</CardTitle>
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
      {action}
    </CardHeader>
  );
}
