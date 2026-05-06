import type { Profile } from "@/types";

function hasExplicitPermission(
  profile: Profile,
  key: "can_view" | "can_upload" | "can_edit" | "can_delete" | "can_download",
): boolean | null {
  if (!profile.document_permissions) return null;
  return profile.document_permissions[key];
}

/** Full org + document access (not department-scoped). */
export function hasFullStaffDocumentAccess(profile: Profile): boolean {
  const explicit = hasExplicitPermission(profile, "can_view");
  if (explicit !== null) return explicit;
  return profile.role === "admin" || profile.role === "member";
}

export function isDepartmentScopedStaff(profile: Profile): boolean {
  return profile.role === "manager" || profile.role === "employee";
}

/** Sidebar: department shortcuts from profile_departments. */
export function usesDepartmentShortcuts(profile: Profile): boolean {
  return (
    profile.role === "viewer" ||
    profile.role === "employee" ||
    profile.role === "manager"
  );
}

export function canUploadDocuments(profile: Profile): boolean {
  const explicit = hasExplicitPermission(profile, "can_upload");
  if (explicit !== null) return explicit;
  return (
    profile.role === "admin" ||
    profile.role === "manager" ||
    profile.role === "member"
  );
}

export function canEditDocumentRecords(profile: Profile): boolean {
  const explicit = hasExplicitPermission(profile, "can_edit");
  if (explicit !== null) return explicit;
  return canUploadDocuments(profile);
}

/** Archive/delete documents and destructive storage ops (RLS: admin + member only). */
export function canDeleteOrArchiveDocuments(profile: Profile): boolean {
  const explicit = hasExplicitPermission(profile, "can_delete");
  if (explicit !== null) return explicit;
  return profile.role === "admin" || profile.role === "member";
}

export function canViewDocuments(profile: Profile): boolean {
  const explicit = hasExplicitPermission(profile, "can_view");
  if (explicit !== null) return explicit;
  return true;
}

export function canDownloadDocuments(profile: Profile): boolean {
  const explicit = hasExplicitPermission(profile, "can_download");
  if (explicit !== null) return explicit;
  return true;
}

export function canMutateOrgReferences(profile: Profile): boolean {
  return profile.role === "admin" || profile.role === "member";
}

export function shouldUseReducedStaffNav(profile: Profile): boolean {
  return usesDepartmentShortcuts(profile);
}
