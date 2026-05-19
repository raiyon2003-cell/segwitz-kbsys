import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  label: string;
  value: number;
  href: string;
};

export function DashboardStatCard({ label, value, href }: Props) {
  return (
    <Link href={href} className="group block h-full">
      <article
        className={cn(
          "relative h-full overflow-hidden rounded-xl border border-border/60 bg-card p-6 shadow-card ring-1 ring-border/30",
          "transition-all hover:border-primary/30 hover:shadow-card-hover",
        )}
      >
        <div
          className="pointer-events-none absolute -right-6 -top-6 size-24 rounded-full bg-gradient-to-br from-primary/15 to-accent/10"
          aria-hidden
        />
        <div className="relative flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {label}
            </p>
            <p className="mt-2 text-3xl font-bold tabular-nums tracking-tight text-foreground">
              {value.toLocaleString()}
            </p>
          </div>
          <span className="flex size-9 items-center justify-center rounded-lg bg-muted text-muted-foreground ring-1 ring-border/40 transition-colors group-hover:bg-primary/10 group-hover:text-primary">
            <ArrowUpRight className="size-4" aria-hidden />
          </span>
        </div>
        <p className="relative mt-4 text-sm text-muted-foreground group-hover:text-primary">
          View in list →
        </p>
      </article>
    </Link>
  );
}
