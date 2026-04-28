/** Stored document row (matches public.documents) */

export type DocumentStatus = "draft" | "published" | "archived";

export type DocumentListView = "active" | "archived" | "all";

export type DocumentRecord = {
  id: string;
  title: string;
  summary: string | null;
  storage_object_path: string;
  original_filename: string;
  mime_type: string;
  division_id: string;
  department_id: string;
  document_type_id: string;
  process_category_id: string | null;
  owner_id: string;
  version: number;
  status: DocumentStatus;
  uploaded_by: string;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
};

export type ProfileMini = {
  id: string;
  full_name: string | null;
  email: string | null;
};

export type DocumentListEmbed = DocumentRecord & {
  divisions?: { id: string; name: string } | null;
  departments?: { id: string; name: string } | null;
  document_types?: { id: string; name: string } | null;
  process_categories?: { id: string; name: string } | null;
  owner_profile?: ProfileMini | null;
};

/** Detail page row + resolved tags + attribution profiles */
export type DocumentDetail = DocumentListEmbed & {
  tags: { id: string; name: string }[];
  uploaded_by_profile?: ProfileMini | null;
  updated_by_profile?: ProfileMini | null;
};
