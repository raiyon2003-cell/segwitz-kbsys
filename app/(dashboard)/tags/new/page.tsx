import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { TagForm } from "@/app/(dashboard)/tags/tag-form";
import { PageHeader } from "@/components/layout/page-header";
import { canMutateOrgReferences } from "@/lib/auth/rbac";
import { getCachedSessionProfile } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "New tag",
};

export default async function NewTagPage() {
  const { profile } = await getCachedSessionProfile();
  if (!canMutateOrgReferences(profile)) {
    redirect("/documents");
  }

  return (
    <main className="space-y-8 animate-fade-in">
      <PageHeader
        title="Create tag"
        description="Tags help teams slice content across divisions and departments."
      />
      <TagForm mode="create" />
    </main>
  );
}
