import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { DocumentForm } from "@/components/documents/document-form";
import { PageHeader } from "@/components/layout/page-header";
import { guardDocumentEditor } from "@/lib/auth/guard-document-editor";
import { getCachedSessionProfile } from "@/lib/auth/session";
import { getTagIdsForDocument } from "@/lib/data/document-tags";
import { loadDocumentFormOptions } from "@/lib/data/document-form-options";
import { getDocumentById } from "@/lib/data/documents";

type Props = {
  params: { id: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const doc = await getDocumentById(params.id);
  return {
    title: doc ? `Edit · ${doc.title}` : "Edit document",
  };
}

export default async function EditDocumentPage({ params }: Props) {
  const gate = await guardDocumentEditor();
  if (gate.denied) {
    redirect("/documents");
  }

  const [document, selectedTagIds, options, { profile }] =
    await Promise.all([
      getDocumentById(params.id),
      getTagIdsForDocument(params.id),
      loadDocumentFormOptions(),
      getCachedSessionProfile(),
    ]);

  if (!document) {
    notFound();
  }

  return (
    <main className="px-6 py-8 lg:px-10">
      <PageHeader
        title="Edit document"
        description="Update metadata or replace the PDF in storage."
      />
      <DocumentForm
        mode="edit"
        document={document}
        selectedTagIds={selectedTagIds}
        options={options}
        currentUserProfileId={profile.id}
      />
    </main>
  );
}
