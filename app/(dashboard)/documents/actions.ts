"use server";

import { randomUUID } from "crypto";
import type { ActionResult } from "@/lib/action-result";
import {
  planDocumentUpdateLogEntries,
  toDocumentRowSnapshot,
  tryLogDocumentActivities,
  tryLogDocumentActivity,
} from "@/lib/activity";
import {
  guardDocumentEditor,
  guardDocumentUploader,
} from "@/lib/auth/guard-document-editor";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  buildDocumentStoragePath,
  deletePdfForDocument,
  uploadPdfForDocument,
} from "@/lib/storage/document-storage";
import { validatePdfUpload } from "@/lib/storage/pdf-validation";
import { revalidateAfterDocumentMutation } from "@/lib/revalidate/documents";
import { getTagIdsForDocument } from "@/lib/data/document-tags";
import type { DocumentStatus } from "@/types/documents";

const STATUSES: DocumentStatus[] = ["draft", "published", "archived"];

function parseTagIds(formData: FormData): string[] {
  const raw = formData.getAll("tag_ids").filter(Boolean);
  const ids = raw.map((v) => String(v).trim()).filter(Boolean);
  return Array.from(new Set(ids));
}

type ParsedFields =
  | {
      ok: true;
      title: string;
      summary: string | null;
      division_id: string;
      department_id: string;
      document_type_id: string;
      process_category_id: string | null;
      owner_id: string;
      version: number;
      status: DocumentStatus;
      tag_ids: string[];
    }
  | { ok: false; error: string };

function parseDocumentFields(formData: FormData): ParsedFields {
  const title = String(formData.get("title") ?? "").trim();
  const summaryRaw = String(formData.get("summary") ?? "").trim();
  const division_id = String(formData.get("division_id") ?? "").trim();
  const department_id = String(formData.get("department_id") ?? "").trim();
  const document_type_id = String(formData.get("document_type_id") ?? "").trim();
  const pcRaw = String(formData.get("process_category_id") ?? "").trim();
  const owner_id = String(formData.get("owner_id") ?? "").trim();
  const versionRaw = String(formData.get("version") ?? "").trim();
  const status = String(formData.get("status") ?? "").trim() as DocumentStatus;

  if (!title) return { ok: false, error: "Title is required." };
  if (!division_id) return { ok: false, error: "Division is required." };
  if (!department_id) return { ok: false, error: "Department is required." };
  if (!document_type_id) return { ok: false, error: "Document type is required." };
  if (!owner_id) return { ok: false, error: "Owner is required." };

  const version = Number.parseInt(versionRaw, 10);
  if (!Number.isFinite(version) || version < 1) {
    return { ok: false, error: "Version must be a positive integer." };
  }

  if (!STATUSES.includes(status)) {
    return { ok: false, error: "Invalid status." };
  }

  return {
    ok: true,
    title,
    summary: summaryRaw.length ? summaryRaw : null,
    division_id,
    department_id,
    document_type_id,
    process_category_id: pcRaw.length ? pcRaw : null,
    owner_id,
    version,
    status,
    tag_ids: parseTagIds(formData),
  };
}

async function assertDepartmentMatchesDivision(
  divisionId: string,
  departmentId: string,
): Promise<ActionResult> {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("departments")
    .select("division_id")
    .eq("id", departmentId)
    .maybeSingle();

  if (error || !data) {
    return { ok: false, error: "Department not found." };
  }

  if (data.division_id !== divisionId) {
    return {
      ok: false,
      error: "Selected department does not belong to the chosen division.",
    };
  }

  return { ok: true };
}

async function syncDocumentTags(
  documentId: string,
  tagIds: string[],
): Promise<ActionResult> {
  const supabase = createSupabaseServerClient();

  const { error: delErr } = await supabase
    .from("document_tags")
    .delete()
    .eq("document_id", documentId);

  if (delErr) return { ok: false, error: delErr.message };

  if (!tagIds.length) return { ok: true };

  const rows = tagIds.map((tag_id) => ({ document_id: documentId, tag_id }));

  const { error: insErr } = await supabase.from("document_tags").insert(rows);

  if (insErr) return { ok: false, error: insErr.message };

  return { ok: true };
}

export async function createDocument(
  formData: FormData,
): Promise<ActionResult<{ id: string }>> {
  const gate = await guardDocumentUploader();
  if (gate.denied) return { ok: false, error: gate.message };

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return { ok: false, error: "PDF file is required." };
  }

  const pdf = await validatePdfUpload(file);
  if (!pdf.ok) return pdf;

  const parsed = parseDocumentFields(formData);
  if (!parsed.ok) return parsed;

  if (parsed.status !== "draft" && parsed.status !== "published") {
    return {
      ok: false,
      error: "New documents must be Draft or Published.",
    };
  }

  const deptOk = await assertDepartmentMatchesDivision(
    parsed.division_id,
    parsed.department_id,
  );
  if (!deptOk.ok) return deptOk;

  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { ok: false, error: "Not authenticated." };

  const docId = randomUUID();
  const storagePath = buildDocumentStoragePath(docId);

  const upload = await uploadPdfForDocument(supabase, docId, file);
  if (!upload.ok) return upload;

  const { error: insertErr } = await supabase.from("documents").insert({
    id: docId,
    title: parsed.title,
    summary: parsed.summary,
    storage_object_path: storagePath,
    original_filename: file.name,
    mime_type: "application/pdf",
    division_id: parsed.division_id,
    department_id: parsed.department_id,
    document_type_id: parsed.document_type_id,
    process_category_id: parsed.process_category_id,
    owner_id: parsed.owner_id,
    version: parsed.version,
    status: parsed.status,
    uploaded_by: user.id,
    updated_by: user.id,
  });

  if (insertErr) {
    await deletePdfForDocument(supabase, storagePath);
    return { ok: false, error: insertErr.message };
  }

  const tagSync = await syncDocumentTags(docId, parsed.tag_ids);
  if (!tagSync.ok) {
    await supabase.from("documents").delete().eq("id", docId);
    await deletePdfForDocument(supabase, storagePath);
    return tagSync;
  }

  await tryLogDocumentActivity(supabase, {
    documentId: docId,
    actorId: user.id,
    action: "upload",
  });

  revalidateAfterDocumentMutation({ documentId: docId });
  return { ok: true, data: { id: docId } };
}

export async function updateDocument(formData: FormData): Promise<ActionResult> {
  const gate = await guardDocumentEditor();
  if (gate.denied) return { ok: false, error: gate.message };

  const id = String(formData.get("id") ?? "").trim();
  if (!id) return { ok: false, error: "Missing document id." };

  const fileField = formData.get("file");
  const replaceFile =
    fileField instanceof File && fileField.size > 0 ? fileField : null;

  if (replaceFile) {
    const pdf = await validatePdfUpload(replaceFile);
    if (!pdf.ok) return pdf;
  }

  const parsed = parseDocumentFields(formData);
  if (!parsed.ok) return parsed;

  const deptOk = await assertDepartmentMatchesDivision(
    parsed.division_id,
    parsed.department_id,
  );
  if (!deptOk.ok) return deptOk;

  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { ok: false, error: "Not authenticated." };

  const { data: existing, error: fetchErr } = await supabase
    .from("documents")
    .select(
      "id, status, title, summary, division_id, department_id, document_type_id, process_category_id, owner_id, version, storage_object_path",
    )
    .eq("id", id)
    .maybeSingle();

  if (fetchErr || !existing) {
    return { ok: false, error: fetchErr?.message ?? "Document not found." };
  }

  const oldTagIds = await getTagIdsForDocument(id);

  const storagePath =
    (existing.storage_object_path as string) ||
    buildDocumentStoragePath(id);

  if (replaceFile) {
    const upload = await uploadPdfForDocument(supabase, id, replaceFile);
    if (!upload.ok) return upload;
  }

  const { error: updErr } = await supabase
    .from("documents")
    .update({
      title: parsed.title,
      summary: parsed.summary,
      division_id: parsed.division_id,
      department_id: parsed.department_id,
      document_type_id: parsed.document_type_id,
      process_category_id: parsed.process_category_id,
      owner_id: parsed.owner_id,
      version: parsed.version,
      status: parsed.status,
      updated_by: user.id,
      ...(replaceFile
        ? {
            original_filename: replaceFile.name,
            mime_type: "application/pdf",
            storage_object_path: storagePath,
          }
        : {}),
    })
    .eq("id", id);

  if (updErr) return { ok: false, error: updErr.message };

  const tagSync = await syncDocumentTags(id, parsed.tag_ids);
  if (!tagSync.ok) return tagSync;

  const entries = planDocumentUpdateLogEntries({
    replaceFile: Boolean(replaceFile),
    existing: toDocumentRowSnapshot({
      id: existing.id,
      status: existing.status,
      title: existing.title,
      summary: (existing.summary as string | null) ?? null,
      division_id: existing.division_id,
      department_id: existing.department_id,
      document_type_id: existing.document_type_id,
      process_category_id: (existing.process_category_id as string | null) ?? null,
      owner_id: existing.owner_id,
      version: existing.version,
    }),
    oldTagIds,
    parsed,
  });
  await tryLogDocumentActivities(supabase, {
    documentId: id,
    actorId: user.id,
    entries,
  });

  revalidateAfterDocumentMutation({ documentId: id });
  return { ok: true };
}

export async function archiveDocument(formData: FormData): Promise<ActionResult> {
  const gate = await guardDocumentEditor();
  if (gate.denied) return { ok: false, error: gate.message };

  const id = String(formData.get("id") ?? "").trim();
  if (!id) return { ok: false, error: "Missing document id." };

  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { ok: false, error: "Not authenticated." };

  const { data: before, error: beforeErr } = await supabase
    .from("documents")
    .select("status")
    .eq("id", id)
    .maybeSingle();

  if (beforeErr || !before) {
    return { ok: false, error: beforeErr?.message ?? "Document not found." };
  }

  if (before.status === "archived") {
    revalidateAfterDocumentMutation({ documentId: id, includeAdminActivity: false });
    return { ok: true };
  }

  const { error } = await supabase
    .from("documents")
    .update({
      status: "archived",
      updated_by: user.id,
    })
    .eq("id", id);

  if (error) return { ok: false, error: error.message };

  await tryLogDocumentActivity(supabase, {
    documentId: id,
    actorId: user.id,
    action: "status_change",
    details: { from: before.status, to: "archived" as const },
  });

  revalidateAfterDocumentMutation({ documentId: id });
  return { ok: true };
}
