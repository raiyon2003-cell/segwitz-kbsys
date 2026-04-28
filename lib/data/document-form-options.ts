import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { DepartmentRow } from "@/types/entities";
import type { DivisionRow } from "@/types/entities";
import type { DocumentTypeRow } from "@/types/entities";
import type { ProcessCategoryRow } from "@/types/entities";
import type { TagRow } from "@/types/entities";

export type DocumentFormOptionSets = {
  divisions: Pick<DivisionRow, "id" | "name">[];
  departments: Pick<DepartmentRow, "id" | "name" | "division_id">[];
  documentTypes: Pick<DocumentTypeRow, "id" | "name">[];
  processCategories: Pick<ProcessCategoryRow, "id" | "name">[];
  tags: Pick<TagRow, "id" | "name">[];
  profiles: { id: string; full_name: string | null; email: string | null }[];
};

export async function loadDocumentFormOptions(): Promise<DocumentFormOptionSets> {
  const supabase = createSupabaseServerClient();

  const [
    divisionsRes,
    departmentsRes,
    docTypesRes,
    procRes,
    tagsRes,
    profilesRes,
  ] = await Promise.all([
    supabase.from("divisions").select("id, name").order("name"),
    supabase.from("departments").select("id, name, division_id").order("name"),
    supabase.from("document_types").select("id, name").order("name"),
    supabase.from("process_categories").select("id, name").order("name"),
    supabase.from("tags").select("id, name").order("name"),
    supabase
      .from("profiles")
      .select("id, full_name, email")
      .order("full_name", { ascending: true, nullsFirst: false }),
  ]);

  const errors = [
    divisionsRes.error,
    departmentsRes.error,
    docTypesRes.error,
    procRes.error,
    tagsRes.error,
    profilesRes.error,
  ].filter(Boolean);

  if (errors.length) {
    throw new Error(errors[0]?.message ?? "Failed to load form options.");
  }

  return {
    divisions: (divisionsRes.data ?? []) as Pick<DivisionRow, "id" | "name">[],
    departments: (departmentsRes.data ?? []) as Pick<
      DepartmentRow,
      "id" | "name" | "division_id"
    >[],
    documentTypes: (docTypesRes.data ?? []) as Pick<
      DocumentTypeRow,
      "id" | "name"
    >[],
    processCategories: (procRes.data ?? []) as Pick<
      ProcessCategoryRow,
      "id" | "name"
    >[],
    tags: (tagsRes.data ?? []) as Pick<TagRow, "id" | "name">[],
    profiles: (profilesRes.data ?? []) as {
      id: string;
      full_name: string | null;
      email: string | null;
    }[],
  };
}
