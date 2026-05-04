"use client";

import { useEffect } from "react";

export default function GlobalError({
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
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased dark:bg-slate-950 dark:text-slate-100">
        <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 py-16 text-center">
          <h1 className="text-xl font-semibold">Something went wrong</h1>
          <p className="max-w-md text-sm text-slate-600 dark:text-slate-400">
            A critical error occurred while loading the app. Check{" "}
            <code className="rounded bg-slate-200 px-1 py-0.5 text-xs dark:bg-slate-800">
              NEXT_PUBLIC_SITE_URL
            </code>{" "}
            (must be a valid URL) and Supabase environment variables.
          </p>
          {detail ? (
            <pre className="max-h-40 max-w-full overflow-auto rounded-md bg-slate-100 px-3 py-2 text-left text-xs dark:bg-slate-800">
              {detail}
            </pre>
          ) : null}
          <button
            type="button"
            onClick={() => reset()}
            className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white dark:bg-slate-100 dark:text-slate-900"
          >
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}
