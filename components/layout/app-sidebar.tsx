"use client";

import { memo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Building2,
  ChevronLeft,
  ChevronRight,
  FileText,
  History,
  KeyRound,
  Layers,
  LayoutDashboard,
  Tag,
  Users,
  Workflow,
} from "lucide-react";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { cn } from "@/lib/utils";
import { shouldUseReducedStaffNav } from "@/lib/auth/rbac";
import { ADMIN_NAV, MAIN_NAV } from "@/lib/nav-config";
import type { ViewerDepartmentLink } from "@/lib/data/access-control";
import type { NavItem, Profile } from "@/types";

const ICONS: Record<string, typeof LayoutDashboard> = {
  "/": LayoutDashboard,
  "/documents": FileText,
  "/divisions": Building2,
  "/departments": Users,
  "/document-types": Layers,
  "/process-categories": Workflow,
  "/tags": Tag,
  "/admin/activity": History,
  "/admin/access": KeyRound,
};

const NavIcon = memo(function NavIcon({ href }: { href: string }) {
  const Icon =
    ICONS[href] ??
    (href.startsWith("/departments/") ? Users : LayoutDashboard);
  return <Icon className="size-[18px] shrink-0" aria-hidden />;
});

const NavLink = memo(function NavLink({
  item,
  collapsed,
  onNavigate,
}: {
  item: NavItem;
  collapsed: boolean;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const active =
    item.href === "/"
      ? pathname === "/"
      : pathname === item.href || pathname.startsWith(`${item.href}/`);

  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      title={collapsed ? item.label : undefined}
      className={cn(
        "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition-all",
        active
          ? "bg-sidebar-active text-white shadow-md ring-1 ring-white/10"
          : "text-sidebar-foreground/80 hover:bg-white/10 hover:text-white",
        collapsed && "justify-center px-2",
      )}
    >
      <NavIcon href={item.href} />
      {!collapsed ? <span className="truncate">{item.label}</span> : null}
    </Link>
  );
});

const SCOPED_STAFF_MAIN_HREFS = new Set(["/", "/documents"]);

function AppSidebarComponent({
  profile,
  viewerDepartmentLinks = [],
  collapsed,
  mobileOpen,
  onMobileClose,
  onToggleCollapse,
}: {
  profile: Profile;
  viewerDepartmentLinks?: ViewerDepartmentLink[];
  collapsed: boolean;
  mobileOpen: boolean;
  onMobileClose?: () => void;
  onToggleCollapse?: () => void;
}) {
  const mainItems = shouldUseReducedStaffNav(profile)
    ? MAIN_NAV.filter((item) => SCOPED_STAFF_MAIN_HREFS.has(item.href))
    : MAIN_NAV;

  const displayName =
    profile.full_name?.trim() || profile.email?.trim() || "User";

  return (
    <aside
      className={cn(
        "sidebar-gradient fixed inset-y-0 left-0 z-50 flex flex-col border-r border-white/10 text-sidebar-foreground shadow-xl ring-1 ring-white/5 transition-[width,transform] duration-200 lg:static lg:translate-x-0",
        collapsed ? "w-[76px]" : "w-64",
        mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
      )}
    >
      <div
        className={cn(
          "flex h-14 items-center border-b border-white/10 px-4",
          collapsed ? "justify-center px-2" : "gap-3",
        )}
      >
        {!collapsed ? (
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/50">
              Segwitz
            </p>
            <p className="truncate text-sm font-bold text-white">Knowledge Base</p>
            <div className="mt-1 h-0.5 w-8 rounded-full bg-accent" aria-hidden />
          </div>
        ) : (
          <div className="flex size-9 items-center justify-center rounded-lg bg-sidebar-active text-xs font-bold text-white">
            KB
          </div>
        )}
        <button
          type="button"
          onClick={onToggleCollapse}
          className="hidden size-8 items-center justify-center rounded-lg border border-white/15 text-white/80 hover:bg-white/10 lg:inline-flex"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <ChevronRight className="size-4" />
          ) : (
            <ChevronLeft className="size-4" />
          )}
        </button>
      </div>

      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-3" aria-label="Main">
        {mainItems.map((item) => (
          <NavLink
            key={item.href}
            item={item}
            collapsed={collapsed}
            onNavigate={onMobileClose}
          />
        ))}
        {shouldUseReducedStaffNav(profile) &&
        viewerDepartmentLinks.length > 0 ? (
          <>
            {!collapsed ? (
              <p className="px-3 pb-1 pt-4 text-[10px] font-bold uppercase tracking-widest text-white/45">
                Departments
              </p>
            ) : null}
            {viewerDepartmentLinks.map((d) => (
              <NavLink
                key={d.id}
                item={{ href: `/departments/${d.id}`, label: d.name }}
                collapsed={collapsed}
                onNavigate={onMobileClose}
              />
            ))}
          </>
        ) : null}
        {profile.role === "admin" ? (
          <>
            {!collapsed ? (
              <p className="px-3 pb-1 pt-4 text-[10px] font-bold uppercase tracking-widest text-white/45">
                Admin
              </p>
            ) : null}
            {ADMIN_NAV.map((item) => (
              <NavLink
                key={item.href}
                item={item}
                collapsed={collapsed}
                onNavigate={onMobileClose}
              />
            ))}
          </>
        ) : null}
      </nav>

      <div className="border-t border-white/10 p-4">
        {!collapsed ? (
          <>
            <p className="truncate text-sm font-semibold text-white">{displayName}</p>
            <p className="mt-0.5 text-[10px] font-bold uppercase tracking-wide text-white/55">
              {profile.role}
            </p>
          </>
        ) : null}
        <SignOutButton
          className={cn(
            "mt-3 w-full justify-center border-white/25 text-white hover:bg-white/10 hover:text-white",
            collapsed && "px-2",
          )}
        />
      </div>
    </aside>
  );
}

export const AppSidebar = memo(AppSidebarComponent);
