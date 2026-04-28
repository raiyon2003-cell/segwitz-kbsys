import "server-only";

import type { ParsedDocumentsListParams } from "@/lib/documents/list-params";
import { PAGE_SIZE } from "@/lib/constants";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { DocumentListEmbed } from "@/types/documents";
import type { DocumentStatus } from "@/types/documents";
import type { DocumentListView } from "@/types/documents";
import type { SupabaseClient } from "@supabase/supabase-js";

function escapeIlikePattern(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/%/g, "\\%").replace(/_/g, "\\_");
}

export const DOCUMENT_LIST_EMBED_SELECT = `
  *,
  divisions ( id, name ),
  departments ( id, name ),
  document_types ( id, name ),
  process_categories ( id, name ),
  owner_profile:profiles!documents_owner_id_fkey ( id, full_name, email )
`;

async function fetchDocumentIdsMatchingAllTags(
  supabase: SupabaseClient,
  tagIds: string[],
): Promise<string[]> {
  if (tagIds.length === 0) return [];

  const { data, error } = await supabase
    .from("document_tags")
    .select("document_id, tag_id")
    .in("tag_id", tagIds);

  if (error) throw new Error(error.message);

  const byDoc = new Map<string, Set<string>>();
  for (const row of data ?? []) {
    const did = row.document_id as string;
    const tid = row.tag_id as string;
    if (!byDoc.has(did)) byDoc.set(did, new Set());
    byDoc.get(did)!.add(tid);
  }

  const required = Array.from(new Set(tagIds));
  return Array.from(byDoc.entries())
    .filter(([, tags]) => required.every((t) => tags.has(t)))
    .map(([id]) => id);
}

export async function getDocumentsPaginated(parsed: ParsedDocumentsListParams) {
  const supabase = createSupabaseServerClient();
  const safePage = Math.max(1, Math.floor(parsed.page) || 1);
  const from = (safePage - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const view = parsed.view;

  let allowedIds: string[] | undefined;

  if (parsed.tagIds.length > 0) {
    allowedIds = await fetchDocumentIdsMatchingAllTags(supabase, parsed.tagIds);
    if (allowedIds.length === 0) {
      return {
        rows: [] as DocumentListEmbed[],
        total: 0,
        page: safePage,
        pageSize: PAGE_SIZE,
      };
    }
  }

  let query = supabase
    .from("documents")
    .select(DOCUMENT_LIST_EMBED_SELECT, { count: "exact" })
    .order("updated_at", { ascending: false })
    .range(from, to);

  if (allowedIds) {
    query = query.in("id", allowedIds);
  }

  const statusFilter = parsed.status;

  if (statusFilter) {
    query = query.eq("status", statusFilter as DocumentStatus);
  } else {
    if (view === "active") {
      query = query.neq("status", "archived");
    } else if (view === "archived") {
      query = query.eq("status", "archived");
    }
  }

  const q = parsed.q.trim();
  if (q.length > 0) {
    const escaped = escapeIlikePattern(q);
    query = query.ilike("title", `%${escaped}%`);
  }

  if (parsed.divisionId) {
    query = query.eq("division_id", parsed.divisionId);
  }

  if (parsed.departmentId) {
    query = query.eq("department_id", parsed.departmentId);
  }

  if (parsed.documentTypeId) {
    query = query.eq("document_type_id", parsed.documentTypeId);
  }

  if (parsed.processUncategorizedOnly) {
    query = query.is("process_category_id", null);
  } else if (parsed.processCategoryId) {
    query = query.eq("process_category_id", parsed.processCategoryId);
  }

  if (parsed.ownerId) {
    query = query.eq("owner_id", parsed.ownerId);
  }

  const { data, error, count } = await query;

  if (error) throw new Error(error.message);

  return {
    rows: (data ?? []) as DocumentListEmbed[],
    total: count ?? 0,
    page: safePage,
    pageSize: PAGE_SIZE,
  };
}

export async function getDocumentById(
  id: string,
): Promise<DocumentListEmbed | null> {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("documents")
    .select(DOCUMENT_LIST_EMBED_SELECT)
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data as DocumentListEmbed | null;
}
