import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { DivisionForm } from "@/app/(dashboard)/divisions/division-form";
import { deleteDivision } from "@/app/(dashboard)/divisions/actions";
import { PageHeader } from "@/components/layout/page-header";
import { ResourceDeleteButton } from "@/components/crud/resource-delete-button";
import { Button } from "@/components/ui/button";
import { canMutateOrgReferences } from "@/lib/auth/rbac";
import { getCachedSessionProfile } from "@/lib/auth/session";
import { getDivisionById } from "@/lib/data/divisions";
import { resolveRouteParams } from "@/lib/next/route-args";

type PageParams = { id: string };
type Props = { params: PageParams | Promise<PageParams> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await resolveRouteParams(params);
  const row = await getDivisionById(id);
  return {
    title: row ? `Edit · ${row.name}` : "Division",
  };
}

export default async function EditDivisionPage({ params }: Props) {
  const { id } = await resolveRouteParams(params);
  const division = await getDivisionById(id);
  if (!division) notFound();

  const { profile } = await getCachedSessionProfile();
  const canMutateRefs = canMutateOrgReferences(profile);
  if (!canMutateRefs) {
    redirect(`/divisions/${division.id}`);
  }

  return (
    <main className="space-y-8 animate-fade-in">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <PageHeader
          title="Edit division"
          description="Update division metadata. Slugs power URLs and integrations."
        />
        <div className="flex flex-wrap gap-2">
          <Link href="/divisions">
            <Button variant="outline">Back to list</Button>
          </Link>
          <ResourceDeleteButton
            id={division.id}
            deleteAction={deleteDivision}
            noun="division"
            listHref="/divisions"
          />
        </div>
      </div>

      <DivisionForm mode="edit" division={division} />
    </main>
  );
}
