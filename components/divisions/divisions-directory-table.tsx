import Link from "next/link";
import { Fragment } from "react";
import {
  documentsHref,
  mergeDocumentsListParams,
  resetDocumentsFiltersKeepScope,
} from "@/lib/documents/list-params";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { DivisionRow } from "@/types/entities";

type DeptLite = { id: string; name: string };

export function DivisionsDirectoryTable({
  rows,
  departmentsByDivisionId,
  showActions,
}: {
  rows: DivisionRow[];
  departmentsByDivisionId: Record<string, DeptLite[]>;
  showActions: boolean;
}) {
  const baseDocsParams = resetDocumentsFiltersKeepScope("active", "table");
  const colSpan = showActions ? 4 : 3;

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Slug</TableHead>
          <TableHead className="max-w-[320px]">Description</TableHead>
          {showActions ? (
            <TableHead className="w-[140px] text-right">Actions</TableHead>
          ) : null}
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.length === 0 ? (
          <TableRow>
            <TableCell
              colSpan={colSpan}
              className="h-24 text-center text-foreground-muted"
            >
              No records yet.
            </TableCell>
          </TableRow>
        ) : (
          rows.map((row) => {
            const depts = departmentsByDivisionId[row.id] ?? [];
            const divisionDocsHref = documentsHref(
              "/documents",
              mergeDocumentsListParams(baseDocsParams, {
                divisionId: row.id,
                departmentId: null,
                page: 1,
              }),
            );

            return (
              <Fragment key={row.id}>
                <TableRow>
                  <TableCell>{row.name}</TableCell>
                  <TableCell>
                    <code className="rounded bg-surface-muted px-1.5 py-0.5 text-xs text-foreground-muted">
                      {row.slug}
                    </code>
                  </TableCell>
                  <TableCell className="max-w-[320px]">
                    <span className="line-clamp-2 text-foreground-muted">
                      {row.description ?? "—"}
                    </span>
                  </TableCell>
                  {showActions ? (
                    <TableCell className="text-right">
                      <Link
                        href={`/divisions/${row.id}/edit`}
                        className="text-sm font-medium text-accent hover:underline"
                      >
                        Edit
                      </Link>
                    </TableCell>
                  ) : null}
                </TableRow>
                <TableRow className="border-border-subtle bg-surface-muted/25 hover:bg-surface-muted/25">
                  <TableCell colSpan={colSpan} className="py-3 align-top">
                    <div className="space-y-2">
                      <p className="text-xs font-semibold uppercase tracking-wide text-foreground-muted">
                        Departments
                      </p>
                      {depts.length === 0 ? (
                        <p className="text-sm text-foreground-muted">
                          No departments in this division yet.
                          {showActions ? (
                            <>
                              {" "}
                              <Link
                                href="/departments/new"
                                className="font-medium text-accent hover:underline"
                              >
                                Add department
                              </Link>
                            </>
                          ) : null}
                        </p>
                      ) : (
                        <ul className="flex flex-col gap-1.5 sm:flex-row sm:flex-wrap sm:gap-x-4 sm:gap-y-1.5">
                          {depts.map((d) => (
                            <li key={d.id}>
                              <Link
                                href={documentsHref(
                                  "/documents",
                                  mergeDocumentsListParams(baseDocsParams, {
                                    divisionId: row.id,
                                    departmentId: d.id,
                                    page: 1,
                                  }),
                                )}
                                className="text-sm font-medium text-accent underline-offset-4 hover:underline"
                              >
                                {d.name}
                                <span className="font-normal text-foreground-muted">
                                  {" "}
                                  — documents
                                </span>
                              </Link>
                            </li>
                          ))}
                        </ul>
                      )}
                      <p className="text-xs text-foreground-muted">
                        <Link
                          href={divisionDocsHref}
                          className="font-medium text-accent hover:underline"
                        >
                          Open division on Documents
                        </Link>
                        {" · "}
                        choose a department above to view its library.
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              </Fragment>
            );
          })
        )}
      </TableBody>
    </Table>
  );
}
