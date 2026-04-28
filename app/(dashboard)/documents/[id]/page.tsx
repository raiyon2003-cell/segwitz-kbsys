import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowLeft, Pencil } from "lucide-react";
import { DocumentDetailMeta } from "@/components/documents/document-detail-meta";
import { DocumentPdfPanel } from "@/components/documents/document-pdf-panel";
import { Button } from "@/components/ui/button";
import { getCachedSessionProfile } from "@/lib/auth/session";
import { getDocumentDetail } from "@/lib/data/document-detail";
import { getSignedPdfDownloadUrl } from "@/lib/storage/document-storage";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type Props = { params: { id: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const doc = await getDocumentDetail(params.id);
  return {
    title: doc?.title ?? "Document",
    description: doc?.summary ?? undefined,
  };
}

export default async function DocumentDetailPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const [{ profile }, doc] = await Promise.all([
    getCachedSessionProfile(),
    getDocumentDetail(params.id),
  ]);

  if (!doc) {
    notFound();
  }

  const updatedRaw = searchParams.updated;
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

  const canManage =
    profile.role === "admin" || profile.role === "manager";

  const supabase = createSupabaseServerClient();
  const signedUrl = await getSignedPdfDownloadUrl(
    supabase,
    doc.storage_object_path,
  );

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-[linear-gradient(180deg,hsl(var(--surface-muted)/0.5)_0%,transparent_28%)] px-6 py-8 lg:px-10">
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
            className="flex flex-wrap items-start justify-between gap-3 rounded-lg border border-emerald-500/35 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-950 dark:text-emerald-50"
            role="status"
          >
            <p className="font-semibold">
              Changes saved successfully.
            </p>
            <Link
              href={`/documents/${doc.id}`}
              className="shrink-0 font-medium text-emerald-800 underline-offset-4 hover:underline dark:text-emerald-200"
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
          {canManage ? (
            <div className="flex shrink-0 gap-2">
              <Link href={`/documents/${doc.id}/edit`}>
                <Button variant="outline" className="gap-2">
                  <Pencil className="size-4" aria-hidden />
                  Edit record
                </Button>
              </Link>
              <a href={`/api/documents/${doc.id}/download`}>
                <Button className="gap-2">Download PDF</Button>
              </a>
            </div>
          ) : (
            <a href={`/api/documents/${doc.id}/download`}>
              <Button className="gap-2">Download PDF</Button>
            </a>
          )}
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
            {signedUrl ? (
              <DocumentPdfPanel
                documentId={doc.id}
                initialUrl={signedUrl}
                filename={doc.original_filename}
              />
            ) : (
              <div className="rounded-xl border border-dashed border-border-subtle bg-surface-muted/40 px-6 py-16 text-center text-sm text-foreground-muted">
                Preview unavailable. Try{" "}
                <a
                  href={`/api/documents/${doc.id}/download`}
                  className="font-medium text-accent hover:underline"
                >
                  downloading the PDF
                </a>
                .
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
