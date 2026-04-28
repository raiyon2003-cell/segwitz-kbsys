import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { TagForm } from "@/app/(dashboard)/tags/tag-form";
import { deleteTag } from "@/app/(dashboard)/tags/actions";
import { ResourceDeleteButton } from "@/components/crud/resource-delete-button";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { getCachedSessionProfile } from "@/lib/auth/session";
import { getTagById } from "@/lib/data/tags";

type Props = { params: { id: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const row = await getTagById(params.id);
  return {
    title: row ? `Edit · ${row.name}` : "Tag",
  };
}

export default async function EditTagPage({ params }: Props) {
  const record = await getTagById(params.id);
  if (!record) notFound();

  const { profile } = await getCachedSessionProfile();
  const isAdmin = profile.role === "admin";

  return (
    <main className="px-6 py-8 lg:px-10">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <PageHeader
          title="Edit tag"
          description="Adjust visible labels and optional highlight color."
        />
        <div className="flex flex-wrap gap-2">
          <Link href="/tags">
            <Button variant="outline">Back to list</Button>
          </Link>
          {isAdmin ? (
            <ResourceDeleteButton
              id={record.id}
              deleteAction={deleteTag}
              noun="tag"
              listHref="/tags"
            />
          ) : null}
        </div>
      </div>

      {isAdmin ? (
        <TagForm mode="edit" record={record} />
      ) : (
        <p className="text-sm text-foreground-muted">
          You don&apos;t have permission to edit tags.
        </p>
      )}
    </main>
  );
}
