import Link from "next/link";
import { redirect } from "next/navigation";
import { CreateScopedAccountForm } from "@/components/admin/create-scoped-account-form";
import { PageHeader } from "@/components/layout/page-header";
import { CrudTable } from "@/components/crud/crud-table";
import type { CrudColumn } from "@/components/crud/crud-table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui";
import { getCachedSessionProfile } from "@/lib/auth/session";
import { listRBACManagedProfiles } from "@/lib/data/access-control";
import { loadDocumentFormOptions } from "@/lib/data/document-form-options";
import type { Profile } from "@/types";

export default async function AdminAccessPage() {
  const { profile } = await getCachedSessionProfile();
  if (profile.role !== "admin") {
    redirect("/");
  }

  const [managedProfiles, options] = await Promise.all([
    listRBACManagedProfiles(),
    loadDocumentFormOptions(),
  ]);

  const columns: CrudColumn<Profile>[] = [
    {
      header: "Email",
      cell: (r) => (
        <span className="text-foreground-muted">{r.email ?? "—"}</span>
      ),
    },
    {
      header: "Name",
      cell: (r) => <span>{r.full_name?.trim() || "—"}</span>,
    },
    {
      header: "Role",
      cell: (r) => (
        <span className="rounded-md bg-surface-muted px-2 py-0.5 text-xs font-medium uppercase ring-1 ring-border-subtle">
          {r.role}
        </span>
      ),
    },
  ];

  return (
    <main className="px-6 py-8 lg:px-10">
      <PageHeader
        title="Access control"
        description="Create scoped accounts (viewer, employee, manager), assign departments, and optionally restrict documents."
      />

      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        <Card className="border-border-subtle">
          <CardHeader>
            <CardTitle className="text-lg">New scoped account</CardTitle>
            <CardDescription>
              Requires <code className="text-xs">SUPABASE_SERVICE_ROLE_KEY</code> in
              server env (never expose to the browser). Managers and employees must have
              at least one department.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CreateScopedAccountForm options={options} />
          </CardContent>
        </Card>

        <Card className="border-border-subtle">
          <CardHeader>
            <CardTitle className="text-lg">Viewer, employee & manager</CardTitle>
            <CardDescription>
              Viewers need explicit document ticks. Employees see their departments
              (optional document whitelist). Managers edit within assigned departments
              only.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {managedProfiles.length === 0 ? (
              <p className="p-6 text-sm text-foreground-muted">
                No scoped accounts yet. Create one using the form on the left.
              </p>
            ) : (
              <CrudTable
                rows={managedProfiles}
                columns={columns}
                actions={(row) => (
                  <Link
                    href={`/admin/access/${row.id}`}
                    className="text-sm font-medium text-accent hover:underline"
                  >
                    Manage access
                  </Link>
                )}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
