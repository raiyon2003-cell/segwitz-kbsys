import "server-only";

import { PAGE_SIZE } from "@/lib/constants";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { DepartmentRow } from "@/types/entities";

export async function getDepartmentsPaginated(page: number) {
  const supabase = createSupabaseServerClient();
  const safePage = Math.max(1, Math.floor(page) || 1);
  const from = (safePage - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const { data, error, count } = await supabase
    .from("departments")
    .select(
      `
      *,
      divisions (
        id,
        name,
        slug
      )
    `,
      { count: "exact" },
    )
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) throw new Error(error.message);

  return {
    rows: (data ?? []) as DepartmentRow[],
    total: count ?? 0,
    page: safePage,
    pageSize: PAGE_SIZE,
  };
}

export async function getDepartmentById(id: string): Promise<DepartmentRow | null> {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("departments")
    .select(
      `
      *,
      divisions (
        id,
        name,
        slug
      )
    `,
    )
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data as DepartmentRow | null;
}
