import Link from "next/link";
import { ActivityLogDetailsCell } from "@/components/admin/activity-log-details-cell";
import type { CrudColumn } from "@/components/crud/crud-table";
import { ACTIVITY_ACTION_LABEL, type ActivityLogListRow } from "@/types/activity";

export const activityLogTableColumns: CrudColumn<ActivityLogListRow>[] = [
  {
    header: "Time",
    className: "whitespace-nowrap text-foreground-muted",
    cell: (r) => (
      <time dateTime={r.created_at} className="text-sm tabular-nums">
        {new Date(r.created_at).toLocaleString(undefined, {
          dateStyle: "medium",
          timeStyle: "short",
        })}
      </time>
    ),
  },
  {
    header: "User",
    cell: (r) => (
      <div className="flex min-w-0 flex-col">
        <span className="font-medium text-foreground">
          {r.actor_name?.trim() || "—"}
        </span>
        {r.actor_email ? (
          <span className="truncate text-xs text-foreground-muted">
            {r.actor_email}
          </span>
        ) : null}
      </div>
    ),
  },
  {
    header: "Action",
    cell: (r) => (
      <span className="inline-flex rounded-md bg-surface-muted px-2 py-0.5 text-sm font-medium text-foreground">
        {ACTIVITY_ACTION_LABEL[r.action] ?? r.action}
      </span>
    ),
  },
  {
    header: "Document",
    className: "min-w-[120px] max-w-[min(320px,40vw)]",
    cell: (r) => (
      <Link
        href={`/documents/${r.document_id}`}
        className="font-medium text-foreground underline-offset-4 hover:text-accent hover:underline"
      >
        {r.document_title}
      </Link>
    ),
  },
  {
    header: "Details",
    className: "max-w-[min(360px,45vw)]",
    cell: (r) => <ActivityLogDetailsCell row={r} />,
  },
];
