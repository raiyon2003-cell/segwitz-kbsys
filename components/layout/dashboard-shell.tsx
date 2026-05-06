import type { ReactNode } from "react";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { AppTopbar } from "@/components/layout/app-topbar";
import type { ViewerDepartmentLink } from "@/lib/data/access-control";
import type { Profile } from "@/types";

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
  return (
    <div className="flex min-h-screen w-full bg-surface">
      <AppSidebar
        profile={profile}
        viewerDepartmentLinks={viewerDepartmentLinks}
      />
      <div className="flex min-w-0 flex-1 flex-col border-l border-border-subtle bg-surface-muted/35 shadow-[inset_1px_0_0_0_rgb(7_59_76/8%)]">
        <AppTopbar profile={profile} email={email} />
        <div className="flex-1 overflow-auto">
          <div className="mx-auto min-h-0 w-full max-w-[1600px]">{children}</div>
        </div>
      </div>
    </div>
  );
}
