import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { DOCUMENT_LIST_EMBED_SELECT } from "@/lib/data/documents";
import type { CountByLabel, DashboardData } from "@/types/dashboard";
import type { DocumentListEmbed } from "@/types/documents";

const DISTRIBUTION_SELECT = `
  division_id,
  document_type_id,
  divisions ( id, name ),
  document_types ( id, name )
`;

type DistRow = {
  division_id: string;
  document_type_id: string;
  divisions: { id: string; name: string } | null;
  document_types: { id: string; name: string } | null;
};

type Labeled = { id: string; name: string };

/**
 * Merges repeated ids (same pattern for division and document-type breakdowns).
 */
function countByLabeledId(rows: Labeled[]): CountByLabel[] {
  const map = new Map<string, { name: string; count: number }>();
  for (const { id, name } of rows) {
    const cur = map.get(id);
    if (cur) cur.count += 1;
    else map.set(id, { name, count: 1 });
  }
  return Array.from(map.entries())
    .map(([id, { name, count }]) => ({ id, name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}

function throwOn<T extends { error: { message: string } | null }>(r: T): T {
  if (r.error) throw new Error(r.error.message);
  return r;
}

function emptyDashboard(setupMessage: string): DashboardData {
  return {
    total: 0,
    draft: 0,
    published: 0,
    archived: 0,
    recent: [],
    byDivision: [],
    byType: [],
    setupMessage,
  };
}

function isMissingSchemaError(message: string): boolean {
  const m = message.toLowerCase();
  return (
    m.includes("could not find the table") ||
    m.includes("schema cache") ||
    (m.includes("relation") && m.includes("does not exist")) ||
    m.includes('table "documents" does not exist')
  );
}

async function getDashboardDataCore(): Promise<DashboardData> {
  const supabase = createSupabaseServerClient();

  const [totalR, draftR, publishedR, archivedR, recentR, distR] =
    await Promise.all([
      supabase
        .from("documents")
        .select("id", { count: "exact", head: true }),
      supabase
        .from("documents")
        .select("id", { count: "exact", head: true })
        .eq("status", "draft"),
      supabase
        .from("documents")
        .select("id", { count: "exact", head: true })
        .eq("status", "published"),
      supabase
        .from("documents")
        .select("id", { count: "exact", head: true })
        .eq("status", "archived"),
      supabase
        .from("documents")
        .select(DOCUMENT_LIST_EMBED_SELECT)
        .order("created_at", { ascending: false })
        .limit(8),
      supabase.from("documents").select(DISTRIBUTION_SELECT),
    ]);

  for (const r of [
    totalR,
    draftR,
    publishedR,
    archivedR,
    recentR,
    distR,
  ] as const) {
    throwOn(r);
  }

  const divisionIds: Labeled[] = [];
  const typeIds: Labeled[] = [];
  for (const row of (distR.data ?? []) as unknown as DistRow[]) {
    divisionIds.push({
      id: row.division_id,
      name: row.divisions?.name?.trim() || "Unknown division",
    });
    typeIds.push({
      id: row.document_type_id,
      name: row.document_types?.name?.trim() || "Unknown type",
    });
  }

  return {
    total: totalR.count ?? 0,
    draft: draftR.count ?? 0,
    published: publishedR.count ?? 0,
    archived: archivedR.count ?? 0,
    recent: (recentR.data ?? []) as DocumentListEmbed[],
    byDivision: countByLabeledId(divisionIds),
    byType: countByLabeledId(typeIds),
    setupMessage: null,
  };
}

export async function getDashboardData(): Promise<DashboardData> {
  try {
    return await getDashboardDataCore();
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (isMissingSchemaError(msg)) {
      return emptyDashboard(
        "Your Supabase database doesn’t have the KB tables yet (e.g. `documents`). In this repo run `supabase link --project-ref …` (same project as `NEXT_PUBLIC_SUPABASE_URL`), then `supabase db push`. Alternatively run the SQL files in `supabase/migrations/` in order in the Supabase SQL editor.",
      );
    }
    throw e;
  }
}
