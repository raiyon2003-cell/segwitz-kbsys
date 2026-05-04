"use client";

import { useEffect, useMemo, useState } from "react";
import { useFormState } from "react-dom";
import { useRouter } from "next/navigation";
import { createScopedAccountAction } from "@/app/(dashboard)/admin/access/actions";
import { Button, Input } from "@/components/ui";
import type { DocumentFormOptionSets } from "@/lib/data/document-form-options";
import type { DocumentPickerRow } from "@/lib/data/documents";

function divisionName(
  options: DocumentFormOptionSets,
  divisionId: string,
): string {
  return options.divisions.find((d) => d.id === divisionId)?.name ?? "Division";
}

export function CreateScopedAccountForm({
  options,
  documents,
}: {
  options: DocumentFormOptionSets;
  documents: DocumentPickerRow[];
}) {
  const router = useRouter();
  const [state, formAction] = useFormState(createScopedAccountAction, undefined);
  const [accountRole, setAccountRole] = useState<
    "viewer" | "employee" | "manager"
  >("viewer");
  const [selectedDeptIds, setSelectedDeptIds] = useState<Set<string>>(
    () => new Set(),
  );

  const departments = [...options.departments].sort((a, b) =>
    a.name.localeCompare(b.name),
  );

  const filteredDocs = useMemo(
    () =>
      documents.filter((d) =>
        selectedDeptIds.size === 0 ? false : selectedDeptIds.has(d.department_id),
      ),
    [documents, selectedDeptIds],
  );

  const showDocuments = accountRole !== "manager";

  function toggleDept(id: string, checked: boolean) {
    setSelectedDeptIds((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  }

  useEffect(() => {
    if (state?.ok && state.userId) {
      router.push(`/admin/access/${state.userId}?created=1`);
    }
  }, [state, router]);

  return (
    <form action={formAction} className="space-y-4">
      {state?.ok === false && state.message ? (
        <p className="rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-800 dark:text-red-100">
          {state.message}
        </p>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground" htmlFor="cv-email">
            Email
          </label>
          <Input id="cv-email" name="email" type="email" required autoComplete="off" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground" htmlFor="cv-password">
            Password
          </label>
          <Input
            id="cv-password"
            name="password"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground" htmlFor="cv-role">
          Role
        </label>
        <select
          id="cv-role"
          name="account_role"
          className="flex h-10 w-full max-w-md rounded-md border border-input-border bg-input-background px-3 py-2 text-sm shadow-inner shadow-black/[4%] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          value={accountRole}
          onChange={(e) =>
            setAccountRole(e.target.value as "viewer" | "employee" | "manager")
          }
        >
          <option value="viewer">Viewer (explicit document grants)</option>
          <option value="employee">Employee (view assigned documents only)</option>
          <option value="manager">Manager (upload/edit in departments)</option>
        </select>
        <p className="text-xs text-foreground-muted">
          Self-signup defaults to member; scoped roles are assigned here by admins.
        </p>
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium text-foreground">Departments</p>
        <p className="text-xs text-foreground-muted">
          Required for viewers, employees, and managers. Managers do not use document
          checkboxes (they access all active documents in assigned departments).
        </p>
        <ul className="max-h-40 space-y-2 overflow-y-auto rounded-md border border-border-subtle bg-surface-muted/30 p-3">
          {departments.map((d) => (
            <li key={d.id} className="flex items-center gap-2">
              <input
                type="checkbox"
                id={`cv-dept-${d.id}`}
                name="department_id"
                value={d.id}
                className="size-4 rounded border-border-subtle"
                onChange={(e) => toggleDept(d.id, e.target.checked)}
              />
              <label htmlFor={`cv-dept-${d.id}`} className="text-sm">
                {divisionName(options, d.division_id)} — {d.name}
              </label>
            </li>
          ))}
        </ul>
      </div>

      {showDocuments ? (
        <div className="space-y-2">
          <p className="text-sm font-medium text-foreground">Document access</p>
          <p className="text-xs text-foreground-muted">
            Required for viewers and employees. Pick departments above first; then tick
            documents this user may open.
          </p>
          {selectedDeptIds.size === 0 ? (
            <p className="text-sm text-foreground-muted">
              Select at least one department to list documents.
            </p>
          ) : filteredDocs.length === 0 ? (
            <p className="text-sm text-foreground-muted">
              No documents in the picker set for these departments.
            </p>
          ) : (
            <ul className="max-h-48 space-y-2 overflow-y-auto rounded-md border border-border-subtle bg-surface-muted/30 p-3">
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
                      id={`cv-doc-${doc.id}`}
                      name="document_id"
                      value={doc.id}
                      className="mt-1 size-4 rounded border-border-subtle"
                    />
                    <label
                      htmlFor={`cv-doc-${doc.id}`}
                      className="text-sm leading-snug"
                    >
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
        </div>
      ) : null}

      <Button type="submit">Create account</Button>
    </form>
  );
}
