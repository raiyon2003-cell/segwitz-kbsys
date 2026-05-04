import Link from "next/link";
import { PageHeader } from "@/components/layout/page-header";
import { CrudPagination } from "@/components/crud/crud-pagination";
import { CrudTable } from "@/components/crud/crud-table";
import type { CrudColumn } from "@/components/crud/crud-table";
import { Button, Card, CardContent } from "@/components/ui";
import {
  canMutateOrgReferences,
  hasFullStaffDocumentAccess,
} from "@/lib/auth/rbac";
import { getCachedSessionProfile } from "@/lib/auth/session";
import {
  getDepartmentsPaginated,
  getDepartmentsPaginatedForProfile,
} from "@/lib/data/departments";
import {
  resolveSearchParams,
  type RouteSearchParams,
} from "@/lib/next/route-args";
import { parsePageParam } from "@/lib/pagination";
import type { DepartmentRow } from "@/types/entities";

export default async function DepartmentsPage({
  searchParams,
}: {
  searchParams: RouteSearchParams | Promise<RouteSearchParams>;
}) {
  const sp = await resolveSearchParams(searchParams);
  const page = parsePageParam(sp);

  const { profile } = await getCachedSessionProfile();
  const canMutateRefs = canMutateOrgReferences(profile);
  const fullStaff = hasFullStaffDocumentAccess(profile);

  const { rows, total, page: currentPage, pageSize } = fullStaff
    ? await getDepartmentsPaginated(page)
    : await getDepartmentsPaginatedForProfile(profile.id, page);
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const columns: CrudColumn<DepartmentRow>[] = [
    {
      header: "Name",
      cell: (r) => r.name,
    },
    {
      header: "Division",
      cell: (r) => (
        <span>{r.divisions?.name ?? "—"}</span>
      ),
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
      className: "max-w-[280px]",
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
          title="Departments"
          description="Functional teams within divisions — linked for routing and reporting."
        />
        {canMutateRefs ? (
          <Link href="/departments/new">
            <Button>Add department</Button>
          </Link>
        ) : null}
      </div>

      <Card className="border-border-subtle">
        <CardContent className="p-0">
          <CrudTable
            rows={rows}
            columns={columns}
            actions={(row) => (
              <div className="flex flex-col items-end gap-1 sm:flex-row sm:gap-3">
                <Link
                  href={`/departments/${row.id}`}
                  className="text-sm font-medium text-accent hover:underline"
                >
                  View documents
                </Link>
                {canMutateRefs ? (
                  <Link
                    href={`/departments/${row.id}/edit`}
                    className="text-sm font-medium text-accent hover:underline"
                  >
                    Edit
                  </Link>
                ) : null}
              </div>
            )}
          />
          <CrudPagination
            basePath="/departments"
            page={currentPage}
            totalPages={totalPages}
          />
        </CardContent>
      </Card>
    </main>
  );
}
