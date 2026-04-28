import Link from "next/link";
import { DocumentStatusBadge } from "@/components/documents/document-status";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui";
import type { DocumentListEmbed } from "@/types/documents";

type Props = {
  items: DocumentListEmbed[];
  emptyText: string;
};

export function DashboardRecentUploads({ items, emptyText }: Props) {
  return (
    <Card className="border-border-subtle">
      <CardHeader>
        <CardTitle className="text-base">Recent uploads</CardTitle>
        <CardDescription>
          Newest documents by upload time (most recent first).
        </CardDescription>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className="text-sm text-foreground-muted">{emptyText}</p>
        ) : (
          <ul className="divide-y divide-border-subtle">
            {items.map((row) => (
              <li
                key={row.id}
                className="flex flex-wrap items-center gap-2 py-3 first:pt-0 last:pb-0"
              >
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/documents/${row.id}`}
                    className="font-medium text-foreground underline-offset-4 hover:text-accent hover:underline"
                  >
                    {row.title}
                  </Link>
                  <p className="mt-0.5 text-xs text-foreground-muted tabular-nums">
                    {new Date(row.created_at).toLocaleString(undefined, {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </p>
                </div>
                <DocumentStatusBadge status={row.status} />
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
