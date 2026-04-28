import Link from "next/link";
import { DocumentArchiveButton } from "@/components/documents/document-archive-button";
import { DocumentStatusBadge } from "@/components/documents/document-status";
import type { DocumentListEmbed } from "@/types/documents";

function formatUpdated(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function DocumentsGrid({
  rows,
  canManage,
}: {
  rows: DocumentListEmbed[];
  canManage: boolean;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {rows.map((row) => (
        <article
          key={row.id}
          className="group flex flex-col rounded-xl border border-border-subtle bg-surface p-5 shadow-sm ring-1 ring-black/[0.02] transition hover:border-border hover:shadow-md dark:ring-white/[0.04]"
        >
          <div className="flex items-start justify-between gap-3">
            <h3 className="min-w-0 flex-1 leading-snug">
              <Link
                  href={`/documents/${row.id}`}
                  className="font-semibold text-foreground underline-offset-4 hover:text-accent hover:underline"
                >
                  {row.title}
                </Link>
            </h3>
            <span className="shrink-0 rounded-md bg-surface-muted px-2 py-0.5 text-xs tabular-nums text-foreground-muted ring-1 ring-border-subtle">
              v{row.version}
            </span>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <DocumentStatusBadge status={row.status} />
            <span className="text-xs text-foreground-muted">
              Updated {formatUpdated(row.updated_at)}
            </span>
          </div>

          <div className="mt-5 flex flex-wrap gap-3 border-t border-border-subtle pt-4">
            <a
              href={`/api/documents/${row.id}/download`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-md bg-accent px-3 py-1.5 text-xs font-medium text-accent-foreground shadow-sm transition hover:opacity-[0.92]"
            >
              Download PDF
            </a>
            {canManage ? (
              <>
                <Link
                  href={`/documents/${row.id}/edit`}
                  className="inline-flex items-center justify-center rounded-md border border-border bg-transparent px-3 py-1.5 text-xs font-medium text-foreground hover:bg-surface-muted"
                >
                  Edit
                </Link>
                {row.status !== "archived" ? (
                  <DocumentArchiveButton documentId={row.id} />
                ) : null}
              </>
            ) : null}
          </div>
        </article>
      ))}
    </div>
  );
}
