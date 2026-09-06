"use client";

import * as React from "react";

export function LiveClock() {
  const [time, setTime] = React.useState<string | null>(null);

  React.useEffect(() => {
    const update = () => {
      setTime(
        new Intl.DateTimeFormat("en-PH", {
          timeZone: "Asia/Manila",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
        }).format(new Date()),
      );
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!time) return null;

  return (
    <span className="hidden font-mono text-sm text-muted-foreground sm:inline-flex sm:items-center sm:gap-1">
      {time}
      <span className="text-xs text-muted-foreground/70">MNL</span>
    </span>
  );
}
