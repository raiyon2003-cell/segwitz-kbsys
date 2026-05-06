import { NextResponse } from "next/server";
import { canDownloadDocuments, canViewDocuments } from "@/lib/auth/rbac";
import { getDocumentById } from "@/lib/data/documents";
import { resolveRouteParams } from "@/lib/next/route-args";
import { getSignedPdfDownloadUrl } from "@/lib/storage/document-storage";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/** JSON signed URL for in-app PDF viewer (refresh when links expire). */
export async function GET(
  _request: Request,
  { params }: { params: { id: string } | Promise<{ id: string }> },
) {
  const { id } = await resolveRouteParams(params);
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { data: profile } = await supabase
    .from("profiles")
    .select("role, document_permissions")
    .eq("id", user.id)
    .maybeSingle();
  const normalizedProfile = {
    id: user.id,
    email: user.email ?? null,
    full_name: null,
    avatar_url: null,
    role: (profile?.role ?? "member") as
      | "admin"
      | "manager"
      | "member"
      | "employee"
      | "viewer",
    department: null,
    document_permissions:
      (profile?.document_permissions as {
        can_view: boolean;
        can_upload: boolean;
        can_edit: boolean;
        can_delete: boolean;
        can_download: boolean;
      } | null) ?? null,
    created_at: "",
    updated_at: "",
  };
  if (!canViewDocuments(normalizedProfile) || !canDownloadDocuments(normalizedProfile)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const doc = await getDocumentById(id);
  if (!doc) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const url = await getSignedPdfDownloadUrl(supabase, doc.storage_object_path);
  if (!url) {
    return NextResponse.json(
      { error: "Could not generate signed URL." },
      { status: 500 },
    );
  }

  return NextResponse.json({ url });
}
