import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { TagRow } from "@/types/entities";

/** All tags for multi-select pickers (small list expected). */
export async function getTagsForPicker(): Promise<Pick<TagRow, "id" | "name">[]> {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("tags")
    .select("id, name")
    .order("name", { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []) as Pick<TagRow, "id" | "name">[];
}
