import Link from "next/link";
import { PageHeader } from "@/components/layout/page-header";
import { CrudPagination } from "@/components/crud/crud-pagination";
import { CrudTable } from "@/components/crud/crud-table";
import type { CrudColumn } from "@/components/crud/crud-table";
import { Button, Card, CardContent } from "@/components/ui";
import { getCachedSessionProfile } from "@/lib/auth/session";
import { getTagsPaginated } from "@/lib/data/tags";
import { parsePageParam } from "@/lib/pagination";
import type { TagRow } from "@/types/entities";

export default async function TagsPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const page = parsePageParam(searchParams);

  const { profile } = await getCachedSessionProfile();
  const isAdmin = profile.role === "admin";

  const { rows, total, page: currentPage, pageSize } =
    await getTagsPaginated(page);
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const columns: CrudColumn<TagRow>[] = [
    {
      header: "Name",
      cell: (r) => r.name,
    },
    {
      header: "Slug",
      cell: (r) => (
        <code className="rounded bg-surface-muted px-1.5 py-0.5 text-xs text-foreground-muted">
          {r.slug}
        </code>
      ),
    },
    {
      header: "Color",
      cell: (r) =>
        r.color ? (
          <span className="inline-flex items-center gap-2">
            <span
              className="size-4 rounded-sm ring-1 ring-border-subtle"
              style={{ backgroundColor: r.color }}
              aria-hidden
            />
            <span className="font-mono text-xs text-foreground-muted">
              {r.color}
            </span>
          </span>
        ) : (
          <span className="text-foreground-muted">—</span>
        ),
    },
    {
      header: "Description",
      className: "max-w-[260px]",
      cell: (r) => (
        <span className="line-clamp-2 text-foreground-muted">
          {r.description ?? "—"}
        </span>
      ),
    },
  ];

  return (
    <main className="px-6 py-8 lg:px-10">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <PageHeader
          title="Tags"
          description="Flexible labels for filtering and grouping documents."
        />
        {isAdmin ? (
          <Link href="/tags/new">
            <Button>Add tag</Button>
          </Link>
        ) : null}
      </div>

      <Card className="border-border-subtle">
        <CardContent className="p-0">
          <CrudTable
            rows={rows}
            columns={columns}
            actions={
              isAdmin
                ? (row) => (
                    <Link
                      href={`/tags/${row.id}/edit`}
                      className="text-sm font-medium text-accent hover:underline"
                    >
                      Edit
                    </Link>
                  )
                : undefined
            }
          />
          <CrudPagination
            basePath="/tags"
            page={currentPage}
            totalPages={totalPages}
          />
        </CardContent>
      </Card>
    </main>
  );
}
