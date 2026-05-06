"use client";

import { useFormState } from "react-dom";
import { useMemo, useState } from "react";
import { updateScopedAccessAction } from "@/app/(dashboard)/admin/access/actions";
import { Button } from "@/components/ui";
import type { DocumentFormOptionSets } from "@/lib/data/document-form-options";
import type { DocumentPickerRow } from "@/lib/data/documents";

function divisionName(
  options: DocumentFormOptionSets,
  divisionId: string,
): string {
  return options.divisions.find((d) => d.id === divisionId)?.name ?? "Division";
}

export type ScopedAccessRole = "viewer" | "employee" | "manager";

export function ViewerAccessEditor({
  userId,
  accessRole,
  options,
  documents,
  initialDepartmentIds,
  initialDocumentIds,
}: {
  userId: string;
  accessRole: ScopedAccessRole;
  options: DocumentFormOptionSets;
  documents: DocumentPickerRow[];
  initialDepartmentIds: string[];
  initialDocumentIds: string[];
}) {
  const [state, formAction] = useFormState(updateScopedAccessAction, undefined);
  const [selectedDeptIds, setSelectedDeptIds] = useState<Set<string>>(
    () => new Set(initialDepartmentIds),
  );

  const departments = useMemo(
    () => [...options.departments].sort((a, b) => a.name.localeCompare(b.name)),
    [options.departments],
  );

  const filteredDocs = useMemo(
    () =>
      documents.filter((d) =>
        selectedDeptIds.size === 0 ? false : selectedDeptIds.has(d.department_id),
      ),
    [documents, selectedDeptIds],
  );

  function toggleDept(id: string, checked: boolean) {
    setSelectedDeptIds((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  }

  const deptHelp =
    accessRole === "manager"
      ? "Managers upload and edit documents only within these departments."
      : accessRole === "employee"
        ? "Employees can open only documents listed below (within these departments)."
        : "Viewers only see documents you tick below, and only inside selected departments.";

  const showDocuments = accessRole !== "manager";

  return (
    <form action={formAction} className="space-y-8">
      <input type="hidden" name="user_id" value={userId} />

      {state?.message ? (
        <p
          className={
            state.ok
              ? "rounded-md border border-brand-lime/35 bg-brand-lime/10 px-3 py-2 text-sm text-brand-charcoal"
              : "rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-800 dark:text-red-100"
          }
        >
          {state.message}
        </p>
      ) : null}

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-foreground">Departments</h2>
        <p className="text-xs text-foreground-muted">{deptHelp}</p>
        <ul className="max-h-48 space-y-2 overflow-y-auto rounded-md border border-border-subtle bg-surface-muted/30 p-3">
          {departments.map((d) => (
            <li key={d.id} className="flex items-center gap-2">
              <input
                type="checkbox"
                id={`ed-dept-${d.id}`}
                name="department_id"
                value={d.id}
                defaultChecked={initialDepartmentIds.includes(d.id)}
                className="size-4 rounded border-border-subtle"
                onChange={(e) => toggleDept(d.id, e.target.checked)}
              />
              <label htmlFor={`ed-dept-${d.id}`} className="text-sm">
                {divisionName(options, d.division_id)} — {d.name}
              </label>
            </li>
          ))}
        </ul>
      </section>

      {showDocuments ? (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-foreground">
            Document access
          </h2>
          <p className="text-xs text-foreground-muted">
            Showing up to 500 most recently updated non-archived documents, filtered by
            departments checked above.
            {accessRole === "employee"
              ? " Tick each document this employee may open."
              : " Tick each document this user may open."}
          </p>
          {selectedDeptIds.size === 0 ? (
            <p className="text-sm text-foreground-muted">
              Select at least one department to list documents.
            </p>
          ) : filteredDocs.length === 0 ? (
            <p className="text-sm text-foreground-muted">
              No documents in the picker set for these departments. Upload documents or
              adjust department selection.
            </p>
          ) : (
            <ul className="max-h-72 space-y-2 overflow-y-auto rounded-md border border-border-subtle bg-surface-muted/30 p-3">
              {filteredDocs.map((doc) => {
                const deptRow = options.departments.find(
                  (x) => x.id === doc.department_id,
                );
                const loc = deptRow
                  ? `${divisionName(options, deptRow.division_id)} — ${deptRow.name}`
                  : "Department";
                return (
                  <li key={doc.id} className="flex items-start gap-2">
                    <input
                      type="checkbox"
                      id={`doc-${doc.id}`}
                      name="document_id"
                      value={doc.id}
                      defaultChecked={initialDocumentIds.includes(doc.id)}
                      className="mt-1 size-4 rounded border-border-subtle"
                    />
                    <label htmlFor={`doc-${doc.id}`} className="text-sm leading-snug">
                      <span className="font-medium text-foreground">{doc.title}</span>
                      <span className="mt-0.5 block text-xs text-foreground-muted">
                        {loc}
                      </span>
                    </label>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      ) : null}

      <Button type="submit">Save access</Button>
    </form>
  );
}
