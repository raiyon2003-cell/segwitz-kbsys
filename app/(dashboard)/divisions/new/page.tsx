import type { Metadata } from "next";
import { DivisionForm } from "@/app/(dashboard)/divisions/division-form";
import { PageHeader } from "@/components/layout/page-header";

export const metadata: Metadata = {
  title: "New division",
};

export default function NewDivisionPage() {
  return (
    <main className="px-6 py-8 lg:px-10">
      <PageHeader
        title="Create division"
        description="Add a division so departments and documents can reference it."
      />
      <DivisionForm mode="create" />
    </main>
  );
}
