import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { DivisionForm } from "@/app/(dashboard)/divisions/division-form";
import { PageHeader } from "@/components/layout/page-header";
import { canMutateOrgReferences } from "@/lib/auth/rbac";
import { getCachedSessionProfile } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "New division",
};

export default async function NewDivisionPage() {
  const { profile } = await getCachedSessionProfile();
  if (!canMutateOrgReferences(profile)) {
    redirect("/divisions");
  }

  return (
    <main className="space-y-8 animate-fade-in">
      <PageHeader
        title="Create division"
        description="Add a division so departments and documents can reference it."
      />
      <DivisionForm mode="create" />
    </main>
  );
}
