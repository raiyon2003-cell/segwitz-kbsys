import Link from "next/link";
import { Button } from "@/components/ui/button";

function buildHref(
  basePath: string,
  page: number,
  preserve?: Record<string, string>,
) {
  const qs = new URLSearchParams();
  if (preserve) {
    for (const [k, v] of Object.entries(preserve)) {
      if (v.length > 0) qs.set(k, v);
    }
  }
  if (page > 1) qs.set("page", String(page));
  const q = qs.toString();
  return q ? `${basePath}?${q}` : basePath;
}

export function CrudPagination({
  basePath,
  page,
  totalPages,
  preserveParams,
}: {
  basePath: string;
  page: number;
  totalPages: number;
  preserveParams?: Record<string, string>;
}) {
  if (totalPages <= 1) {
    return (
      <div className="flex justify-center border-t border-border-subtle px-4 py-3 text-sm text-foreground-muted">
        {totalPages === 1 ? "1 page" : "No rows"}
      </div>
    );
  }

  const prev = Math.max(1, page - 1);
  const next = Math.min(totalPages, page + 1);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border-subtle px-4 py-3">
      <p className="text-sm text-foreground-muted">
        Page <span className="tabular-nums text-foreground">{page}</span> of{" "}
        <span className="tabular-nums text-foreground">{totalPages}</span>
      </p>
      <div className="flex gap-2">
        {page <= 1 ? (
          <Button variant="outline" size="sm" type="button" disabled>
            Previous
          </Button>
        ) : (
          <Link href={buildHref(basePath, prev, preserveParams)}>
            <Button variant="outline" size="sm" type="button">
              Previous
            </Button>
          </Link>
        )}
        {page >= totalPages ? (
          <Button variant="outline" size="sm" type="button" disabled>
            Next
          </Button>
        ) : (
          <Link href={buildHref(basePath, next, preserveParams)}>
            <Button variant="outline" size="sm" type="button">
              Next
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
}
