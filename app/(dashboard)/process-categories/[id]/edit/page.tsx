import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ProcessCategoryForm } from "@/app/(dashboard)/process-categories/process-category-form";
import { deleteProcessCategory } from "@/app/(dashboard)/process-categories/actions";
import { ResourceDeleteButton } from "@/components/crud/resource-delete-button";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { canMutateOrgReferences } from "@/lib/auth/rbac";
import { getCachedSessionProfile } from "@/lib/auth/session";
import { getProcessCategoryById } from "@/lib/data/process-categories";
import { resolveRouteParams } from "@/lib/next/route-args";

type PageParams = { id: string };
type Props = { params: PageParams | Promise<PageParams> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await resolveRouteParams(params);
  const row = await getProcessCategoryById(id);
  return {
    title: row ? `Edit · ${row.name}` : "Process category",
  };
}

export default async function EditProcessCategoryPage({ params }: Props) {
  const { id } = await resolveRouteParams(params);
  const record = await getProcessCategoryById(id);
  if (!record) notFound();

  const { profile } = await getCachedSessionProfile();
  const canMutateRefs = canMutateOrgReferences(profile);
  if (!canMutateRefs) {
    redirect("/process-categories");
  }

  return (
    <main className="space-y-8 animate-fade-in">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <PageHeader
          title="Edit process category"
          description="Adjust labels without breaking downstream integrations."
        />
        <div className="flex flex-wrap gap-2">
          <Link href="/process-categories">
            <Button variant="outline">Back to list</Button>
          </Link>
          <ResourceDeleteButton
            id={record.id}
            deleteAction={deleteProcessCategory}
            noun="process category"
            listHref="/process-categories"
          />
        </div>
      </div>

      <ProcessCategoryForm mode="edit" record={record} />
    </main>
  );
}
