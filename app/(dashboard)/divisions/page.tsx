import Link from "next/link";
import { DivisionsDirectoryTable } from "@/components/divisions/divisions-directory-table";
import { PageHeader } from "@/components/layout/page-header";
import { CrudPagination } from "@/components/crud/crud-pagination";
import { Button, Card, CardContent } from "@/components/ui";
import { getCachedSessionProfile } from "@/lib/auth/session";
import { getDepartmentsForDivisionIds } from "@/lib/data/departments";
import { getDivisionsPaginated } from "@/lib/data/divisions";
import { parsePageParam } from "@/lib/pagination";

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

  const divisionIds = rows.map((r) => r.id);
  const departmentsFlat = await getDepartmentsForDivisionIds(divisionIds);
  const departmentsByDivisionId: Record<
    string,
    { id: string; name: string }[]
  > = {};
  for (const d of departmentsFlat) {
    const list = departmentsByDivisionId[d.division_id] ?? [];
    list.push({ id: d.id, name: d.name });
    departmentsByDivisionId[d.division_id] = list;
  }

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
          <DivisionsDirectoryTable
            rows={rows}
            departmentsByDivisionId={departmentsByDivisionId}
            showActions={canMutateRefs}
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
