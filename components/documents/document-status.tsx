import { cn } from "@/lib/utils";

export function DocumentStatusBadge({ status }: { status: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize ring-1 ring-inset",
        status === "published" &&
          "bg-emerald-500/10 text-emerald-700 ring-emerald-500/25 dark:text-emerald-300",
        status === "draft" &&
          "bg-amber-500/10 text-amber-800 ring-amber-500/25 dark:text-amber-200",
        status === "archived" &&
          "bg-surface-muted text-foreground-muted ring-border-subtle",
      )}
    >
      {status}
    </span>
  );
}
