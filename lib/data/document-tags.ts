import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function getTagIdsForDocument(
  documentId: string,
): Promise<string[]> {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("document_tags")
    .select("tag_id")
    .eq("document_id", documentId);

  if (error) throw new Error(error.message);
  return (data ?? []).map((row) => row.tag_id as string);
}

export async function getTagsForDocument(
  documentId: string,
): Promise<{ id: string; name: string }[]> {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("document_tags")
    .select("tags ( id, name )")
    .eq("document_id", documentId);

  if (error) throw new Error(error.message);

  const rows = data ?? [];
  const tags: { id: string; name: string }[] = [];
  for (const row of rows as unknown as { tags: { id: string; name: string } | null }[]) {
    if (row.tags?.id && row.tags?.name) {
      tags.push({ id: row.tags.id, name: row.tags.name });
    }
  }
  tags.sort((a, b) => a.name.localeCompare(b.name));
  return tags;
}
