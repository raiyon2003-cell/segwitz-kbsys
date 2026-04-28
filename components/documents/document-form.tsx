"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useTransition } from "react";
import {
  createDocument,
  updateDocument,
} from "@/app/(dashboard)/documents/actions";
import type { DocumentFormOptionSets } from "@/lib/data/document-form-options";
import type { DocumentListEmbed, DocumentStatus } from "@/types/documents";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Select,
  Textarea,
} from "@/components/ui";

function profileLabel(p: {
  full_name: string | null;
  email: string | null;
  id: string;
}) {
  return (
    p.full_name?.trim() ||
    p.email?.trim() ||
    p.id.slice(0, 8)
  );
}

type Props =
  | {
      mode: "create";
      options: DocumentFormOptionSets;
      currentUserProfileId: string;
      /** When false (e.g. missing reference rows), disables submit until data exists. */
      allowSubmit?: boolean;
    }
  | {
      mode: "edit";
      document: DocumentListEmbed;
      selectedTagIds: string[];
      options: DocumentFormOptionSets;
      currentUserProfileId: string;
    };

export function DocumentForm(props: Props) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const doc = props.mode === "edit" ? props.document : null;

  const [divisionId, setDivisionId] = useState(
    doc?.division_id ?? "",
  );
  const [departmentId, setDepartmentId] = useState(
    doc?.department_id ?? "",
  );

  useEffect(() => {
    const deps = props.options.departments.filter(
      (d) => d.division_id === divisionId,
    );
    if (!departmentId || !deps.some((d) => d.id === departmentId)) {
      setDepartmentId(deps[0]?.id ?? "");
    }
  }, [divisionId, props.options.departments, departmentId]);

  const filteredDepartments = useMemo(
    () =>
      props.options.departments.filter((d) => d.division_id === divisionId),
    [props.options.departments, divisionId],
  );

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (props.mode === "create" && props.allowSubmit === false) {
      setError(
        "Finish setting up divisions, departments, and document types before uploading.",
      );
      return;
    }
    setError(null);
    const fd = new FormData(e.currentTarget);

    if (props.mode === "edit" && doc) {
      fd.set("id", doc.id);
    }

    fd.set("division_id", divisionId);
    fd.set("department_id", departmentId);

    startTransition(async () => {
      const res =
        props.mode === "create"
          ? await createDocument(fd)
          : await updateDocument(fd);

      if (!res.ok) {
        setError(res.error);
        return;
      }

      router.push("/documents?uploaded=success");
      router.refresh();
    });
  }

  const statuses: DocumentStatus[] =
    props.mode === "create"
      ? ["draft", "published"]
      : ["draft", "published", "archived"];

  const selectedTags =
    props.mode === "edit" ? new Set(props.selectedTagIds) : new Set<string>();

  const submitVerb = props.mode === "create" ? "Upload" : "Save";
  const canSubmit =
    props.mode !== "create" ||
    props.allowSubmit !== false;

  const fieldDisabled =
    pending || (props.mode === "create" && props.allowSubmit === false);

  return (
    <form
      encType="multipart/form-data"
      onSubmit={onSubmit}
      className="space-y-8"
      aria-busy={pending}
    >
      {error ? (
        <p
          className="rounded-md border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-700 dark:text-red-300"
          role="alert"
        >
          {error}
        </p>
      ) : null}

      <Card className="border-border-subtle">
        <CardHeader>
          <CardTitle>Basics</CardTitle>
          <CardDescription>Title and summary shown in lists and search.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            name="title"
            label="Title"
            required
            disabled={fieldDisabled}
            defaultValue={doc?.title ?? ""}
          />
          <Textarea
            name="summary"
            label="Summary"
            hint="Optional short abstract."
            disabled={fieldDisabled}
            defaultValue={doc?.summary ?? ""}
          />
        </CardContent>
      </Card>

      <Card className="border-border-subtle">
        <CardHeader>
          <CardTitle>Classification</CardTitle>
          <CardDescription>
            Division drives department choices; process category is optional.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Select
              label="Division"
              required
              disabled={fieldDisabled}
              value={divisionId}
              onChange={(e) => setDivisionId(e.target.value)}
            >
              <option value="">Select division…</option>
              {props.options.divisions.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </Select>

            <Select
              name="department_id"
              label="Department"
              required
              disabled={pending || !divisionId}
              value={departmentId}
              onChange={(e) => setDepartmentId(e.target.value)}
            >
              <option value="">Select department…</option>
              {filteredDepartments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </Select>
          </div>

          <Select
            name="document_type_id"
            label="Document type"
            required
            disabled={fieldDisabled}
            defaultValue={doc?.document_type_id ?? ""}
          >
            <option value="">Select type…</option>
            {props.options.documentTypes.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </Select>

          <Select
            name="process_category_id"
            label="Process category"
            disabled={fieldDisabled}
            defaultValue={doc?.process_category_id ?? ""}
          >
            <option value="">None</option>
            {props.options.processCategories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
        </CardContent>
      </Card>

      <Card className="border-border-subtle">
        <CardHeader>
          <CardTitle>Ownership & lifecycle</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Select
              name="owner_id"
              label="Owner"
              required
              disabled={fieldDisabled}
              defaultValue={
                doc?.owner_id ?? props.currentUserProfileId
              }
            >
              <option value="">Select owner…</option>
              {props.options.profiles.map((p) => (
                <option key={p.id} value={p.id}>
                  {profileLabel(p)}
                </option>
              ))}
            </Select>

            <Input
              name="version"
              type="number"
              label="Version"
              min={1}
              required
              disabled={fieldDisabled}
              defaultValue={doc?.version ?? 1}
            />
          </div>

          <Select
            name="status"
            label="Status"
            required
            disabled={fieldDisabled}
            defaultValue={doc?.status ?? "draft"}
          >
            {statuses.map((s) => (
              <option key={s} value={s}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </option>
            ))}
          </Select>
        </CardContent>
      </Card>

      <Card className="border-border-subtle">
        <CardHeader>
          <CardTitle>Tags</CardTitle>
          <CardDescription>Select one or more tags (optional).</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {props.options.tags.map((tag) => (
              <label
                key={tag.id}
                className="flex cursor-pointer items-center gap-2 rounded-md border border-border-subtle bg-surface-muted/40 px-3 py-2 text-sm hover:bg-surface-muted"
              >
                <input
                  type="checkbox"
                  name="tag_ids"
                  value={tag.id}
                  defaultChecked={selectedTags.has(tag.id)}
                  disabled={fieldDisabled}
                  className="size-4 rounded border-border text-accent focus:ring-accent"
                />
                <span>{tag.name}</span>
              </label>
            ))}
          </div>
          {props.options.tags.length === 0 ? (
            <p className="text-sm text-foreground-muted">
              No tags defined yet — add some under Tags.
            </p>
          ) : null}
        </CardContent>
      </Card>

      <Card className="border-border-subtle">
        <CardHeader>
          <CardTitle>PDF file</CardTitle>
          <CardDescription>
            {props.mode === "create"
              ? "Required: one PDF file (validated on the server for type and integrity)."
              : "Upload a replacement file to overwrite the stored PDF (optional)."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <input
            name="file"
            type="file"
            accept="application/pdf,.pdf"
            required={props.mode === "create"}
            disabled={fieldDisabled}
            className="block w-full text-sm text-foreground file:mr-4 file:rounded-md file:border file:border-border file:bg-surface-muted file:px-3 file:py-2 file:text-sm file:font-medium"
          />
          {doc ? (
            <p className="text-xs text-foreground-muted">
              Current file:{" "}
              <span className="font-medium text-foreground">
                {doc.original_filename}
              </span>
            </p>
          ) : null}
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-2">
        <Button type="submit" disabled={fieldDisabled}>
          {pending ? `${submitVerb}…` : `${submitVerb} document`}
        </Button>
        <Link href="/documents">
          <Button type="button" variant="outline">
            Cancel
          </Button>
        </Link>
      </div>
    </form>
  );
}
