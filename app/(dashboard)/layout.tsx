import type { ReactNode } from "react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { usesDepartmentShortcuts } from "@/lib/auth/rbac";
import { getViewerDepartmentNavLinks } from "@/lib/data/access-control";
import { getCachedSessionProfile } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const { profile, email } = await getCachedSessionProfile();

  let viewerDepartmentLinks: Awaited<
    ReturnType<typeof getViewerDepartmentNavLinks>
  > | undefined;
  if (usesDepartmentShortcuts(profile)) {
    try {
      viewerDepartmentLinks = await getViewerDepartmentNavLinks(profile.id);
    } catch {
      viewerDepartmentLinks = [];
    }
  }

  return (
    <DashboardShell
      profile={profile}
      email={email}
      viewerDepartmentLinks={viewerDepartmentLinks}
    >
      {children}
    </DashboardShell>
  );
}
