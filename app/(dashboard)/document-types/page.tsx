import Link from "next/link";
import { PageHeader } from "@/components/layout/page-header";
import { CrudPagination } from "@/components/crud/crud-pagination";
import { CrudTable } from "@/components/crud/crud-table";
import type { CrudColumn } from "@/components/crud/crud-table";
import { Button, Card, CardContent } from "@/components/ui";
import { redirect } from "next/navigation";
import { canMutateOrgReferences } from "@/lib/auth/rbac";
import { getCachedSessionProfile } from "@/lib/auth/session";
import { getDocumentTypesPaginated } from "@/lib/data/document-types";
import {
  resolveSearchParams,
  type RouteSearchParams,
} from "@/lib/next/route-args";
import { parsePageParam } from "@/lib/pagination";
import type { DocumentTypeRow } from "@/types/entities";

export default async function DocumentTypesPage({
  searchParams,
}: {
  searchParams: RouteSearchParams | Promise<RouteSearchParams>;
}) {
  const sp = await resolveSearchParams(searchParams);
  const page = parsePageParam(sp);

  const { profile } = await getCachedSessionProfile();
  const canMutateRefs = canMutateOrgReferences(profile);
  if (!canMutateRefs) {
    redirect("/documents");
  }

  const { rows, total, page: currentPage, pageSize } =
    await getDocumentTypesPaginated(page);
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const columns: CrudColumn<DocumentTypeRow>[] = [
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
          title="Document types"
          description="Templates and taxonomy used when classifying uploaded documents."
        />
        {canMutateRefs ? (
          <Link href="/document-types/new">
            <Button>Add document type</Button>
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
                      href={`/document-types/${row.id}/edit`}
                      className="text-sm font-medium text-accent hover:underline"
                    >
                      Edit
                    </Link>
                  )
                : undefined
            }
          />
          <CrudPagination
            basePath="/document-types"
            page={currentPage}
            totalPages={totalPages}
          />
        </CardContent>
      </Card>
    </main>
  );
}
