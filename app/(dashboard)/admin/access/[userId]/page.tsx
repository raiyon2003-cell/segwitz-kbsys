import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ViewerAccessEditor } from "@/components/admin/viewer-access-editor";
import type { ScopedAccessRole } from "@/components/admin/viewer-access-editor";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui";
import { cn } from "@/lib/utils";
import {
  getProfileDepartments,
  getProfileDocumentGrants,
} from "@/lib/data/access-control";
import { getRecentDocumentsForAccessPicker } from "@/lib/data/documents";
import { loadDocumentFormOptions } from "@/lib/data/document-form-options";
import { getCachedSessionProfile } from "@/lib/auth/session";
import {
  resolveRouteParams,
  resolveSearchParams,
  type RouteSearchParams,
} from "@/lib/next/route-args";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Profile } from "@/types";

const SCOPED_ROLES: ScopedAccessRole[] = ["viewer", "employee", "manager"];

function isScopedRole(role: string): role is ScopedAccessRole {
  return SCOPED_ROLES.includes(role as ScopedAccessRole);
}

export default async function AdminAccessUserPage({
  params,
  searchParams,
}: {
  params: { userId: string } | Promise<{ userId: string }>;
  searchParams: RouteSearchParams | Promise<RouteSearchParams>;
}) {
  const { profile } = await getCachedSessionProfile();
  if (profile.role !== "admin") {
    redirect("/");
  }

  const { userId: rawUserId } = await resolveRouteParams(params);
  const userId = typeof rawUserId === "string" ? rawUserId.trim() : "";
  if (!userId) {
    redirect("/admin/access");
  }

  const supabase = await createSupabaseServerClient();
  const { data: target, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!target) notFound();

  const targetProfile = target as Profile;
  if (!isScopedRole(targetProfile.role)) {
    redirect("/admin/access");
  }

  const sp = await resolveSearchParams(searchParams);
  const created =
    sp.created === "1" ||
    sp.created === "true" ||
    sp.created === "success";

  const [options, documents, initialDeptIds, initialDocIds] = await Promise.all([
    loadDocumentFormOptions(),
    getRecentDocumentsForAccessPicker(),
    getProfileDepartments(userId),
    getProfileDocumentGrants(userId),
  ]);

  return (
    <main className="px-6 py-8 lg:px-10">
      <div className="mb-6">
        <Link
          href="/admin/access"
          className={cn(
            "mb-4 inline-flex h-10 items-center justify-center rounded-md border border-border bg-transparent px-4 text-sm font-medium text-foreground transition-colors hover:bg-surface-muted",
          )}
        >
          ← Back to access control
        </Link>
        <PageHeader
          title={targetProfile.email ?? targetProfile.id.slice(0, 8)}
          description="Assign departments and (for viewers and employees) optional documents."
        />
      </div>

      {created ? (
        <div
          className="mb-6 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-950 dark:text-emerald-50"
          role="status"
        >
          Account created. Configure department access below so the user can sign in with
          the password you chose.
        </div>
      ) : null}

      <Card className="border-border-subtle">
        <CardHeader>
          <CardTitle className="text-lg">Departments & documents</CardTitle>
          <CardDescription>
            User: {targetProfile.full_name?.trim() || "—"} · Role:{" "}
            {targetProfile.role}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ViewerAccessEditor
            userId={userId}
            accessRole={targetProfile.role}
            options={options}
            documents={documents}
            initialDepartmentIds={initialDeptIds}
            initialDocumentIds={initialDocIds}
          />
        </CardContent>
      </Card>
    </main>
  );
}
