import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { TagForm } from "@/app/(dashboard)/tags/tag-form";
import { deleteTag } from "@/app/(dashboard)/tags/actions";
import { ResourceDeleteButton } from "@/components/crud/resource-delete-button";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { canMutateOrgReferences } from "@/lib/auth/rbac";
import { getCachedSessionProfile } from "@/lib/auth/session";
import { getTagById } from "@/lib/data/tags";
import { resolveRouteParams } from "@/lib/next/route-args";

type PageParams = { id: string };
type Props = { params: PageParams | Promise<PageParams> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await resolveRouteParams(params);
  const row = await getTagById(id);
  return {
    title: row ? `Edit · ${row.name}` : "Tag",
  };
}

export default async function EditTagPage({ params }: Props) {
  const { id } = await resolveRouteParams(params);
  const record = await getTagById(id);
  if (!record) notFound();

  const { profile } = await getCachedSessionProfile();
  const canMutateRefs = canMutateOrgReferences(profile);
  if (!canMutateRefs) {
    redirect("/tags");
  }

  return (
    <main className="space-y-8 animate-fade-in">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <PageHeader
          title="Edit tag"
          description="Adjust visible labels and optional highlight color."
        />
        <div className="flex flex-wrap gap-2">
          <Link href="/tags">
            <Button variant="outline">Back to list</Button>
          </Link>
          <ResourceDeleteButton
            id={record.id}
            deleteAction={deleteTag}
            noun="tag"
            listHref="/tags"
          />
        </div>
      </div>

      <TagForm mode="edit" record={record} />
    </main>
  );
}
