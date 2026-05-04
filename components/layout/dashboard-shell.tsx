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
    <div
      className="flex min-h-screen w-full bg-slate-100/90 dark:bg-slate-950"
      style={{
        display: "flex",
        minHeight: "100vh",
        width: "100%",
      }}
    >
      <AppSidebar
        profile={profile}
        viewerDepartmentLinks={viewerDepartmentLinks}
      />
      <div
        className="flex min-w-0 flex-1 flex-col border-l border-slate-200/90 bg-gray-50 shadow-[inset_1px_0_0_0_rgb(15_23_42/4%)] dark:border-slate-800 dark:bg-slate-900/60 dark:shadow-[inset_1px_0_0_0_rgb(255_255_255/6%)]"
        style={{
          display: "flex",
          flex: "1 1 0%",
          minWidth: 0,
          flexDirection: "column",
        }}
      >
        <AppTopbar profile={profile} email={email} />
        <div className="flex-1 overflow-auto">
          <div className="mx-auto min-h-0 w-full max-w-[1600px]">{children}</div>
        </div>
      </div>
    </div>
  );
}
