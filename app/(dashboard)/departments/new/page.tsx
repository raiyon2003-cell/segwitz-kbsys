import type { Metadata } from "next";
import { DepartmentForm } from "@/app/(dashboard)/departments/department-form";
import { PageHeader } from "@/components/layout/page-header";
import { getDivisionOptions } from "@/lib/data/divisions";

export const metadata: Metadata = {
  title: "New department",
};

export default async function NewDepartmentPage() {
  const divisions = await getDivisionOptions();

  return (
    <main className="px-6 py-8 lg:px-10">
      <PageHeader
        title="Create department"
        description="Attach each department to exactly one division."
      />
      <DepartmentForm
        mode="create"
        divisions={divisions.map((d) => ({ id: d.id, name: d.name }))}
      />
    </main>
  );
}
