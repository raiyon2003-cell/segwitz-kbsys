import type { NavItem } from "@/types";

export const MAIN_NAV: NavItem[] = [
  { label: "Dashboard", href: "/" },
  { label: "Documents", href: "/documents" },
  { label: "Divisions", href: "/divisions" },
  { label: "Departments", href: "/departments" },
  { label: "Document Types", href: "/document-types" },
  { label: "Process Categories", href: "/process-categories" },
  { label: "Tags", href: "/tags" },
];

/** Shown in the sidebar only when the user is an admin. */
export const ADMIN_NAV: NavItem[] = [
  { label: "Activity", href: "/admin/activity" },
];
