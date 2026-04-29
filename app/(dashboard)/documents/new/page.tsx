import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { DocumentForm } from "@/components/documents/document-form";
import { PageHeader } from "@/components/layout/page-header";
import { guardDocumentUploader } from "@/lib/auth/guard-document-editor";
import { getCachedSessionProfile } from "@/lib/auth/session";
import { loadDocumentFormOptions } from "@/lib/data/document-form-options";

export const metadata: Metadata = {
  title: "Upload document",
};

export default async function NewDocumentPage() {
  const gate = await guardDocumentUploader();
  if (gate.denied) {
    redirect("/documents");
  }

  const [{ profile }, options] = await Promise.all([
    getCachedSessionProfile(),
    loadDocumentFormOptions(),
  ]);

  const hasDivisions = options.divisions.length > 0;
  const hasDepartments = options.departments.length > 0;
  const hasTypes = options.documentTypes.length > 0;
  const prerequisitesOk =
    hasDivisions && hasDepartments && hasTypes && options.profiles.length > 0;

  return (
    <main className="px-6 py-8 lg:px-10">
      <div className="mx-auto max-w-3xl">
        <PageHeader
          title="Upload document"
          description="Provide metadata and a single PDF. Files are stored in the private “documents” bucket and indexed in the library."
        />

        {!prerequisitesOk ? (
          <div
            className="mb-8 rounded-lg border border-amber-500/35 bg-amber-500/10 px-4 py-3 text-sm text-amber-950 dark:text-amber-100"
            role="alert"
          >
            <p className="font-semibold">Finish reference data before uploading.</p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              {!hasDivisions ? (
                <li>
                  Add at least one division under{" "}
                  <Link className="font-medium underline" href="/divisions/new">
                    Divisions
                  </Link>
                  .
                </li>
              ) : null}
              {!hasDepartments ? (
                <li>
                  Add at least one department under{" "}
                  <Link
                    className="font-medium underline"
                    href="/departments/new"
                  >
                    Departments
                  </Link>{" "}
                  (linked to a division).
                </li>
              ) : null}
              {!hasTypes ? (
                <li>
                  Add a document type under{" "}
                  <Link
                    className="font-medium underline"
                    href="/document-types/new"
                  >
                    Document types
                  </Link>
                  .
                </li>
              ) : null}
              {options.profiles.length === 0 ? (
                <li>No profiles loaded — verify database access.</li>
              ) : null}
            </ul>
          </div>
        ) : null}

        <DocumentForm
          mode="create"
          options={options}
          currentUserProfileId={profile.id}
          allowSubmit={prerequisitesOk}
        />
      </div>
    </main>
  );
}
