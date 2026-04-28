import type { ReactNode } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export type CrudColumn<T extends { id: string }> = {
  header: string;
  className?: string;
  cell: (row: T) => ReactNode;
};

export function CrudTable<T extends { id: string }>({
  columns,
  rows,
  actions,
}: {
  columns: CrudColumn<T>[];
  rows: T[];
  actions?: (row: T) => ReactNode;
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          {columns.map((col) => (
            <TableHead key={col.header} className={col.className}>
              {col.header}
            </TableHead>
          ))}
          {actions ? (
            <TableHead className="w-[140px] text-right">Actions</TableHead>
          ) : null}
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.length === 0 ? (
          <TableRow>
            <TableCell
              colSpan={columns.length + (actions ? 1 : 0)}
              className="h-24 text-center text-foreground-muted"
            >
              No records yet.
            </TableCell>
          </TableRow>
        ) : (
          rows.map((row) => (
            <TableRow key={row.id}>
              {columns.map((col) => (
                <TableCell key={col.header} className={col.className}>
                  {col.cell(row)}
                </TableCell>
              ))}
              {actions ? (
                <TableCell className="text-right">{actions(row)}</TableCell>
              ) : null}
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}
