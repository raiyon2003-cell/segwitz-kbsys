import "server-only";

import { getCachedSessionProfile } from "@/lib/auth/session";

export async function guardAdminMutation(): Promise<
  | { denied: true; message: string }
  | { denied: false }
> {
  const { profile } = await getCachedSessionProfile();
  if (profile.role !== "admin") {
    return {
      denied: true,
      message: "Only administrators can modify this resource.",
    };
  }
  return { denied: false };
}
