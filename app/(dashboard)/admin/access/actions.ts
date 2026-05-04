"use server";

import { revalidatePath } from "next/cache";
import { getCachedSessionProfile } from "@/lib/auth/session";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type AccessActionState = {
  ok: boolean;
  message?: string;
  userId?: string;
};

async function requireAdmin() {
  const { profile } = await getCachedSessionProfile();
  if (profile.role !== "admin") {
    throw new Error("Unauthorized");
  }
}

export async function createScopedAccountAction(
  _prev: AccessActionState | undefined,
  formData: FormData,
): Promise<AccessActionState> {
  try {
    await requireAdmin();
  } catch {
    return { ok: false, message: "You do not have permission to create users." };
  }

  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const departmentIds = formData
    .getAll("department_id")
    .map(String)
    .filter(Boolean);

  const documentIdsRaw = formData
    .getAll("document_id")
    .map(String)
    .filter(Boolean);

  const roleRaw = String(formData.get("account_role") ?? "viewer").trim();
  const accountRole =
    roleRaw === "employee" || roleRaw === "manager" ? roleRaw : "viewer";

  if (
    (accountRole === "manager" || accountRole === "employee") &&
    departmentIds.length === 0
  ) {
    return {
      ok: false,
      message: "Managers and employees need at least one assigned department.",
    };
  }

  if (accountRole === "viewer" && departmentIds.length === 0) {
    return {
      ok: false,
      message: "Viewers need at least one assigned department.",
    };
  }

  if (!email.includes("@")) {
    return { ok: false, message: "Enter a valid email address." };
  }
  if (password.length < 8) {
    return { ok: false, message: "Password must be at least 8 characters." };
  }

  let admin;
  try {
    admin = createSupabaseAdminClient();
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return { ok: false, message: msg };
  }

  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (error) {
    return { ok: false, message: error.message };
  }

  const userId = data.user?.id;
  if (!userId) {
    return { ok: false, message: "Account was not created." };
  }

  const supabase = await createSupabaseServerClient();
  const { error: roleErr } = await supabase
    .from("profiles")
    .update({ role: accountRole })
    .eq("id", userId);

  if (roleErr) {
    return { ok: false, message: roleErr.message };
  }

  if (departmentIds.length > 0) {
    const rows = departmentIds.map((department_id) => ({
      profile_id: userId,
      department_id,
    }));
    const { error: deptErr } = await supabase
      .from("profile_departments")
      .insert(rows);
    if (deptErr) {
      return { ok: false, message: deptErr.message };
    }
  }

  const validGrantIds = new Set<string>();
  if (
    (accountRole === "viewer" || accountRole === "employee") &&
    departmentIds.length > 0 &&
    documentIdsRaw.length > 0
  ) {
    const { data: docRows, error: docErr } = await supabase
      .from("documents")
      .select("id")
      .in("id", documentIdsRaw)
      .in("department_id", departmentIds);

    if (docErr) {
      return { ok: false, message: docErr.message };
    }
    for (const r of docRows ?? []) {
      validGrantIds.add(r.id as string);
    }
  }

  const grants = documentIdsRaw
    .filter((id) => validGrantIds.has(id))
    .map((document_id) => ({ profile_id: userId, document_id }));

  if (accountRole === "employee" && departmentIds.length > 0 && grants.length === 0) {
    return {
      ok: false,
      message:
        "Employees must have at least one assigned document in the selected departments.",
    };
  }

  if (accountRole === "viewer" && grants.length === 0) {
    return {
      ok: false,
      message: "Viewers must have at least one assigned document.",
    };
  }

  if (grants.length > 0) {
    const { error: grantErr } = await supabase
      .from("profile_document_access")
      .insert(grants);
    if (grantErr) {
      return { ok: false, message: grantErr.message };
    }
  }

  revalidatePath("/admin/access");
  return { ok: true, userId };
}

export async function updateScopedAccessAction(
  _prev: AccessActionState | undefined,
  formData: FormData,
): Promise<AccessActionState> {
  try {
    await requireAdmin();
  } catch {
    return { ok: false, message: "You do not have permission." };
  }

  const userId = String(formData.get("user_id") ?? "").trim();
  const departmentIds = formData
    .getAll("department_id")
    .map(String)
    .filter(Boolean);
  let documentIds = formData
    .getAll("document_id")
    .map(String)
    .filter(Boolean);

  if (!userId) {
    return { ok: false, message: "Missing user." };
  }

  const supabase = await createSupabaseServerClient();
  const { data: target, error: targetErr } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .maybeSingle();

  if (targetErr) {
    return { ok: false, message: targetErr.message };
  }

  const scopedRoles = ["viewer", "employee", "manager"] as const;
  type ScopedRole = (typeof scopedRoles)[number];

  const role = target?.role as ScopedRole | undefined;
  if (!role || !scopedRoles.includes(role)) {
    return {
      ok: false,
      message: "This page only manages viewer, employee, and manager accounts.",
    };
  }

  if (
    (role === "manager" || role === "employee") &&
    departmentIds.length === 0
  ) {
    return {
      ok: false,
      message: "Assign at least one department for managers and employees.",
    };
  }

  if (role === "viewer" && departmentIds.length === 0) {
    return {
      ok: false,
      message: "Assign at least one department for viewers.",
    };
  }

  if (role === "manager") {
    documentIds = [];
  }

  const validIds = new Set<string>();
  if (role !== "manager" && departmentIds.length > 0 && documentIds.length > 0) {
    const { data: docRows, error: docErr } = await supabase
      .from("documents")
      .select("id")
      .in("id", documentIds)
      .in("department_id", departmentIds);

    if (docErr) {
      return { ok: false, message: docErr.message };
    }
    for (const r of docRows ?? []) {
      validIds.add(r.id as string);
    }
  }

  const grantsPreview = documentIds
    .filter((id) => validIds.has(id))
    .map((document_id) => ({ profile_id: userId, document_id }));

  if (role === "employee" && departmentIds.length > 0 && grantsPreview.length === 0) {
    return {
      ok: false,
      message:
        "Employees must have at least one assigned document in the selected departments.",
    };
  }

  if (role === "viewer" && grantsPreview.length === 0) {
    return {
      ok: false,
      message: "Viewers must have at least one assigned document.",
    };
  }

  const { error: delD } = await supabase
    .from("profile_departments")
    .delete()
    .eq("profile_id", userId);
  if (delD) {
    return { ok: false, message: delD.message };
  }

  if (departmentIds.length > 0) {
    const { error: insD } = await supabase.from("profile_departments").insert(
      departmentIds.map((department_id) => ({
        profile_id: userId,
        department_id,
      })),
    );
    if (insD) {
      return { ok: false, message: insD.message };
    }
  }

  const { error: delDoc } = await supabase
    .from("profile_document_access")
    .delete()
    .eq("profile_id", userId);
  if (delDoc) {
    return { ok: false, message: delDoc.message };
  }

  if (grantsPreview.length > 0) {
    const { error: insG } = await supabase
      .from("profile_document_access")
      .insert(grantsPreview);
    if (insG) {
      return { ok: false, message: insG.message };
    }
  }

  revalidatePath("/admin/access");
  revalidatePath(`/admin/access/${userId}`);
  return { ok: true, message: "Access rules saved." };
}

export const updateViewerAccessAction = updateScopedAccessAction;
