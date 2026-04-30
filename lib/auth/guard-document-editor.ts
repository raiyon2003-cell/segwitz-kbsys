import "server-only";

import { getCachedSessionProfile } from "@/lib/auth/session";

/** Upload / create documents (admin, manager, or member). */
export async function guardDocumentUploader(): Promise<
  | { denied: true; message: string }
  | { denied: false }
> {
  const { profile } = await getCachedSessionProfile();
  if (
    profile.role !== "admin" &&
    profile.role !== "manager" &&
    profile.role !== "member"
  ) {
    return {
      denied: true,
      message:
        "Only administrators, managers, and members can upload documents.",
    };
  }
  return { denied: false };
}

/** Edit metadata, replace files, archive — admin, manager, or member. */
export async function guardDocumentEditor(): Promise<
  | { denied: true; message: string }
  | { denied: false }
> {
  const { profile } = await getCachedSessionProfile();
  if (
    profile.role !== "admin" &&
    profile.role !== "manager" &&
    profile.role !== "member"
  ) {
    return {
      denied: true,
      message:
        "Only administrators, managers, and members can edit or archive repository documents.",
    };
  }
  return { denied: false };
}
