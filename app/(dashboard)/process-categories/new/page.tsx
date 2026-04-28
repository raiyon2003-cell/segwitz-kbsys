import type { Metadata } from "next";
import { ProcessCategoryForm } from "@/app/(dashboard)/process-categories/process-category-form";
import { PageHeader } from "@/components/layout/page-header";

export const metadata: Metadata = {
  title: "New process category",
};

export default function NewProcessCategoryPage() {
  return (
    <main className="px-6 py-8 lg:px-10">
      <PageHeader
        title="Create process category"
        description="Use consistent naming so teams can browse processes predictably."
      />
      <ProcessCategoryForm mode="create" />
    </main>
  );
}
