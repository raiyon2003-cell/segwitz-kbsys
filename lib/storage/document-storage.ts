import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import {
  DOCUMENTS_BUCKET,
  DOCUMENT_STORAGE_FILENAME,
} from "@/lib/constants/storage";

export function buildDocumentStoragePath(documentId: string): string {
  return `${documentId}/${DOCUMENT_STORAGE_FILENAME}`;
}

export async function uploadPdfForDocument(
  supabase: SupabaseClient,
  documentId: string,
  file: File,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const path = buildDocumentStoragePath(documentId);
  const buffer = await file.arrayBuffer();

  const { error } = await supabase.storage.from(DOCUMENTS_BUCKET).upload(path, buffer, {
    cacheControl: "3600",
    upsert: true,
    contentType: "application/pdf",
  });

  if (error) {
    return { ok: false, error: error.message };
  }

  return { ok: true };
}

export async function deletePdfForDocument(
  supabase: SupabaseClient,
  storagePath: string,
): Promise<void> {
  await supabase.storage.from(DOCUMENTS_BUCKET).remove([storagePath]);
}

export async function getSignedPdfDownloadUrl(
  supabase: SupabaseClient,
  storagePath: string,
  expiresSeconds = 3600,
): Promise<string | null> {
  const { data, error } = await supabase.storage
    .from(DOCUMENTS_BUCKET)
    .createSignedUrl(storagePath, expiresSeconds);

  if (error || !data?.signedUrl) return null;
  return data.signedUrl;
}
