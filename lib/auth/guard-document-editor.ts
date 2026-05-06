import "server-only";

import { canDeleteOrArchiveDocuments, canEditDocumentRecords, canUploadDocuments } from "@/lib/auth/rbac";
import { getCachedSessionProfile } from "@/lib/auth/session";

/** Upload / create documents (admin, manager, or member). */
export async function guardDocumentUploader(): Promise<
  | { denied: true; message: string }
  | { denied: false }
> {
  const { profile } = await getCachedSessionProfile();
  if (!canUploadDocuments(profile)) {
    return {
      denied: true,
      message: "You do not have permission to upload documents.",
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
  if (!canEditDocumentRecords(profile)) {
    return {
      denied: true,
      message: "You do not have permission to edit documents.",
    };
  }
  return { denied: false };
}

export async function guardDocumentDelete(): Promise<
  | { denied: true; message: string }
  | { denied: false }
> {
  const { profile } = await getCachedSessionProfile();
  if (!canDeleteOrArchiveDocuments(profile)) {
    return {
      denied: true,
      message: "You do not have permission to delete documents.",
    };
  }
  return { denied: false };
}
