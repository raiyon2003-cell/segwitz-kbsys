import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DocumentTypeForm } from "@/app/(dashboard)/document-types/document-type-form";
import { deleteDocumentType } from "@/app/(dashboard)/document-types/actions";
import { ResourceDeleteButton } from "@/components/crud/resource-delete-button";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { getCachedSessionProfile } from "@/lib/auth/session";
import { getDocumentTypeById } from "@/lib/data/document-types";

type Props = { params: { id: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const row = await getDocumentTypeById(params.id);
  return {
    title: row ? `Edit · ${row.name}` : "Document type",
  };
}

export default async function EditDocumentTypePage({ params }: Props) {
  const record = await getDocumentTypeById(params.id);
  if (!record) notFound();

  const { profile } = await getCachedSessionProfile();
  const isAdmin = profile.role === "admin";

  return (
    <main className="px-6 py-8 lg:px-10">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <PageHeader
          title="Edit document type"
          description="Rename or reslug carefully — downstream references expect stability."
        />
        <div className="flex flex-wrap gap-2">
          <Link href="/document-types">
            <Button variant="outline">Back to list</Button>
          </Link>
          {isAdmin ? (
            <ResourceDeleteButton
              id={record.id}
              deleteAction={deleteDocumentType}
              noun="document type"
              listHref="/document-types"
            />
          ) : null}
        </div>
      </div>

      {isAdmin ? (
        <DocumentTypeForm mode="edit" record={record} />
      ) : (
        <p className="text-sm text-foreground-muted">
          You don&apos;t have permission to edit document types.
        </p>
      )}
    </main>
  );
}
