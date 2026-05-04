import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Profile } from "@/types";

export type ViewerDepartmentLink = { id: string; name: string };

export async function getViewerDepartmentNavLinks(
  profileId: string,
): Promise<ViewerDepartmentLink[]> {
  const supabase = await createSupabaseServerClient();
  const { data: links, error: linkErr } = await supabase
    .from("profile_departments")
    .select("department_id")
    .eq("profile_id", profileId);

  if (linkErr) throw new Error(linkErr.message);

  const ids = (links ?? []).map((r) => r.department_id as string);
  if (ids.length === 0) return [];

  const { data: depts, error: deptErr } = await supabase
    .from("departments")
    .select("id, name")
    .in("id", ids);

  if (deptErr) throw new Error(deptErr.message);

  const out = (depts ?? []).map((d) => ({
    id: d.id as string,
    name: d.name as string,
  }));
  out.sort((a, b) => a.name.localeCompare(b.name));
  return out;
}

export async function viewerHasDepartmentAccess(
  profileId: string,
  departmentId: string,
): Promise<boolean> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("profile_departments")
    .select("department_id")
    .eq("profile_id", profileId)
    .eq("department_id", departmentId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return Boolean(data);
}

/** Admin/member: all departments; others must be assigned in profile_departments. */
export async function assertDepartmentAccessible(
  profile: Profile,
  departmentId: string,
): Promise<boolean> {
  if (profile.role === "admin" || profile.role === "member") return true;
  return viewerHasDepartmentAccess(profile.id, departmentId);
}

export async function assertDepartmentVisibleToViewer(
  profile: Profile,
  departmentId: string,
): Promise<boolean> {
  return assertDepartmentAccessible(profile, departmentId);
}

/** Scoped users may open a division page only if an assigned department is in that division. */
export async function assertDivisionAccessible(
  profile: Profile,
  divisionId: string,
): Promise<boolean> {
  if (profile.role === "admin" || profile.role === "member") return true;

  const supabase = await createSupabaseServerClient();
  const { data: links, error: linkErr } = await supabase
    .from("profile_departments")
    .select("department_id")
    .eq("profile_id", profile.id);

  if (linkErr) throw new Error(linkErr.message);
  const deptIds = (links ?? []).map((r) => r.department_id as string);
  if (deptIds.length === 0) return false;

  const { data: depts, error: deptErr } = await supabase
    .from("departments")
    .select("id")
    .in("id", deptIds)
    .eq("division_id", divisionId)
    .limit(1);

  if (deptErr) throw new Error(deptErr.message);
  return (depts?.length ?? 0) > 0;
}

export async function assertDivisionVisibleToViewer(
  profile: Profile,
  divisionId: string,
): Promise<boolean> {
  return assertDivisionAccessible(profile, divisionId);
}

export async function listViewerProfiles(): Promise<Profile[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("role", "viewer")
    .order("email", { ascending: true, nullsFirst: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as Profile[];
}

/** Viewer, employee, and manager accounts managed under Access control. */
export async function listRBACManagedProfiles(): Promise<Profile[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .in("role", ["viewer", "employee", "manager"])
    .order("email", { ascending: true, nullsFirst: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as Profile[];
}

export async function getProfileDepartments(userId: string): Promise<string[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("profile_departments")
    .select("department_id")
    .eq("profile_id", userId);

  if (error) throw new Error(error.message);
  return (data ?? []).map((r) => r.department_id as string);
}

export async function getProfileDocumentGrants(
  userId: string,
): Promise<string[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("profile_document_access")
    .select("document_id")
    .eq("profile_id", userId);

  if (error) throw new Error(error.message);
  return (data ?? []).map((r) => r.document_id as string);
}
