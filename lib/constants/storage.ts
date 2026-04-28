/** Supabase Storage bucket for PDF documents */
export const DOCUMENTS_BUCKET = "documents" as const;

/** Stored object path suffix — one canonical PDF per document row */
export const DOCUMENT_STORAGE_FILENAME = "document.pdf" as const;
