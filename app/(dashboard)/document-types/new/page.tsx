import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { DocumentTypeForm } from "@/app/(dashboard)/document-types/document-type-form";
import { PageHeader } from "@/components/layout/page-header";
import { canMutateOrgReferences } from "@/lib/auth/rbac";
import { getCachedSessionProfile } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "New document type",
};

export default async function NewDocumentTypePage() {
  const { profile } = await getCachedSessionProfile();
  if (!canMutateOrgReferences(profile)) {
    redirect("/documents");
  }

  return (
    <main className="px-6 py-8 lg:px-10">
      <PageHeader
        title="Create document type"
        description="Define how documents are categorized in workflows and search."
      />
      <DocumentTypeForm mode="create" />
    </main>
  );
}
