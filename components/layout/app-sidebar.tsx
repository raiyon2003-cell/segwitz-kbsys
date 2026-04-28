"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Building2,
  FileText,
  History,
  Layers,
  LayoutDashboard,
  Tag,
  Users,
  Workflow,
} from "lucide-react";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { cn } from "@/lib/utils";
import { ADMIN_NAV, MAIN_NAV } from "@/lib/nav-config";
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
};

function NavIcon({ href }: { href: string }) {
  const Icon = ICONS[href] ?? LayoutDashboard;
  return <Icon className="size-[18px] shrink-0" aria-hidden />;
}

function NavLink({ item }: { item: NavItem }) {
  const pathname = usePathname();
  const active =
    item.href === "/"
      ? pathname === "/"
      : pathname === item.href || pathname.startsWith(`${item.href}/`);

  return (
    <Link
      href={item.href}
      className={cn(
        "group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
        active
          ? "bg-surface-muted text-foreground shadow-sm ring-1 ring-border-subtle"
          : "text-foreground-muted hover:bg-surface-muted hover:text-foreground",
      )}
    >
      <NavIcon href={item.href} />
      <span>{item.label}</span>
    </Link>
  );
}

export function AppSidebar({ profile }: { profile: Profile }) {
  return (
    <aside className="flex w-[260px] shrink-0 flex-col border-r border-border-subtle bg-surface-muted/40">
      <div className="flex h-14 items-center gap-2 border-b border-border-subtle px-5">
        <div className="flex size-8 items-center justify-center rounded-md bg-accent text-xs font-bold text-accent-foreground">
          KB
        </div>
        <div className="flex flex-col leading-tight">
          <span className="text-sm font-semibold tracking-tight">Knowledge Base</span>
          <span className="text-xs text-foreground-muted">Segwitz</span>
        </div>
      </div>
      <nav className="flex flex-1 flex-col gap-1 p-3" aria-label="Main">
        {MAIN_NAV.map((item) => (
          <NavLink key={item.href} item={item} />
        ))}
        {profile.role === "admin" ? (
          <>
            <p className="px-3 pb-1 pt-4 text-xs font-semibold uppercase tracking-wide text-foreground-muted">
              Admin
            </p>
            {ADMIN_NAV.map((item) => (
              <NavLink key={item.href} item={item} />
            ))}
          </>
        ) : null}
      </nav>
      <div className="border-t border-border-subtle p-4">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <span className="rounded-md bg-surface-muted px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-foreground-muted ring-1 ring-border-subtle">
            {profile.role}
          </span>
        </div>
        <SignOutButton className="mb-3 w-full justify-center" />
        <p className="text-xs leading-relaxed text-foreground-faint">
          Roles are stored on your profile and managed by admins.
        </p>
      </div>
    </aside>
  );
}
