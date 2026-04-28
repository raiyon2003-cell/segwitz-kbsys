import type { Metadata } from "next";
import { DocumentTypeForm } from "@/app/(dashboard)/document-types/document-type-form";
import { PageHeader } from "@/components/layout/page-header";

export const metadata: Metadata = {
  title: "New document type",
};

export default function NewDocumentTypePage() {
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
