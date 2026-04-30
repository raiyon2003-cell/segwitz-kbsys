import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProcessCategoryForm } from "@/app/(dashboard)/process-categories/process-category-form";
import { deleteProcessCategory } from "@/app/(dashboard)/process-categories/actions";
import { ResourceDeleteButton } from "@/components/crud/resource-delete-button";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { getCachedSessionProfile } from "@/lib/auth/session";
import { getProcessCategoryById } from "@/lib/data/process-categories";

type Props = { params: { id: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const row = await getProcessCategoryById(params.id);
  return {
    title: row ? `Edit · ${row.name}` : "Process category",
  };
}

export default async function EditProcessCategoryPage({ params }: Props) {
  const record = await getProcessCategoryById(params.id);
  if (!record) notFound();

  const { profile } = await getCachedSessionProfile();
  const canMutateRefs =
    profile.role === "admin" || profile.role === "member";

  return (
    <main className="px-6 py-8 lg:px-10">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <PageHeader
          title="Edit process category"
          description="Adjust labels without breaking downstream integrations."
        />
        <div className="flex flex-wrap gap-2">
          <Link href="/process-categories">
            <Button variant="outline">Back to list</Button>
          </Link>
          {canMutateRefs ? (
            <ResourceDeleteButton
              id={record.id}
              deleteAction={deleteProcessCategory}
              noun="process category"
              listHref="/process-categories"
            />
          ) : null}
        </div>
      </div>

      {canMutateRefs ? (
        <ProcessCategoryForm mode="edit" record={record} />
      ) : (
        <p className="text-sm text-foreground-muted">
          You don&apos;t have permission to edit process categories.
        </p>
      )}
    </main>
  );
}
