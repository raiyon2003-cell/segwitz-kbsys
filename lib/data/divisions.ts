import "server-only";

import { PAGE_SIZE } from "@/lib/constants";
import { getProfileDepartments } from "@/lib/data/access-control";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { DivisionRow } from "@/types/entities";

export async function getDivisionsPaginated(page: number) {
  const supabase = await createSupabaseServerClient();
  const safePage = Math.max(1, Math.floor(page) || 1);
  const from = (safePage - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const { data, error, count } = await supabase
    .from("divisions")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) throw new Error(error.message);

  return {
    rows: (data ?? []) as DivisionRow[],
    total: count ?? 0,
    page: safePage,
    pageSize: PAGE_SIZE,
  };
}

/** Divisions that contain at least one department assigned to the profile. */
export async function getDivisionsPaginatedForProfile(
  profileId: string,
  page: number,
) {
  const safePage = Math.max(1, Math.floor(page) || 1);
  const deptIds = await getProfileDepartments(profileId);

  if (deptIds.length === 0) {
    return {
      rows: [] as DivisionRow[],
      total: 0,
      page: safePage,
      pageSize: PAGE_SIZE,
    };
  }

  const supabase = await createSupabaseServerClient();
  const { data: deptRows, error: deptErr } = await supabase
    .from("departments")
    .select("division_id")
    .in("id", deptIds);

  if (deptErr) throw new Error(deptErr.message);

  const divisionIds = Array.from(
    new Set(
      (deptRows ?? []).map((r) => r.division_id as string).filter(Boolean),
    ),
  );

  if (divisionIds.length === 0) {
    return {
      rows: [] as DivisionRow[],
      total: 0,
      page: safePage,
      pageSize: PAGE_SIZE,
    };
  }

  const from = (safePage - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const { data, error, count } = await supabase
    .from("divisions")
    .select("*", { count: "exact" })
    .in("id", divisionIds)
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) throw new Error(error.message);

  return {
    rows: (data ?? []) as DivisionRow[],
    total: count ?? 0,
    page: safePage,
    pageSize: PAGE_SIZE,
  };
}

export async function getDivisionById(id: string): Promise<DivisionRow | null> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("divisions")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data as DivisionRow | null;
}

export async function getDivisionOptions(): Promise<
  Pick<DivisionRow, "id" | "name" | "slug">[]
> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("divisions")
    .select("id, name, slug")
    .order("name", { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []) as Pick<DivisionRow, "id" | "name" | "slug">[];
}
