import type { DocumentActivityAction } from "@/types/activity";
import type { DocumentStatus } from "@/types/documents";

/**
 * Supabase `documents` row fields needed to diff metadata + tags
 * (without JSON columns like storage path).
 */
export type DocumentRowSnapshot = {
  id: string;
  status: DocumentStatus;
  title: string;
  summary: string | null;
  division_id: string;
  department_id: string;
  document_type_id: string;
  process_category_id: string | null;
  owner_id: string;
  version: number;
};

/**
 * Form payload after successful `parseDocumentFields` (ok branch).
 */
export type DocumentFormPayload = {
  title: string;
  summary: string | null;
  division_id: string;
  department_id: string;
  document_type_id: string;
  process_category_id: string | null;
  owner_id: string;
  version: number;
  status: DocumentStatus;
  tag_ids: string[];
};

function tagsEqual(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false;
  const sa = [...a].sort();
  const sb = [...b].sort();
  return sa.every((v, i) => v === sb[i]);
}

function isMetadataChanged(
  existing: DocumentRowSnapshot,
  parsed: DocumentFormPayload,
): boolean {
  return (
    parsed.title !== existing.title ||
    (parsed.summary ?? null) !== (existing.summary ?? null) ||
    parsed.division_id !== existing.division_id ||
    parsed.department_id !== existing.department_id ||
    parsed.document_type_id !== existing.document_type_id ||
    (parsed.process_category_id ?? null) !==
      (existing.process_category_id ?? null) ||
    parsed.owner_id !== existing.owner_id ||
    parsed.version !== existing.version
  );
}

export type ActivityLogEntry = {
  action: DocumentActivityAction;
  details?: Record<string, unknown> | null;
};

/**
 * Produces 0..n log entries for a document save (one batch insert on the client).
 */
export function planDocumentUpdateLogEntries(
  options: {
    replaceFile: boolean;
    existing: DocumentRowSnapshot;
    oldTagIds: string[];
    parsed: DocumentFormPayload;
  },
): ActivityLogEntry[] {
  const { replaceFile, existing, oldTagIds, parsed } = options;
  const out: ActivityLogEntry[] = [];

  if (replaceFile) {
    out.push({ action: "file_replacement" });
  }
  if (parsed.status !== existing.status) {
    out.push({
      action: "status_change",
      details: { from: existing.status, to: parsed.status },
    });
  }
  if (isMetadataChanged(existing, parsed) || !tagsEqual(oldTagIds, parsed.tag_ids)) {
    out.push({ action: "update" });
  }
  return out;
}

/**
 * Read `documents` row (partial select) into a stable snapshot.
 */
export function toDocumentRowSnapshot(
  row: {
    id: string;
    status: DocumentStatus;
    title: string;
    summary: string | null;
    division_id: string;
    department_id: string;
    document_type_id: string;
    process_category_id: string | null;
    owner_id: string;
    version: number;
  },
): DocumentRowSnapshot {
  return {
    id: row.id,
    status: row.status,
    title: row.title,
    summary: row.summary,
    division_id: row.division_id,
    department_id: row.department_id,
    document_type_id: row.document_type_id,
    process_category_id: row.process_category_id,
    owner_id: row.owner_id,
    version: row.version,
  };
}
