/** Shared application types */

export type NavItem = {
  label: string;
  href: string;
};

export type AppRole = "admin" | "manager" | "member" | "viewer";

export type Profile = {
  id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  role: AppRole;
  created_at: string;
  updated_at: string;
};
