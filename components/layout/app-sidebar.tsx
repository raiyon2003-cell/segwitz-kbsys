"use client";

import { memo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Building2,
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

const NavLink = memo(function NavLink({ item }: { item: NavItem }) {
  const pathname = usePathname();
  const active =
    item.href === "/"
      ? pathname === "/"
      : pathname === item.href || pathname.startsWith(`${item.href}/`);

  return (
    <Link
      href={item.href}
      className={cn(
        "group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-semibold",
        active
          ? "bg-brand-lime text-white shadow-sm ring-1 ring-brand-lime/70"
          : "text-white/80 hover:bg-brand-steel/75 hover:text-white",
      )}
    >
      <NavIcon href={item.href} />
      <span>{item.label}</span>
    </Link>
  );
});

const SCOPED_STAFF_MAIN_HREFS = new Set(["/", "/documents"]);

function AppSidebarComponent({
  profile,
  viewerDepartmentLinks = [],
}: {
  profile: Profile;
  viewerDepartmentLinks?: ViewerDepartmentLink[];
}) {
  const mainItems = shouldUseReducedStaffNav(profile)
    ? MAIN_NAV.filter((item) => SCOPED_STAFF_MAIN_HREFS.has(item.href))
    : MAIN_NAV;

  return (
    <aside className="flex w-64 shrink-0 flex-col border-r border-brand-teal/60 bg-brand-teal text-white md:w-[260px]">
      <div className="flex h-14 items-center gap-2 border-b border-brand-steel/70 px-5">
        <div className="flex size-8 items-center justify-center rounded-md bg-accent text-xs font-bold text-accent-foreground">
          KB
        </div>
        <div className="flex flex-col leading-tight">
          <span className="text-sm font-bold tracking-tight text-white">Knowledge Base</span>
          <span className="text-xs text-white/70">Segwitz</span>
        </div>
      </div>
      <nav className="flex flex-1 flex-col gap-1 p-3" aria-label="Main">
        {mainItems.map((item) => (
          <NavLink key={item.href} item={item} />
        ))}
        {shouldUseReducedStaffNav(profile) &&
        viewerDepartmentLinks.length > 0 ? (
          <>
            <p className="px-3 pb-1 pt-4 text-xs font-bold uppercase tracking-wide text-white/60">
              Departments
            </p>
            {viewerDepartmentLinks.map((d) => (
              <NavLink
                key={d.id}
                item={{ href: `/departments/${d.id}`, label: d.name }}
              />
            ))}
          </>
        ) : null}
        {profile.role === "admin" ? (
          <>
            <p className="px-3 pb-1 pt-4 text-xs font-bold uppercase tracking-wide text-white/60">
              Admin
            </p>
            {ADMIN_NAV.map((item) => (
              <NavLink key={item.href} item={item} />
            ))}
          </>
        ) : null}
      </nav>
      <div className="border-t border-brand-steel/70 p-4">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <span className="rounded-md bg-brand-steel/70 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-white/90 ring-1 ring-white/20">
            {profile.role}
          </span>
        </div>
        <SignOutButton className="mb-3 w-full justify-center border-white/30 text-white hover:bg-white/10 hover:text-white" />
        <p className="text-xs leading-relaxed text-white/65">
          Roles are stored on your profile and managed by admins.
        </p>
      </div>
    </aside>
  );
}

export const AppSidebar = memo(AppSidebarComponent);
