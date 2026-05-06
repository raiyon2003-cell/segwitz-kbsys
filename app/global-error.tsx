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
      <body className="min-h-screen bg-surface text-foreground antialiased">
        <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 py-16 text-center">
          <h1 className="text-xl font-bold">Something went wrong</h1>
          <p className="max-w-md text-sm text-foreground-muted">
            A critical error occurred while loading the app. Check{" "}
            <code className="rounded bg-surface-muted px-1 py-0.5 text-xs">
              NEXT_PUBLIC_SITE_URL
            </code>{" "}
            (must be a valid URL) and Supabase environment variables.
          </p>
          {detail ? (
            <pre className="max-h-40 max-w-full overflow-auto rounded-md bg-surface-muted px-3 py-2 text-left text-xs">
              {detail}
            </pre>
          ) : null}
          <button
            type="button"
            onClick={() => reset()}
            className="rounded-md bg-brand-lime px-4 py-2 text-sm font-semibold text-white hover:bg-brand-charcoal"
          >
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}
