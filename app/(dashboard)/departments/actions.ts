"use server";

import type { ActionResult } from "@/lib/action-result";
import { guardAdminMutation } from "@/lib/auth/guard-admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isValidSlug, slugify } from "@/lib/slug";
import { revalidatePath } from "next/cache";

function parseDepartmentPayload(formData: FormData) {
  const division_id = String(formData.get("division_id") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  let slug = String(formData.get("slug") ?? "").trim().toLowerCase();
  const descriptionRaw = String(formData.get("description") ?? "").trim();
  const description = descriptionRaw.length ? descriptionRaw : null;

  if (!division_id) return { ok: false as const, error: "Division is required." };
  if (!name) return { ok: false as const, error: "Name is required." };

  if (!slug) slug = slugify(name);
  if (!isValidSlug(slug)) {
    return {
      ok: false as const,
      error:
        "Slug must use lowercase letters, numbers, and single hyphens between words.",
    };
  }

  return { ok: true as const, division_id, name, slug, description };
}

export async function createDepartment(
  formData: FormData,
): Promise<ActionResult<{ id: string }>> {
  const gate = await guardAdminMutation();
  if (gate.denied) return { ok: false, error: gate.message };

  const parsed = parseDepartmentPayload(formData);
  if (!parsed.ok) return parsed;

  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("departments")
    .insert({
      division_id: parsed.division_id,
      name: parsed.name,
      slug: parsed.slug,
      description: parsed.description,
    })
    .select("id")
    .single();

  if (error) {
    if (error.code === "23505") {
      return {
        ok: false,
        error: "Slug already exists for this division.",
      };
    }
    return { ok: false, error: error.message };
  }

  revalidatePath("/departments");
  return { ok: true, data: { id: data.id } };
}

export async function updateDepartment(formData: FormData): Promise<ActionResult> {
  const gate = await guardAdminMutation();
  if (gate.denied) return { ok: false, error: gate.message };

  const id = String(formData.get("id") ?? "").trim();
  if (!id) return { ok: false, error: "Missing record id." };

  const parsed = parseDepartmentPayload(formData);
  if (!parsed.ok) return parsed;

  const supabase = createSupabaseServerClient();
  const { error } = await supabase
    .from("departments")
    .update({
      division_id: parsed.division_id,
      name: parsed.name,
      slug: parsed.slug,
      description: parsed.description,
    })
    .eq("id", id);

  if (error) {
    if (error.code === "23505") {
      return {
        ok: false,
        error: "Slug already exists for this division.",
      };
    }
    return { ok: false, error: error.message };
  }

  revalidatePath("/departments");
  revalidatePath(`/departments/${id}/edit`);
  return { ok: true };
}

export async function deleteDepartment(formData: FormData): Promise<ActionResult> {
  const gate = await guardAdminMutation();
  if (gate.denied) return { ok: false, error: gate.message };

  const id = String(formData.get("id") ?? "").trim();
  if (!id) return { ok: false, error: "Missing record id." };

  const supabase = createSupabaseServerClient();
  const { error } = await supabase.from("departments").delete().eq("id", id);

  if (error) {
    if (error.code === "23503") {
      return {
        ok: false,
        error:
          "Cannot delete this department while documents still reference it.",
      };
    }
    return { ok: false, error: error.message };
  }

  revalidatePath("/departments");
  return { ok: true };
}
