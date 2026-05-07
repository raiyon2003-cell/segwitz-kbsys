"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { deleteDocument } from "@/app/(dashboard)/documents/actions";
import { Button } from "@/components/ui/button";

export function DocumentDeleteButton({
  documentId,
  redirectTo,
}: {
  documentId: string;
  redirectTo?: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!globalThis.confirm("Delete this document permanently? This cannot be undone.")) {
      return;
    }

    startTransition(async () => {
      setError(null);
      setSuccess(null);
      const fd = new FormData();
      fd.set("id", documentId);
      const res = await deleteDocument(fd);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setSuccess("Document deleted.");
      if (redirectTo) {
        router.push(redirectTo);
      } else {
        router.refresh();
      }
    });
  }

  return (
    <form onSubmit={submit} className="inline-flex flex-col items-end gap-1">
      {error ? <span className="max-w-[220px] text-right text-xs text-red-600">{error}</span> : null}
      {success ? (
        <span className="max-w-[220px] text-right text-xs text-brand-charcoal">
          {success}
        </span>
      ) : null}
      <Button
        type="submit"
        variant="outline"
        size="sm"
        disabled={pending}
        className="border-red-300 text-red-700 hover:bg-red-50 hover:text-red-800"
      >
        {pending ? "Deleting…" : "Delete"}
      </Button>
    </form>
  );
}
