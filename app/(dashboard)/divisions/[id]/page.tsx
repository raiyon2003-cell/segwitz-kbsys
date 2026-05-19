import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { DocumentsGrid } from "@/components/documents/documents-grid";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui";
import { getCachedSessionProfile } from "@/lib/auth/session";
import { assertDivisionAccessible } from "@/lib/data/access-control";
import {
  canDownloadDocuments,
  canDeleteDocuments,
  canDeleteOrArchiveDocuments,
  canEditDocumentRecords,
  canMutateOrgReferences,
  canViewDocuments,
} from "@/lib/auth/rbac";
import { getDocumentsForDivisionLibrary } from "@/lib/data/documents";
import { getDivisionById } from "@/lib/data/divisions";
import {
  documentsHref,
  mergeDocumentsListParams,
  resetDocumentsFiltersKeepScope,
} from "@/lib/documents/list-params";
import { resolveRouteParams } from "@/lib/next/route-args";

export default async function DivisionLibraryPage({
  params,
}: {
  params: { id: string } | Promise<{ id: string }>;
}) {
  const { id: rawId } = await resolveRouteParams(params);
  const id = rawId.trim();

  if (id.toLowerCase() === "new") {
    redirect("/divisions/new");
  }

  if (id.toLowerCase() === "edit") {
    redirect("/divisions");
  }

  const { profile } = await getCachedSessionProfile();
  if (!canViewDocuments(profile)) {
    redirect("/");
  }
  const division = await getDivisionById(id);
  if (!division) notFound();

  const mayView = await assertDivisionAccessible(profile, id);
  if (!mayView) {
    redirect("/documents?notice=no-division-access");
  }

  const rows = await getDocumentsForDivisionLibrary(id);
  const canEditDocs = canEditDocumentRecords(profile);
  const canArchiveDocs = canDeleteOrArchiveDocuments(profile);
  const canDeleteDocs = canDeleteDocuments(profile);
  const canDownload = canDownloadDocuments(profile);
  const showDivisionAdminLinks = canMutateOrgReferences(profile);

  const docsHref = documentsHref(
    "/documents",
    mergeDocumentsListParams(resetDocumentsFiltersKeepScope("active", "table"), {
      divisionId: id,
      departmentId: null,
      page: 1,
    }),
  );

  return (
    <main className="space-y-8 animate-fade-in">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <PageHeader
          title={division.name}
          description="All active documents in this division."
        />
        <div className="flex flex-wrap gap-3">
          <Link
            href={docsHref}
            className="text-sm font-medium text-accent hover:underline"
          >
            Open in Documents library
          </Link>
          {showDivisionAdminLinks ? (
            <Link
              href={`/divisions/${id}/edit`}
              className="text-sm font-medium text-accent hover:underline"
            >
              Edit division
            </Link>
          ) : null}
        </div>
      </div>

      <Card className="border-border-subtle">
        <CardContent className="p-6">
          {rows.length === 0 ? (
            <p className="text-sm text-foreground-muted">
              No active documents in this division yet.
            </p>
          ) : (
            <DocumentsGrid
              rows={rows}
              canEdit={canEditDocs}
              canArchive={canArchiveDocs}
              canDownload={canDownload}
              canDelete={canDeleteDocs}
            />
          )}
        </CardContent>
      </Card>
    </main>
  );
}
