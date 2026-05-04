import type { Profile } from "@/types";

/** Full org + document access (not department-scoped). */
export function hasFullStaffDocumentAccess(profile: Profile): boolean {
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
  return (
    profile.role === "admin" ||
    profile.role === "manager" ||
    profile.role === "member"
  );
}

export function canEditDocumentRecords(profile: Profile): boolean {
  return canUploadDocuments(profile);
}

/** Archive/delete documents and destructive storage ops (RLS: admin + member only). */
export function canDeleteOrArchiveDocuments(profile: Profile): boolean {
  return profile.role === "admin" || profile.role === "member";
}

export function canMutateOrgReferences(profile: Profile): boolean {
  return profile.role === "admin" || profile.role === "member";
}

export function shouldUseReducedStaffNav(profile: Profile): boolean {
  return usesDepartmentShortcuts(profile);
}
