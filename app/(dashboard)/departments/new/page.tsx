import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { DepartmentForm } from "@/app/(dashboard)/departments/department-form";
import { PageHeader } from "@/components/layout/page-header";
import { canMutateOrgReferences } from "@/lib/auth/rbac";
import { getCachedSessionProfile } from "@/lib/auth/session";
import { getDivisionOptions } from "@/lib/data/divisions";

export const metadata: Metadata = {
  title: "New department",
};

export default async function NewDepartmentPage() {
  const { profile } = await getCachedSessionProfile();
  if (!canMutateOrgReferences(profile)) {
    redirect("/departments");
  }

  const divisions = await getDivisionOptions();

  return (
    <main className="space-y-8 animate-fade-in">
      <PageHeader
        title="Create department"
        description="Attach each department to exactly one division."
      />
      <DepartmentForm
        mode="create"
        divisions={divisions.map((d) => ({ id: d.id, name: d.name }))}
      />
    </main>
  );
}
