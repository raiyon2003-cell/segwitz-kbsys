import { cn } from "@/lib/utils";

export function DocumentStatusBadge({ status }: { status: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize ring-1 ring-inset",
        status === "published" &&
          "bg-brand-lime/15 text-brand-charcoal ring-brand-lime/35",
        status === "draft" &&
          "bg-brand-steel/15 text-brand-teal ring-brand-steel/35",
        status === "archived" &&
          "bg-surface-muted text-foreground-muted ring-border-subtle",
      )}
    >
      {status}
    </span>
  );
}
