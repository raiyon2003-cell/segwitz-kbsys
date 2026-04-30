import Link from "next/link";
import { PageHeader } from "@/components/layout/page-header";
import { CrudPagination } from "@/components/crud/crud-pagination";
import { CrudTable } from "@/components/crud/crud-table";
import type { CrudColumn } from "@/components/crud/crud-table";
import { Button, Card, CardContent } from "@/components/ui";
import { getCachedSessionProfile } from "@/lib/auth/session";
import { getDivisionsPaginated } from "@/lib/data/divisions";
import { parsePageParam } from "@/lib/pagination";
import type { DivisionRow } from "@/types/entities";

export default async function DivisionsPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const page = parsePageParam(searchParams);

  const { profile } = await getCachedSessionProfile();
  const canMutateRefs =
    profile.role === "admin" || profile.role === "member";

  const { rows, total, page: currentPage, pageSize } =
    await getDivisionsPaginated(page);
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const columns: CrudColumn<DivisionRow>[] = [
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
      header: "Description",
      className: "max-w-[320px]",
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
          title="Divisions"
          description="Business units used to organize departments and documents."
        />
        {canMutateRefs ? (
          <Link href="/divisions/new">
            <Button>Add division</Button>
          </Link>
        ) : null}
      </div>

      <Card className="border-border-subtle">
        <CardContent className="p-0">
          <CrudTable
            rows={rows}
            columns={columns}
            actions={
              canMutateRefs
                ? (row) => (
                    <Link
                      href={`/divisions/${row.id}/edit`}
                      className="text-sm font-medium text-accent hover:underline"
                    >
                      Edit
                    </Link>
                  )
                : undefined
            }
          />
          <CrudPagination
            basePath="/divisions"
            page={currentPage}
            totalPages={totalPages}
          />
        </CardContent>
      </Card>
    </main>
  );
}
