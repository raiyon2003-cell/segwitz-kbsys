import "server-only";

import { cache } from "react";
import { getTagsForDocument } from "@/lib/data/document-tags";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { DocumentDetail } from "@/types/documents";

const DOCUMENT_DETAIL_SELECT = `
  *,
  divisions ( id, name ),
  departments ( id, name ),
  document_types ( id, name ),
  process_categories ( id, name ),
  owner_profile:profiles!documents_owner_id_fkey ( id, full_name, email ),
  uploaded_by_profile:profiles!documents_uploaded_by_fkey ( id, full_name, email ),
  updated_by_profile:profiles!documents_updated_by_fkey ( id, full_name, email )
`;

export const getDocumentDetail = cache(
  async function getDocumentDetail(
    id: string,
  ): Promise<DocumentDetail | null> {
    const supabase = createSupabaseServerClient();

    const [{ data, error }, tags] = await Promise.all([
      supabase
        .from("documents")
        .select(DOCUMENT_DETAIL_SELECT)
        .eq("id", id)
        .maybeSingle(),
      getTagsForDocument(id),
    ]);

    if (error) throw new Error(error.message);
    if (!data) return null;

    const row = data as Omit<DocumentDetail, "tags">;
    return {
      ...row,
      tags,
    };
  },
);
