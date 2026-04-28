import Link from "next/link";
import { DocumentStatusBadge } from "@/components/documents/document-status";
import type { DocumentDetail } from "@/types/documents";

function formatProfile(p: {
  full_name: string | null;
  email: string | null;
  id: string;
}) {
  return p.full_name?.trim() || p.email?.trim() || p.id.slice(0, 8);
}

function formatWhen(iso: string) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(iso));
}

function LabeledRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1 border-b border-border-subtle py-3 last:border-b-0 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6">
      <span className="shrink-0 text-xs font-semibold uppercase tracking-wide text-foreground-muted">
        {label}
      </span>
      <span className="min-w-0 text-sm text-foreground sm:text-right">{children}</span>
    </div>
  );
}

export function DocumentDetailMeta({ doc }: { doc: DocumentDetail }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xs font-semibold uppercase tracking-wide text-foreground-muted">
          Summary
        </h2>
        <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-foreground-muted">
          {doc.summary?.trim().length ? doc.summary : (
            <span className="italic text-foreground-faint">No summary provided.</span>
          )}
        </p>
      </div>

      <div className="rounded-xl border border-border-subtle bg-surface px-4">
        <LabeledRow label="Division">{doc.divisions?.name ?? "—"}</LabeledRow>
        <LabeledRow label="Department">{doc.departments?.name ?? "—"}</LabeledRow>
        <LabeledRow label="Document type">
          {doc.document_types?.name ?? "—"}
        </LabeledRow>
        <LabeledRow label="Process category">
          {doc.process_categories?.name ?? (
            <span className="text-foreground-muted">Uncategorized</span>
          )}
        </LabeledRow>
        <LabeledRow label="Owner">
          {doc.owner_profile ? formatProfile(doc.owner_profile) : "—"}
        </LabeledRow>
        <LabeledRow label="Version">
          <span className="tabular-nums font-medium">{doc.version}</span>
        </LabeledRow>
        <LabeledRow label="Status">
          <DocumentStatusBadge status={doc.status} />
        </LabeledRow>
      </div>

      <div>
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-foreground-muted">
          Tags
        </h3>
        {doc.tags.length === 0 ? (
          <p className="text-sm italic text-foreground-faint">No tags</p>
        ) : (
          <ul className="flex flex-wrap gap-2">
            {doc.tags.map((t) => (
              <li key={t.id}>
                <Link
                  href={`/documents?tags=${encodeURIComponent(t.id)}`}
                  className="inline-flex rounded-full bg-accent/10 px-3 py-1 text-xs font-medium text-accent hover:bg-accent/15"
                >
                  {t.name}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="rounded-xl border border-border-subtle bg-surface-muted/40 p-4">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-foreground-muted">
          Activity
        </h3>
        <dl className="mt-3 space-y-2 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-foreground-muted">Created</dt>
            <dd className="tabular-nums text-foreground">{formatWhen(doc.created_at)}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-foreground-muted">Last updated</dt>
            <dd className="tabular-nums text-foreground">{formatWhen(doc.updated_at)}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-foreground-muted">Uploaded by</dt>
            <dd className="text-right text-foreground">
              {doc.uploaded_by_profile
                ? formatProfile(doc.uploaded_by_profile)
                : "—"}
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-foreground-muted">Last edited by</dt>
            <dd className="text-right text-foreground">
              {doc.updated_by_profile
                ? formatProfile(doc.updated_by_profile)
                : (
                    <span className="text-foreground-muted">—</span>
                  )}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
