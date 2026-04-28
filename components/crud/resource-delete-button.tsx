"use client";

import type { ActionResult } from "@/lib/action-result";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

export function ResourceDeleteButton({
  id,
  deleteAction,
  noun,
  listHref,
}: {
  id: string;
  deleteAction: (fd: FormData) => Promise<ActionResult>;
  noun: string;
  listHref: string;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!globalThis.confirm(`Delete this ${noun}? This cannot be undone.`)) {
      return;
    }
    startTransition(async () => {
      setError(null);
      const fd = new FormData();
      fd.set("id", id);
      const res = await deleteAction(fd);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      router.push(listHref);
      router.refresh();
    });
  }

  return (
    <form onSubmit={submit} className="inline-flex flex-col items-end gap-1">
      {error ? (
        <span className="max-w-[240px] text-right text-xs text-red-600 dark:text-red-400">
          {error}
        </span>
      ) : null}
      <Button type="submit" variant="outline" size="sm" disabled={pending}>
        {pending ? "Deleting…" : "Delete"}
      </Button>
    </form>
  );
}
