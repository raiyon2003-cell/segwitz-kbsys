"use client";

import { archiveDocument } from "@/app/(dashboard)/documents/actions";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

export function DocumentArchiveButton({
  documentId,
}: {
  documentId: string;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (
      !globalThis.confirm(
        "Archive this document? It will be hidden from the active list.",
      )
    ) {
      return;
    }
    startTransition(async () => {
      setError(null);
      const fd = new FormData();
      fd.set("id", documentId);
      const res = await archiveDocument(fd);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <form onSubmit={submit} className="inline-flex flex-col items-end gap-1">
      {error ? (
        <span className="max-w-[220px] text-right text-xs text-red-600 dark:text-red-400">
          {error}
        </span>
      ) : null}
      <Button type="submit" variant="outline" size="sm" disabled={pending}>
        {pending ? "Archiving…" : "Archive"}
      </Button>
    </form>
  );
}
