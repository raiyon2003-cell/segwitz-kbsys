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
import type { DocumentPickerRow } from "@/lib/data/documents";
import { loadDocumentFormOptions } from "@/lib/data/document-form-options";
import type { DocumentFormOptionSets } from "@/lib/data/document-form-options";
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
  let targetProfile: Profile | null = null;
  let pageError: string | null = null;
  try {
    const { data: target, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();
    if (error) {
      console.error("[admin/access/user] failed to load profile", { userId, error });
      pageError = "Could not load this user profile right now.";
    } else if (!target) {
      notFound();
    } else {
      targetProfile = target as Profile;
    }
  } catch (error) {
    console.error("[admin/access/user] profile query crashed", { userId, error });
    pageError = "Could not load this user profile right now.";
  }

  if (!targetProfile) {
    return (
      <main className="space-y-8 animate-fade-in">
        <div className="mb-6">
          <Link
            href="/admin/access"
            className={cn(
              "mb-4 inline-flex h-10 items-center justify-center rounded-md border border-border bg-transparent px-4 text-sm font-medium text-foreground transition-colors hover:bg-surface-muted",
            )}
          >
            ← Back to access control
          </Link>
          <PageHeader title="Access control" description="User access could not be loaded." />
        </div>
        <Card className="border-border-subtle">
          <CardContent className="py-6">
            <p className="text-sm text-foreground-muted">
              {pageError ?? "No data available"}
            </p>
          </CardContent>
        </Card>
      </main>
    );
  }
  if (!isScopedRole(targetProfile.role)) {
    redirect("/admin/access");
  }

  const sp = await resolveSearchParams(searchParams);
  const created =
    sp.created === "1" ||
    sp.created === "true" ||
    sp.created === "success";

  let options: DocumentFormOptionSets = {
    divisions: [],
    departments: [],
    documentTypes: [],
    processCategories: [],
    tags: [],
    profiles: [],
  };
  let documents: DocumentPickerRow[] = [];
  let initialDeptIds: string[] = [];
  let initialDocIds: string[] = [];
  try {
    [options, documents, initialDeptIds, initialDocIds] = await Promise.all([
      loadDocumentFormOptions(),
      getRecentDocumentsForAccessPicker(),
      getProfileDepartments(userId),
      getProfileDocumentGrants(userId),
    ]);
  } catch (error) {
    console.error("[admin/access/user] failed to load access dependencies", {
      user: profile.id,
      role: profile.role,
      targetUserId: userId,
      targetRole: targetProfile.role,
      error,
    });
    pageError = "Some access data could not be loaded. You can still review this user.";
  }

  console.log("[admin/access/user] loaded data", {
    user: profile.id,
    role: profile.role,
    targetUserId: userId,
    targetRole: targetProfile.role,
    fetchedDocuments: documents.length,
    accessMappings: {
      departments: initialDeptIds.length,
      documents: initialDocIds.length,
    },
  });

  return (
    <main className="space-y-8 animate-fade-in">
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
          description="Assign departments and explicit documents for viewers and employees."
        />
      </div>

      {created ? (
        <div
          className="mb-6 rounded-lg border border-brand-lime/35 bg-brand-lime/10 px-4 py-3 text-sm text-brand-charcoal"
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
          {pageError ? (
            <p className="mb-4 rounded-md border border-brand-olive/40 bg-brand-olive/10 px-4 py-2 text-sm text-foreground">
              {pageError}
            </p>
          ) : null}
          {options.departments.length === 0 && documents.length === 0 ? (
            <p className="text-sm text-foreground-muted">No data available</p>
          ) : (
            <ViewerAccessEditor
              userId={userId}
              accessRole={targetProfile.role}
              options={options}
              documents={documents}
              initialDepartmentIds={initialDeptIds}
              initialDocumentIds={initialDocIds}
            />
          )}
        </CardContent>
      </Card>
    </main>
  );
}
