import "server-only";

import { cache } from "react";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { AppRole, Profile } from "@/types";
import { redirect } from "next/navigation";

export async function getSessionProfile(): Promise<{
  profile: Profile;
  email: string | null;
}> {
  const supabase = createSupabaseServerClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/login");
  }

  const { data: profileRow } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  const fallback: Profile = {
    id: user.id,
    email: user.email ?? null,
    full_name: null,
    avatar_url: null,
    role: "member",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const row = profileRow as Profile | null | undefined;

  const profile: Profile = row?.id
    ? {
        ...fallback,
        ...row,
        role: (row.role ?? "member") as AppRole,
      }
    : fallback;

  return {
    profile,
    email: user.email ?? null,
  };
}

export const getCachedSessionProfile = cache(getSessionProfile);
