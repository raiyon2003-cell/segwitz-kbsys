"use server";

import type { ActionResult } from "@/lib/action-result";
import { guardAdminMutation } from "@/lib/auth/guard-admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isValidSlug, slugify } from "@/lib/slug";
import { revalidatePath } from "next/cache";

const HEX_COLOR = /^#[0-9A-Fa-f]{6}$/;

function parseTagPayload(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  let slug = String(formData.get("slug") ?? "").trim().toLowerCase();
  let colorRaw = String(formData.get("color") ?? "").trim();
  const descriptionRaw = String(formData.get("description") ?? "").trim();
  const description = descriptionRaw.length ? descriptionRaw : null;

  if (!name) return { ok: false as const, error: "Name is required." };

  if (!slug) slug = slugify(name);
  if (!isValidSlug(slug)) {
    return {
      ok: false as const,
      error:
        "Slug must use lowercase letters, numbers, and single hyphens between words.",
    };
  }

  if (colorRaw && !colorRaw.startsWith("#")) {
    colorRaw = `#${colorRaw}`;
  }

  let color: string | null = null;
  if (colorRaw.length > 0) {
    if (!HEX_COLOR.test(colorRaw)) {
      return {
        ok: false as const,
        error: "Color must be a hex value like #3366CC.",
      };
    }
    color = colorRaw.toUpperCase();
  }

  return { ok: true as const, name, slug, description, color };
}

export async function createTag(formData: FormData): Promise<ActionResult<{ id: string }>> {
  const gate = await guardAdminMutation();
  if (gate.denied) return { ok: false, error: gate.message };

  const parsed = parseTagPayload(formData);
  if (!parsed.ok) return parsed;

  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("tags")
    .insert({
      name: parsed.name,
      slug: parsed.slug,
      description: parsed.description,
      color: parsed.color,
    })
    .select("id")
    .single();

  if (error) {
    if (error.code === "23505") {
      return { ok: false, error: "Slug already exists." };
    }
    return { ok: false, error: error.message };
  }

  revalidatePath("/tags");
  return { ok: true, data: { id: data.id } };
}

export async function updateTag(formData: FormData): Promise<ActionResult> {
  const gate = await guardAdminMutation();
  if (gate.denied) return { ok: false, error: gate.message };

  const id = String(formData.get("id") ?? "").trim();
  if (!id) return { ok: false, error: "Missing record id." };

  const parsed = parseTagPayload(formData);
  if (!parsed.ok) return parsed;

  const supabase = createSupabaseServerClient();
  const { error } = await supabase
    .from("tags")
    .update({
      name: parsed.name,
      slug: parsed.slug,
      description: parsed.description,
      color: parsed.color,
    })
    .eq("id", id);

  if (error) {
    if (error.code === "23505") {
      return { ok: false, error: "Slug already exists." };
    }
    return { ok: false, error: error.message };
  }

  revalidatePath("/tags");
  revalidatePath(`/tags/${id}/edit`);
  return { ok: true };
}

export async function deleteTag(formData: FormData): Promise<ActionResult> {
  const gate = await guardAdminMutation();
  if (gate.denied) return { ok: false, error: gate.message };

  const id = String(formData.get("id") ?? "").trim();
  if (!id) return { ok: false, error: "Missing record id." };

  const supabase = createSupabaseServerClient();
  const { error } = await supabase.from("tags").delete().eq("id", id);

  if (error) {
    if (error.code === "23503") {
      return {
        ok: false,
        error:
          "Cannot delete this tag while documents still reference it.",
      };
    }
    return { ok: false, error: error.message };
  }

  revalidatePath("/tags");
  return { ok: true };
}
