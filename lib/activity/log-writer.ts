import type { DocumentActivityAction } from "@/types/activity";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { ActivityLogEntry } from "@/lib/activity/diff";

/**
 * Appends a single log row. Failures are non-fatal for the main mutation.
 */
export async function tryLogDocumentActivity(
  supabase: SupabaseClient,
  input: {
    documentId: string;
    actorId: string;
    action: DocumentActivityAction;
    details?: Record<string, unknown> | null;
  },
): Promise<void> {
  const { error } = await supabase.from("document_activity_log").insert({
    document_id: input.documentId,
    actor_id: input.actorId,
    action: input.action,
    details: input.details ?? null,
  });
  if (error) {
    console.error("document activity log failed:", error.message);
  }
}

/**
 * Batches log rows in one request (e.g. after document update: file + status + body).
 */
export async function tryLogDocumentActivities(
  supabase: SupabaseClient,
  input: {
    documentId: string;
    actorId: string;
    entries: ActivityLogEntry[];
  },
): Promise<void> {
  if (input.entries.length === 0) return;
  const rows = input.entries.map((e) => ({
    document_id: input.documentId,
    actor_id: input.actorId,
    action: e.action,
    details: e.details ?? null,
  }));
  const { error } = await supabase.from("document_activity_log").insert(rows);
  if (error) {
    console.error("document activity log (batch) failed:", error.message);
  }
}
