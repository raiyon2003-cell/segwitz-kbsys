import Link from "next/link";
import {
  documentsHref,
  mergeDocumentsListParams,
  type ParsedDocumentsListParams,
} from "@/lib/documents/list-params";

type DivisionOpt = { id: string; name: string };
type DepartmentOpt = { id: string; name: string; division_id: string };

export function DocumentsBrowseNav({
  pathname,
  parsed,
  divisions,
  departments,
}: {
  pathname: string;
  parsed: ParsedDocumentsListParams;
  divisions: DivisionOpt[];
  departments: DepartmentOpt[];
}) {
  if (!parsed.divisionId) return null;

  const division = divisions.find((d) => d.id === parsed.divisionId);
  const divisionName = division?.name ?? "Division";
  const deptInDivision = departments.filter(
    (d) => d.division_id === parsed.divisionId,
  );

  if (!parsed.departmentId) {
    return (
      <div className="mb-6 rounded-lg border border-border-subtle bg-surface-muted/40 px-4 py-4">
        <nav
          className="mb-3 text-sm text-foreground-muted"
          aria-label="Browse"
        >
          <Link
            href={documentsHref(
              pathname,
              mergeDocumentsListParams(parsed, {
                divisionId: null,
                departmentId: null,
                page: 1,
              }),
            )}
            className="font-medium text-accent hover:underline"
          >
            Documents
          </Link>
          <span className="mx-2" aria-hidden>
            /
          </span>
          <span className="text-foreground">{divisionName}</span>
        </nav>
        <p className="mb-3 text-sm text-foreground-muted">
          Select a department to view documents in this division.
        </p>
        <ul className="space-y-2">
          {deptInDivision.map((d) => (
            <li key={d.id}>
              <Link
                href={documentsHref(
                  pathname,
                  mergeDocumentsListParams(parsed, {
                    divisionId: parsed.divisionId,
                    departmentId: d.id,
                    page: 1,
                  }),
                )}
                className="text-sm font-medium text-foreground underline-offset-4 hover:text-accent hover:underline"
              >
                {d.name}
              </Link>
            </li>
          ))}
        </ul>
        {deptInDivision.length === 0 ? (
          <p className="text-sm text-foreground-muted">
            No departments in this division yet.
          </p>
        ) : null}
      </div>
    );
  }

  const department = deptInDivision.find((d) => d.id === parsed.departmentId);

  return (
    <nav
      className="mb-4 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-foreground-muted"
      aria-label="Browse"
    >
      <Link
        href={documentsHref(
          pathname,
          mergeDocumentsListParams(parsed, {
            divisionId: null,
            departmentId: null,
            page: 1,
          }),
        )}
        className="font-medium text-accent hover:underline"
      >
        Documents
      </Link>
      <span aria-hidden>/</span>
      <Link
        href={documentsHref(
          pathname,
          mergeDocumentsListParams(parsed, {
            departmentId: null,
            page: 1,
          }),
        )}
        className="font-medium text-accent hover:underline"
      >
        {divisionName}
      </Link>
      <span aria-hidden>/</span>
      <span className="font-medium text-foreground">
        {department?.name ?? "Department"}
      </span>
    </nav>
  );
}
