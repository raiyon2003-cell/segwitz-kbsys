import Link from "next/link";
import dynamic from "next/dynamic";
import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { ArrowLeft, Pencil } from "lucide-react";
import { DocumentDetailMeta } from "@/components/documents/document-detail-meta";
import { DocumentDeleteButton } from "@/components/documents/document-delete-button";
import { Button } from "@/components/ui/button";
import {
  canDeleteDocuments,
  canDownloadDocuments,
  canEditDocumentRecords,
  canViewDocuments,
} from "@/lib/auth/rbac";
import { getCachedSessionProfile } from "@/lib/auth/session";
import { getDocumentDetail } from "@/lib/data/document-detail";
import { getDepartmentById } from "@/lib/data/departments";
import { getDivisionById } from "@/lib/data/divisions";
import {
  documentsHref,
  mergeDocumentsListParams,
  resetDocumentsFiltersKeepScope,
} from "@/lib/documents/list-params";
import { getSignedPdfDownloadUrl } from "@/lib/storage/document-storage";
import {
  resolveRouteParams,
  resolveSearchParams,
  type RouteSearchParams,
} from "@/lib/next/route-args";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type Props = { params: { id: string } | Promise<{ id: string }> };

const DocumentPdfPanel = dynamic(
  () =>
    import("@/components/documents/document-pdf-panel").then(
      (mod) => mod.DocumentPdfPanel,
    ),
  {
    loading: () => (
      <div className="flex min-h-[520px] items-center justify-center rounded-xl border border-border-subtle bg-surface-muted/40 p-6">
        <div className="w-full max-w-md animate-pulse space-y-3">
          <div className="h-4 w-2/3 rounded bg-surface-muted" />
          <div className="h-3 w-1/3 rounded bg-surface-muted" />
          <div className="h-80 w-full rounded-lg bg-surface-muted" />
        </div>
      </div>
    ),
  },
);

async function resolveRouteId(params: Props["params"]): Promise<string> {
  const { id } = await resolveRouteParams(params);
  return typeof id === "string" ? id.trim() : "";
}

/** Avoid 404 when users open `/documents/edit` (dynamic segment catches "edit"). */
function redirectIfReservedDocumentSegment(routeId: string): void {
  const lower = routeId.toLowerCase();
  if (lower === "edit" || lower === "new") {
    redirect(lower === "new" ? "/documents/new" : "/documents");
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const routeId = await resolveRouteId(params);
  if (!routeId) return { title: "Document" };
  const seg = routeId.toLowerCase();
  if (seg === "edit" || seg === "new") return { title: "Documents" };

  const doc = await getDocumentDetail(routeId);
  if (doc) {
    return {
      title: doc.title,
      description: doc.summary ?? undefined,
    };
  }

  const division = await getDivisionById(routeId);
  if (division) {
    return { title: `${division.name} · Documents` };
  }

  const dept = await getDepartmentById(routeId);
  if (dept) {
    return { title: `${dept.name} · Department` };
  }

  return { title: "Document" };
}

export default async function DocumentDetailPage({
  params,
  searchParams,
}: {
  params: Props["params"];
  searchParams: RouteSearchParams | Promise<RouteSearchParams>;
}) {
  const routeId = await resolveRouteId(params);
  if (!routeId) notFound();
  redirectIfReservedDocumentSegment(routeId);

  const sp = await resolveSearchParams(searchParams);

  const [{ profile }, doc] = await Promise.all([
    getCachedSessionProfile(),
    getDocumentDetail(routeId),
  ]);

  if (!doc) {
    const division = await getDivisionById(routeId);
    if (division) {
      redirect(
        documentsHref(
          "/documents",
          mergeDocumentsListParams(
            resetDocumentsFiltersKeepScope("active", "table"),
            {
              divisionId: routeId,
              departmentId: null,
              page: 1,
            },
          ),
        ),
      );
    }

    const dept = await getDepartmentById(routeId);
    if (dept) {
      redirect(`/departments/${routeId}`);
    }

    notFound();
  }

  const updatedRaw = sp.updated;
  const updatedFlag =
    typeof updatedRaw === "string"
      ? updatedRaw
      : Array.isArray(updatedRaw)
        ? updatedRaw[0]
        : undefined;
  const showUpdated =
    updatedFlag === "success" ||
    updatedFlag === "1" ||
    updatedFlag === "true";

  const canEditRecord = canEditDocumentRecords(profile);
  const canDelete = canDeleteDocuments(profile);
  const canDownload = canDownloadDocuments(profile);
  const canView = canViewDocuments(profile);
  if (!canView) {
    redirect("/");
  }

  const supabase = await createSupabaseServerClient();
  const signedUrl = await getSignedPdfDownloadUrl(
    supabase,
    doc.storage_object_path,
  );

  return (
    <main className="space-y-8 animate-fade-in">
      <div className="mx-auto max-w-[1480px] space-y-8">
        <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-sm">
          <Link
            href="/documents"
            className="inline-flex items-center gap-1 text-foreground-muted transition hover:text-accent"
          >
            <ArrowLeft className="size-4 shrink-0" aria-hidden />
            Documents
          </Link>
          <span className="text-foreground-faint" aria-hidden>
            /
          </span>
          <span className="max-w-[min(72vw,560px)] truncate font-medium text-foreground">
            {doc.title}
          </span>
        </nav>

        {showUpdated ? (
          <div
            className="flex flex-wrap items-start justify-between gap-3 rounded-lg border border-brand-lime/35 bg-brand-lime/10 px-4 py-3 text-sm text-brand-charcoal"
            role="status"
          >
            <p className="font-semibold">
              Changes saved successfully.
            </p>
            <Link
              href={`/documents/${doc.id}`}
              className="shrink-0 font-semibold text-brand-teal underline-offset-4 hover:underline"
            >
              Dismiss
            </Link>
          </div>
        ) : null}

        <header className="flex flex-col gap-4 border-b border-border-subtle pb-8 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 space-y-2">
            <h1 className="text-balance text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
              {doc.title}
            </h1>
            <p className="max-w-3xl text-sm text-foreground-muted">
              Internal reference · PDF{" "}
              <span className="tabular-nums">{doc.version}</span>
              {doc.original_filename ? (
                <>
                  {" "}
                  · <span className="break-all">{doc.original_filename}</span>
                </>
              ) : null}
            </p>
          </div>
          <div className="flex shrink-0 gap-2">
            {canEditRecord ? (
              <Link href={`/documents/${doc.id}/edit`}>
                <Button variant="outline" className="gap-2">
                  <Pencil className="size-4" aria-hidden />
                  Edit record
                </Button>
              </Link>
            ) : null}
            {canDownload ? (
              <a href={`/api/documents/${doc.id}/download`}>
                <Button className="gap-2">Download PDF</Button>
              </a>
            ) : null}
            {canDelete ? (
              <DocumentDeleteButton documentId={doc.id} redirectTo="/documents" />
            ) : null}
          </div>
        </header>

        <div className="grid gap-10 xl:grid-cols-[minmax(280px,380px)_1fr] xl:items-start xl:gap-12">
          <aside className="space-y-2 xl:sticky xl:top-24">
            <h2 className="text-sm font-semibold text-foreground">
              About this document
            </h2>
            <DocumentDetailMeta doc={doc} />
          </aside>

          <section aria-labelledby="pdf-heading" className="min-w-0 space-y-3">
            <div className="flex items-end justify-between gap-4">
              <h2
                id="pdf-heading"
                className="text-sm font-semibold text-foreground"
              >
                Preview
              </h2>
              <p className="text-xs text-foreground-muted">
                Zoom with browser controls · Use fullscreen for focus reading
              </p>
            </div>
            {signedUrl && canDownload ? (
              <DocumentPdfPanel
                documentId={doc.id}
                initialUrl={signedUrl}
                filename={doc.original_filename}
              />
            ) : (
              <div className="rounded-xl border border-dashed border-border-subtle bg-surface-muted/40 px-6 py-16 text-center text-sm text-foreground-muted">
                {canDownload
                  ? "Preview unavailable for this document."
                  : "You do not have permission to download this document."}
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
