import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DepartmentForm } from "@/app/(dashboard)/departments/department-form";
import { deleteDepartment } from "@/app/(dashboard)/departments/actions";
import { ResourceDeleteButton } from "@/components/crud/resource-delete-button";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { getCachedSessionProfile } from "@/lib/auth/session";
import { getDepartmentById } from "@/lib/data/departments";
import { getDivisionOptions } from "@/lib/data/divisions";

type Props = { params: { id: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const row = await getDepartmentById(params.id);
  return {
    title: row ? `Edit · ${row.name}` : "Department",
  };
}

export default async function EditDepartmentPage({ params }: Props) {
  const [department, divisions] = await Promise.all([
    getDepartmentById(params.id),
    getDivisionOptions(),
  ]);

  if (!department) notFound();

  const { profile } = await getCachedSessionProfile();
  const canMutateRefs =
    profile.role === "admin" || profile.role === "member";

  return (
    <main className="px-6 py-8 lg:px-10">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <PageHeader
          title="Edit department"
          description="Change division assignment or slug within uniqueness rules."
        />
        <div className="flex flex-wrap gap-2">
          <Link href="/departments">
            <Button variant="outline">Back to list</Button>
          </Link>
          {canMutateRefs ? (
            <ResourceDeleteButton
              id={department.id}
              deleteAction={deleteDepartment}
              noun="department"
              listHref="/departments"
            />
          ) : null}
        </div>
      </div>

      {canMutateRefs ? (
        <DepartmentForm
          mode="edit"
          department={department}
          divisions={divisions.map((d) => ({ id: d.id, name: d.name }))}
        />
      ) : (
        <p className="text-sm text-foreground-muted">
          You don&apos;t have permission to edit departments.
        </p>
      )}
    </main>
  );
}
