import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui";
import type { CountByLabel } from "@/types/dashboard";

type Props = {
  title: string;
  description: string;
  items: CountByLabel[];
  itemHref: (id: string) => string;
  emptyText: string;
};

export function DashboardDistributionCard({
  title,
  description,
  items,
  itemHref,
  emptyText,
}: Props) {
  const max = Math.max(1, ...items.map((i) => i.count));
  return (
    <Card className="border-border-subtle">
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className="text-sm text-foreground-muted">{emptyText}</p>
        ) : (
          <ul className="space-y-3.5">
            {items.map((row) => (
              <li key={row.id}>
                <div className="mb-1 flex items-baseline justify-between gap-2 text-sm">
                  <Link
                    href={itemHref(row.id)}
                    className="min-w-0 flex-1 truncate font-medium text-foreground underline-offset-4 hover:text-accent hover:underline"
                  >
                    {row.name}
                  </Link>
                  <span className="shrink-0 tabular-nums text-foreground-muted">
                    {row.count}
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-surface-muted">
                  <div
                    className="h-full rounded-full bg-accent/70 transition-[width]"
                    style={{ width: `${(row.count / max) * 100}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
