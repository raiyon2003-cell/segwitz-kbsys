"use client";

import { useEffect } from "react";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  const detail =
    process.env.NODE_ENV === "development" ? error.message : undefined;

  return (
    <main className="flex min-h-[50vh] flex-col items-center justify-center gap-4 px-6 py-16 text-center">
      <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
        Something went wrong
      </h1>
      <p className="max-w-md text-sm text-slate-600 dark:text-slate-400">
        The page hit an unexpected error. Try again, or sign out and back in if it
        persists.
      </p>
      {detail ? (
        <pre className="max-h-40 max-w-full overflow-auto rounded-md bg-slate-100 px-3 py-2 text-left text-xs text-slate-800 dark:bg-slate-800 dark:text-slate-200">
          {detail}
        </pre>
      ) : null}
      <button
        type="button"
        onClick={() => reset()}
        className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white"
      >
        Try again
      </button>
    </main>
  );
}
