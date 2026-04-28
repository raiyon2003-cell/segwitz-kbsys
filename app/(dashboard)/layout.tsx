import type { ReactNode } from "react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { getCachedSessionProfile } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const { profile, email } = await getCachedSessionProfile();

  return (
    <DashboardShell profile={profile} email={email}>
      {children}
    </DashboardShell>
  );
}
