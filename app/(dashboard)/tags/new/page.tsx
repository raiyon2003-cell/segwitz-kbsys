import type { Metadata } from "next";
import { TagForm } from "@/app/(dashboard)/tags/tag-form";
import { PageHeader } from "@/components/layout/page-header";

export const metadata: Metadata = {
  title: "New tag",
};

export default function NewTagPage() {
  return (
    <main className="px-6 py-8 lg:px-10">
      <PageHeader
        title="Create tag"
        description="Tags help teams slice content across divisions and departments."
      />
      <TagForm mode="create" />
    </main>
  );
}
