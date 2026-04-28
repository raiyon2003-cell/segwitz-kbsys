"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  createProcessCategory,
  updateProcessCategory,
} from "@/app/(dashboard)/process-categories/actions";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Textarea,
} from "@/components/ui";
import type { ProcessCategoryRow } from "@/types/entities";

type Props =
  | { mode: "create" }
  | { mode: "edit"; record: ProcessCategoryRow };

export function ProcessCategoryForm(props: Props) {
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
          ? await createProcessCategory(fd)
          : await updateProcessCategory(fd);

      if (!res.ok) {
        setError(res.error);
        return;
      }

      router.push("/process-categories");
      router.refresh();
    });
  }

  const d = props.mode === "edit" ? props.record : null;

  return (
    <Card className="max-w-xl border-border-subtle">
      <CardHeader>
        <CardTitle>
          {props.mode === "create"
            ? "New process category"
            : "Edit process category"}
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
            hint="Lowercase, hyphenated (leave blank to derive from name)."
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
            <Link href="/process-categories">
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
