"use client";

import { useState, type ReactNode } from "react";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { AppTopbar } from "@/components/layout/app-topbar";
import type { ViewerDepartmentLink } from "@/lib/data/access-control";
import type { Profile } from "@/types";
import { cn } from "@/lib/utils";

export function DashboardShell({
  children,
  profile,
  email,
  viewerDepartmentLinks,
}: {
  children: ReactNode;
  profile: Profile;
  email: string | null;
  viewerDepartmentLinks?: ViewerDepartmentLink[];
}) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen w-full bg-background">
      {mobileNavOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
          aria-label="Close navigation"
          onClick={() => setMobileNavOpen(false)}
        />
      ) : null}

      <AppSidebar
        profile={profile}
        viewerDepartmentLinks={viewerDepartmentLinks}
        collapsed={collapsed}
        mobileOpen={mobileNavOpen}
        onMobileClose={() => setMobileNavOpen(false)}
        onToggleCollapse={() => setCollapsed((c) => !c)}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <AppTopbar
          profile={profile}
          email={email}
          onMenuClick={() => setMobileNavOpen(true)}
        />
        <main className="workspace-canvas">
          <div className={cn("workspace-inner", "min-h-[calc(100vh-3.5rem)]")}>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
