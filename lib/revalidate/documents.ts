import { revalidatePath } from "next/cache";

export function revalidateDocumentsList(): void {
  revalidatePath("/documents");
}

export function revalidateDocumentEdit(documentId: string): void {
  revalidatePath(`/documents/${documentId}/edit`);
}

export function revalidateAdminActivity(): void {
  revalidatePath("/admin/activity");
}

/**
 * After create / update / archive: refresh list, optional edit view, and admin audit.
 */
export function revalidateAfterDocumentMutation(options?: {
  documentId?: string;
  includeAdminActivity?: boolean;
}): void {
  const { documentId, includeAdminActivity = true } = options ?? {};
  revalidateDocumentsList();
  if (documentId) revalidateDocumentEdit(documentId);
  if (includeAdminActivity) revalidateAdminActivity();
}
