import Link from "next/link";
import { DocumentArchiveButton } from "@/components/documents/document-archive-button";
import { DocumentUploadSuccessBanner } from "@/components/documents/document-upload-success-banner";
import { DocumentStatusBadge } from "@/components/documents/document-status";
import { DocumentsBrowseNav } from "@/components/documents/documents-browse-nav";
import { DocumentsFilterToolbar } from "@/components/documents/documents-filter-toolbar";
import { DocumentsGrid } from "@/components/documents/documents-grid";
import { CrudPagination } from "@/components/crud/crud-pagination";
import { CrudTable } from "@/components/crud/crud-table";
import type { CrudColumn } from "@/components/crud/crud-table";
import { PageHeader } from "@/components/layout/page-header";
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui";
import { getCachedSessionProfile } from "@/lib/auth/session";
import { getDocumentsPaginated } from "@/lib/data/documents";
import { loadDocumentFormOptions } from "@/lib/data/document-form-options";
import {
  documentsHref,
  documentsListPreserveParams,
  parseDocumentsListParams,
} from "@/lib/documents/list-params";
import type { DocumentListEmbed } from "@/types/documents";

export default async function DocumentsPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const parsed = parseDocumentsListParams(searchParams);

  const uploadedRaw = searchParams.uploaded;
  const uploadNotice =
    typeof uploadedRaw === "string"
      ? uploadedRaw
      : Array.isArray(uploadedRaw)
        ? uploadedRaw[0]
        : undefined;
  const uploadSuccess =
    uploadNotice === "success" ||
    uploadNotice === "1" ||
    uploadNotice === "true";

  const [{ profile }, options, pageResult] = await Promise.all([
    getCachedSessionProfile(),
    loadDocumentFormOptions(),
    getDocumentsPaginated(parsed),
  ]);

  const canUpload =
    profile.role === "admin" ||
    profile.role === "manager" ||
    profile.role === "member";

  const canManageDocs =
    profile.role === "admin" ||
    profile.role === "manager" ||
    profile.role === "member";

  const { rows, total, page: currentPage, pageSize } = pageResult;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const columns: CrudColumn<DocumentListEmbed>[] = [
    {
      header: "Title",
      className: "min-w-[200px] max-w-[min(420px,40vw)]",
      cell: (r) => (
        <div className="flex flex-col gap-0.5">
          <Link
              href={`/documents/${r.id}`}
              className="font-semibold text-foreground underline-offset-4 hover:text-accent hover:underline"
            >
              {r.title}
            </Link>
          {(r.owner_profile?.full_name ?? r.owner_profile?.email) ? (
            <span className="truncate text-xs text-foreground-muted">
              Owner:{" "}
              {r.owner_profile?.full_name?.trim() ||
                r.owner_profile?.email?.trim()}
            </span>
          ) : null}
        </div>
      ),
    },
    {
      header: "Version",
      cell: (r) => (
        <span className="tabular-nums font-medium text-foreground-muted">
          {r.version}
        </span>
      ),
    },
    {
      header: "Status",
      cell: (r) => <DocumentStatusBadge status={r.status} />,
    },
    {
      header: "Updated",
      cell: (r) => (
        <span className="text-sm tabular-nums text-foreground-muted">
          {new Date(r.updated_at).toLocaleDateString(undefined, {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </span>
      ),
    },
    {
      header: "",
      className: "w-[120px]",
      cell: (r) => (
        <a
          href={`/api/documents/${r.id}/download`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-medium text-accent hover:underline"
        >
          PDF
        </a>
      ),
    },
  ];

  const preserveParams = documentsListPreserveParams(parsed);
  const needsDeptForDocs = Boolean(parsed.divisionId && !parsed.departmentId);

  return (
    <main className="min-h-[calc(100vh-4rem)] px-6 py-8 lg:px-10">
      <div className="mx-auto max-w-[1400px] space-y-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <PageHeader
            title="Documents"
            description="Search and filter your knowledge base like a modern workspace."
          />
          {canUpload ? (
            <Link href="/documents/new">
              <Button>Upload document</Button>
            </Link>
          ) : null}
        </div>

        {!canUpload ? (
          <div className="rounded-lg border border-border-subtle bg-surface-muted/40 px-4 py-3 text-sm text-foreground-muted">
            <strong className="text-foreground">View-only.</strong> Your role
            cannot upload documents. Ask an admin if you need upload access.
          </div>
        ) : null}

        {uploadSuccess ? (
          <DocumentUploadSuccessBanner
            dismissHref={documentsHref("/documents", parsed)}
          />
        ) : null}

        <DocumentsBrowseNav
          pathname="/documents"
          parsed={parsed}
          divisions={options.divisions}
          departments={options.departments}
        />

        <Card className="overflow-hidden border-border-subtle shadow-[0_1px_2px_rgb(15_23_42/4%),0_8px_24px_rgb(15_23_42/6%)] dark:shadow-[0_4px_24px_rgb(0_0_0/35%)]">
          <CardHeader className="border-b border-border-subtle bg-surface-muted/40 pb-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <CardTitle className="text-lg">Library filters</CardTitle>
                <CardDescription className="mt-1">
                  Filters apply on the server — URLs stay shareable and pagination stays accurate.
                </CardDescription>
              </div>
              <div className="rounded-full bg-accent/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-accent">
                {total === 1 ? "1 match" : `${total.toLocaleString()} matches`}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-8 p-6">
            <DocumentsFilterToolbar parsed={parsed} options={options} />

            <div className="border-t border-border-subtle pt-6">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm text-foreground-muted">
                  {total === 0 ? (
                    needsDeptForDocs ? (
                      <>Select a department above to view documents in this division.</>
                    ) : (
                    <>
                      No documents match{" "}
                      <span className="font-medium text-foreground">
                        these filters
                      </span>
                      .
                    </>
                    )
                  ) : (
                    <>
                      Showing{" "}
                      <span className="font-medium tabular-nums text-foreground">
                        {(currentPage - 1) * pageSize + 1}
                      </span>
                      –
                      <span className="font-medium tabular-nums text-foreground">
                        {(currentPage - 1) * pageSize + rows.length}
                      </span>{" "}
                      of{" "}
                      <span className="font-medium tabular-nums text-foreground">
                        {total.toLocaleString()}
                      </span>
                    </>
                  )}
                </p>
                <span className="text-xs uppercase tracking-wide text-foreground-muted">
                  {parsed.layout === "grid" ? "Grid view" : "Table view"}
                </span>
              </div>

              {parsed.layout === "grid" ? (
                rows.length === 0 ? (
                  <p className="rounded-xl border border-dashed border-border-subtle bg-surface-muted/30 py-16 text-center text-sm text-foreground-muted">
                    {needsDeptForDocs
                      ? "Select a department above to view documents in this division."
                      : "No documents match these filters."}
                  </p>
                ) : (
                  <DocumentsGrid rows={rows} canManage={canManageDocs} />
                )
              ) : rows.length === 0 ? (
                <p className="rounded-xl border border-dashed border-border-subtle bg-surface-muted/30 py-16 text-center text-sm text-foreground-muted">
                  {needsDeptForDocs
                    ? "Select a department above to view documents in this division."
                    : "No documents match these filters."}
                </p>
              ) : (
                <CrudTable
                  rows={rows}
                  columns={columns}
                  actions={
                    canManageDocs
                      ? (row) => (
                          <div className="flex flex-col items-end gap-2 sm:flex-row sm:items-center">
                            <Link
                              href={`/documents/${row.id}/edit`}
                              className="text-sm font-medium text-accent hover:underline"
                            >
                              Edit
                            </Link>
                            {row.status !== "archived" ? (
                              <DocumentArchiveButton documentId={row.id} />
                            ) : null}
                          </div>
                        )
                      : undefined
                  }
                />
              )}
            </div>

            <CrudPagination
              basePath="/documents"
              page={currentPage}
              totalPages={totalPages}
              preserveParams={preserveParams}
            />
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
