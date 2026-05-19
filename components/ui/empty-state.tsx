import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-border/60 bg-gradient-to-b from-card/80 to-muted/30 p-1 shadow-sm",
        className,
      )}
    >
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/70 bg-card/50 px-6 py-14 text-center">
        {icon ? (
          <div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-muted text-muted-foreground ring-1 ring-border/50">
            {icon}
          </div>
        ) : null}
        <h3 className="text-base font-semibold text-foreground">{title}</h3>
        {description ? (
          <p className="mt-2 max-w-md text-sm text-muted-foreground">
            {description}
          </p>
        ) : null}
        {action ? <div className="mt-6">{action}</div> : null}
      </div>
    </div>
  );
}
