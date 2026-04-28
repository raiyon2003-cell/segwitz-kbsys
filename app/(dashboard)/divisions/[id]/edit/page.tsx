import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DivisionForm } from "@/app/(dashboard)/divisions/division-form";
import { deleteDivision } from "@/app/(dashboard)/divisions/actions";
import { PageHeader } from "@/components/layout/page-header";
import { ResourceDeleteButton } from "@/components/crud/resource-delete-button";
import { Button } from "@/components/ui/button";
import { getCachedSessionProfile } from "@/lib/auth/session";
import { getDivisionById } from "@/lib/data/divisions";

type Props = { params: { id: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const row = await getDivisionById(params.id);
  return {
    title: row ? `Edit · ${row.name}` : "Division",
  };
}

export default async function EditDivisionPage({ params }: Props) {
  const division = await getDivisionById(params.id);
  if (!division) notFound();

  const { profile } = await getCachedSessionProfile();
  const isAdmin = profile.role === "admin";

  return (
    <main className="px-6 py-8 lg:px-10">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <PageHeader
          title="Edit division"
          description="Update division metadata. Slugs power URLs and integrations."
        />
        <div className="flex flex-wrap gap-2">
          <Link href="/divisions">
            <Button variant="outline">Back to list</Button>
          </Link>
          {isAdmin ? (
            <ResourceDeleteButton
              id={division.id}
              deleteAction={deleteDivision}
              noun="division"
              listHref="/divisions"
            />
          ) : null}
        </div>
      </div>

      {isAdmin ? (
        <DivisionForm mode="edit" division={division} />
      ) : (
        <p className="text-sm text-foreground-muted">
          You don&apos;t have permission to edit divisions.
        </p>
      )}
    </main>
  );
}
