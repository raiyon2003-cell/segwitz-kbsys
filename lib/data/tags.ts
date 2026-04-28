import "server-only";

import { PAGE_SIZE } from "@/lib/constants";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { TagRow } from "@/types/entities";

export async function getTagsPaginated(page: number) {
  const supabase = createSupabaseServerClient();
  const safePage = Math.max(1, Math.floor(page) || 1);
  const from = (safePage - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const { data, error, count } = await supabase
    .from("tags")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) throw new Error(error.message);

  return {
    rows: (data ?? []) as TagRow[],
    total: count ?? 0,
    page: safePage,
    pageSize: PAGE_SIZE,
  };
}

export async function getTagById(id: string): Promise<TagRow | null> {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase.from("tags").select("*").eq("id", id).maybeSingle();

  if (error) throw new Error(error.message);
  return data as TagRow | null;
}
