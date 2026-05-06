/** Shared application types */

export type NavItem = {
  label: string;
  href: string;
};

export type AppRole = "admin" | "manager" | "member" | "employee" | "viewer";

export type DocumentPermissions = {
  can_view: boolean;
  can_upload: boolean;
  can_edit: boolean;
  can_delete: boolean;
  can_download: boolean;
};

export type Profile = {
  id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  role: AppRole;
  department: string | null;
  document_permissions: DocumentPermissions | null;
  created_at: string;
  updated_at: string;
};
