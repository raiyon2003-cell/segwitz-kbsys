import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getSupabasePublicEnv } from "@/lib/supabase/env";

export function createSupabaseBrowserClient(): SupabaseClient {
  const { url, key } = getSupabasePublicEnv();
  return createBrowserClient(url, key);
}
