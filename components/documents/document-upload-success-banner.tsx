import Link from "next/link";

type Props = { dismissHref: string };

/** Shown once after `/documents/new` redirects with `?uploaded=success`. */
export function DocumentUploadSuccessBanner({ dismissHref }: Props) {
  return (
    <div
      className="mb-6 flex flex-wrap items-start justify-between gap-3 rounded-lg border border-emerald-500/35 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-950 dark:text-emerald-100"
      role="status"
    >
      <p>
        <span className="font-semibold">Document uploaded.</span> It is now in
        the library and visible here according to filters and tags.
      </p>
      <Link
        href={dismissHref}
        className="shrink-0 text-sm font-medium text-emerald-800 underline-offset-4 hover:underline dark:text-emerald-200"
      >
        Dismiss
      </Link>
    </div>
  );
}
