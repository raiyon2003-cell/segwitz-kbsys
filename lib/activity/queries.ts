import "server-only";

import { PAGE_SIZE } from "@/lib/constants";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { unwrapOne } from "@/lib/supabase/unwrap-embed";
import type { ActivityLogListRow, DocumentActivityAction } from "@/types/activity";

const LOG_SELECT = `
  id,
  document_id,
  actor_id,
  action,
  details,
  created_at,
  documents ( title ),
  profiles ( full_name, email )
`;

type RawLogRow = {
  id: string;
  document_id: string;
  actor_id: string;
  action: DocumentActivityAction;
  details: Record<string, unknown> | null;
  created_at: string;
  documents: { title: string } | { title: string }[] | null;
  profiles:
    | { full_name: string | null; email: string | null }
    | { full_name: string | null; email: string | null }[]
    | null;
};

function mapLogRow(r: RawLogRow): ActivityLogListRow {
  const doc = unwrapOne(r.documents);
  const prof = unwrapOne(r.profiles);
  return {
    id: r.id,
    document_id: r.document_id,
    actor_id: r.actor_id,
    action: r.action,
    details: r.details,
    created_at: r.created_at,
    document_title: doc?.title?.trim() || "(untitled)",
    actor_name: prof?.full_name?.trim() || null,
    actor_email: prof?.email?.trim() || null,
  };
}

export type ActivityLogPageResult = {
  rows: ActivityLogListRow[];
  total: number;
  page: number;
  pageSize: number;
};

export async function getActivityLogPaginated(
  page: number,
): Promise<ActivityLogPageResult> {
  const supabase = createSupabaseServerClient();
  const safePage = Math.max(1, Math.floor(page) || 1);
  const from = (safePage - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const { data, error, count } = await supabase
    .from("document_activity_log")
    .select(LOG_SELECT, { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) throw new Error(error.message);

  const rows = (data ?? [] as unknown as RawLogRow[]).map(mapLogRow);

  return {
    rows,
    total: count ?? 0,
    page: safePage,
    pageSize: PAGE_SIZE,
  };
}
