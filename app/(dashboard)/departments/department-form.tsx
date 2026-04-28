"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import type { DepartmentRow, DivisionRow } from "@/types/entities";
import {
  createDepartment,
  updateDepartment,
} from "./actions";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Select,
  Textarea,
} from "@/components/ui";

type Props =
  | {
      mode: "create";
      divisions: Pick<DivisionRow, "id" | "name">[];
    }
  | {
      mode: "edit";
      department: DepartmentRow;
      divisions: Pick<DivisionRow, "id" | "name">[];
    };

export function DepartmentForm(props: Props) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const res =
        props.mode === "create"
          ? await createDepartment(fd)
          : await updateDepartment(fd);

      if (!res.ok) {
        setError(res.error);
        return;
      }

      router.push("/departments");
      router.refresh();
    });
  }

  const d = props.mode === "edit" ? props.department : null;

  const divisionDefault =
    props.mode === "edit" ? props.department.division_id : "";

  return (
    <Card className="max-w-xl border-border-subtle">
      <CardHeader>
        <CardTitle>
          {props.mode === "create" ? "New department" : "Edit department"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={onSubmit}>
          {props.mode === "edit" && d ? (
            <input type="hidden" name="id" value={d.id} />
          ) : null}

          {error ? (
            <p
              className="rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-700 dark:text-red-300"
              role="alert"
            >
              {error}
            </p>
          ) : null}

          <Select
            name="division_id"
            label="Division"
            required
            disabled={pending}
            defaultValue={divisionDefault}
          >
            <option value="">Select division…</option>
            {props.divisions.map((div) => (
              <option key={div.id} value={div.id}>
                {div.name}
              </option>
            ))}
          </Select>

          <Input
            name="name"
            label="Name"
            required
            disabled={pending}
            defaultValue={d?.name ?? ""}
          />
          <Input
            name="slug"
            label="Slug"
            hint="Unique within the division."
            disabled={pending}
            defaultValue={d?.slug ?? ""}
          />
          <Textarea
            name="description"
            label="Description"
            disabled={pending}
            defaultValue={d?.description ?? ""}
          />

          <div className="flex flex-wrap gap-2 pt-2">
            <Button type="submit" disabled={pending}>
              {pending ? "Saving…" : "Save"}
            </Button>
            <Link href="/departments">
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </Link>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
