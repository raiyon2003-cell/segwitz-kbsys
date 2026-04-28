import type { ActivityLogListRow } from "@/types/activity";

type Props = { row: ActivityLogListRow };

export function ActivityLogDetailsCell({ row }: Props) {
  const d = row.details;
  if (!d || typeof d !== "object") {
    return <span className="text-foreground-muted">—</span>;
  }
  if ("from" in d && "to" in d) {
    return (
      <code className="whitespace-nowrap text-xs text-foreground-muted">
        {String(d.from)} → {String(d.to)}
      </code>
    );
  }
  return (
    <code className="line-clamp-2 break-all text-xs text-foreground-muted">
      {JSON.stringify(d)}
    </code>
  );
}
