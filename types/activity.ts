/** Matches public.document_activity_action */

export type DocumentActivityAction =
  | "upload"
  | "update"
  | "status_change"
  | "file_replacement";

export const ACTIVITY_ACTION_LABEL: Record<
  DocumentActivityAction,
  string
> = {
  upload: "Upload",
  update: "Update",
  status_change: "Status change",
  file_replacement: "File replacement",
};

/** Shaped for admin activity table + API (includes joined display fields). */
export type ActivityLogListRow = {
  id: string;
  document_id: string;
  actor_id: string;
  action: DocumentActivityAction;
  details: Record<string, unknown> | null;
  created_at: string;
  document_title: string;
  actor_name: string | null;
  actor_email: string | null;
};
