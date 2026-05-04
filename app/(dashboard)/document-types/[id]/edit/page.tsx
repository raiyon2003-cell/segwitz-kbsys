import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { DocumentTypeForm } from "@/app/(dashboard)/document-types/document-type-form";
import { deleteDocumentType } from "@/app/(dashboard)/document-types/actions";
import { ResourceDeleteButton } from "@/components/crud/resource-delete-button";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { canMutateOrgReferences } from "@/lib/auth/rbac";
import { getCachedSessionProfile } from "@/lib/auth/session";
import { getDocumentTypeById } from "@/lib/data/document-types";
import { resolveRouteParams } from "@/lib/next/route-args";

type PageParams = { id: string };
type Props = { params: PageParams | Promise<PageParams> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await resolveRouteParams(params);
  const row = await getDocumentTypeById(id);
  return {
    title: row ? `Edit · ${row.name}` : "Document type",
  };
}

export default async function EditDocumentTypePage({ params }: Props) {
  const { id } = await resolveRouteParams(params);
  const record = await getDocumentTypeById(id);
  if (!record) notFound();

  const { profile } = await getCachedSessionProfile();
  const canMutateRefs = canMutateOrgReferences(profile);
  if (!canMutateRefs) {
    redirect("/document-types");
  }

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
          <ResourceDeleteButton
            id={record.id}
            deleteAction={deleteDocumentType}
            noun="document type"
            listHref="/document-types"
          />
        </div>
      </div>

      <DocumentTypeForm mode="edit" record={record} />
    </main>
  );
}
