import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { DepartmentForm } from "@/app/(dashboard)/departments/department-form";
import { deleteDepartment } from "@/app/(dashboard)/departments/actions";
import { ResourceDeleteButton } from "@/components/crud/resource-delete-button";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { canMutateOrgReferences } from "@/lib/auth/rbac";
import { getCachedSessionProfile } from "@/lib/auth/session";
import { getDepartmentById } from "@/lib/data/departments";
import { getDivisionOptions } from "@/lib/data/divisions";
import { resolveRouteParams } from "@/lib/next/route-args";

type Props = { params: { id: string } | Promise<{ id: string }> };

async function resolveDepartmentId(
  params: Props["params"],
): Promise<string> {
  const { id } = await resolveRouteParams(params);
  const trimmed = id.trim();
  if (trimmed.toLowerCase() === "new") {
    redirect("/departments/new");
  }
  return trimmed;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id: rawId } = await resolveRouteParams(params);
  const id = rawId.trim();
  if (id.toLowerCase() === "new") {
    return { title: "Department" };
  }
  const row = await getDepartmentById(id);
  return {
    title: row ? `Edit · ${row.name}` : "Department",
  };
}

export default async function EditDepartmentPage({ params }: Props) {
  const id = await resolveDepartmentId(params);
  const [department, divisions] = await Promise.all([
    getDepartmentById(id),
    getDivisionOptions(),
  ]);

  if (!department) notFound();

  const { profile } = await getCachedSessionProfile();
  const canMutateRefs = canMutateOrgReferences(profile);
  if (!canMutateRefs) {
    redirect(`/departments/${id}`);
  }

  return (
    <main className="space-y-8 animate-fade-in">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <PageHeader
          title="Edit department"
          description="Change division assignment or slug within uniqueness rules."
        />
        <div className="flex flex-wrap gap-2">
          <Link href="/departments">
            <Button variant="outline">Back to list</Button>
          </Link>
          <ResourceDeleteButton
            id={department.id}
            deleteAction={deleteDepartment}
            noun="department"
            listHref="/departments"
          />
        </div>
      </div>

      <DepartmentForm
        mode="edit"
        department={department}
        divisions={divisions.map((d) => ({ id: d.id, name: d.name }))}
      />
    </main>
  );
}
