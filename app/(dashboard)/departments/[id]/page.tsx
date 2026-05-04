import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { DocumentsGrid } from "@/components/documents/documents-grid";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui";
import { getCachedSessionProfile } from "@/lib/auth/session";
import {
  assertDepartmentAccessible,
} from "@/lib/data/access-control";
import {
  canDeleteOrArchiveDocuments,
  canEditDocumentRecords,
  canMutateOrgReferences,
} from "@/lib/auth/rbac";
import { getDepartmentById } from "@/lib/data/departments";
import { getDocumentsForDepartmentLibrary } from "@/lib/data/documents";
import {
  documentsHref,
  mergeDocumentsListParams,
  resetDocumentsFiltersKeepScope,
} from "@/lib/documents/list-params";
import { resolveRouteParams } from "@/lib/next/route-args";

export default async function DepartmentLibraryPage({
  params,
}: {
  params: { id: string } | Promise<{ id: string }>;
}) {
  const { id: rawId } = await resolveRouteParams(params);
  const id = rawId.trim();

  if (id.toLowerCase() === "new") {
    redirect("/departments/new");
  }

  if (id.toLowerCase() === "edit") {
    redirect("/departments");
  }

  const { profile } = await getCachedSessionProfile();
  const dept = await getDepartmentById(id);
  if (!dept) notFound();

  const mayView = await assertDepartmentAccessible(profile, id);
  if (!mayView) {
    redirect("/documents?notice=no-dept-access");
  }

  const rows = await getDocumentsForDepartmentLibrary(id);
  const canEditDocs = canEditDocumentRecords(profile);
  const canArchiveDocs = canDeleteOrArchiveDocuments(profile);
  const showDeptAdminLinks = canMutateOrgReferences(profile);

  const divisionName = dept.divisions?.name ?? "Division";
  const docsHref = documentsHref(
    "/documents",
    mergeDocumentsListParams(resetDocumentsFiltersKeepScope("active", "table"), {
      divisionId: dept.division_id,
      departmentId: id,
      page: 1,
    }),
  );

  return (
    <main className="px-6 py-8 lg:px-10">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <PageHeader
          title={dept.name}
          description={`${divisionName} — all active documents in this department.`}
        />
        <div className="flex flex-wrap gap-3">
          <Link
            href={docsHref}
            className="text-sm font-medium text-accent hover:underline"
          >
            Open in Documents library
          </Link>
          {showDeptAdminLinks ? (
            <Link
              href={`/departments/${id}/edit`}
              className="text-sm font-medium text-accent hover:underline"
            >
              Edit department
            </Link>
          ) : null}
        </div>
      </div>

      <Card className="border-border-subtle">
        <CardContent className="p-6">
          {rows.length === 0 ? (
            <p className="text-sm text-foreground-muted">
              No active documents in this department yet.
            </p>
          ) : (
            <DocumentsGrid
              rows={rows}
              canEdit={canEditDocs}
              canArchive={canArchiveDocs}
            />
          )}
        </CardContent>
      </Card>
    </main>
  );
}
