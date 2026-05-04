import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ProcessCategoryForm } from "@/app/(dashboard)/process-categories/process-category-form";
import { PageHeader } from "@/components/layout/page-header";
import { canMutateOrgReferences } from "@/lib/auth/rbac";
import { getCachedSessionProfile } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "New process category",
};

export default async function NewProcessCategoryPage() {
  const { profile } = await getCachedSessionProfile();
  if (!canMutateOrgReferences(profile)) {
    redirect("/documents");
  }

  return (
    <main className="px-6 py-8 lg:px-10">
      <PageHeader
        title="Create process category"
        description="Use consistent naming so teams can browse processes predictably."
      />
      <ProcessCategoryForm mode="create" />
    </main>
  );
}
