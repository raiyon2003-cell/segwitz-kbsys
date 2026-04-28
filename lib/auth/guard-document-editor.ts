import "server-only";

import { getCachedSessionProfile } from "@/lib/auth/session";

export async function guardDocumentEditor(): Promise<
  | { denied: true; message: string }
  | { denied: false }
> {
  const { profile } = await getCachedSessionProfile();
  if (profile.role !== "admin" && profile.role !== "manager") {
    return {
      denied: true,
      message:
        "Only administrators and managers can upload or edit repository documents.",
    };
  }
  return { denied: false };
}
