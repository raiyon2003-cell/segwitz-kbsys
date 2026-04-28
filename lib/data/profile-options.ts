import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function getProfileOptions(): Promise<
  { id: string; full_name: string | null; email: string | null }[]
> {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, email")
    .order("full_name", { ascending: true, nullsFirst: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as {
    id: string;
    full_name: string | null;
    email: string | null;
  }[];
}
