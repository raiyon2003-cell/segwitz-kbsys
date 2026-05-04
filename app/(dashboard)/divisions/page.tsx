import Link from "next/link";
import { DivisionsDirectoryTable } from "@/components/divisions/divisions-directory-table";
import { PageHeader } from "@/components/layout/page-header";
import { CrudPagination } from "@/components/crud/crud-pagination";
import { Button, Card, CardContent } from "@/components/ui";
import {
  canMutateOrgReferences,
  hasFullStaffDocumentAccess,
} from "@/lib/auth/rbac";
import { getCachedSessionProfile } from "@/lib/auth/session";
import { getProfileDepartments } from "@/lib/data/access-control";
import { getDepartmentsForDivisionIds } from "@/lib/data/departments";
import {
  getDivisionsPaginated,
  getDivisionsPaginatedForProfile,
} from "@/lib/data/divisions";
import {
  resolveSearchParams,
  type RouteSearchParams,
} from "@/lib/next/route-args";
import { parsePageParam } from "@/lib/pagination";

export default async function DivisionsPage({
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
    ? await getDivisionsPaginated(page)
    : await getDivisionsPaginatedForProfile(profile.id, page);
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const divisionIds = rows.map((r) => r.id);
  let departmentsFlat = await getDepartmentsForDivisionIds(divisionIds);
  if (!fullStaff) {
    const allowedDeptIds = new Set(await getProfileDepartments(profile.id));
    departmentsFlat = departmentsFlat.filter((d) =>
      allowedDeptIds.has(d.id),
    );
  }
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
