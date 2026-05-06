import Link from "next/link";

type Props = { dismissHref: string };

/** Shown once after `/documents/new` redirects with `?uploaded=success`. */
export function DocumentUploadSuccessBanner({ dismissHref }: Props) {
  return (
    <div
      className="mb-6 flex flex-wrap items-start justify-between gap-3 rounded-lg border border-brand-lime/35 bg-brand-lime/10 px-4 py-3 text-sm text-brand-charcoal"
      role="status"
    >
      <p>
        <span className="font-semibold">Document uploaded.</span> It is now in
        the library and visible here according to filters and tags.
      </p>
      <Link
        href={dismissHref}
        className="shrink-0 text-sm font-semibold text-brand-teal underline-offset-4 hover:underline"
      >
        Dismiss
      </Link>
    </div>
  );
}
